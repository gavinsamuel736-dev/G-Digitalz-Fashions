import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { Product, Category } from '../../types';

export const AdminProducts: React.FC = () => {
  const { authFetch, showAdminNotification } = useAdmin();
  const { formatPrice, refreshStore } = useShop();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    category_id: '',
    price_ugx: 500000,
    compare_at_price_ugx: '',
    price_usd: 135,
    image: '',
    gallery: [] as string[],
    description: '',
    fabric: '',
    detailsText: '',
    careText: '',
    sizesText: 'UK 8 / XS, UK 10 / S, UK 12 / M, UK 14 / L, Bespoke Made-to-Measure',
    colorsText: 'Natural, Obsidian, Terracotta',
    stock_quantity: 10,
    is_in_stock: true,
    is_featured: false,
    is_new_arrival: false,
    badge: '',
    is_published: true,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        authFetch('/api/admin/products'),
        authFetch('/api/admin/categories'),
      ]);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (err) {
      console.error('Failed to load products/categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      tagline: '',
      category_id: categories[0]?.id || '',
      price_ugx: 750000,
      compare_at_price_ugx: '',
      price_usd: 200,
      image: '/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg',
      gallery: ['/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg'],
      description: '',
      fabric: '100% Organic Ugandan Cotton / Raw Silk',
      detailsText: 'Hand-cut single-needle tailoring\nInterior lining\nConcealed closures',
      careText: 'Dry clean only\nStore in garment bag',
      sizesText: 'UK 8 / XS, UK 10 / S, UK 12 / M, UK 14 / L, Bespoke',
      colorsText: 'Obsidian, Ivory, Gold',
      stock_quantity: 12,
      is_in_stock: true,
      is_featured: false,
      is_new_arrival: true,
      badge: 'New Season',
      is_published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      tagline: product.tagline || '',
      category_id: product.category_id || '',
      price_ugx: product.price_ugx,
      compare_at_price_ugx: product.compare_at_price_ugx ? String(product.compare_at_price_ugx) : '',
      price_usd: product.price_usd || Math.round(product.price_ugx / 3750),
      image: product.image,
      gallery: product.gallery || [product.image],
      description: product.description || '',
      fabric: product.fabric || '',
      detailsText: (product.details || []).join('\n'),
      careText: (product.care || []).join('\n'),
      sizesText: (product.availableSizes || []).join(', '),
      colorsText: (product.colors || []).join(', '),
      stock_quantity: product.stock_quantity ?? 10,
      is_in_stock: Boolean(product.is_in_stock),
      is_featured: Boolean(product.is_featured),
      is_new_arrival: Boolean(product.is_new_arrival),
      badge: product.badge || '',
      is_published: Boolean(product.is_published),
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await authFetch('/api/admin/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (res.ok) {
        setFormData((prev) => ({
          ...prev,
          image: data.url,
          gallery: [data.url, ...prev.gallery],
        }));
        showAdminNotification('Image uploaded successfully to persistent storage');
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      tagline: formData.tagline.trim(),
      category_id: formData.category_id,
      price_ugx: Number(formData.price_ugx),
      compare_at_price_ugx: formData.compare_at_price_ugx ? Number(formData.compare_at_price_ugx) : null,
      price_usd: Number(formData.price_usd) || Math.round(Number(formData.price_ugx) / 3750),
      image: formData.image,
      gallery: formData.gallery.length > 0 ? formData.gallery : [formData.image],
      description: formData.description.trim(),
      fabric: formData.fabric.trim(),
      details: formData.detailsText.split('\n').map((s) => s.trim()).filter(Boolean),
      care: formData.careText.split('\n').map((s) => s.trim()).filter(Boolean),
      sizes: formData.sizesText.split(',').map((s) => s.trim()).filter(Boolean),
      colors: formData.colorsText.split(',').map((s) => s.trim()).filter(Boolean),
      stock_quantity: Number(formData.stock_quantity),
      is_in_stock: formData.stock_quantity > 0 && formData.is_in_stock,
      is_featured: formData.is_featured,
      is_new_arrival: formData.is_new_arrival,
      badge: formData.badge.trim() || null,
      is_published: formData.is_published,
    };

    try {
      let res;
      if (editingProduct) {
        res = await authFetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showAdminNotification(
          editingProduct ? `Updated "${payload.name}" successfully` : `Created "${payload.name}" in database`
        );
        setIsModalOpen(false);
        await loadData();
        await refreshStore();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save product');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAdminNotification('Product deleted permanently from database');
        setIsDeletingId(null);
        await loadData();
        await refreshStore();
      } else {
        const err = await res.json();
        alert(err.error || 'Delete failed');
      }
    } catch (err: any) {
      alert('Delete error: ' + err.message);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.tagline || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#1A1816]">Product Management</h2>
          <p className="text-xs text-[#7A7165]">
            Create, price, manage inventory, and publish pieces across the customer catalog
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-[#1A1816] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#322D27] transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Creation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xs border border-[#E8E2D9]">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title or fabric..."
            className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 pl-9 text-xs text-[#1A1816] rounded-xs focus:outline-none focus:border-[#8E6C3B]"
          />
          <Search className="w-3.5 h-3.5 text-[#7A7165] absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#7A7165] whitespace-nowrap">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 text-xs text-[#1A1816] rounded-xs focus:outline-none focus:border-[#8E6C3B]"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E8E2D9] rounded-xs shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-[#7A7165] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-medium">Garment / Creation</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Price (UGX)</th>
                <th className="py-3 px-4 font-medium">Stock</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-16 object-cover object-top rounded-xs border border-[#E8E2D9] bg-[#EFECE6]"
                      />
                      <div>
                        <span className="font-editorial text-base font-medium text-[#1A1816] block">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-[#7A7165] line-clamp-1">
                          {p.tagline}
                        </span>
                        {p.badge && (
                          <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-semibold text-[#8E6C3B] bg-[#8E6C3B]/10 px-1.5 py-0.5 rounded">
                            {p.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#4A433A] whitespace-nowrap">
                    {p.category_name || p.category_id}
                  </td>
                  <td className="py-3 px-4 tabular-nums font-semibold text-[#1A1816]">
                    {formatPrice(p.price_ugx)}
                    {p.compare_at_price_ugx && (
                      <span className="block text-[10px] text-[#A89885] line-through">
                        {formatPrice(p.compare_at_price_ugx)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.stock_quantity <= 5
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : 'bg-[#EBF6EE] text-[#2F6B45]'
                      }`}
                    >
                      {p.stock_quantity} units {p.stock_quantity <= 5 ? '(Low)' : ''}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.is_published ? 'bg-[#EBF6EE] text-[#2F6B45]' : 'bg-[#EFECE6] text-[#7A7165]'
                      }`}
                    >
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-[#4A433A] hover:text-[#1A1816] hover:bg-[#EFECE6] rounded transition-colors"
                        title="Edit product details & price"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsDeletingId(p.id)}
                        className="p-1.5 text-[#B91C1C] hover:bg-[#FEE2E2] rounded transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#FAF8F5] border border-[#D5CDC1] p-6 rounded-md max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-editorial text-xl font-semibold text-[#1A1816]">Confirm Product Deletion</h3>
            <p className="text-xs text-[#595045] leading-relaxed">
              Are you sure you want to permanently delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 border border-[#D5CDC1] text-xs text-[#595045] rounded hover:bg-[#EFECE6]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(isDeletingId)}
                className="px-4 py-2 bg-[#B91C1C] text-white text-xs font-semibold rounded hover:bg-[#991B1B]"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-[#D5CDC1] rounded-lg max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto text-[#1A1816]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
              <div>
                <h3 className="font-editorial text-2xl font-semibold">
                  {editingProduct ? 'Edit Atelier Creation' : 'Add New Atelier Creation'}
                </h3>
                <p className="text-xs text-[#7A7165]">
                  Updates are saved directly to the database and sync live with the customer storefront.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#7A7165] hover:text-[#1A1816] rounded-full hover:bg-[#EFECE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Garment Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. The Kampala Imperial Silk Gown"
                    className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#8E6C3B]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#8E6C3B]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Tagline / Brief Subtitle
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Sculptural asymmetric evening couture with hand-threaded golden filigree"
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#8E6C3B]"
                />
              </div>

              {/* Pricing & Stock Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#EFECE6]/70 rounded-xs">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Price in UGX (Integer) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={formData.price_ugx}
                    onChange={(e) => setFormData({ ...formData, price_ugx: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs font-semibold tabular-nums focus:outline-none focus:border-[#8E6C3B]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Original / Compare-at UGX (Optional)
                  </label>
                  <input
                    type="number"
                    step={1000}
                    value={formData.compare_at_price_ugx}
                    onChange={(e) => setFormData({ ...formData, compare_at_price_ugx: e.target.value })}
                    placeholder="e.g. 2100000"
                    className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs tabular-nums focus:outline-none focus:border-[#8E6C3B]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Available Stock Inventory *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs tabular-nums focus:outline-none focus:border-[#8E6C3B]"
                  />
                </div>
              </div>

              {/* Image Upload & URL */}
              <div className="space-y-2">
                <label className="block uppercase tracking-wider font-semibold text-[#595045]">
                  Primary Product Image *
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={formData.image || '/src/assets/images/hero_peterz_couture_1793621754106.jpg'}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-16 h-20 object-cover object-top border border-[#D5CDC1] rounded-xs bg-[#EFECE6]"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      required
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="/uploads/my_gown.jpg or /src/assets/images/..."
                      className="w-full bg-white border border-[#D5CDC1] px-3 py-1.5 rounded text-xs focus:outline-none focus:border-[#8E6C3B]"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1816] text-[#FAF8F5] text-[11px] rounded cursor-pointer hover:bg-[#322D27]">
                      <Upload className="w-3 h-3" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload File to Persistent Storage'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Description & Fabric */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Fabric Composition
                  </label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="e.g. 100% Ugandan Mulberry Silk & Metallic Gold Threading"
                    className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#8E6C3B]"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Promotional Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Atelier Signature, Limited Run, Bestseller"
                    className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#8E6C3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Editorial Garment Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed tailoring notes, silhouettes, and cultural context..."
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#8E6C3B]"
                />
              </div>

              {/* Sizes and Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Available Sizes (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formData.sizesText}
                    onChange={(e) => setFormData({ ...formData, sizesText: e.target.value })}
                    placeholder="UK 8 / XS, UK 10 / S, UK 12 / M, Bespoke"
                    className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#8E6C3B]"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Available Colors (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formData.colorsText}
                    onChange={(e) => setFormData({ ...formData, colorsText: e.target.value })}
                    placeholder="Emerald Gold, Obsidian, Terracotta"
                    className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#8E6C3B]"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[#E8E2D9]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="accent-[#1A1816]"
                  />
                  <span className="font-semibold text-[#1A1816]">Publish to Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="accent-[#1A1816]"
                  />
                  <span className="text-[#595045]">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                    className="accent-[#1A1816]"
                  />
                  <span className="text-[#595045]">Mark as New Arrival</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D5CDC1] text-[#595045] rounded hover:bg-[#EFECE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1A1816] text-[#FAF8F5] uppercase tracking-wider font-semibold rounded hover:bg-[#322D27] cursor-pointer"
                >
                  {editingProduct ? 'Save & Sync Product' : 'Create & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
