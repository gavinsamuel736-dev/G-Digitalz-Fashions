import React, { useEffect, useState } from 'react';
import { Palette, RotateCcw, Check, Sparkles, Layout } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { AppearanceSettings } from '../../types';

export const AdminAppearance: React.FC = () => {
  const { authFetch, showAdminNotification } = useAdmin();
  const { refreshStore } = useShop();

  const [appearance, setAppearance] = useState<AppearanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAppearance = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/admin/appearance');
      if (res.ok) {
        const data = await res.json();
        setAppearance(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppearance();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appearance) return;
    setSaving(true);
    try {
      const res = await authFetch('/api/admin/appearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appearance),
      });
      if (res.ok) {
        showAdminNotification('Appearance settings saved and published');
        await refreshStore();
      } else {
        alert('Failed to save appearance');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('Are you sure you want to reset appearance settings to the default luxury fashion theme?')) return;
    try {
      const res = await authFetch('/api/admin/appearance/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAppearance(data.config);
        showAdminNotification('Appearance reset to default G-Digitalz luxury palette');
        await refreshStore();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || !appearance) {
    return <div className="py-20 text-center text-xs text-[#7A7165]">Loading appearance settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#1A1816]">Website Appearance & Styling</h2>
          <p className="text-xs text-[#7A7165]">
            Customize luxury palettes, button geometries, and brand typography without touching CSS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2 border border-[#D5CDC1] text-[#7A7165] hover:text-[#1A1816] text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Inputs (8 Cols) */}
        <div className="lg:col-span-8 space-y-6 bg-white p-6 rounded-xs border border-[#E8E2D9] shadow-xs text-xs">
          {/* Colors */}
          <div className="space-y-4">
            <h3 className="font-editorial text-lg font-semibold text-[#1A1816] pb-2 border-b border-[#E8E2D9]">
              1. Brand Color Palette (60-30-10 Distribution)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Primary Brand Tone (Obsidian)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.primaryColor}
                    onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                    className="w-9 h-9 p-0 border border-[#D5CDC1] rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={appearance.primaryColor}
                    onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                    className="flex-1 bg-[#FAF8F5] border border-[#D5CDC1] px-2.5 py-1.5 rounded font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Secondary Accent (Atelier Ochre)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.secondaryColor}
                    onChange={(e) => setAppearance({ ...appearance, secondaryColor: e.target.value })}
                    className="w-9 h-9 p-0 border border-[#D5CDC1] rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={appearance.secondaryColor}
                    onChange={(e) => setAppearance({ ...appearance, secondaryColor: e.target.value })}
                    className="flex-1 bg-[#FAF8F5] border border-[#D5CDC1] px-2.5 py-1.5 rounded font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Page Canvas Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.backgroundColor}
                    onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
                    className="w-9 h-9 p-0 border border-[#D5CDC1] rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={appearance.backgroundColor}
                    onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
                    className="flex-1 bg-[#FAF8F5] border border-[#D5CDC1] px-2.5 py-1.5 rounded font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-4 pt-4 border-t border-[#E8E2D9]">
            <h3 className="font-editorial text-lg font-semibold text-[#1A1816] pb-2 border-b border-[#E8E2D9]">
              2. Approved Web Typography
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Editorial Headline Font
                </label>
                <select
                  value={appearance.fontHeading}
                  onChange={(e) => setAppearance({ ...appearance, fontHeading: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 rounded text-xs text-[#1A1816]"
                >
                  <option value="Cormorant Garamond">Cormorant Garamond (Classical Luxury)</option>
                  <option value="Playfair Display">Playfair Display (Vogue Editorial)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Geometric)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Body Prose Font
                </label>
                <select
                  value={appearance.fontBody}
                  onChange={(e) => setAppearance({ ...appearance, fontBody: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 rounded text-xs text-[#1A1816]"
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Highly Legible Sans)</option>
                  <option value="DM Sans">DM Sans (Clean Humanist)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Geometry & Buttons */}
          <div className="space-y-4 pt-4 border-t border-[#E8E2D9]">
            <h3 className="font-editorial text-lg font-semibold text-[#1A1816] pb-2 border-b border-[#E8E2D9]">
              3. Button & Card Corner Radius
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'rounded-none', label: 'Sharp (0px)' },
                { id: 'rounded-xs', label: 'Atelier (2px)' },
                { id: 'rounded', label: 'Subtle (4px)' },
                { id: 'rounded-full', label: 'Pill Radius' },
              ].map((style) => (
                <button
                  type="button"
                  key={style.id}
                  onClick={() => setAppearance({ ...appearance, buttonRadius: style.id as any })}
                  className={`p-3 border text-center transition-all ${
                    appearance.buttonRadius === style.id
                      ? 'border-[#1A1816] bg-[#1A1816] text-[#FAF8F5] font-semibold'
                      : 'border-[#D5CDC1] bg-[#FAF8F5] text-[#595045]'
                  }`}
                >
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#1A1816] text-[#FAF8F5] uppercase tracking-wider font-semibold rounded hover:bg-[#322D27] cursor-pointer"
            >
              {saving ? 'Publishing Styling...' : 'Save & Publish Appearance'}
            </button>
          </div>
        </div>

        {/* Right: Live Style Preview Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xs border border-[#E8E2D9] space-y-4 shadow-xs text-xs">
          <h4 className="font-editorial text-base font-semibold text-[#1A1816] border-b border-[#E8E2D9] pb-2">
            Real-time Palette Preview
          </h4>

          <div
            className="p-5 border rounded-xs space-y-3"
            style={{ backgroundColor: appearance.backgroundColor }}
          >
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: appearance.secondaryColor }}>
                Kampala Signature Couture
              </span>
              <h5
                className="text-lg font-semibold"
                style={{
                  color: appearance.primaryColor,
                  fontFamily: appearance.fontHeading,
                }}
              >
                The Imperial Duchess Silk Gown
              </h5>
              <p className="text-xs text-[#595045]">
                Demonstration card showing live color and typography pairings.
              </p>
            </div>

            <button
              type="button"
              className={`w-full py-2.5 text-xs text-white uppercase tracking-wider font-semibold ${appearance.buttonRadius}`}
              style={{ backgroundColor: appearance.primaryColor }}
            >
              Primary Purchase CTA
            </button>

            <button
              type="button"
              className={`w-full py-2 text-xs uppercase tracking-wider font-semibold border ${appearance.buttonRadius}`}
              style={{
                borderColor: appearance.secondaryColor,
                color: appearance.secondaryColor,
              }}
            >
              Secondary Concierge Action
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
