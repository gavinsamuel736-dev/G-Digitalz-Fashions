import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { db, hashPassword, verifyPassword } from './server/db';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure public/uploads exists and serve static uploads
const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.use('/src/assets', express.static(path.resolve(process.cwd(), 'src', 'assets')));

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    cb(null, `${safeName}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, SVG, and GIF image files are allowed.'));
    }
  },
});

// Helper for Audit Logging
function logAudit(actorId: string, actorName: string, action: string, targetType: string, targetId: string, details?: any) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, action, target_type, target_id, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorId,
      actorName,
      action,
      targetType,
      targetId,
      JSON.stringify(details || {})
    );
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}

// ==========================================
// AUTHENTICATION MIDDLEWARES
// ==========================================
interface AuthenticatedRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    full_name: string;
    role: 'OWNER' | 'STAFF';
    permissions: string[];
  };
}

function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.prepare(`
    SELECT s.user_id, s.expires_at, u.id, u.email, u.full_name, u.role, u.permissions_json, u.is_active
    FROM admin_sessions s
    JOIN admin_users u ON s.user_id = u.id
    WHERE s.token = ?
  `).get(token) as any;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  if (new Date(session.expires_at) < new Date()) {
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
    return res.status(401).json({ error: 'Session expired: Please log in again' });
  }

  if (!session.is_active) {
    return res.status(403).json({ error: 'Account deactivated: Contact store owner' });
  }

  req.adminUser = {
    id: session.id,
    email: session.email,
    full_name: session.full_name,
    role: session.role,
    permissions: JSON.parse(session.permissions_json || '[]'),
  };

  next();
}

function requireOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.adminUser || req.adminUser.role !== 'OWNER') {
    return res.status(403).json({ error: 'Access denied: Requires OWNER privileges' });
  }
  next();
}

// ==========================================
// PUBLIC STOREFRONT ENDPOINTS
// ==========================================

// Bootstrap entire customer website with live published backend data
app.get('/api/store/bootstrap', (req, res) => {
  try {
    const brandingRow = db.prepare("SELECT value_json FROM store_settings WHERE key = 'branding'").get() as any;
    const branding = brandingRow ? JSON.parse(brandingRow.value_json) : {};

    const homepageRow = db.prepare("SELECT content_json FROM homepage_content WHERE status = 'published'").get() as any;
    const homepage = homepageRow ? JSON.parse(homepageRow.content_json) : {};

    const appearanceRow = db.prepare("SELECT config_json FROM appearance_settings WHERE id = 'current'").get() as any;
    const appearance = appearanceRow ? JSON.parse(appearanceRow.config_json) : {};

    const categories = db.prepare(`
      SELECT * FROM categories
      WHERE is_published = 1
      ORDER BY display_order ASC
    `).all();

    const products = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_published = 1
      ORDER BY p.is_featured DESC, p.created_at DESC
    `).all().map((p: any) => ({
      ...p,
      gallery: JSON.parse(p.gallery_json || '[]'),
      details: JSON.parse(p.details_json || '[]'),
      care: JSON.parse(p.care_json || '[]'),
      availableSizes: JSON.parse(p.sizes_json || '["M"]'),
      colors: JSON.parse(p.colors_json || '[]'),
      priceUGX: p.price_ugx,
      compareAtPriceUGX: p.compare_at_price_ugx,
      priceUSD: p.price_usd,
      inStock: Boolean(p.is_in_stock && p.stock_quantity > 0),
      featured: Boolean(p.is_featured),
      isNewArrival: Boolean(p.is_new_arrival),
    }));

    const shippingZones = db.prepare(`
      SELECT * FROM shipping_zones
      WHERE is_active = 1
      ORDER BY display_order ASC
    `).all();

    const paymentMethods = db.prepare(`
      SELECT * FROM payment_methods
      WHERE is_enabled = 1
    `).all();

    const reviews = db.prepare(`
      SELECT * FROM reviews
      WHERE status = 'approved'
      ORDER BY created_at DESC
    `).all();

    res.json({
      branding,
      homepage,
      appearance,
      categories,
      products,
      shippingZones,
      paymentMethods,
      reviews,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching bootstrap data:', error);
    res.status(500).json({ error: 'Failed to load store configuration' });
  }
});

