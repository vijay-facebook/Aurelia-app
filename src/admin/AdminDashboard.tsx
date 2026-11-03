import React, { useState, useEffect } from 'react';
import { SiteConfig, ServiceItemConfig, StaffMemberConfig, MenuItemConfig, GalleryImageConfig, VideoItemConfig, OfferItemConfig, HomeServiceConfig, ReviewItemConfig, SocialPostConfig } from '../config/types';
import { defaultConfig } from '../config/defaultConfig';
import { 
  LayoutDashboard, Globe, Megaphone, Compass, Sparkles, UserCheck, 
  Menu as MenuIcon, Image as ImageIcon, Video, Tag, Home, MessageSquare, 
  Share2, Calendar, Eye, Settings, Shield, LogOut, Save, RotateCcw, Download, Upload, Plus, Trash2, Check, AlertCircle 
  } from 'lucide-react';
import { AdminErrorLogger } from '../components/AdminErrorLogger';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<string>('brand');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('salon_draft_config');
    if (saved) {
      setConfig(JSON.parse(saved));
    } else {
      fetch('/api/config')
        .then((res) => res.json())
        .then((data) => {
          if (data) setConfig(data);
        })
        .catch((err) => console.error('Failed to load admin config', err));
    }
  }, []);

  useEffect(() => {
    // Autosave to localStorage
    if (config !== defaultConfig) {
      localStorage.setItem('salon_draft_config', JSON.stringify(config));
      setHasUnsavedChanges(true);
    }

    // Debounced preview update
    const timer = setTimeout(() => {
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'CONFIG_UPDATE', config }, '*');
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [config]);

  useEffect(() => {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'FOCUS_SECTION', sectionId: activeTab }, '*');
    }
  }, [activeTab]);


  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to save config');
      const updated = await res.json();
      setConfig(updated);
      setHasUnsavedChanges(false);
      showToast('Changes saved & published successfully!');
    } catch (err: any) {
      showError(err.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all content to default template?')) return;
    try {
      const res = await fetch('/api/config/reset', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Reset failed');
      const data = await res.json();
      setConfig(data);
      setHasUnsavedChanges(false);
      showToast('Reset to default template successfully.');
    } catch (err: any) {
      showError(err.message || 'Reset failed');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      callback(data.url);
      setHasUnsavedChanges(true);
      showToast('File uploaded successfully!');
    } catch (err: any) {
      showError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const updateNested = (path: string, value: any) => {
    const keys = path.split('.');
    const updated = JSON.parse(JSON.stringify(config));
    let current = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setConfig(updated);
    setHasUnsavedChanges(true);
  };

  const tabs = [
    { id: 'brand', label: 'Brand & Identity', icon: Globe },
    { id: 'announcement', label: 'Announcement Bar', icon: Megaphone },
    { id: 'navigation', label: 'Navigation & Order', icon: Compass },
    { id: 'hero', label: 'Hero Section', icon: Sparkles },
    { id: 'business', label: 'Business Info & Hours', icon: Settings },
    { id: 'services', label: 'Services Grid', icon: LayoutDashboard },
    { id: 'story', label: 'Story / About', icon: UserCheck },
    { id: 'staff', label: 'Master Artists', icon: UserCheck },
    { id: 'menu', label: 'Service Menu', icon: MenuIcon },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'videos', label: 'Video Gallery', icon: Video },
    { id: 'offers', label: 'Session Offers', icon: Tag },
    { id: 'homeServices', label: 'At-Home Services', icon: Home },
    { id: 'reviews', label: 'Reviews & Kind Words', icon: MessageSquare },
    { id: 'social', label: 'Social & Feed', icon: Share2 },
    { id: 'booking', label: 'Booking & WhatsApp', icon: Calendar },
    { id: 'seo', label: 'SEO & Metadata', icon: Globe },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0D1117] text-[#C9D1D9] font-sans flex flex-col">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#238636] text-white px-5 py-3 rounded-lg shadow-2xl text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Error Notification */}
      <AdminErrorLogger message={errorMessage} onClose={() => setErrorMessage(null)} />

      {/* Top Admin Header */}
      <header className="h-16 bg-[#161B22] border-b border-[#30363D] px-6 flex items-center justify-between shrink-0 sticky top-0 z-45">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-[#21262D] border border-[#30363D] text-[#58A6FF] rounded-lg flex items-center justify-center font-bold">
            S
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[#F2F4F8]">Salon White-Label CMS</h1>
            <p className="text-[10px] text-[#8B949E]">Editing active site configuration</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(true)}
            className="px-3 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-[#58A6FF] rounded-lg text-xs font-medium border border-[#30363D] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] rounded-lg text-xs font-medium border border-[#30363D] flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span>Open Live Site</span>
          </a>

          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-red-400 rounded-lg text-xs font-medium border border-[#30363D] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Reset Default</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : hasUnsavedChanges ? 'Save & Publish *' : 'Save & Publish'}</span>
          </button>

          <button
            onClick={onLogout}
            className="p-2 bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-white rounded-lg border border-[#30363D] transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-72 bg-[#161B22] border-r border-[#30363D] overflow-y-auto p-4 space-y-1.5 shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-[#8B949E] font-semibold px-3 py-2">
            CMS Sections
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1F6FEB]/15 text-[#58A6FF] border border-[#1F6FEB]/30'
                    : 'text-[#C9D1D9] hover:bg-[#21262D] hover:text-[#F2F4F8]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#58A6FF]' : 'text-[#8B949E]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 bg-[#0D1117]">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* BRAND & IDENTITY */}
            {activeTab === 'brand' && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 lg:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#F2F4F8]">Brand & Identity</h2>
                  <p className="text-xs text-[#8B949E]">Configure salon name, wordmark spacing, logo image, and currency symbol.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">Brand Name</label>
                    <input
                      type="text"
                      value={config.brand.name}
                      onChange={(e) => updateNested('brand.name', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">Wordmark Display Text</label>
                    <input
                      type="text"
                      value={config.brand.wordmark}
                      onChange={(e) => updateNested('brand.wordmark', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="autoLetterSpacing"
                    checked={config.brand.autoLetterSpacing}
                    onChange={(e) => updateNested('brand.autoLetterSpacing', e.target.checked)}
                    className="w-4 h-4 accent-[#238636]"
                  />
                  <label htmlFor="autoLetterSpacing" className="text-xs text-[#C9D1D9]">Auto Letter-Spacing (A U R E L I A style)</label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C9D1D9]">Logo Image Upload (Optional — replaces wordmark)</label>
                  <div className="flex items-center gap-4">
                    {config.brand.logoImage && (
                      <img src={config.brand.logoImage} alt="Logo Preview" className="h-10 bg-white p-1 rounded border border-[#30363D]" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) => handleFileUpload(e, (url) => updateNested('brand.logoImage', url))}
                      className="text-xs text-[#8B949E]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">Tagline</label>
                    <input
                      type="text"
                      value={config.brand.tagline}
                      onChange={(e) => updateNested('brand.tagline', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">Currency Symbol</label>
                    <input
                      type="text"
                      value={config.brand.currencySymbol}
                      onChange={(e) => updateNested('brand.currencySymbol', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C9D1D9]">Copyright Line</label>
                  <input
                    type="text"
                    value={config.brand.copyright}
                    onChange={(e) => updateNested('brand.copyright', e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1.5 pt-4 border-t border-[#30363D]">
                  <label className="text-xs font-medium text-[#C9D1D9]">Custom Salon Link & Slug (Your Unique Name URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.brand.customSlug || ''}
                      onChange={(e) => updateNested('brand.customSlug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="e.g. aurelia-bandra"
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const link = `${window.location.origin}/?salon=${config.brand.customSlug || 'aurelia'}`;
                        navigator.clipboard.writeText(link);
                        showToast('Custom shareable link copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-[#58A6FF] rounded-lg text-xs font-medium border border-[#30363D] shrink-0 cursor-pointer"
                    >
                      Copy Link
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8B949E]">
                    Shareable Link: <code className="text-[#58A6FF]">{window.location.origin}/?salon={config.brand.customSlug || 'salon'}</code>
                  </p>
                </div>
              </div>
            )}

            {/* ANNOUNCEMENT BAR */}
            {activeTab === 'announcement' && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 lg:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#F2F4F8]">Top Announcement Bar</h2>
                  <p className="text-xs text-[#8B949E]">Enable or disable top ticker banner and customise announcement text.</p>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="announcementEnabled"
                    checked={config.announcementBar.enabled}
                    onChange={(e) => updateNested('announcementBar.enabled', e.target.checked)}
                    className="w-4 h-4 accent-[#238636]"
                  />
                  <label htmlFor="announcementEnabled" className="text-xs text-[#C9D1D9]">Enable Announcement Bar</label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C9D1D9]">Announcement Text</label>
                  <input
                    type="text"
                    value={config.announcementBar.text}
                    onChange={(e) => updateNested('announcementBar.text', e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">Action Link Label</label>
                    <input
                      type="text"
                      value={config.announcementBar.linkText}
                      onChange={(e) => updateNested('announcementBar.linkText', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">Action Link URL</label>
                    <input
                      type="text"
                      value={config.announcementBar.linkUrl}
                      onChange={(e) => updateNested('announcementBar.linkUrl', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* NAVIGATION & ORDER */}
            {activeTab === 'navigation' && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 lg:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#F2F4F8]">Navigation & Section Visibility</h2>
                  <p className="text-xs text-[#8B949E]">Show/hide sections and rename navigation labels.</p>
                </div>

                <div className="space-y-3">
                  {config.navigation.map((nav, index) => (
                    <div key={nav.id} className="bg-[#0D1117] border border-[#30363D] p-4 rounded-lg flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <input
                          type="checkbox"
                          checked={nav.show}
                          onChange={(e) => {
                            const updated = [...config.navigation];
                            updated[index].show = e.target.checked;
                            updateNested('navigation', updated);
                          }}
                          className="w-4 h-4 accent-[#238636]"
                        />
                        <input
                          type="text"
                          value={nav.label}
                          onChange={(e) => {
                            const updated = [...config.navigation];
                            updated[index].label = e.target.value;
                            updateNested('navigation', updated);
                          }}
                          className="bg-[#161B22] border border-[#30363D] text-[#F2F4F8] px-3 py-1.5 rounded text-xs flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#8B949E]">ID: {nav.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HERO SECTION */}
            {activeTab === 'hero' && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 lg:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#F2F4F8]">Hero Section</h2>
                  <p className="text-xs text-[#8B949E]">Customise hero headline, eyebrow, subtext, image, and badges.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C9D1D9]">Eyebrow</label>
                  <input
                    type="text"
                    value={config.hero.eyebrow}
                    onChange={(e) => updateNested('hero.eyebrow', e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">Headline Line 1</label>
                    <input
                      type="text"
                      value={config.hero.headlineLine1}
                      onChange={(e) => updateNested('hero.headlineLine1', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">Headline Line 2 (Italic)</label>
                    <input
                      type="text"
                      value={config.hero.headlineLine2}
                      onChange={(e) => updateNested('hero.headlineLine2', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C9D1D9]">Subtext</label>
                  <textarea
                    rows={3}
                    value={config.hero.subtext}
                    onChange={(e) => updateNested('hero.subtext', e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">Primary Button Text</label>
                    <input
                      type="text"
                      value={config.hero.primaryButtonText}
                      onChange={(e) => updateNested('hero.primaryButtonText', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">Secondary Button Text</label>
                    <input
                      type="text"
                      value={config.hero.secondaryButtonText}
                      onChange={(e) => updateNested('hero.secondaryButtonText', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C9D1D9]">Hero Image Upload</label>
                  <div className="flex items-center gap-4">
                    {config.hero.heroImage && (
                      <img src={config.hero.heroImage} alt="Hero Preview" className="h-16 w-20 object-cover rounded border border-[#30363D]" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) => handleFileUpload(e, (url) => updateNested('hero.heroImage', url))}
                      className="text-xs text-[#8B949E]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C9D1D9]">Rotating Circular Badge Text</label>
                  <input
                    type="text"
                    value={config.hero.rotatingBadgeText}
                    onChange={(e) => updateNested('hero.rotatingBadgeText', e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C9D1D9]">Next Available Pill Text</label>
                  <input
                    type="text"
                    value={config.hero.nextAvailableText}
                    onChange={(e) => updateNested('hero.nextAvailableText', e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    placeholder="Today, 4:30 pm / Signature Blowout with Leah"
                  />
                </div>
              </div>
            )}

            {/* BUSINESS INFO & HOURS */}
            {activeTab === 'business' && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 lg:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#F2F4F8]">Business Info & Hours</h2>
                  <p className="text-xs text-[#8B949E]">Update address, contact info, WhatsApp number, and weekly operating hours.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">City</label>
                    <input
                      type="text"
                      value={config.businessInfo.city}
                      onChange={(e) => updateNested('businessInfo.city', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">Pincode</label>
                    <input
                      type="text"
                      value={config.businessInfo.pincode}
                      onChange={(e) => updateNested('businessInfo.pincode', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">Phone Number</label>
                    <input
                      type="text"
                      value={config.businessInfo.phone}
                      onChange={(e) => updateNested('businessInfo.phone', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C9D1D9]">WhatsApp Number (Digits with country code)</label>
                    <input
                      type="text"
                      value={config.businessInfo.whatsappNumber}
                      onChange={(e) => updateNested('businessInfo.whatsappNumber', e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C9D1D9]">Email Address</label>
                  <input
                    type="email"
                    value={config.businessInfo.email}
                    onChange={(e) => updateNested('businessInfo.email', e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}

            {/* SERVICES */}
            {activeTab === 'services' && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 lg:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#F2F4F8]">Services Cards Grid</h2>
                    <p className="text-xs text-[#8B949E]">Add, edit, or delete main service offerings.</p>
                  </div>
                  <button
                    onClick={() => {
                      const newService: ServiceItemConfig = {
                        id: 'service-' + Date.now(),
                        title: 'New Service',
                        category: 'hair',
                        subtitle: 'Service subtitle and description.',
                        price: 'from ₹2,000',
                        numericPrice: 2000,
                        image: config.services[0]?.image || '',
                      };
                      updateNested('services', [...config.services, newService]);
                    }}
                    className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Service</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {config.services.map((service, index) => (
                    <div key={service.id} className="bg-[#0D1117] border border-[#30363D] p-5 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-[#58A6FF]">Service #{index + 1}</span>
                        <button
                          onClick={() => {
                            const updated = config.services.filter((s) => s.id !== service.id);
                            updateNested('services', updated);
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#8B949E]">Title</label>
                          <input
                            type="text"
                            value={service.title}
                            onChange={(e) => {
                              const updated = [...config.services];
                              updated[index].title = e.target.value;
                              updateNested('services', updated);
                            }}
                            className="w-full bg-[#161B22] border border-[#30363D] text-white p-2.5 rounded text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#8B949E]">Price Text</label>
                          <input
                            type="text"
                            value={service.price}
                            onChange={(e) => {
                              const updated = [...config.services];
                              updated[index].price = e.target.value;
                              updateNested('services', updated);
                            }}
                            className="w-full bg-[#161B22] border border-[#30363D] text-white p-2.5 rounded text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-[#8B949E]">Subtitle / Description</label>
                        <input
                          type="text"
                          value={service.subtitle}
                          onChange={(e) => {
                            const updated = [...config.services];
                            updated[index].subtitle = e.target.value;
                            updateNested('services', updated);
                          }}
                          className="w-full bg-[#161B22] border border-[#30363D] text-white p-2.5 rounded text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-[#8B949E]">Image URL / Upload</label>
                        <div className="flex items-center gap-3">
                          {service.image && <img src={service.image} alt="" className="h-10 w-12 object-cover rounded border border-[#30363D]" />}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploading}
                            onChange={(e) => handleFileUpload(e, (url) => {
                              const updated = [...config.services];
                              updated[index].image = url;
                              updateNested('services', updated);
                            })}
                            className="text-xs text-[#8B949E]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STAFF / ARTISTS */}
            {activeTab === 'staff' && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 lg:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#F2F4F8]">Master Artists & Practitioners</h2>
                    <p className="text-xs text-[#8B949E]">Manage salon staff, bios, specialties, and photos.</p>
                  </div>
                  <button
                    onClick={() => {
                      const newStaff: StaffMemberConfig = {
                        id: 'staff-' + Date.now(),
                        name: 'New Stylist',
                        role: 'Senior Stylist',
                        specialties: ['Precision Cuts'],
                        experience: '5 Years Experience',
                        bio: 'Expert stylist in modern cuts and styling.',
                        image: config.staff[0]?.image || '',
                        availableNext: 'Today, 3:00 PM',
                        instagram: '@stylist',
                        sinceYear: '2022',
                        show: true,
                      };
                      updateNested('staff', [...config.staff, newStaff]);
                    }}
                    className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Artist</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {config.staff.map((staff, index) => (
                    <div key={staff.id} className="bg-[#0D1117] border border-[#30363D] p-5 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-[#58A6FF]">{staff.name}</span>
                        <button
                          onClick={() => {
                            const updated = config.staff.filter((s) => s.id !== staff.id);
                            updateNested('staff', updated);
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#8B949E]">Name</label>
                          <input
                            type="text"
                            value={staff.name}
                            onChange={(e) => {
                              const updated = [...config.staff];
                              updated[index].name = e.target.value;
                              updateNested('staff', updated);
                            }}
                            className="w-full bg-[#161B22] border border-[#30363D] text-white p-2.5 rounded text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#8B949E]">Role</label>
                          <select
                            value={staff.role}
                            onChange={(e) => {
                              const updated = [...config.staff];
                              updated[index].role = e.target.value;
                              updateNested('staff', updated);
                            }}
                            className="w-full bg-[#161B22] border border-[#30363D] text-white p-2.5 rounded text-xs"
                          >
                            <option value="Senior Stylist">Senior Stylist</option>
                            <option value="Master Artist">Master Artist</option>
                            <option value="Skin Specialist">Skin Specialist</option>
                            <option value="Founder & Creative Director">Founder & Creative Director</option>
                            <option value="Other">Other</option>
                          </select>
                          <input
                            type="text"
                            value={staff.role}
                            onChange={(e) => {
                              const updated = [...config.staff];
                              updated[index].role = e.target.value;
                              updateNested('staff', updated);
                            }}
                            className="w-full bg-[#161B22] border border-[#30363D] text-white p-2.5 rounded text-xs mt-2"
                            placeholder="Or type custom role"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-[#8B949E]">Biography</label>
                        <textarea
                          rows={2}
                          value={staff.bio}
                          onChange={(e) => {
                            const updated = [...config.staff];
                            updated[index].bio = e.target.value;
                            updateNested('staff', updated);
                          }}
                          className="w-full bg-[#161B22] border border-[#30363D] text-white p-2.5 rounded text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-[#8B949E]">Photo Upload</label>
                        <div className="flex items-center gap-3">
                          {staff.image && <img src={staff.image} alt="" className="h-12 w-10 object-cover rounded border border-[#30363D]" />}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploading}
                            onChange={(e) => handleFileUpload(e, (url) => {
                              const updated = [...config.staff];
                              updated[index].image = url;
                              updateNested('staff', updated);
                            })}
                            className="text-xs text-[#8B949E]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OFFERS */}
            {activeTab === 'offers' && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 lg:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#F2F4F8]">Session Offers & Packages</h2>
                    <p className="text-xs text-[#8B949E]">Manage seasonal packages and promo codes.</p>
                  </div>
                  <button
                    onClick={() => {
                      const newOffer: OfferItemConfig = {
                        id: 'offer-' + Date.now(),
                        title: 'Seasonal Glow Special',
                        subtitle: 'Weekday Special',
                        badge: 'Special Privilege',
                        discountTag: 'Save ₹1,500',
                        originalPrice: '₹8,000',
                        offerPrice: '₹6,500',
                        code: 'GLOWSPECIAL',
                        validTill: 'Valid Mon - Fri',
                        image: config.offers[0]?.image || '',
                        description: 'Special seasonal package for radiant skin and hair gloss.',
                        highlights: ['Complimentary consultation', 'Take-home sample kit'],
                        active: true,
                      };
                      updateNested('offers', [...config.offers, newOffer]);
                    }}
                    className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Offer</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {config.offers.map((offer, index) => (
                    <div key={offer.id} className="bg-[#0D1117] border border-[#30363D] p-5 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-[#58A6FF]">{offer.title}</span>
                        <button
                          onClick={() => {
                            const updated = config.offers.filter((o) => o.id !== offer.id);
                            updateNested('offers', updated);
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#8B949E]">Title</label>
                          <input
                            type="text"
                            value={offer.title}
                            onChange={(e) => {
                              const updated = [...config.offers];
                              updated[index].title = e.target.value;
                              updateNested('offers', updated);
                            }}
                            className="w-full bg-[#161B22] border border-[#30363D] text-white p-2.5 rounded text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#8B949E]">Promo Code</label>
                          <input
                            type="text"
                            value={offer.code}
                            onChange={(e) => {
                              const updated = [...config.offers];
                              updated[index].code = e.target.value;
                              updateNested('offers', updated);
                            }}
                            className="w-full bg-[#161B22] border border-[#30363D] text-white p-2.5 rounded text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#8B949E]">Original Price</label>
                          <input
                            type="text"
                            value={offer.originalPrice}
                            onChange={(e) => {
                              const updated = [...config.offers];
                              updated[index].originalPrice = e.target.value;
                              updateNested('offers', updated);
                            }}
                            className="w-full bg-[#161B22] border border-[#30363D] text-white p-2.5 rounded text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#8B949E]">Offer Price</label>
                          <input
                            type="text"
                            value={offer.offerPrice}
                            onChange={(e) => {
                              const updated = [...config.offers];
                              updated[index].offerPrice = e.target.value;
                              updateNested('offers', updated);
                            }}
                            className="w-full bg-[#161B22] border border-[#30363D] text-white p-2.5 rounded text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#8B949E]">Discount Tag</label>
                          <input
                            type="text"
                            value={offer.discountTag}
                            onChange={(e) => {
                              const updated = [...config.offers];
                              updated[index].discountTag = e.target.value;
                              updateNested('offers', updated);
                            }}
                            className="w-full bg-[#161B22] border border-[#30363D] text-white p-2.5 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO & METADATA */}
            {activeTab === 'seo' && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 lg:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#F2F4F8]">SEO & Page Metadata</h2>
                  <p className="text-xs text-[#8B949E]">Configure search engine title, meta description, and language.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C9D1D9]">Meta Page Title</label>
                  <input
                    type="text"
                    value={config.seo.title}
                    onChange={(e) => updateNested('seo.title', e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C9D1D9]">Meta Description</label>
                  <textarea
                    rows={3}
                    value={config.seo.description}
                    onChange={(e) => updateNested('seo.description', e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] text-[#F2F4F8] p-3 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}

          </div>
        </main>

      </div>

      {/* Live Preview Modal */}
      {previewMode && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col">
          <div className="bg-[#161B22] border-b border-[#30363D] px-6 py-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <h3 className="text-sm font-semibold">Live Preview Mode — {config.brand.name}</h3>
                <p className="text-[10px] text-[#8B949E]">Showing active configuration draft. Click 'Save & Publish' to persist.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                  iframe.contentWindow?.postMessage({ type: 'SET_MODE', mode: 'focus' }, '*');
                }}
                className="px-3 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-xs rounded-lg border border-[#30363D]"
              >
                Focus Section
              </button>
              <button
                onClick={() => {
                  const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                  iframe.contentWindow?.postMessage({ type: 'SET_MODE', mode: 'full' }, '*');
                }}
                className="px-3 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-xs rounded-lg border border-[#30363D]"
              >
                View Full Website
              </button>
              <button
                onClick={() => setPreviewMode(false)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Exit Preview
              </button>
            </div>
          </div>
          <iframe
            id="preview-iframe"
            src={`/preview?v=${Date.now()}`}
            className="flex-1 w-full border-none bg-white"
            onLoad={() => {
              const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
              iframe.contentWindow?.postMessage({ type: 'CONFIG_UPDATE', config }, '*');
              iframe.contentWindow?.postMessage({ type: 'FOCUS_SECTION', sectionId: activeTab }, '*');
            }}
          />
        </div>
      )}
    </div>
  );
};
