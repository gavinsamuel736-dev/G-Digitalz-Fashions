import React, { useEffect, useState } from 'react';
import { Upload, Save, Globe, Phone, Mail, MapPin, MessageCircle, FileText } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { StoreBranding } from '../../types';

export const AdminBranding: React.FC = () => {
  const { authFetch, showAdminNotification } = useAdmin();
  const { refreshStore } = useShop();

  const [branding, setBranding] = useState<StoreBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/admin/branding');
      if (res.ok) {
        const data = await res.json();
        setBranding(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranding();
  }, []);

  const handleFieldChange = (field: string, value: any) => {
    if (!branding) return;
    setBranding((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: 'socialLinks' | 'policies', key: string, value: string) => {
    if (!branding) return;
    setBranding((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value,
      },
    }));
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    const isLogo = type === 'logo';
    isLogo ? setUploadingLogo(true) : setUploadingFavicon(true);

    const body = new FormData();
    body.append('file', file);

    try {
      const res = await authFetch('/api/admin/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (res.ok) {
        handleFieldChange(isLogo ? 'logoUrl' : 'faviconUrl', data.url);
        showAdminNotification(`${isLogo ? 'Logo' : 'Favicon'} uploaded to persistent storage`);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      isLogo ? setUploadingLogo(false) : setUploadingFavicon(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branding) return;

    setSaving(true);
    try {
      const res = await authFetch('/api/admin/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });
      if (res.ok) {
        showAdminNotification('Branding & Store Information saved and published');
        await refreshStore();
      } else {
        alert('Failed to save');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !branding) {
    return <div className="py-20 text-center text-xs text-[#7A7165]">Loading store branding...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#1A1816]">Store Branding & Information</h2>
          <p className="text-xs text-[#7A7165]">
            Configure store name, logo, WhatsApp concierge numbers, Kampala studio address, and legal policies
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Identity & Visual Assets */}
        <div className="bg-white p-6 rounded-xs border border-[#E8E2D9] space-y-4 shadow-xs">
          <h3 className="font-editorial text-lg font-semibold text-[#1A1816] pb-2 border-b border-[#E8E2D9]">
            1. Brand Identity & Visual Marks
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={branding.storeName}
                onChange={(e) => handleFieldChange('storeName', e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3.5 py-2.5 rounded font-editorial text-base text-[#1A1816] focus:outline-none focus:border-[#8E6C3B]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                Store Tagline
              </label>
              <input
                type="text"
                value={branding.tagline}
                onChange={(e) => handleFieldChange('tagline', e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3.5 py-2.5 rounded text-xs text-[#1A1816] focus:outline-none focus:border-[#8E6C3B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Logo */}
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                Store Logo Image (Optional Header Mark)
              </label>
              <div className="flex items-center gap-4">
                {branding.logoUrl ? (
                  <img
                    src={branding.logoUrl}
                    alt="Logo"
                    className="w-20 h-10 object-contain border border-[#D5CDC1] rounded p-1 bg-[#FAF8F5]"
                  />
                ) : (
                  <div className="w-20 h-10 border border-dashed border-[#D5CDC1] rounded flex items-center justify-center text-[10px] text-[#A89885]">
                    Text Wordmark
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={branding.logoUrl || ''}
                    onChange={(e) => handleFieldChange('logoUrl', e.target.value)}
                    placeholder="URL or upload file..."
                    className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-1.5 rounded text-xs"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1816] text-[#FAF8F5] text-[11px] rounded cursor-pointer hover:bg-[#322D27]">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                Favicon (Browser Tab Icon)
              </label>
              <div className="flex items-center gap-4">
                {branding.faviconUrl ? (
                  <img
                    src={branding.faviconUrl}
                    alt="Favicon"
                    className="w-8 h-8 object-contain border border-[#D5CDC1] rounded p-1"
                  />
                ) : (
                  <div className="w-8 h-8 border border-dashed border-[#D5CDC1] rounded flex items-center justify-center text-[10px] text-[#A89885]">
                    PF
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={branding.faviconUrl || ''}
                    onChange={(e) => handleFieldChange('faviconUrl', e.target.value)}
                    placeholder="/uploads/favicon.png"
                    className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-1.5 rounded text-xs"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1816] text-[#FAF8F5] text-[11px] rounded cursor-pointer hover:bg-[#322D27]">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}</span>
                    <input
                      type="file"
                      accept="image/png,image/x-icon,image/svg+xml"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'favicon')}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Coordinates */}
        <div className="bg-white p-6 rounded-xs border border-[#E8E2D9] space-y-4 shadow-xs">
          <h3 className="font-editorial text-lg font-semibold text-[#1A1816] pb-2 border-b border-[#E8E2D9]">
            2. Customer Concierge & Kampala Atelier Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                WhatsApp Concierge Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={branding.whatsappNumber}
                  onChange={(e) => handleFieldChange('whatsappNumber', e.target.value)}
                  placeholder="+256772987654"
                  className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 pl-8 rounded text-xs text-[#1A1816]"
                />
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={branding.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 pl-8 rounded text-xs text-[#1A1816]"
                />
                <Phone className="w-3.5 h-3.5 text-[#7A7165] absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                Official Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={branding.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 pl-8 rounded text-xs text-[#1A1816]"
                />
                <Mail className="w-3.5 h-3.5 text-[#7A7165] absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                Physical Atelier Studio Address
              </label>
              <input
                type="text"
                value={branding.physicalAddress}
                onChange={(e) => handleFieldChange('physicalAddress', e.target.value)}
                placeholder="Plot 14 Nakasero Hill Road, Kampala, Uganda"
                className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 rounded text-xs text-[#1A1816]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={branding.operatingHours}
                onChange={(e) => handleFieldChange('operatingHours', e.target.value)}
                placeholder="Monday - Saturday: 9:00 AM - 7:00 PM"
                className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 rounded text-xs text-[#1A1816]"
              />
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white p-6 rounded-xs border border-[#E8E2D9] space-y-4 shadow-xs">
          <h3 className="font-editorial text-lg font-semibold text-[#1A1816] pb-2 border-b border-[#E8E2D9]">
            3. Client Policies & Legal Terms
          </h3>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
              Bespoke Alteration & Returns Policy
            </label>
            <textarea
              rows={2}
              value={branding.policies?.returnPolicy || ''}
              onChange={(e) => handleNestedChange('policies', 'returnPolicy', e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#D5CDC1] p-2.5 rounded text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
              Privacy Policy
            </label>
            <textarea
              rows={2}
              value={branding.policies?.privacyPolicy || ''}
              onChange={(e) => handleNestedChange('policies', 'privacyPolicy', e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#D5CDC1] p-2.5 rounded text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#1A1816] text-[#FAF8F5] uppercase tracking-wider font-semibold rounded hover:bg-[#322D27] cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save & Publish Branding'}
          </button>
        </div>
      </form>
    </div>
  );
};
