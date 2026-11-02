import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Save,
  Send,
  Upload,
  Eye,
  Check,
  RotateCcw,
  Layers,
  ArrowRight,
  Globe,
  X,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { HomepageContent } from '../../types';

export const AdminHomepageEditor: React.FC = () => {
  const { authFetch, showAdminNotification } = useAdmin();
  const { refreshStore, setCurrentView } = useShop();

  const [draft, setDraft] = useState<HomepageContent | null>(null);
  const [published, setPublished] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const loadHomepageData = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/admin/homepage/draft');
      if (res.ok) {
        const data = await res.json();
        setDraft(data.draft);
        setPublished(data.published);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomepageData();
  }, []);

  const handleFieldChange = (field: keyof HomepageContent, value: any) => {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  };

  const handleVisibilityToggle = (sectionKey: keyof HomepageContent['sectionVisibility']) => {
    if (!draft) return;
    setDraft({
      ...draft,
      sectionVisibility: {
        ...draft.sectionVisibility,
        [sectionKey]: !draft.sectionVisibility[sectionKey],
      },
    });
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        handleFieldChange('heroBannerImage', data.url);
        showAdminNotification('Hero banner uploaded to persistent storage');
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!draft) return;
    setIsSavingDraft(true);
    try {
      const res = await authFetch('/api/admin/homepage/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        showAdminNotification('Homepage draft saved successfully');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save draft');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublishChanges = async () => {
    if (!draft) return;
    setIsPublishing(true);
    try {
      const res = await authFetch('/api/admin/homepage/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        showAdminNotification('Homepage published live! Customers see changes immediately.');
        setPublished(draft);
        await refreshStore(); // Sync client
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to publish');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRevertDraft = () => {
    if (!published) return;
    if (confirm('Revert current draft to the last published version?')) {
      setDraft(published);
    }
  };

  if (loading || !draft) {
    return <div className="py-20 text-center text-xs text-[#7A7165]">Loading homepage editor...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#1A1816]">Homepage Customizer</h2>
          <p className="text-xs text-[#7A7165]">
            Edit headlines, campaign banners, and CTAs. Save drafts safely or publish live to Uganda and global visitors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2 border border-[#D5CDC1] text-[#4A433A] text-xs font-semibold rounded-xs hover:bg-[#EFECE6] flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Draft</span>
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="px-4 py-2 border border-[#1A1816] text-[#1A1816] text-xs font-semibold rounded-xs hover:bg-[#EFECE6] flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
          </button>
          <button
            onClick={handlePublishChanges}
            disabled={isPublishing}
            className="px-5 py-2 bg-[#8E6C3B] text-white text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#A37D46] shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing Live...' : 'Publish Changes'}</span>
          </button>
        </div>
      </div>

      {/* Editor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor Inputs (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Hero Campaign Section */}
          <div className="bg-white border border-[#E8E2D9] p-6 rounded-xs space-y-4 shadow-xs">
            <h3 className="font-editorial text-lg font-semibold text-[#1A1816] pb-2 border-b border-[#E8E2D9]">
              1. Hero Campaign Banner & Messaging
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Main Headline (Balanced Display Prose) *
                </label>
                <input
                  type="text"
                  value={draft.headline}
                  onChange={(e) => handleFieldChange('headline', e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3.5 py-2.5 rounded font-editorial text-base text-[#1A1816] focus:outline-none focus:border-[#8E6C3B]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Supporting Editorial Subtitle *
                </label>
                <textarea
                  rows={2}
                  value={draft.supportingText}
                  onChange={(e) => handleFieldChange('supportingText', e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3.5 py-2 rounded text-xs text-[#1A1816] focus:outline-none focus:border-[#8E6C3B]"
                />
              </div>

              {/* Hero Image */}
              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Hero Campaign Backdrop Image *
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={draft.heroBannerImage}
                    alt="Hero Banner Preview"
                    referrerPolicy="no-referrer"
                    className="w-28 h-16 object-cover rounded-xs border border-[#D5CDC1]"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={draft.heroBannerImage}
                      onChange={(e) => handleFieldChange('heroBannerImage', e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-1.5 rounded text-xs text-[#1A1816]"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1816] text-[#FAF8F5] text-[11px] rounded cursor-pointer hover:bg-[#322D27]">
                      <Upload className="w-3 h-3" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload New Hero Banner'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                    </label>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={draft.primaryCtaText}
                    onChange={(e) => handleFieldChange('primaryCtaText', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 rounded text-xs text-[#1A1816]"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Secondary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={draft.secondaryCtaText}
                    onChange={(e) => handleFieldChange('secondaryCtaText', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 rounded text-xs text-[#1A1816]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Announcement Strip & Section Titles */}
          <div className="bg-white border border-[#E8E2D9] p-6 rounded-xs space-y-4 shadow-xs">
            <h3 className="font-editorial text-lg font-semibold text-[#1A1816] pb-2 border-b border-[#E8E2D9]">
              2. Announcement Strip & Titles
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Top Announcement Strip Message
                </label>
                <input
                  type="text"
                  value={draft.announcementStrip}
                  onChange={(e) => handleFieldChange('announcementStrip', e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3.5 py-2 rounded text-xs text-[#1A1816]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Featured Collection Section Title
                  </label>
                  <input
                    type="text"
                    value={draft.featuredCollectionTitle}
                    onChange={(e) => handleFieldChange('featuredCollectionTitle', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 rounded text-xs text-[#1A1816]"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                    Featured Collection Subtitle
                  </label>
                  <input
                    type="text"
                    value={draft.featuredCollectionSubtitle}
                    onChange={(e) => handleFieldChange('featuredCollectionSubtitle', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 rounded text-xs text-[#1A1816]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. About & Atelier Heritage Section */}
          <div className="bg-white border border-[#E8E2D9] p-6 rounded-xs space-y-4 shadow-xs">
            <h3 className="font-editorial text-lg font-semibold text-[#1A1816] pb-2 border-b border-[#E8E2D9]">
              3. Atelier Craftsmanship Story & Metrics
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Atelier Story Headline
                </label>
                <input
                  type="text"
                  value={draft.aboutSectionHeadline}
                  onChange={(e) => handleFieldChange('aboutSectionHeadline', e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3.5 py-2 rounded text-xs text-[#1A1816]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Craftsmanship Manifesto Prose
                </label>
                <textarea
                  rows={3}
                  value={draft.aboutSectionStory}
                  onChange={(e) => handleFieldChange('aboutSectionStory', e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3.5 py-2 rounded text-xs text-[#1A1816]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Prominent Metric Callout (e.g. 2,400+ Bespoke Garments)
                </label>
                <input
                  type="text"
                  value={draft.aboutSectionMetricsText}
                  onChange={(e) => handleFieldChange('aboutSectionMetricsText', e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3.5 py-2 rounded text-xs text-[#1A1816]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Section Visibility & Live Status (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
          {/* Publication State Card */}
          <div className="bg-white border border-[#E8E2D9] p-5 rounded-xs space-y-3 shadow-xs text-xs">
            <h4 className="font-editorial text-base font-semibold text-[#1A1816] border-b border-[#E8E2D9] pb-2">
              Publication Control
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#7A7165]">Draft Status:</span>
                <span className="text-[#8E6C3B] font-semibold">Active & Modifiable</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7A7165]">Customer Storefront:</span>
                <span className="text-[#2F6B45] font-semibold">Serving Published Version</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handlePublishChanges}
                className="w-full py-2.5 bg-[#8E6C3B] hover:bg-[#A37D46] text-white font-semibold rounded uppercase tracking-wider transition-colors"
              >
                Publish Draft to Storefront
              </button>
              <button
                onClick={handleRevertDraft}
                className="w-full py-2 border border-[#D5CDC1] text-[#7A7165] hover:text-[#1A1816] rounded transition-colors"
              >
                Revert to Published State
              </button>
            </div>
          </div>

          {/* Section Visibility Switches */}
          <div className="bg-white border border-[#E8E2D9] p-5 rounded-xs space-y-3 shadow-xs text-xs">
            <h4 className="font-editorial text-base font-semibold text-[#1A1816] border-b border-[#E8E2D9] pb-2">
              Homepage Section Visibility
            </h4>
            <div className="space-y-2.5">
              {Object.entries(draft.sectionVisibility).map(([key, val]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer py-1">
                  <span className="capitalize text-[#4A433A]">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(val)}
                    onChange={() => handleVisibilityToggle(key as any)}
                    className="accent-[#1A1816] w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-[#D5CDC1] rounded-lg max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8E6C3B] font-semibold">
                  Simulated Customer Viewport
                </span>
                <h3 className="font-editorial text-xl font-bold">Homepage Draft Preview</h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 text-[#7A7165] hover:text-[#1A1816]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Body */}
            <div className="space-y-8 border border-[#E8E2D9] rounded bg-[#FAF8F5] p-4">
              {/* Announcement strip */}
              {draft.sectionVisibility.announcement && (
                <div className="bg-[#1A1816] text-[#D8C7B0] text-xs py-2 px-4 text-center">
                  {draft.announcementStrip}
                </div>
              )}

              {/* Hero */}
              {draft.sectionVisibility.hero && (
                <div className="relative rounded overflow-hidden aspect-[16/9] w-full bg-[#1A1816] flex items-end p-6 text-white">
                  <img
                    src={draft.heroBannerImage}
                    alt="Hero Banner"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="relative z-10 max-w-xl space-y-2">
                    <h2 className="font-editorial text-2xl sm:text-4xl font-semibold leading-tight">
                      {draft.headline}
                    </h2>
                    <p className="text-xs text-[#D8C7B0]">{draft.supportingText}</p>
                    <div className="pt-2 flex gap-2">
                      <span className="px-4 py-2 bg-[#FAF8F5] text-[#1A1816] text-xs font-semibold rounded-xs">
                        {draft.primaryCtaText}
                      </span>
                      <span className="px-4 py-2 border border-[#C5A880] text-white text-xs font-semibold rounded-xs">
                        {draft.secondaryCtaText}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 border border-[#D5CDC1] text-xs rounded"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handlePublishChanges();
                }}
                className="px-5 py-2 bg-[#8E6C3B] text-white text-xs font-semibold rounded"
              >
                Publish This Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