// Get individual product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE (p.id = ? OR p.slug = ?) AND p.is_published = 1
    `).get(req.params.id, req.params.id) as any;

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      ...product,
      gallery: JSON.parse(product.gallery_json || '[]'),
      details: JSON.parse(product.details_json || '[]'),
      care: JSON.parse(product.care_json || '[]'),
      availableSizes: JSON.parse(product.sizes_json || '["M"]'),
      colors: JSON.parse(product.colors_json || '[]'),
      priceUGX: product.price_ugx,
      compareAtPriceUGX: product.compare_at_price_ugx,
      priceUSD: product.price_usd,
      inStock: Boolean(product.is_in_stock && product.stock_quantity > 0),
      featured: Boolean(product.is_featured),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Customer Order with Strict Server-Side Price & Inventory Validation
app.post('/api/orders', (req, res) => {
  try {
    const { items, shippingDetails, paymentMethod, momoNumber, discountCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Shopping cart is empty' });
    }

    if (!shippingDetails || !shippingDetails.fullName || !shippingDetails.phone || !shippingDetails.address) {
      return res.status(400).json({ error: 'Missing required shipping information' });
    }

    // Begin database transaction for atomic order creation and inventory deduction
    const createOrderTransaction = db.transaction(() => {
      let subtotalUGX = 0;
      const verifiedItems: any[] = [];

      // Validate each item against the real database record
      for (const item of items) {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId || item.product?.id) as any;
        if (!product) {
          throw new Error(`Product ${item.product?.name || item.productId} no longer exists.`);
        }
        if (!product.is_published) {
          throw new Error(`Product "${product.name}" is currently unavailable.`);
        }
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock_quantity}`);
        }

        const unitPrice = product.price_ugx;
        const lineTotal = unitPrice * item.quantity;
        subtotalUGX += lineTotal;

        verifiedItems.push({
          productId: product.id,
          name: product.name,
          size: item.size || 'Standard',
          color: item.color || '',
          unitPrice,
          quantity: item.quantity,
          lineTotal,
          image: product.image,
        });

        // Decrement stock
        const remainingStock = product.stock_quantity - item.quantity;
        db.prepare(`
          UPDATE products
          SET stock_quantity = ?, is_in_stock = ?
          WHERE id = ?
        `).run(remainingStock, remainingStock > 0 ? 1 : 0, product.id);
      }

      // Validate shipping delivery fee
      let deliveryFee = 15000;
      const zone = db.prepare('SELECT fee_ugx, free_threshold_ugx FROM shipping_zones WHERE id = ? OR name LIKE ?')
        .get(shippingDetails.deliveryZoneId, `%${shippingDetails.deliveryMethod}%`) as any;
      if (zone) {
        deliveryFee = (subtotalUGX >= zone.free_threshold_ugx) ? 0 : zone.fee_ugx;
      }

      // Validate discount
      let discountUGX = 0;
      if (discountCode && discountCode.toUpperCase() === 'KAMPALA10') {
        discountUGX = Math.round(subtotalUGX * 0.1);
      }

      const totalUGX = subtotalUGX + deliveryFee - discountUGX;
      const orderId = `ord-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderNumber = `PF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Initial payment status
      let paymentStatus = 'Pending Verification';
      if (paymentMethod === 'cash-on-delivery') {
        paymentStatus = 'Unpaid';
      }

      // Insert Order
      db.prepare(`
        INSERT INTO orders (
          id, order_number, customer_name, customer_email, customer_phone, delivery_address,
          delivery_landmark, delivery_city, delivery_district, delivery_method, delivery_fee_ugx,
          delivery_notes, subtotal_ugx, discount_ugx, total_ugx, status, payment_method,
          payment_status, momo_number
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, 'Confirmed', ?,
          ?, ?
        )
      `).run(
        orderId, orderNumber, shippingDetails.fullName, shippingDetails.email, shippingDetails.phone,
        shippingDetails.address, shippingDetails.landmark || '', shippingDetails.city || 'Kampala',
        shippingDetails.district || 'Kampala Central', shippingDetails.deliveryMethod || 'Kampala Express',
        deliveryFee, shippingDetails.deliveryNotes || '', subtotalUGX, discountUGX, totalUGX,
        paymentMethod, paymentStatus, momoNumber || ''
      );

      // Insert Order Items (Immutable Snapshots)
      const insertItem = db.prepare(`
        INSERT INTO order_items (
          id, order_id, product_id, product_name_snapshot, size_snapshot, color_snapshot,
          unit_price_ugx_snapshot, quantity, line_total_ugx, image_snapshot
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const vItem of verifiedItems) {
        insertItem.run(
          `item-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          orderId,
          vItem.productId,
          vItem.name,
          vItem.size,
          vItem.color,
          vItem.unitPrice,
          vItem.quantity,
          vItem.lineTotal,
          vItem.image
        );
      }

      return {
        orderId,
        orderNumber,
        subtotalUGX,
        deliveryFee,
        discountUGX,
        totalUGX,
        verifiedItems,
        status: 'Confirmed',
        paymentStatus,
      };
    });

    const result = createOrderTransaction();
    res.json({ success: true, order: result });
  } catch (err: any) {
    console.error('Order creation error:', err.message);
    res.status(400).json({ error: err.message || 'Failed to place order' });
  }
});

