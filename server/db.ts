import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Ensure data and uploads directories exist
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'peterz_fashions.db');
export const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, generatedSalt, 64).toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculatedHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calculatedHash, 'hex'));
}

export function initializeDatabase() {
  db.exec(`
    -- Administrator Users
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('OWNER', 'STAFF')),
      permissions_json TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    -- Admin Sessions
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    -- Categories
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      display_order INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Products
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      tagline TEXT,
      category_id TEXT NOT NULL,
      price_ugx INTEGER NOT NULL,
      compare_at_price_ugx INTEGER,
      price_usd INTEGER NOT NULL,
      image TEXT NOT NULL,
      gallery_json TEXT DEFAULT '[]',
      description TEXT NOT NULL,
      fabric TEXT,
      details_json TEXT DEFAULT '[]',
      care_json TEXT DEFAULT '[]',
      sizes_json TEXT DEFAULT '["M"]',
      colors_json TEXT DEFAULT '[]',
      stock_quantity INTEGER DEFAULT 10,
      is_in_stock INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      is_new_arrival INTEGER DEFAULT 0,
      badge TEXT,
      is_published INTEGER DEFAULT 1,
      rating REAL DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    -- Orders
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      delivery_landmark TEXT,
      delivery_city TEXT NOT NULL,
      delivery_district TEXT NOT NULL,
      delivery_method TEXT NOT NULL,
      delivery_fee_ugx INTEGER NOT NULL,
      delivery_notes TEXT,
      subtotal_ugx INTEGER NOT NULL,
      discount_ugx INTEGER DEFAULT 0,
      total_ugx INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'Pending Verification' CHECK(payment_status IN ('Unpaid', 'Pending Verification', 'Paid', 'Failed', 'Refunded')),
      momo_number TEXT,
      internal_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Order Items (Immutable Snapshots)
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name_snapshot TEXT NOT NULL,
      size_snapshot TEXT NOT NULL,
      color_snapshot TEXT,
      unit_price_ugx_snapshot INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      line_total_ugx INTEGER NOT NULL,
      image_snapshot TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- Store Settings & Branding
    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Homepage Content (Draft vs Published)
    CREATE TABLE IF NOT EXISTS homepage_content (
      status TEXT PRIMARY KEY CHECK(status IN ('draft', 'published')),
      content_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_by TEXT
    );

    -- Appearance Settings
    CREATE TABLE IF NOT EXISTS appearance_settings (
      id TEXT PRIMARY KEY DEFAULT 'current',
      config_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Shipping Zones
    CREATE TABLE IF NOT EXISTS shipping_zones (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      fee_ugx INTEGER NOT NULL,
      estimated_time TEXT NOT NULL,
      free_threshold_ugx INTEGER DEFAULT 1500000,
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      notes TEXT
    );

    -- Payment Methods
    CREATE TABLE IF NOT EXISTS payment_methods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      is_enabled INTEGER DEFAULT 1,
      merchant_account TEXT,
      instructions TEXT,
      requires_verification INTEGER DEFAULT 1
    );

    -- Customer Reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT,
      product_name TEXT NOT NULL,
      author TEXT NOT NULL,
      location TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'approved' CHECK(status IN ('pending', 'approved', 'rejected')),
      verified_buyer INTEGER DEFAULT 1,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      details_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default data if store_settings is empty
  seedInitialData();

  // Ensure persistent settings reflect G-Digitalz Fashions
  try {
    const brandingRow = db.prepare('SELECT value_json FROM store_settings WHERE key = ?').get('branding') as { value_json: string } | undefined;
    if (brandingRow && brandingRow.value_json.includes('Peterz Fashions')) {
      const updated = brandingRow.value_json.replace(/Peterz Fashions/g, 'G-Digitalz Fashions');
      db.prepare('UPDATE store_settings SET value_json = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?').run(updated, 'branding');
    }
  } catch (err) {
    // Non-fatal
  }
}

function seedInitialData() {
  const hasSettings = db.prepare('SELECT 1 FROM store_settings WHERE key = ?').get('branding');
  if (hasSettings) {
    return; // Already seeded
  }

  // 1. Seed Initial Owner Account: owner@peterz.ug / PeterzAdmin2026!
  // Securely salted and hashed using scrypt
  const initialPassword = 'PeterzAdmin2026!';
  const { hash, salt } = hashPassword(initialPassword);
  db.prepare(`
    INSERT OR IGNORE INTO admin_users (id, email, password_hash, salt, full_name, role, permissions_json, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    'usr-owner-01',
    'owner@peterz.ug',
    hash,
    salt,
    'Peter Katende (Founder & Creative Director)',
    'OWNER',
    JSON.stringify(['*'])
  );

  // Also seed a Staff Account for permission testing: staff@peterz.ug / PeterzStaff2026!
  const staffHash = hashPassword('PeterzStaff2026!');
  db.prepare(`
    INSERT OR IGNORE INTO admin_users (id, email, password_hash, salt, full_name, role, permissions_json, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    'usr-staff-01',
    'staff@peterz.ug',
    staffHash.hash,
    staffHash.salt,
    'Aisha Nakato (Atelier Assistant)',
    'STAFF',
    JSON.stringify(['products', 'orders', 'reviews'])
  );

  // 2. Seed Categories
  const categories = [
    { id: 'cat-couture', name: 'Haute Couture & Bridal', slug: 'couture', description: 'Royal gowns and bespoke ceremonial attire', image: '/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg', display_order: 1 },
    { id: 'cat-women', name: "Women's Collection", slug: 'women', description: 'Tailored blazers, silk drapes and contemporary dresses', image: '/src/assets/images/product_contemporary_kitenge_blazer_1793621755842.jpg', display_order: 2 },
    { id: 'cat-men', name: "Men's Bespoke Tailoring", slug: 'men', description: 'Mandarin collar linen suits and modern safari cuts', image: '/src/assets/images/product_bespoke_linen_suit_1793621755616.jpg', display_order: 3 },
    { id: 'cat-accessories', name: 'Handcrafted Accessories', slug: 'accessories', description: 'Vegetable-tanned Ugandan cowhide leather and natural fiber goods', image: '/src/assets/images/product_artisan_leather_tote_1793621756800.jpg', display_order: 4 },
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, slug, description, image, display_order, is_published)
    VALUES (@id, @name, @slug, @description, @image, @display_order, 1)
  `);
  for (const cat of categories) {
    insertCategory.run(cat);
  }

  // 3. Seed Products
  const products = [
    {
      id: 'pf-01',
      name: 'The Kampala Imperial Silk Gown',
      slug: 'the-kampala-imperial-silk-gown',
      tagline: 'Sculptural asymmetric evening couture with hand-threaded golden filigree',
      category_id: 'cat-couture',
      price_ugx: 1850000,
      compare_at_price_ugx: 2100000,
      price_usd: 495,
      image: '/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg',
      gallery_json: JSON.stringify([
        '/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg',
        '/src/assets/images/hero_peterz_couture_1793621754106.jpg'
      ]),
      description: 'An architectural tribute to royal Ugandan elegance. Tailored from heavy emerald duchess silk, featuring custom hand-embroidered golden motif drapes cascading across an asymmetric sculpted bodice. Each piece is crafted by master artisans over 65 hours in our Nakasero atelier.',
      fabric: '100% Ugandan Mulberry Silk & Metallic Gold Threading',
      details_json: JSON.stringify([
        'Asymmetric one-shoulder silhouette with structural pleat fold',
        'Hand-embroidered organic Buganda court geometric motifs',
        'Full floor-length drape with interior silk habotai lining',
        'Concealed invisible side zipper with hand-cast brass hook'
      ]),
      care_json: JSON.stringify([
        'Specialist dry clean only',
        'Store in provided breathable G-Digitalz Fashions garment shroud',
        'Cool iron with protective press cloth'
      ]),
      sizes_json: JSON.stringify(['UK 8 / XS', 'UK 10 / S', 'UK 12 / M', 'UK 14 / L', 'Bespoke Made-to-Measure']),
      colors_json: JSON.stringify(['Emerald Green & Gold', 'Midnight Obsidian', 'Imperial Ochre']),
      stock_quantity: 8,
      is_in_stock: 1,
      is_featured: 1,
      is_new_arrival: 1,
      badge: 'Atelier Signature',
      is_published: 1,
      rating: 5.0,
      review_count: 28
    },
    {
      id: 'pf-02',
      name: 'Nakasero Mandarin Linen Suit',
      slug: 'nakasero-mandarin-linen-suit',
      tagline: 'Two-piece tailored raw ivory linen suit with ancestral geometric cuffs',
      category_id: 'cat-men',
      price_ugx: 1450000,
      compare_at_price_ugx: 1650000,
      price_usd: 390,
      image: '/src/assets/images/product_bespoke_linen_suit_1793621755616.jpg',
      gallery_json: JSON.stringify([
        '/src/assets/images/product_bespoke_linen_suit_1793621755616.jpg',
        '/src/assets/images/hero_peterz_couture_1793621754106.jpg'
      ]),
      description: 'A sovereign study in modern African menswear. Tailored from breathable raw Ugandan organic flax linen in pristine ivory and sand-beige tones. Features a refined standing band collar, horn buttons, and subtle geometric cuff embroidery inspired by traditional Buganda craftsmanship.',
      fabric: '100% Organic African Flax Linen & Raw Silk Trim',
      details_json: JSON.stringify([
        'Unstructured modern silhouette with soft shoulder contour',
        'Intricate chevron cuff embroidery hand-finished in Kampala',
        'Matching slim-straight pleated linen trousers with side tab adjusters',
        'Lightweight half-canvas construction ideal for tropical & global climates'
      ]),
      care_json: JSON.stringify([
        'Gentle eco dry clean recommended',
        'Do not tumble dry',
        'Steam iron on medium heat with linen setting'
      ]),
      sizes_json: JSON.stringify(['38R / S', '40R / M', '42R / L', '44R / XL', 'Bespoke Made-to-Measure']),
      colors_json: JSON.stringify(['Raw Ivory', 'Sahara Sand', 'Nile Charcoal']),
      stock_quantity: 12,
      is_in_stock: 1,
      is_featured: 1,
      is_new_arrival: 0,
      badge: 'Tailored Luxury',
      is_published: 1,
      rating: 4.9,
      review_count: 34
    },
    {
      id: 'pf-03',
      name: 'Victoria Heritage Blazer Dress',
      slug: 'victoria-heritage-blazer-dress',
      tagline: 'Double-breasted trench silhouette with woven earth-tone jacquard tapestry',
      category_id: 'cat-women',
      price_ugx: 980000,
      compare_at_price_ugx: 1150000,
      price_usd: 265,
      image: '/src/assets/images/product_contemporary_kitenge_blazer_1793621755842.jpg',
      gallery_json: JSON.stringify([
        '/src/assets/images/product_contemporary_kitenge_blazer_1793621755842.jpg'
      ]),
      description: 'A striking fusion of executive tailoring and East African textile panache. Features structured peak lapels, tonal earth-ochre and deep terracotta woven graphic panels, and a cinched belted waist with antique brass buckle.',
      fabric: 'Heavyweight Ugandan Jacquard Weave & Structured Wool Blend',
      details_json: JSON.stringify([
        'Double-breasted front with custom-cast matte buttons',
        'Detachable tailored belt with brass geometric clasp',
        'Structured padded shoulders with sharp hourglass cut',
        'Full interior cupro lining for smooth friction-free drape'
      ]),
      care_json: JSON.stringify([
        'Professional dry clean only',
        'Hang on wide contoured wooden hanger',
        'Do not soak or bleach'
      ]),
      sizes_json: JSON.stringify(['UK 8 / XS', 'UK 10 / S', 'UK 12 / M', 'UK 14 / L', 'UK 16 / XL']),
      colors_json: JSON.stringify(['Terracotta & Ochre Jacquard']),
      stock_quantity: 15,
      is_in_stock: 1,
      is_featured: 1,
      is_new_arrival: 1,
      badge: 'Bestseller',
      is_published: 1,
      rating: 4.9,
      review_count: 42
    },
    {
      id: 'pf-04',
      name: 'Kawanda Artisan Leather & Fiber Tote',
      slug: 'kawanda-artisan-leather-fiber-tote',
      tagline: 'Cognac calfskin weekender with hand-woven Ugandan natural reed & brass hardware',
      category_id: 'cat-accessories',
      price_ugx: 720000,
      compare_at_price_ugx: 820000,
      price_usd: 195,
      image: '/src/assets/images/product_artisan_leather_tote_1793621756800.jpg',
      gallery_json: JSON.stringify([
        '/src/assets/images/product_artisan_leather_tote_1793621756800.jpg'
      ]),
      description: 'Handcrafted by third-generation leather artisans in Kampala. Combines vegetable-tanned Ugandan cognac leather with hand-woven natural banana fiber panels and solid forged brass feet and buckles.',
      fabric: 'Vegetable-Tanned Full-Grain Cowhide & Artisanal Banana Fiber Weave',
      details_json: JSON.stringify([
        'Reinforced rolled leather handles with removable adjustable shoulder strap',
        'Two-way solid brass heavy-duty zipper closure',
        'Interior padded 15-inch laptop pocket & zipper passport compartment',
        'Protective brass studs at bottom base'
      ]),
      care_json: JSON.stringify([
        'Treat periodically with natural beeswax leather balm',
        'Keep dry; wipe gently with soft damp micro-cloth',
        'Store in cotton dust bag when not in travel'
      ]),
      sizes_json: JSON.stringify(['One Size (48cm x 28cm x 22cm)']),
      colors_json: JSON.stringify(['Cognac Leather & Natural Fiber']),
      stock_quantity: 6,
      is_in_stock: 1,
      is_featured: 1,
      is_new_arrival: 0,
      badge: 'Artisan Crafted',
      is_published: 1,
      rating: 5.0,
      review_count: 19
    },
    {
      id: 'pf-05',
      name: 'Pearl Sunset Silk Drape Cape',
      slug: 'pearl-sunset-silk-drape-cape',
      tagline: 'Fluid cascading silk overlay inspired by evening reflections on Lake Victoria',
      category_id: 'cat-women',
      price_ugx: 680000,
      compare_at_price_ugx: 750000,
      price_usd: 180,
      image: '/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg',
      gallery_json: JSON.stringify([
        '/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg'
      ]),
      description: 'An ethereal layering garment that elevates simple daywear into regal evening presence. Crafted from lightweight shimmering golden-olive silk habotai, finished with delicate micro-rolled hems.',
      fabric: '100% Shimmering Silk Habotai',
      details_json: JSON.stringify([
        'Open front design with self-tie neck tassels',
        'Hand-rolled borders with artisanal French seams',
        'Flowing floor-length wings that catch subtle breezes'
      ]),
      care_json: JSON.stringify(['Gentle hand wash in cold water or dry clean', 'Lay flat to dry out of direct sunlight']),
      sizes_json: JSON.stringify(['One Size Fits All', 'Petite', 'Tall']),
      colors_json: JSON.stringify(['Golden Olive Habotai']),
      stock_quantity: 10,
      is_in_stock: 1,
      is_featured: 0,
      is_new_arrival: 1,
      badge: null,
      is_published: 1,
      rating: 4.8,
      review_count: 15
    },
    {
      id: 'pf-06',
      name: 'Rwenzori Heritage Safari Jacket',
      slug: 'rwenzori-heritage-safari-jacket',
      tagline: 'Modernized four-pocket safari coat in textured sand khaki linen',
      category_id: 'cat-men',
      price_ugx: 890000,
      compare_at_price_ugx: 990000,
      price_usd: 240,
      image: '/src/assets/images/product_bespoke_linen_suit_1793621755616.jpg',
      gallery_json: JSON.stringify([
        '/src/assets/images/product_bespoke_linen_suit_1793621755616.jpg'
      ]),
      description: 'Inspired by expeditions through the Rwenzori mountains, refined for modern metropolitan life in Kampala and international runways. Features four pleated bellows pockets and horn buttons.',
      fabric: 'Textured Ugandan Heavy Slub Linen & Cotton Drill',
      details_json: JSON.stringify([
        'Four functional utility cargo pockets with box pleats',
        'Internal adjustable drawcord for tailored waist cinching',
        'Action back shoulder pleats allowing full range of mobility',
        'Unlined body for maximum ventilation in warm climates'
      ]),
      care_json: JSON.stringify(['Dry clean or delicate cycle machine wash at 30°C', 'Warm iron while slightly damp']),
      sizes_json: JSON.stringify(['38 / S', '40 / M', '42 / L', '44 / XL']),
      colors_json: JSON.stringify(['Textured Sand Khaki', 'Safari Olive']),
      stock_quantity: 3, // Low stock indicator
      is_in_stock: 1,
      is_featured: 0,
      is_new_arrival: 0,
      badge: 'Limited Run',
      is_published: 1,
      rating: 4.9,
      review_count: 22
    }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, name, slug, tagline, category_id, price_ugx, compare_at_price_ugx, price_usd,
      image, gallery_json, description, fabric, details_json, care_json, sizes_json, colors_json,
      stock_quantity, is_in_stock, is_featured, is_new_arrival, badge, is_published, rating, review_count
    ) VALUES (
      @id, @name, @slug, @tagline, @category_id, @price_ugx, @compare_at_price_ugx, @price_usd,
      @image, @gallery_json, @description, @fabric, @details_json, @care_json, @sizes_json, @colors_json,
      @stock_quantity, @is_in_stock, @is_featured, @is_new_arrival, @badge, @is_published, @rating, @review_count
    )
  `);

  for (const prod of products) {
    insertProduct.run(prod);
  }

  // 4. Seed Store Branding & Information
  const branding = {
    storeName: 'G-Digitalz Fashions',
    tagline: 'Kampala · Haute Couture & Bespoke African Tailoring',
    logoUrl: '',
    faviconUrl: '',
    phone: '+256 772 987 654',
    whatsappNumber: '+256772987654',
    email: 'concierge@gdigitalz.ug',
    physicalAddress: 'Plot 14 Nakasero Hill Road, Kampala, Uganda',
    operatingHours: 'Monday - Saturday: 9:00 AM - 7:00 PM (Appointments & Walk-ins)',
    currencyPrimary: 'UGX',
    currencySecondary: 'USD',
    socialLinks: {
      instagram: 'https://instagram.com/gdigitalzfashions',
      facebook: 'https://facebook.com/gdigitalzfashions',
      x: 'https://x.com/gdigitalzfashions'
    },
    policies: {
      returnPolicy: 'Every G-Digitalz Fashions purchase comes with complimentary bespoke alterations at our Nakasero atelier within 14 days of delivery. Custom made-to-measure pieces are individually tailored and non-refundable, but we guarantee fit perfection with unlimited atelier adjustments.',
      privacyPolicy: 'We respect client privacy across Uganda and internationally. Personal details, phone numbers, and measurements are used exclusively for tailoring fulfillment and concierge delivery updates.',
      termsConditions: 'All prices are quoted in Ugandan Shillings (UGX). Orders placed via MTN MoMo, Airtel Money, Cards, or Cash on Delivery are verified by our Kampala dispatch team before courier handover.'
    }
  };

  db.prepare(`
    INSERT INTO store_settings (key, value_json)
    VALUES ('branding', ?)
  `).run(JSON.stringify(branding));

  // 5. Seed Homepage Content (both Draft and Published)
  const defaultHomepage = {
    headline: 'Ugandan Elegance, Reimagined For The Modern World.',
    supportingText: 'Bespoke tailoring, archival craftsmanship, and contemporary African couture created at our Nakasero atelier. Designed for sovereign poise across Kampala and beyond.',
    heroBannerImage: '/src/assets/images/hero_peterz_couture_1793621754106.jpg',
    primaryCtaText: 'Explore Collection',
    primaryCtaDestination: 'catalogue',
    secondaryCtaText: 'Book Atelier Fitting',
    secondaryCtaDestination: 'whatsapp',
    announcementStrip: 'Complimentary Kampala Express Delivery on orders over UGX 1,500,000 · WhatsApp Concierge: +256 772 987 654',
    featuredCollectionTitle: 'Signature Atelier Arrivals',
    featuredCollectionSubtitle: 'Archival Selection',
    aboutSectionHeadline: 'Where Heritage Meets Architectural Haute Couture.',
    aboutSectionStory: 'Founded in the heart of Kampala, G-Digitalz Fashions was born out of a desire to elevate indigenous Ugandan textiles and craftsmanship into the global luxury pantheon.',
    aboutSectionMetricsText: 'Over 2,400 bespoke garments delivered to satisfied clients across Kampala, East Africa, and the global diaspora.',
    sectionVisibility: {
      announcement: true,
      hero: true,
      proofPillars: true,
      featuredProducts: true,
      categorySpotlight: true,
      craftsmanshipStory: true,
      customerReviews: true,
      newsletter: true
    }
  };

  db.prepare(`
    INSERT INTO homepage_content (status, content_json, updated_by)
    VALUES ('published', ?, 'system'), ('draft', ?, 'system')
  `).run(JSON.stringify(defaultHomepage), JSON.stringify(defaultHomepage));

  // 6. Seed Appearance Settings
  const defaultAppearance = {
    primaryColor: '#1A1816',
    secondaryColor: '#8E6C3B',
    accentColor: '#C5A880',
    backgroundColor: '#FAF8F5',
    cardBackground: '#FFFFFF',
    fontHeading: 'Cormorant Garamond',
    fontBody: 'Plus Jakarta Sans',
    buttonRadius: 'rounded-xs', // 'rounded-none' | 'rounded-xs' | 'rounded' | 'rounded-full'
    enablePromotionalBanner: true,
    themeMode: 'luxury-light'
  };

  db.prepare(`
    INSERT INTO appearance_settings (id, config_json)
    VALUES ('current', ?)
  `).run(JSON.stringify(defaultAppearance));

  // 7. Seed Shipping Zones
  const shippingZones = [
    { id: 'zone-kampala-express', name: 'Kampala Express Same-Day (Within 3 Hours)', fee_ugx: 15000, estimated_time: 'Within 3 Hours', free_threshold_ugx: 1500000, is_active: 1, display_order: 1, notes: 'Doorstep delivery via G-Digitalz private chauffeur courier across Kololo, Nakasero, Bugolobi, Muyenga.' },
    { id: 'zone-kampala-standard', name: 'Standard Kampala Delivery (Next Day)', fee_ugx: 8000, estimated_time: 'Next Business Day', free_threshold_ugx: 1500000, is_active: 1, display_order: 2, notes: 'Dispatched the following morning across Greater Kampala and Wakiso.' },
    { id: 'zone-upcountry', name: 'Upcountry Uganda (24–48 Hours)', fee_ugx: 25000, estimated_time: '24–48 Hours', free_threshold_ugx: 2500000, is_active: 1, display_order: 3, notes: 'Jinja, Mbarara, Gulu, Mbale, Fort Portal via vetted regional express courier.' },
    { id: 'zone-international', name: 'East Africa & Worldwide DHL Express', fee_ugx: 120000, estimated_time: '3–5 Business Days', free_threshold_ugx: 5000000, is_active: 1, display_order: 4, notes: 'Kenya, Rwanda, Tanzania, United Kingdom, USA, Europe via tracked DHL Express.' },
  ];

  const insertZone = db.prepare(`
    INSERT INTO shipping_zones (id, name, fee_ugx, estimated_time, free_threshold_ugx, is_active, display_order, notes)
    VALUES (@id, @name, @fee_ugx, @estimated_time, @free_threshold_ugx, @is_active, @display_order, @notes)
  `);
  for (const zone of shippingZones) {
    insertZone.run(zone);
  }

  // 8. Seed Payment Methods
  const paymentMethods = [
    { id: 'pay-mtn-momo', name: 'MTN Mobile Money', provider: 'mtn-ug', is_enabled: 1, merchant_account: '0772 987 654', instructions: 'Instant USSD PIN push sent to your registered MTN phone number.', requires_verification: 1 },
    { id: 'pay-airtel-money', name: 'Airtel Money', provider: 'airtel-ug', is_enabled: 1, merchant_account: '0700 987 654', instructions: 'Instant payment prompt sent to your Airtel SIM card.', requires_verification: 1 },
    { id: 'pay-card', name: 'Credit / Debit Card', provider: 'visa-mastercard', is_enabled: 1, merchant_account: 'GDIGITALZ-PAY-01', instructions: 'Secured via 256-bit encrypted card gateway.', requires_verification: 1 },
    { id: 'pay-cod', name: 'Cash on Delivery', provider: 'cash', is_enabled: 1, merchant_account: 'KAMPALA-ONLY', instructions: 'Pay cash upon arrival. Available exclusively in Greater Kampala and Entebbe.', requires_verification: 0 },
  ];

  const insertPay = db.prepare(`
    INSERT INTO payment_methods (id, name, provider, is_enabled, merchant_account, instructions, requires_verification)
    VALUES (@id, @name, @provider, @is_enabled, @merchant_account, @instructions, @requires_verification)
  `);
  for (const pay of paymentMethods) {
    insertPay.run(pay);
  }

  // 9. Seed Reviews
  const reviews = [
    {
      id: 'rev-01',
      product_id: 'pf-01',
      product_name: 'The Kampala Imperial Silk Gown',
      author: 'Brenda Namubiru',
      location: 'Kololo, Kampala',
      rating: 5,
      title: 'Wore this to the Kampala Fashion Week Gala — absolute showstopper',
      comment: 'The craftsmanship of this gown is simply unmatched. The gold thread embroidery caught every light in the ballroom. Peter and his atelier team even accommodated my custom waist measurement within 48 hours.',
      status: 'approved',
      verified_buyer: 1,
      likes: 47
    },
    {
      id: 'rev-02',
      product_id: 'pf-02',
      product_name: 'Nakasero Mandarin Linen Suit',
      author: 'Dr. Arthur Mukasa',
      location: 'Nakasero, Kampala',
      rating: 5,
      title: 'The sharpest suit in East Africa. Pure class.',
      comment: 'I ordered the Mandarin Linen Suit for my daughter’s introduction ceremony (Kwanjula) and reception. The fit around the shoulders is effortless, and the geometric Buganda cuff detailing earned countless compliments.',
      status: 'approved',
      verified_buyer: 1,
      likes: 38
    },
    {
      id: 'rev-03',
      product_id: 'pf-03',
      product_name: 'Victoria Heritage Blazer Dress',
      author: 'Zahra Kembabazi',
      location: 'London, United Kingdom',
      rating: 5,
      title: 'Diaspora approved: Stunning fit, arrived via DHL in 4 days',
      comment: 'Living in London, it is rare to find Afro-luxe clothing that matches Savile Row construction standards. This blazer dress holds its structural shape beautifully and transitions effortlessly.',
      status: 'approved',
      verified_buyer: 1,
      likes: 52
    },
    {
      id: 'rev-04',
      product_id: 'pf-04',
      product_name: 'Kawanda Artisan Leather & Fiber Tote',
      author: 'Joshua Ssemwogerere',
      location: 'Entebbe, Uganda',
      rating: 5,
      title: 'Exceptional leather quality, genuine artisan pride',
      comment: 'The combination of natural banana fiber weave with Ugandan vegetable-tanned leather is genius. It is sturdy, fits my MacBook Pro and travel wardrobe effortlessly.',
      status: 'approved',
      verified_buyer: 1,
      likes: 29
    }
  ];

  const insertReview = db.prepare(`
    INSERT INTO reviews (id, product_id, product_name, author, location, rating, title, comment, status, verified_buyer, likes)
    VALUES (@id, @product_id, @product_name, @author, @location, @rating, @title, @comment, @status, @verified_buyer, @likes)
  `);
  for (const rev of reviews) {
    insertReview.run(rev);
  }

  // 10. Seed Sample Verified Orders
  const sampleOrder = {
    id: 'ord-init-01',
    order_number: 'PF-2026-1042',
    customer_name: 'Grace Nakamya',
    customer_email: 'grace.nakamya@gmail.com',
    customer_phone: '+256 772 123 456',
    delivery_address: 'Plot 28 Elizabeth Avenue, Kololo',
    delivery_landmark: 'Near Kololo Airstrip / Opposite Acacia Mall lane',
    delivery_city: 'Kampala',
    delivery_district: 'Kampala Central',
    delivery_method: 'Kampala Express Same-Day',
    delivery_fee_ugx: 15000,
    delivery_notes: 'Please call security gate on arrival.',
    subtotal_ugx: 1850000,
    discount_ugx: 0,
    total_ugx: 1865000,
    status: 'Confirmed',
    payment_method: 'mtn-momo',
    payment_status: 'Paid',
    momo_number: '0772 123 456',
    internal_notes: 'Client requested gold dust packaging. Dispatched with private courier.',
  };

  db.prepare(`
    INSERT INTO orders (
      id, order_number, customer_name, customer_email, customer_phone, delivery_address,
      delivery_landmark, delivery_city, delivery_district, delivery_method, delivery_fee_ugx,
      delivery_notes, subtotal_ugx, discount_ugx, total_ugx, status, payment_method,
      payment_status, momo_number, internal_notes
    ) VALUES (
      @id, @order_number, @customer_name, @customer_email, @customer_phone, @delivery_address,
      @delivery_landmark, @delivery_city, @delivery_district, @delivery_method, @delivery_fee_ugx,
      @delivery_notes, @subtotal_ugx, @discount_ugx, @total_ugx, @status, @payment_method,
      @payment_status, @momo_number, @internal_notes
    )
  `).run(sampleOrder);

  // Snapshot line item
  db.prepare(`
    INSERT INTO order_items (
      id, order_id, product_id, product_name_snapshot, size_snapshot, color_snapshot,
      unit_price_ugx_snapshot, quantity, line_total_ugx, image_snapshot
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'item-init-01',
    'ord-init-01',
    'pf-01',
    'The Kampala Imperial Silk Gown',
    'UK 10 / S',
    'Emerald Green & Gold',
    1850000,
    1,
    1850000,
    '/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg'
  );

  // 11. Initial Audit Log
  db.prepare(`
    INSERT INTO audit_logs (id, actor_id, actor_name, action, target_type, target_id, details_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'log-init-01',
    'usr-owner-01',
    'Peter Katende',
    'INITIALIZE_STORE',
    'STORE',
    'gdigitalz-fashions',
    JSON.stringify({ note: 'G-Digitalz Fashions production store initialized with high-fidelity Ugandan couture collection' })
  );
}

// Automatically initialize tables and seed data upon module load
initializeDatabase();
