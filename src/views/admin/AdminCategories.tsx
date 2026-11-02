import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Upload, Layers, Check, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { Category } from '../../types';

export const AdminCategories: React.FC = () => {
  const { authFetch, showAdminNotification } = useAdmin();
  const { refreshStore } = useShop();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isPublished, setIsPublished] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg');
    setDisplayOrder(categories.length + 1);
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setDisplayOrder(cat.display_order);
    setIsPublished(Boolean(cat.is_published));
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
        setImage(data.url);
        showAdminNotification('Category banner uploaded');
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      description: description.trim(),
      image,
      display_order: Number(displayOrder),
      is_published: isPublished,
    };

    try {
      let res;
      if (editingCategory) {
        res = await authFetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showAdminNotification(editingCategory ? 'Category updated' : 'Category created');
        setIsModalOpen(false);
        await loadCategories();
        await refreshStore();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      const res = await authFetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' });
      if (res.ok) {
        showAdminNotification('Category deleted');
        await loadCategories();
        await refreshStore();
      } else {
        const err = await res.json();
        alert(err.error || 'Delete failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#1A1816]">Category Management</h2>
          <p className="text-xs text-[#7A7165]">
            Configure wardrobe divisions, collection banners, and public hierarchy
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-[#1A1816] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#322D27] transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-[#E8E2D9] rounded-xs overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div className="relative aspect-video w-full bg-[#EFECE6] border-b border-[#E8E2D9]">
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#9C9284]">
                  <Layers className="w-8 h-8" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-[#FAF8F5]/90 text-[#1A1816] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#E8E2D9]">
                Order: #{cat.display_order}
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-editorial text-lg font-medium text-[#1A1816]">{cat.name}</h3>
                <p className="text-xs text-[#7A7165] line-clamp-2 mt-1">{cat.description}</p>
                <p className="text-[11px] text-[#8E6C3B] font-semibold mt-2">
                  {cat.product_count ?? 0} active creations
                </p>
              </div>

              <div className="pt-3 border-t border-[#EFECE6] flex items-center justify-between">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    cat.is_published ? 'bg-[#EBF6EE] text-[#2F6B45]' : 'bg-[#EFECE6] text-[#7A7165]'
                  }`}
                >
                  {cat.is_published ? 'Published' : 'Hidden'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-[#4A433A] hover:text-[#1A1816] hover:bg-[#EFECE6] rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 text-[#B91C1C] hover:bg-[#FEE2E2] rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#FAF8F5] border border-[#D5CDC1] rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 text-[#1A1816]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D9]">
              <h3 className="font-editorial text-xl font-semibold">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-[#7A7165]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bridal & Ceremonial Robes"
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief note about garments in this category..."
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="accent-[#1A1816]"
                    />
                    <span className="font-semibold text-[#1A1816]">Publish to Catalog</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Cover Banner Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="/uploads/... or /src/assets/..."
                    className="flex-1 bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs"
                  />
                  <label className="px-3 py-2 bg-[#1A1816] text-[#FAF8F5] text-[11px] rounded cursor-pointer hover:bg-[#322D27] flex items-center gap-1.5 whitespace-nowrap">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D5CDC1] text-[#595045] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1816] text-[#FAF8F5] font-semibold uppercase tracking-wider rounded"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