// Lookup Order by Number
app.get('/api/orders/:orderNumber', (req, res) => {
  try {
    const order = db.prepare(`
      SELECT * FROM orders WHERE order_number = ? OR id = ?
    `).get(req.params.orderNumber, req.params.orderNumber) as any;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.prepare(`
      SELECT * FROM order_items WHERE order_id = ?
    `).all(order.id);

    res.json({ ...order, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Customer Review
app.post('/api/reviews', (req, res) => {
  try {
    const { author, location, rating, title, comment, productName, productId } = req.body;
    if (!author || !comment || !title || !rating) {
      return res.status(400).json({ error: 'Please provide all review details' });
    }

    const reviewId = `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    db.prepare(`
      INSERT INTO reviews (id, product_id, product_name, author, location, rating, title, comment, status, verified_buyer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1)
    `).run(
      reviewId,
      productId || '',
      productName || 'Peterz Bespoke Creation',
      author.trim(),
      location || 'Kampala, Uganda',
      Number(rating),
      title.trim(),
      comment.trim()
    );

    res.json({
      success: true,
      message: 'Thank you! Your review has been submitted for atelier verification and approval.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMINISTRATOR AUTHENTICATION & MANAGEMENT
// ==========================================

// Admin Login
app.post('/api/admin/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account is currently disabled. Contact the store owner.' });
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate secure session token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    db.prepare(`
      INSERT INTO admin_sessions (token, user_id, expires_at)
      VALUES (?, ?, ?)
    `).run(token, user.id, expiresAt);

    // Update last login
    db.prepare("UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);

    logAudit(user.id, user.full_name, 'LOGIN', 'AUTH', user.id, { email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        permissions: JSON.parse(user.permissions_json || '[]'),
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server authentication failure' });
  }
});

// Admin Logout
app.post('/api/admin/auth/logout', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  const token = req.headers.authorization!.split(' ')[1];
  db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
  logAudit(req.adminUser!.id, req.adminUser!.full_name, 'LOGOUT', 'AUTH', req.adminUser!.id);
  res.json({ success: true, message: 'Logged out successfully' });
});

// Current Admin Info
app.get('/api/admin/auth/me', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.adminUser });
});

// Change Password
app.post('/api/admin/auth/change-password', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const user = db.prepare('SELECT password_hash, salt FROM admin_users WHERE id = ?').get(req.adminUser!.id) as any;
    if (!verifyPassword(currentPassword, user.password_hash, user.salt)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const { hash, salt } = hashPassword(newPassword);
    db.prepare('UPDATE admin_users SET password_hash = ?, salt = ? WHERE id = ?').run(hash, salt, req.adminUser!.id);

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'CHANGE_PASSWORD', 'USER', req.adminUser!.id);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard Statistics (Real computed numbers, never reporting pending as completed sales)
app.get('/api/admin/dashboard/stats', requireAdminAuth, (req, res) => {
  try {
    const totalOrders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count;
    const pendingOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'").get() as any).count;
    const confirmedOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Confirmed'").get() as any).count;
    const completedOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Delivered'").get() as any).count;

    // Verified revenue: strictly where payment_status = 'Paid'
    const verifiedRevenueUGX = (db.prepare("SELECT COALESCE(SUM(total_ugx), 0) as total FROM orders WHERE payment_status = 'Paid'").get() as any).total;

    const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count;
    const lowStockProducts = (db.prepare('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= 5').get() as any).count;
    const pendingReviews = (db.prepare("SELECT COUNT(*) as count FROM reviews WHERE status = 'pending'").get() as any).count;

    const recentOrders = db.prepare(`
      SELECT id, order_number, customer_name, total_ugx, status, payment_status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 6
    `).all();

    res.json({
      totalOrders,
      pendingOrders,
      confirmedOrders,
      completedOrders,
      verifiedRevenueUGX,
      totalProducts,
      lowStockProducts,
      pendingReviews,
      recentOrders,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// FILE UPLOAD API
// ==========================================
app.post('/api/admin/upload', requireAdminAuth, upload.single('file'), (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const publicUrl = `/uploads/${req.file.filename}`;
    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'UPLOAD_FILE', 'FILE', req.file.filename, { url: publicUrl });
    res.json({ success: true, url: publicUrl, filename: req.file.filename });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN: PRODUCT MANAGEMENT
// ==========================================
app.get('/api/admin/products', requireAdminAuth, (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.updated_at DESC
    `).all().map((p: any) => ({
      ...p,
      gallery: JSON.parse(p.gallery_json || '[]'),
      details: JSON.parse(p.details_json || '[]'),
      care: JSON.parse(p.care_json || '[]'),
      availableSizes: JSON.parse(p.sizes_json || '["M"]'),
      colors: JSON.parse(p.colors_json || '[]'),
    }));

    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/products', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const {
      name, tagline, category_id, price_ugx, compare_at_price_ugx, price_usd,
      image, gallery, description, fabric, details, care, sizes, colors,
      stock_quantity, is_in_stock, is_featured, is_new_arrival, badge, is_published
    } = req.body;

    if (!name || !price_ugx || !category_id || !image) {
      return res.status(400).json({ error: 'Name, Category, Price (UGX), and Image are required' });
    }

    const id = `pf-${Date.now().toString(36)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

    db.prepare(`
      INSERT INTO products (
        id, name, slug, tagline, category_id, price_ugx, compare_at_price_ugx, price_usd,
        image, gallery_json, description, fabric, details_json, care_json, sizes_json, colors_json,
        stock_quantity, is_in_stock, is_featured, is_new_arrival, badge, is_published
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `).run(
      id, name, slug, tagline || '', category_id, Math.round(Number(price_ugx)),
      compare_at_price_ugx ? Math.round(Number(compare_at_price_ugx)) : null,
      Number(price_usd) || Math.round(Number(price_ugx) / 3750),
      image, JSON.stringify(gallery || [image]), description || '', fabric || '',
      JSON.stringify(details || []), JSON.stringify(care || []),
      JSON.stringify(sizes || ['M']), JSON.stringify(colors || []),
      Number(stock_quantity) || 0, is_in_stock ? 1 : 0, is_featured ? 1 : 0,
      is_new_arrival ? 1 : 0, badge || null, is_published ? 1 : 0
    );

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'CREATE_PRODUCT', 'PRODUCT', id, { name, price_ugx });
    res.json({ success: true, id, message: 'Product created successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const {
      name, tagline, category_id, price_ugx, compare_at_price_ugx, price_usd,
      image, gallery, description, fabric, details, care, sizes, colors,
      stock_quantity, is_in_stock, is_featured, is_new_arrival, badge, is_published
    } = req.body;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare(`
      UPDATE products SET
        name = ?, tagline = ?, category_id = ?, price_ugx = ?, compare_at_price_ugx = ?,
        price_usd = ?, image = ?, gallery_json = ?, description = ?, fabric = ?,
        details_json = ?, care_json = ?, sizes_json = ?, colors_json = ?,
        stock_quantity = ?, is_in_stock = ?, is_featured = ?, is_new_arrival = ?,
        badge = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name, tagline || '', category_id, Math.round(Number(price_ugx)),
      compare_at_price_ugx ? Math.round(Number(compare_at_price_ugx)) : null,
      Number(price_usd) || Math.round(Number(price_ugx) / 3750),
      image, JSON.stringify(gallery || [image]), description || '', fabric || '',
      JSON.stringify(details || []), JSON.stringify(care || []),
      JSON.stringify(sizes || ['M']), JSON.stringify(colors || []),
      Number(stock_quantity) || 0, is_in_stock ? 1 : 0, is_featured ? 1 : 0,
      is_new_arrival ? 1 : 0, badge || null, is_published ? 1 : 0,
      id
    );

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'UPDATE_PRODUCT', 'PRODUCT', id, {
      name,
      oldPrice: existing.price_ugx,
      newPrice: price_ugx,
    });

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT name FROM products WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'DELETE_PRODUCT', 'PRODUCT', id, { name: existing.name });

    res.json({ success: true, message: 'Product deleted permanently' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN: CATEGORY MANAGEMENT
// ==========================================
app.get('/api/admin/categories', requireAdminAuth, (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.display_order ASC
    `).all();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/categories', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, image, display_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const id = `cat-${Date.now().toString(36)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    db.prepare(`
      INSERT INTO categories (id, name, slug, description, image, display_order, is_published)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(id, name, slug, description || '', image || '', Number(display_order) || 0);

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'CREATE_CATEGORY', 'CATEGORY', id, { name });
    res.json({ success: true, id, message: 'Category created' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/categories/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, display_order, is_published } = req.body;

    db.prepare(`
      UPDATE categories SET
        name = ?, description = ?, image = ?, display_order = ?, is_published = ?
      WHERE id = ?
    `).run(name, description || '', image || '', Number(display_order) || 0, is_published ? 1 : 0, id);

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'UPDATE_CATEGORY', 'CATEGORY', id, { name });
    res.json({ success: true, message: 'Category updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/categories/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const count = (db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(id) as any).count;
    if (count > 0) {
      return res.status(400).json({
        error: `Cannot delete: ${count} products are currently assigned to this category. Please reassign or delete them first.`,
      });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'DELETE_CATEGORY', 'CATEGORY', id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN: ORDER MANAGEMENT
// ==========================================
app.get('/api/admin/orders', requireAdminAuth, (req, res) => {
  try {
    const { status, payment_status, search } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (payment_status && payment_status !== 'all') {
      query += ' AND payment_status = ?';
      params.push(payment_status);
    }
    if (search) {
      query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR customer_email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY created_at DESC';
    const orders = db.prepare(query).all(...params);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders/:id', requireAdminAuth, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    res.json({ ...order, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/orders/:id/status', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status, internal_notes } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    db.prepare(`
      UPDATE orders SET status = ?, internal_notes = COALESCE(?, internal_notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, internal_notes, id);

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'UPDATE_ORDER_STATUS', 'ORDER', id, { status });
    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/orders/:id/payment', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    const allowed = ['Unpaid', 'Pending Verification', 'Paid', 'Failed', 'Refunded'];

    if (!allowed.includes(payment_status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    db.prepare(`
      UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(payment_status, id);

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'UPDATE_PAYMENT_STATUS', 'ORDER', id, { payment_status });
    res.json({ success: true, message: `Payment status updated to ${payment_status}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/orders/:id/notes', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    db.prepare(`
      UPDATE orders SET internal_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(notes, id);

    res.json({ success: true, message: 'Notes saved' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN: BRANDING & HOMEPAGE & APPEARANCE
// ==========================================

// Branding & Store Settings
app.get('/api/admin/branding', requireAdminAuth, (req, res) => {
  try {
    const row = db.prepare("SELECT value_json FROM store_settings WHERE key = 'branding'").get() as any;
    res.json(row ? JSON.parse(row.value_json) : {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/branding', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const branding = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO store_settings (key, value_json, updated_at)
      VALUES ('branding', ?, CURRENT_TIMESTAMP)
    `).run(JSON.stringify(branding));

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'UPDATE_BRANDING', 'SETTINGS', 'branding', branding);
    res.json({ success: true, message: 'Branding and store settings saved and published' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Homepage: Draft vs Published
app.get('/api/admin/homepage/draft', requireAdminAuth, (req, res) => {
  try {
    const draftRow = db.prepare("SELECT content_json FROM homepage_content WHERE status = 'draft'").get() as any;
    const publishedRow = db.prepare("SELECT content_json FROM homepage_content WHERE status = 'published'").get() as any;

    res.json({
      draft: draftRow ? JSON.parse(draftRow.content_json) : {},
      published: publishedRow ? JSON.parse(publishedRow.content_json) : {},
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/homepage/draft', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const draftContent = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO homepage_content (status, content_json, updated_at, updated_by)
      VALUES ('draft', ?, CURRENT_TIMESTAMP, ?)
    `).run(JSON.stringify(draftContent), req.adminUser!.id);

    res.json({ success: true, message: 'Homepage draft saved' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/homepage/publish', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    // If body provided, use it, or copy from draft
    let contentToPublish = req.body;
    if (!contentToPublish || Object.keys(contentToPublish).length === 0) {
      const draftRow = db.prepare("SELECT content_json FROM homepage_content WHERE status = 'draft'").get() as any;
      if (!draftRow) return res.status(400).json({ error: 'No draft found to publish' });
      contentToPublish = JSON.parse(draftRow.content_json);
    }

    db.prepare(`
      INSERT OR REPLACE INTO homepage_content (status, content_json, updated_at, updated_by)
      VALUES ('published', ?, CURRENT_TIMESTAMP, ?)
    `).run(JSON.stringify(contentToPublish), req.adminUser!.id);

    // Also update draft to match published
    db.prepare(`
      INSERT OR REPLACE INTO homepage_content (status, content_json, updated_at, updated_by)
      VALUES ('draft', ?, CURRENT_TIMESTAMP, ?)
    `).run(JSON.stringify(contentToPublish), req.adminUser!.id);

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'PUBLISH_HOMEPAGE', 'HOMEPAGE', 'published', {
      headline: contentToPublish.headline,
    });

    res.json({ success: true, message: 'Homepage changes successfully published to live website!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Appearance Settings
app.get('/api/admin/appearance', requireAdminAuth, (req, res) => {
  try {
    const row = db.prepare("SELECT config_json FROM appearance_settings WHERE id = 'current'").get() as any;
    res.json(row ? JSON.parse(row.config_json) : {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/appearance', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const appearance = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO appearance_settings (id, config_json, updated_at)
      VALUES ('current', ?, CURRENT_TIMESTAMP)
    `).run(JSON.stringify(appearance));

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'UPDATE_APPEARANCE', 'APPEARANCE', 'current', appearance);
    res.json({ success: true, message: 'Website appearance settings updated and published' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/appearance/reset', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const defaultAppearance = {
      primaryColor: '#1A1816',
      secondaryColor: '#8E6C3B',
      accentColor: '#C5A880',
      backgroundColor: '#FAF8F5',
      cardBackground: '#FFFFFF',
      fontHeading: 'Cormorant Garamond',
      fontBody: 'Plus Jakarta Sans',
      buttonRadius: 'rounded-xs',
      enablePromotionalBanner: true,
      themeMode: 'luxury-light',
    };

    db.prepare(`
      INSERT OR REPLACE INTO appearance_settings (id, config_json, updated_at)
      VALUES ('current', ?, CURRENT_TIMESTAMP)
    `).run(JSON.stringify(defaultAppearance));

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'RESET_APPEARANCE', 'APPEARANCE', 'current');
    res.json({ success: true, config: defaultAppearance, message: 'Appearance reset to default Peterz luxury theme' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN: SHIPPING & PAYMENTS
// ==========================================
app.get('/api/admin/shipping', requireAdminAuth, (req, res) => {
  try {
    const zones = db.prepare('SELECT * FROM shipping_zones ORDER BY display_order ASC').all();
    res.json(zones);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/shipping/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { name, fee_ugx, estimated_time, free_threshold_ugx, is_active, notes } = req.body;

    db.prepare(`
      UPDATE shipping_zones SET
        name = ?, fee_ugx = ?, estimated_time = ?, free_threshold_ugx = ?, is_active = ?, notes = ?
      WHERE id = ?
    `).run(name, Math.round(Number(fee_ugx)), estimated_time, Math.round(Number(free_threshold_ugx)), is_active ? 1 : 0, notes || '', id);

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'UPDATE_SHIPPING_ZONE', 'SHIPPING', id, { fee_ugx });
    res.json({ success: true, message: 'Shipping zone updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/payments', requireAdminAuth, (req, res) => {
  try {
    const methods = db.prepare('SELECT * FROM payment_methods').all();
    res.json(methods);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/payments/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { is_enabled, merchant_account, instructions, requires_verification } = req.body;

    db.prepare(`
      UPDATE payment_methods SET
        is_enabled = ?, merchant_account = ?, instructions = ?, requires_verification = ?
      WHERE id = ?
    `).run(is_enabled ? 1 : 0, merchant_account || '', instructions || '', requires_verification ? 1 : 0, id);

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'UPDATE_PAYMENT_METHOD', 'PAYMENT', id, { is_enabled });
    res.json({ success: true, message: 'Payment gateway configuration updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN: REVIEWS MODERATION
// ==========================================
app.get('/api/admin/reviews', requireAdminAuth, (req, res) => {
  try {
    const reviews = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/reviews/:id/status', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status, verified_buyer } = req.body;

    db.prepare(`
      UPDATE reviews SET
        status = COALESCE(?, status),
        verified_buyer = COALESCE(?, verified_buyer)
      WHERE id = ?
    `).run(status, verified_buyer !== undefined ? (verified_buyer ? 1 : 0) : null, id);

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'MODERATE_REVIEW', 'REVIEW', id, { status });
    res.json({ success: true, message: `Review status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/reviews/:id', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'DELETE_REVIEW', 'REVIEW', id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN: USERS & ROLES (OWNER ONLY)
// ==========================================
app.get('/api/admin/users', requireAdminAuth, requireOwner, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, email, full_name, role, permissions_json, is_active, created_at, last_login
      FROM admin_users
      ORDER BY role DESC, created_at ASC
    `).all().map((u: any) => ({
      ...u,
      permissions: JSON.parse(u.permissions_json || '[]'),
    }));

    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users', requireAdminAuth, requireOwner, (req: AuthenticatedRequest, res) => {
  try {
    const { email, password, full_name, role, permissions } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An administrator with this email already exists' });
    }

    const { hash, salt } = hashPassword(password);
    const id = `usr-${Date.now().toString(36)}`;

    db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, salt, full_name, role, permissions_json, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      id,
      email.toLowerCase().trim(),
      hash,
      salt,
      full_name,
      role === 'OWNER' ? 'OWNER' : 'STAFF',
      JSON.stringify(permissions || ['products', 'orders', 'reviews'])
    );

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'CREATE_ADMIN_USER', 'USER', id, { email, role });
    res.json({ success: true, message: 'Administrator account created successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/users/:id/toggle-active', requireAdminAuth, requireOwner, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    if (id === req.adminUser!.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own owner account' });
    }

    const user = db.prepare('SELECT is_active, email FROM admin_users WHERE id = ?').get(id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newStatus = user.is_active ? 0 : 1;
    db.prepare('UPDATE admin_users SET is_active = ? WHERE id = ?').run(newStatus, id);

    // If deactivating, destroy active sessions
    if (!newStatus) {
      db.prepare('DELETE FROM admin_sessions WHERE user_id = ?').run(id);
    }

    logAudit(req.adminUser!.id, req.adminUser!.full_name, 'TOGGLE_USER_STATUS', 'USER', id, { active: newStatus });
    res.json({ success: true, message: `Account ${newStatus ? 'activated' : 'deactivated'}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN: AUDIT LOGS
// ==========================================
app.get('/api/admin/audit-logs', requireAdminAuth, requireOwner, (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 100
    `).all().map((l: any) => ({
      ...l,
      details: JSON.parse(l.details_json || '{}'),
    }));

    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// VITE MIDDLEWARE & STATIC CLIENT SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Peterz Fashions Full-Stack Production Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
