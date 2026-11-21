'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  Dumbbell,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  DollarSign,
  ListCheck,
  BookOpen,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function ServicesManagementPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.get('/services');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setServices(res.data.data);
        if (res.data.data.length > 0 && !expandedId) {
          setExpandedId(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setErrorMessage('Could not load services. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');
    try {
      const res = await api.put('/admin/services', services);
      if (res.data?.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error updating services:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save services changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all services to default system data? Custom edits will be overwritten.')) {
      return;
    }
    setSaving(true);
    setErrorMessage('');
    try {
      const res = await api.post('/admin/services/reset');
      if (res.data?.success && res.data?.data) {
        setServices(res.data.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setErrorMessage('Failed to reset services.');
    } finally {
      setSaving(false);
    }
  };

  // Upload image to BunnyCDN
  const handleImageUpload = async (file, sIdx) => {
    if (!file) return;
    setUploadingIdx(sIdx);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.url) {
        const updated = [...services];
        updated[sIdx] = { ...updated[sIdx], image: res.data.url };
        setServices(updated);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image to BunnyCDN.');
    } finally {
      setUploadingIdx(null);
    }
  };

  // Service CRUD helpers
  const handleAddService = () => {
    const newId = `service-${Date.now()}`;
    const nextNum = String(services.length + 1).padStart(2, '0');
    const newService = {
      id: newId,
      number: nextNum,
      title: 'NEW DISCIPLINE / SERVICE',
      shortTitle: 'New Service',
      tagline: 'High-intensity coaching protocol designed for peak physical transformation.',
      image: 'https://cly-pull-bunny.b-cdn.net/products/service-placeholder.jpg',
      category: 'strength',
      curriculum: [
        'Fundamental Movement Mechanics',
        'Periodized Progressive Overload',
        'Advanced Structural Conditioning',
      ],
      included: [
        'Unlimited specialty floor access',
        'Bi-weekly progress diagnostics & form analysis',
        'Custom nutrition & supplement blueprint',
      ],
      prices: [
        { plan: 'Monthly Pass', price: '₹2,500', desc: 'Standard full facility access' },
        { plan: 'Quarterly Pass', price: '₹6,500', desc: 'Includes locker + meal guide' },
      ],
    };
    setServices([...services, newService]);
    setExpandedId(newId);
  };

  const handleDeleteService = (idx) => {
    if (!window.confirm(`Delete "${services[idx].title}"?`)) return;
    const updated = services.filter((_, i) => i !== idx);
    setServices(updated);
  };

  // Curriculum Item Helpers
  const handleAddCurriculumItem = (sIdx) => {
    const updated = [...services];
    const curr = updated[sIdx].curriculum || [];
    updated[sIdx] = {
      ...updated[sIdx],
      curriculum: [...curr, 'New curriculum module'],
    };
    setServices(updated);
  };

  const handleUpdateCurriculumItem = (sIdx, cIdx, value) => {
    const updated = [...services];
    const curr = [...(updated[sIdx].curriculum || [])];
    curr[cIdx] = value;
    updated[sIdx] = { ...updated[sIdx], curriculum: curr };
    setServices(updated);
  };

  const handleDeleteCurriculumItem = (sIdx, cIdx) => {
    const updated = [...services];
    const curr = (updated[sIdx].curriculum || []).filter((_, i) => i !== cIdx);
    updated[sIdx] = { ...updated[sIdx], curriculum: curr };
    setServices(updated);
  };

  // Included Item Helpers
  const handleAddIncludedItem = (sIdx) => {
    const updated = [...services];
    const inc = updated[sIdx].included || [];
    updated[sIdx] = {
      ...updated[sIdx],
      included: [...inc, 'New included feature / perk'],
    };
    setServices(updated);
  };

  const handleUpdateIncludedItem = (sIdx, iIdx, value) => {
    const updated = [...services];
    const inc = [...(updated[sIdx].included || [])];
    inc[iIdx] = value;
    updated[sIdx] = { ...updated[sIdx], included: inc };
    setServices(updated);
  };

  const handleDeleteIncludedItem = (sIdx, iIdx) => {
    const updated = [...services];
    const inc = (updated[sIdx].included || []).filter((_, i) => i !== iIdx);
    updated[sIdx] = { ...updated[sIdx], included: inc };
    setServices(updated);
  };

  // Price Item Helpers
  const handleAddPriceItem = (sIdx) => {
    const updated = [...services];
    const prices = updated[sIdx].prices || [];
    updated[sIdx] = {
      ...updated[sIdx],
      prices: [
        ...prices,
        { plan: 'New Plan Pass', price: '₹3,000', desc: 'Standard membership duration' },
      ],
    };
    setServices(updated);
  };

  const handleUpdatePriceItem = (sIdx, pIdx, field, value) => {
    const updated = [...services];
    const prices = [...(updated[sIdx].prices || [])];
    prices[pIdx] = { ...prices[pIdx], [field]: value };
    updated[sIdx] = { ...updated[sIdx], prices };
    setServices(updated);
  };

  const handleDeletePriceItem = (sIdx, pIdx) => {
    const updated = [...services];
    const prices = (updated[sIdx].prices || []).filter((_, i) => i !== pIdx);
    updated[sIdx] = { ...updated[sIdx], prices };
    setServices(updated);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-400 font-medium">Loading services from Redis/MySQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 w-full min-w-0">
      {/* Sticky Header with Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10 py-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discipline Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Services &amp; Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Configure Service Name, BunnyCDN Image, Core Curriculum list, What&apos;s Included list, and Service Price options.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleAddService}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>

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
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Services updated successfully! MySQL and Redis cache refreshed. Gymweb 60s ISR will regenerate.</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Services List / Cards */}
      <div className="space-y-5">
        {services.map((service, sIdx) => {
          const isExpanded = expandedId === service.id;
          const curriculumList = service.curriculum || [];
          const includedList = service.included || [];
          const priceList = service.prices || [];

          return (
            <div
              key={service.id || sIdx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-zinc-900/80 border-amber-500/40 shadow-xl'
                  : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {/* Service Card Header / Toggle Row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : service.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 relative">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Title & Stats */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-amber-500 shrink-0">
                        #{service.number || String(sIdx + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight uppercase truncate">
                        {service.title || 'Untitled Service'}
                      </h3>
                      {service.category && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-300 uppercase shrink-0">
                          {service.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                      {service.tagline || 'No tagline set'}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1 text-zinc-300">
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        {curriculumList.length} Curriculum Modules
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-zinc-300">
                        <ListCheck className="w-3 h-3 text-emerald-400" />
                        {includedList.length} Included Perks
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-zinc-300">
                        <DollarSign className="w-3 h-3 text-blue-400" />
                        {priceList.length} Price Options
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Expand Chevron & Delete Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteService(sIdx);
                    }}
                    className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Service Editor */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-zinc-800/80 bg-zinc-950/40 space-y-7">
                  {/* Row 1: Service Name, Image & Tagline */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Image Preview & BunnyCDN Upload (4 cols) */}
                    <div className="lg:col-span-4 space-y-3">
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        SERVICE IMAGE (BUNNYCDN)
                      </label>
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 group flex items-center justify-center">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4 text-zinc-600">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                            <span className="text-xs">No image uploaded</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-zinc-950 text-xs font-semibold cursor-pointer hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-md">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingIdx === sIdx ? 'Uploading...' : 'Upload Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingIdx === sIdx}
                              className="hidden"
                              onChange={(e) => handleImageUpload(e.target.files[0], sIdx)}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 uppercase font-bold">Image URL</label>
                        <input
                          type="text"
                          value={service.image || ''}
                          onChange={(e) => {
                            const updated = [...services];
                            updated[sIdx] = { ...updated[sIdx], image: e.target.value };
                            setServices(updated);
                          }}
                          placeholder="https://cly-pull-bunny.b-cdn.net/products/..."
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Right: Title, Category, Tagline (8 cols) */}
                    <div className="lg:col-span-8 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                            SERVICE NAME
                          </label>
                          <input
                            type="text"
                            value={service.title || ''}
                            onChange={(e) => {
                              const updated = [...services];
                              updated[sIdx] = { ...updated[sIdx], title: e.target.value };
                              setServices(updated);
                            }}
                            placeholder="e.g. MUSCLE TRAINING & BODYBUILDING"
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                            Category
                          </label>
                          <select
                            value={service.category || 'strength'}
                            onChange={(e) => {
                              const updated = [...services];
                              updated[sIdx] = { ...updated[sIdx], category: e.target.value };
                              setServices(updated);
                            }}
                            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="strength">Strength</option>
                            <option value="cardio">Cardio</option>
                            <option value="combat">Combat</option>
                            <option value="wellness">Wellness</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                          Tagline / Subtext
                        </label>
                        <textarea
                          rows={2}
                          value={service.tagline || ''}
                          onChange={(e) => {
                            const updated = [...services];
                            updated[sIdx] = { ...updated[sIdx], tagline: e.target.value };
                            setServices(updated);
                          }}
                          placeholder="Brief description of this training discipline..."
                          className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 uppercase font-bold">Badge Text</label>
                          <input
                            type="text"
                            value={service.badge || ''}
                            onChange={(e) => {
                              const updated = [...services];
                              updated[sIdx] = { ...updated[sIdx], badge: e.target.value };
                              setServices(updated);
                            }}
                            placeholder="e.g. MOST POPULAR, HIGH ENERGY"
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 uppercase font-bold">Head Coach</label>
                          <input
                            type="text"
                            value={service.trainer || ''}
                            onChange={(e) => {
                              const updated = [...services];
                              updated[sIdx] = { ...updated[sIdx], trainer: e.target.value };
                              setServices(updated);
                            }}
                            placeholder="e.g. Marcus 'The Titan' Vance"
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: CORE CURRICULUM (List Items) */}
                  <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          CORE CURRICULUM (LIST ITEMS)
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddCurriculumItem(sIdx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/20 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Curriculum Item</span>
                      </button>
                    </div>

                    <p className="text-xs text-zinc-400">
                      These appear as numbered step-by-step training modules in the service details box.
                    </p>

                    <div className="space-y-2.5">
                      {curriculumList.map((item, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-zinc-800 text-amber-400 font-mono text-xs flex items-center justify-center shrink-0 font-bold">
                            {cIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateCurriculumItem(sIdx, cIdx, e.target.value)}
                            placeholder="e.g. Hypertrophy Mechanics & Fiber Recruitment"
                            className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteCurriculumItem(sIdx, cIdx)}
                            className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors shrink-0"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {curriculumList.length === 0 && (
                        <p className="text-xs text-zinc-500 italic py-2">
                          No curriculum items yet. Click &quot;Add Curriculum Item&quot; to add modules.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: WHATS INCLUDED IN THIS SERVICE (List Items) */}
                  <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ListCheck className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          WHATS INCLUDED IN THIS SERVICE (LIST ITEMS)
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddIncludedItem(sIdx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Included Perk</span>
                      </button>
                    </div>

                    <p className="text-xs text-zinc-400">
                      These appear as checkmark perk items highlighting enrollment value.
                    </p>

                    <div className="space-y-2.5">
                      {includedList.map((item, iIdx) => (
                        <div key={iIdx} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 font-mono text-xs flex items-center justify-center shrink-0">
                            ✓
                          </span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateIncludedItem(sIdx, iIdx, e.target.value)}
                            placeholder="e.g. Bi-weekly InBody 570 body composition scans"
                            className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteIncludedItem(sIdx, iIdx)}
                            className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors shrink-0"
                            title="Remove Perk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {includedList.length === 0 && (
                        <p className="text-xs text-zinc-500 italic py-2">
                          No included perks yet. Click &quot;Add Included Perk&quot; to add items.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 4: SERVICE PRICE (List Items) */}
                  <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          SERVICE PRICE (LIST ITEMS / TIERS)
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddPriceItem(sIdx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Price Option</span>
                      </button>
                    </div>

                    <p className="text-xs text-zinc-400">
                      Configure different pricing options (e.g. Monthly, Quarterly, Annual, or Drop-in passes).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {priceList.map((tier, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2.5 relative group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                              Option #{pIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeletePriceItem(sIdx, pIdx)}
                              className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                              title="Delete Price Option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold">Plan Name</label>
                            <input
                              type="text"
                              value={tier.plan || ''}
                              onChange={(e) =>
                                handleUpdatePriceItem(sIdx, pIdx, 'plan', e.target.value)
                              }
                              placeholder="e.g. 1 Month Pass"
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold">Price Value</label>
                            <input
                              type="text"
                              value={tier.price || ''}
                              onChange={(e) =>
                                handleUpdatePriceItem(sIdx, pIdx, 'price', e.target.value)
                              }
                              placeholder="e.g. ₹2,500 or $69"
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-black text-amber-400 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold">Details / Note</label>
                            <input
                              type="text"
                              value={tier.desc || ''}
                              onChange={(e) =>
                                handleUpdatePriceItem(sIdx, pIdx, 'desc', e.target.value)
                              }
                              placeholder="e.g. Includes locker access"
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-zinc-300 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {priceList.length === 0 && (
                      <p className="text-xs text-zinc-500 italic py-2">
                        No pricing options configured yet. Click &quot;Add Price Option&quot; above.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
