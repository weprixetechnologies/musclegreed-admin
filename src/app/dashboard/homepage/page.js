'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  Save,
  RotateCcw,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  Image as ImageIcon,
  Video,
  Layers,
  Target,
  Compass,
  MessageSquare,
  BarChart2,
  HelpCircle,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';

export default function HomepageCustomisePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('hero');

  // Fetch current config on mount
  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.get('/homepage');
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching homepage data:', err);
      setErrorMessage('Could not load homepage data. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');
    try {
      const res = await api.put('/admin/homepage', data);
      if (res.data?.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error updating homepage data:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all homepage customizations back to default values?')) {
      return;
    }
    setSaving(true);
    setErrorMessage('');
    try {
      const res = await api.post('/admin/homepage/reset');
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setErrorMessage('Failed to reset defaults.');
    } finally {
      setSaving(false);
    }
  };

  // Helper for uploading single media file
  const handleFileUpload = async (file, onUploaded) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.url) {
        onUploaded(res.data.url);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'File upload failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-500 font-medium">Loading homepage configurations from Redis / MySQL...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-zinc-900 rounded-2xl border border-zinc-800">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Configuration Unavailable</h3>
        <p className="text-sm text-zinc-400 mb-4">{errorMessage || 'Unable to connect to backend'}</p>
        <button
          onClick={fetchHomepageData}
          className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-xl text-xs font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'hero', name: '1. Hero Background & Text', icon: Sparkles },
    { id: 'reviews-tiles', name: '2. Review Avatars & Scrolling Tiles', icon: ImageIcon },
    { id: 'services', name: '3. Services Cards', icon: Layers },
    { id: 'mission-goals', name: '4. Our Mission & Goals', icon: Compass },
    { id: 'about', name: '5. About Story', icon: Target },
    { id: 'testimonials', name: '6. Testimonials', icon: MessageSquare },
    { id: 'culture', name: '7. Gym Culture & Video', icon: Video },
    { id: 'stats', name: '8. Stats Banner', icon: BarChart2 },
  ];

  return (
    <div className="space-y-8 pb-20 w-full min-w-0">
      {/* Sticky Header with Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10 py-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Content Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Homepage Customise
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage all 10 homepage sections. Changes update MySQL and Redis cache for instant 60s ISR delivery.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving to Redis...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Homepage saved successfully! MySQL and Redis cache have been updated. ISR will regenerate on next cycle.</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-zinc-800/80 w-full min-w-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: HERO SECTION BACKGROUND & TEXTS                         */}
      {/* ============================================================== */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-1">1. Hero Section Background Images</h2>
            <p className="text-xs text-zinc-400 mb-6">
              Desktop and Mobile images are separate for perfect responsiveness and high-DPI displays.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Desktop Background */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-zinc-300">
                  Desktop Background Image
                </label>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center group">
                  {data.hero?.bgDesktop ? (
                    <img
                      src={data.hero.bgDesktop}
                      alt="Hero Desktop Background"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-zinc-600">No desktop image selected</span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold cursor-pointer hover:bg-amber-400 transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload to BunnyCDN</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e.target.files[0], (url) =>
                            setData({ ...data, hero: { ...data.hero, bgDesktop: url } })
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={data.hero?.bgDesktop || ''}
                  onChange={(e) =>
                    setData({ ...data, hero: { ...data.hero, bgDesktop: e.target.value } })
                  }
                  placeholder="/images/hero-bg.jpg or https://cly-pull.b-cdn.net/..."
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Mobile Background */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-zinc-300">
                  Mobile Background Image
                </label>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center group">
                  {data.hero?.bgMobile ? (
                    <img
                      src={data.hero.bgMobile}
                      alt="Hero Mobile Background"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-zinc-600">No mobile image selected</span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold cursor-pointer hover:bg-amber-400 transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload to BunnyCDN</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e.target.files[0], (url) =>
                            setData({ ...data, hero: { ...data.hero, bgMobile: url } })
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={data.hero?.bgMobile || ''}
                  onChange={(e) =>
                    setData({ ...data, hero: { ...data.hero, bgMobile: e.target.value } })
                  }
                  placeholder="/images/hero-bg.jpg or https://cly-pull.b-cdn.net/..."
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Hero Texts */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-semibold text-white">2. Hero Section Texts</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Heading Line 1
                </label>
                <input
                  type="text"
                  value={data.hero?.headingLine1 || ''}
                  onChange={(e) =>
                    setData({ ...data, hero: { ...data.hero, headingLine1: e.target.value } })
                  }
                  placeholder="REACH YOUR"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Highlighted Word (Red Accent)
                </label>
                <input
                  type="text"
                  value={data.hero?.headingHighlight || ''}
                  onChange={(e) =>
                    setData({ ...data, hero: { ...data.hero, headingHighlight: e.target.value } })
                  }
                  placeholder="FITNESS"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-[#FF1018] font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Heading Line 2 Suffix
                </label>
                <input
                  type="text"
                  value={data.hero?.headingLine2Suffix || ''}
                  onChange={(e) =>
                    setData({ ...data, hero: { ...data.hero, headingLine2Suffix: e.target.value } })
                  }
                  placeholder="GOALS"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Review Count Text
                </label>
                <input
                  type="text"
                  value={data.hero?.reviewCount || ''}
                  onChange={(e) =>
                    setData({ ...data, hero: { ...data.hero, reviewCount: e.target.value } })
                  }
                  placeholder="95+"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Review Label Text
                </label>
                <input
                  type="text"
                  value={data.hero?.reviewLabel || ''}
                  onChange={(e) =>
                    setData({ ...data, hero: { ...data.hero, reviewLabel: e.target.value } })
                  }
                  placeholder="Reviews"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Hero Subtext / Headline
              </label>
              <textarea
                rows={3}
                value={data.hero?.subText || ''}
                onChange={(e) =>
                  setData({ ...data, hero: { ...data.hero, subText: e.target.value } })
                }
                placeholder="REDEFINE YOUR LIFE WITH THE BEST GUIDANCE..."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={data.hero?.ctaText || ''}
                  onChange={(e) =>
                    setData({ ...data, hero: { ...data.hero, ctaText: e.target.value } })
                  }
                  placeholder="Connect Now"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  CTA Button Link
                </label>
                <input
                  type="text"
                  value={data.hero?.ctaLink || ''}
                  onChange={(e) =>
                    setData({ ...data, hero: { ...data.hero, ctaLink: e.target.value } })
                  }
                  placeholder="/contact"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: HERO REVIEWS AVATARS & SCROLLING TILES                  */}
      {/* ============================================================== */}
      {activeTab === 'reviews-tiles' && (
        <div className="space-y-6">
          {/* Review Avatars */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">3. Hero Review Avatars</h2>
                <p className="text-xs text-zinc-400">Small avatar circular icons shown above the reviews count.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const current = data.hero?.reviewAvatars || [];
                  setData({
                    ...data,
                    hero: { ...data.hero, reviewAvatars: [...current, '/images/avatar-1.jpg'] },
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-amber-400 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Avatar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(data.hero?.reviewAvatars || []).map((avatarUrl, idx) => (
                <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900 shrink-0">
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[11px] text-zinc-400 block mb-1">Avatar #{idx + 1}</label>
                    <label className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-[10px] cursor-pointer hover:bg-zinc-700 inline-flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e.target.files[0], (url) => {
                            const updated = [...(data.hero?.reviewAvatars || [])];
                            updated[idx] = url;
                            setData({ ...data, hero: { ...data.hero, reviewAvatars: updated } });
                          })
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (data.hero?.reviewAvatars || []).filter((_, i) => i !== idx);
                      setData({ ...data, hero: { ...data.hero, reviewAvatars: updated } });
                    }}
                    className="p-1.5 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Scrolling Tiles */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">4. Hero Scrolling Tiles Images</h2>
                <p className="text-xs text-zinc-400">
                  Horizontally scrollable gym photo strip displayed in the hero section.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const current = data.hero?.scrollingTiles || [];
                  const newTile = {
                    id: Date.now(),
                    src: '/images/hero-card-1-hd.jpg',
                    alt: 'New gym training highlight',
                  };
                  setData({
                    ...data,
                    hero: { ...data.hero, scrollingTiles: [...current, newTile] },
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-amber-400 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data.hero?.scrollingTiles || []).map((tile, idx) => (
                <div key={tile.id || idx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 group">
                    <img src={tile.src} alt={tile.alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold cursor-pointer hover:bg-amber-400 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload New Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(e.target.files[0], (url) => {
                              const updated = [...(data.hero?.scrollingTiles || [])];
                              updated[idx] = { ...updated[idx], src: url };
                              setData({ ...data, hero: { ...data.hero, scrollingTiles: updated } });
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Alt Description</label>
                    <input
                      type="text"
                      value={tile.alt || ''}
                      onChange={(e) => {
                        const updated = [...(data.hero?.scrollingTiles || [])];
                        updated[idx] = { ...updated[idx], alt: e.target.value };
                        setData({ ...data, hero: { ...data.hero, scrollingTiles: updated } });
                      }}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-zinc-500">Tile #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (data.hero?.scrollingTiles || []).filter((_, i) => i !== idx);
                        setData({ ...data, hero: { ...data.hero, scrollingTiles: updated } });
                      }}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SERVICES CARDS                                          */}
      {/* ============================================================== */}
      {activeTab === 'services' && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">5. Services Cards</h2>
              <p className="text-xs text-zinc-400">
                Card images, titles, and links displayed in the interactive animated services gallery.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const current = data.services || [];
                const newCard = {
                  id: `service-${Date.now()}`,
                  title: 'NEW PROGRAM',
                  imageSrc: '/images/service-muscle-hd.jpg',
                  link: '/services',
                };
                setData({ ...data, services: [...current, newCard] });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-semibold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Service Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(data.services || []).map((service, idx) => (
              <div key={service.id || idx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 group">
                  <img src={service.imageSrc} alt={service.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold cursor-pointer hover:bg-amber-400 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Card Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e.target.files[0], (url) => {
                            const updated = [...(data.services || [])];
                            updated[idx] = { ...updated[idx], imageSrc: url };
                            setData({ ...data, services: updated });
                          })
                        }
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Card Title</label>
                  <input
                    type="text"
                    value={service.title || ''}
                    onChange={(e) => {
                      const updated = [...(data.services || [])];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      setData({ ...data, services: updated });
                    }}
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Link Destination</label>
                  <input
                    type="text"
                    value={service.link || ''}
                    onChange={(e) => {
                      const updated = [...(data.services || [])];
                      updated[idx] = { ...updated[idx], link: e.target.value };
                      setData({ ...data, services: updated });
                    }}
                    placeholder="/services"
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-zinc-900">
                  <span className="text-[10px] text-zinc-500 font-mono">{service.id}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (data.services || []).filter((_, i) => i !== idx);
                      setData({ ...data, services: updated });
                    }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: OUR MISSION & OUR GOALS                                 */}
      {/* ============================================================== */}
      {activeTab === 'mission-goals' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OUR MISSION */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FF1018] uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>Card 1: Our Mission</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={data.mission?.badge || ''}
                  onChange={(e) =>
                    setData({ ...data, mission: { ...data.mission, badge: e.target.value } })
                  }
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  value={data.mission?.title || ''}
                  onChange={(e) =>
                    setData({ ...data, mission: { ...data.mission, title: e.target.value } })
                  }
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-bold text-white uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Tagline</label>
                <input
                  type="text"
                  value={data.mission?.tagline || ''}
                  onChange={(e) =>
                    setData({ ...data, mission: { ...data.mission, tagline: e.target.value } })
                  }
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-[#FF1018] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Description / Subtext</label>
                <textarea
                  rows={3}
                  value={data.mission?.description || ''}
                  onChange={(e) =>
                    setData({ ...data, mission: { ...data.mission, description: e.target.value } })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300"
                />
              </div>

              {/* Mission List Items */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-white">Mission Core Points</label>
                  <button
                    type="button"
                    onClick={() => {
                      const items = data.mission?.items || [];
                      setData({
                        ...data,
                        mission: {
                          ...data.mission,
                          items: [...items, { title: 'New Point:', text: 'Point explanation.' }],
                        },
                      });
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(data.mission?.items || []).map((item, idx) => (
                    <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => {
                            const updated = [...(data.mission?.items || [])];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setData({ ...data, mission: { ...data.mission, items: updated } });
                          }}
                          placeholder="Point Title"
                          className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-white font-bold w-2/3"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (data.mission?.items || []).filter((_, i) => i !== idx);
                            setData({ ...data, mission: { ...data.mission, items: updated } });
                          }}
                          className="text-zinc-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={item.text || ''}
                        onChange={(e) => {
                          const updated = [...(data.mission?.items || [])];
                          updated[idx] = { ...updated[idx], text: e.target.value };
                          setData({ ...data, mission: { ...data.mission, items: updated } });
                        }}
                        placeholder="Point description..."
                        className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* OUR GOALS */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FF1018] uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>Card 2: Our Goals</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={data.goals?.badge || ''}
                  onChange={(e) =>
                    setData({ ...data, goals: { ...data.goals, badge: e.target.value } })
                  }
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  value={data.goals?.title || ''}
                  onChange={(e) =>
                    setData({ ...data, goals: { ...data.goals, title: e.target.value } })
                  }
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-bold text-white uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Tagline</label>
                <input
                  type="text"
                  value={data.goals?.tagline || ''}
                  onChange={(e) =>
                    setData({ ...data, goals: { ...data.goals, tagline: e.target.value } })
                  }
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-[#FF1018] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Description / Subtext</label>
                <textarea
                  rows={3}
                  value={data.goals?.description || ''}
                  onChange={(e) =>
                    setData({ ...data, goals: { ...data.goals, description: e.target.value } })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300"
                />
              </div>

              {/* Goals List Items */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-white">Goal Benchmarks</label>
                  <button
                    type="button"
                    onClick={() => {
                      const items = data.goals?.items || [];
                      setData({
                        ...data,
                        goals: {
                          ...data.goals,
                          items: [...items, { title: 'New Benchmark:', text: 'Goal explanation.' }],
                        },
                      });
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(data.goals?.items || []).map((item, idx) => (
                    <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => {
                            const updated = [...(data.goals?.items || [])];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setData({ ...data, goals: { ...data.goals, items: updated } });
                          }}
                          placeholder="Benchmark Title"
                          className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-white font-bold w-2/3"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (data.goals?.items || []).filter((_, i) => i !== idx);
                            setData({ ...data, goals: { ...data.goals, items: updated } });
                          }}
                          className="text-zinc-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={item.text || ''}
                        onChange={(e) => {
                          const updated = [...(data.goals?.items || [])];
                          updated[idx] = { ...updated[idx], text: e.target.value };
                          setData({ ...data, goals: { ...data.goals, items: updated } });
                        }}
                        placeholder="Benchmark description..."
                        className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: ABOUT SECTION TITLE & SUBTEXT                           */}
      {/* ============================================================== */}
      {activeTab === 'about' && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-semibold text-white">7. About Section Title & Subtext</h2>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Badge Title</label>
            <input
              type="text"
              value={data.about?.badge || ''}
              onChange={(e) =>
                setData({ ...data, about: { ...data.about, badge: e.target.value } })
              }
              placeholder="ABOUT MUSCLEGREED"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-[#FF1018] font-bold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Heading Line 1</label>
              <input
                type="text"
                value={data.about?.headingLine1 || ''}
                onChange={(e) =>
                  setData({ ...data, about: { ...data.about, headingLine1: e.target.value } })
                }
                placeholder="BUILT FOR ATHLETES WHO"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white uppercase font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Heading Outline Word</label>
              <input
                type="text"
                value={data.about?.headingOutline || ''}
                onChange={(e) =>
                  setData({ ...data, about: { ...data.about, headingOutline: e.target.value } })
                }
                placeholder="REFUSE"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white uppercase font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Heading Highlight Word</label>
              <input
                type="text"
                value={data.about?.headingHighlight || ''}
                onChange={(e) =>
                  setData({ ...data, about: { ...data.about, headingHighlight: e.target.value } })
                }
                placeholder="MEDIOCRITY"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-[#FF1018] uppercase font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">About Story Subtext</label>
            <textarea
              rows={4}
              value={data.about?.subText || ''}
              onChange={(e) =>
                setData({ ...data, about: { ...data.about, subText: e.target.value } })
              }
              placeholder="Founded in 2019 as the unapologetic antidote..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: TESTIMONIALS                                            */}
      {/* ============================================================== */}
      {activeTab === 'testimonials' && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">8. Testimonials</h2>
              <p className="text-xs text-zinc-400">Quotes and member avatars rotating in the testimonials 3D fan carousel.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const current = data.testimonials || [];
                const newT = {
                  id: Date.now(),
                  avatar: '/images/avatar-1.jpg',
                  quote: '"The training energy here is unmatched."',
                  author: '- Member Name, Athlete',
                };
                setData({ ...data, testimonials: [...current, newT] });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-semibold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Testimonial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data.testimonials || []).map((t, idx) => (
              <div key={t.id || idx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-900 border border-zinc-700 shrink-0">
                    <img src={t.avatar} alt="Author" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-[10px] cursor-pointer hover:bg-zinc-700 inline-flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload Avatar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e.target.files[0], (url) => {
                            const updated = [...(data.testimonials || [])];
                            updated[idx] = { ...updated[idx], avatar: url };
                            setData({ ...data, testimonials: updated });
                          })
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (data.testimonials || []).filter((_, i) => i !== idx);
                      setData({ ...data, testimonials: updated });
                    }}
                    className="p-1.5 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Quote</label>
                  <textarea
                    rows={2}
                    value={t.quote || ''}
                    onChange={(e) => {
                      const updated = [...(data.testimonials || [])];
                      updated[idx] = { ...updated[idx], quote: e.target.value };
                      setData({ ...data, testimonials: updated });
                    }}
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Author & Credential</label>
                  <input
                    type="text"
                    value={t.author || ''}
                    onChange={(e) => {
                      const updated = [...(data.testimonials || [])];
                      updated[idx] = { ...updated[idx], author: e.target.value };
                      setData({ ...data, testimonials: updated });
                    }}
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-amber-400 font-medium"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: CULTURE AT MUSCLE GREED (IMAGE OR VIDEO)                */}
      {/* ============================================================== */}
      {activeTab === 'culture' && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">9. Culture at MuscleGreed (Images & Videos)</h2>
              <p className="text-xs text-zinc-400">
                Highlights shown in the culture section with horizontal scroll, supporting video loops and photos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const current = data.culture || [];
                const newItem = {
                  id: `card-${Date.now()}`,
                  type: 'image',
                  src: '/images/culture-card-1-hd.jpg',
                  title: 'New Culture Highlight',
                };
                setData({ ...data, culture: [...current, newItem] });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-semibold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Culture Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data.culture || []).map((item, idx) => (
              <div key={item.id || idx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono">Type:</span>
                    <select
                      value={item.type || 'image'}
                      onChange={(e) => {
                        const updated = [...(data.culture || [])];
                        updated[idx] = { ...updated[idx], type: e.target.value };
                        setData({ ...data, culture: updated });
                      }}
                      className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-xs text-white"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video Loop</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = (data.culture || []).filter((_, i) => i !== idx);
                      setData({ ...data, culture: updated });
                    }}
                    className="text-zinc-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Media Preview */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 group">
                  {item.type === 'video' ? (
                    <video
                      src={item.src}
                      poster={item.poster}
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <label className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold cursor-pointer hover:bg-amber-400 flex items-center gap-1.5">
                      <Upload className="w-3 h-3" />
                      <span>Upload {item.type === 'video' ? 'Video' : 'Image'}</span>
                      <input
                        type="file"
                        accept={item.type === 'video' ? 'video/mp4,video/webm' : 'image/*'}
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e.target.files[0], (url) => {
                            const updated = [...(data.culture || [])];
                            updated[idx] = { ...updated[idx], src: url };
                            setData({ ...data, culture: updated });
                          })
                        }
                      />
                    </label>

                    {item.type === 'video' && (
                      <label className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-[10px] cursor-pointer hover:bg-zinc-700 flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Upload Poster</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(e.target.files[0], (url) => {
                              const updated = [...(data.culture || [])];
                              updated[idx] = { ...updated[idx], poster: url };
                              setData({ ...data, culture: updated });
                            })
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Highlight Title</label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => {
                      const updated = [...(data.culture || [])];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      setData({ ...data, culture: updated });
                    }}
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: STATS CARD CONTENT IN HOMEPAGE                          */}
      {/* ============================================================== */}
      {activeTab === 'stats' && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">10. Stats Card Content in Homepage</h2>
              <p className="text-xs text-zinc-400">
                Key numerical achievements (e.g. 18,000 Sq Ft Iron Floor, 40,000+ Lbs Steel).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const current = data.stats || [];
                const newStat = {
                  value: '100+',
                  label: 'Competition Racks',
                  highlight: false,
                };
                setData({ ...data, stats: [...current, newStat] });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-semibold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stat Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(data.stats || []).map((stat, idx) => (
              <div key={idx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Card #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (data.stats || []).filter((_, i) => i !== idx);
                      setData({ ...data, stats: updated });
                    }}
                    className="text-zinc-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Figure / Value</label>
                  <input
                    type="text"
                    value={stat.value || ''}
                    onChange={(e) => {
                      const updated = [...(data.stats || [])];
                      updated[idx] = { ...updated[idx], value: e.target.value };
                      setData({ ...data, stats: updated });
                    }}
                    placeholder="18,000"
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-lg font-black text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Label</label>
                  <input
                    type="text"
                    value={stat.label || ''}
                    onChange={(e) => {
                      const updated = [...(data.stats || [])];
                      updated[idx] = { ...updated[idx], label: e.target.value };
                      setData({ ...data, stats: updated });
                    }}
                    placeholder="Sq Ft Iron Floor"
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-zinc-900">
                  <span className="text-xs text-zinc-400">Red Highlight</span>
                  <input
                    type="checkbox"
                    checked={!!stat.highlight}
                    onChange={(e) => {
                      const updated = [...(data.stats || [])];
                      updated[idx] = { ...updated[idx], highlight: e.target.checked };
                      setData({ ...data, stats: updated });
                    }}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-zinc-900 border-zinc-700 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
