'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  CreditCard,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Check,
  X,
  Calendar,
  Tag,
  Flame,
  ArrowRight,
  Layers,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import PaymentApprovalsTab from '@/components/subscriptions/PaymentApprovalsTab';
import PaymentScannerTab from '@/components/subscriptions/PaymentScannerTab';

export default function SubscriptionsManagementPage() {
  const [services, setServices] = useState([]);
  const [subscriptions, setSubscriptions] = useState({});
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' | 'approvals' | 'scanner'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [servicesRes, subsRes] = await Promise.all([
        api.get('/services'),
        api.get('/subscriptions'),
      ]);

      if (servicesRes.data?.success && Array.isArray(servicesRes.data?.data)) {
        setServices(servicesRes.data.data);
        if (servicesRes.data.data.length > 0) {
          setSelectedServiceId(servicesRes.data.data[0].id);
        }
      }

      if (subsRes.data?.success && subsRes.data?.data) {
        setSubscriptions(subsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setErrorMessage('Could not load services or subscription plans. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');
    try {
      const res = await api.put('/admin/subscriptions', subscriptions);
      if (res.data?.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error updating subscriptions:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save subscriptions.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all subscriptions to system defaults? Custom edits will be overwritten.')) {
      return;
    }
    setSaving(true);
    setErrorMessage('');
    try {
      const res = await api.post('/admin/subscriptions/reset');
      if (res.data?.success && res.data?.data) {
        setSubscriptions(res.data.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setErrorMessage('Failed to reset subscriptions.');
    } finally {
      setSaving(false);
    }
  };

  // Current plans for the selected service
  const currentPlans = subscriptions[selectedServiceId] || [];

  // Add plan to selected service
  const handleAddPlan = (interval = 'MONTHLY') => {
    const newId = `${selectedServiceId}-${interval.toLowerCase()}-${Date.now()}`;
    const newPlan = {
      id: newId,
      interval: interval, // WEEKLY | MONTHLY | YEARLY
      title: `${interval.charAt(0) + interval.slice(1).toLowerCase()} Access Pass`,
      basePrice: interval === 'WEEKLY' ? '₹1,200' : interval === 'MONTHLY' ? '₹3,500' : '₹25,000',
      salePrice: interval === 'WEEKLY' ? '₹899' : interval === 'MONTHLY' ? '₹2,500' : '₹18,000',
      badge: interval === 'MONTHLY' ? 'MOST POPULAR' : interval === 'YEARLY' ? 'BEST VALUE' : 'TRIAL',
      popular: interval === 'MONTHLY',
      included: [
        'Full facility training access during duration',
        'Locker room & clean shower access',
        'Form diagnostics and onboarding clinic',
      ],
      notIncluded: [
        'Dedicated 1-on-1 private coaching sessions',
      ],
    };

    setSubscriptions({
      ...subscriptions,
      [selectedServiceId]: [...currentPlans, newPlan],
    });
  };

  // Delete plan
  const handleDeletePlan = (pIdx) => {
    const updated = currentPlans.filter((_, i) => i !== pIdx);
    setSubscriptions({
      ...subscriptions,
      [selectedServiceId]: updated,
    });
  };

  // Update plan property
  const handleUpdatePlan = (pIdx, field, value) => {
    const updated = [...currentPlans];
    updated[pIdx] = { ...updated[pIdx], [field]: value };
    setSubscriptions({
      ...subscriptions,
      [selectedServiceId]: updated,
    });
  };

  // Included Items Handlers
  const handleAddIncluded = (pIdx) => {
    const updated = [...currentPlans];
    const inc = updated[pIdx].included || [];
    updated[pIdx] = { ...updated[pIdx], included: [...inc, 'New included feature / perk'] };
    setSubscriptions({
      ...subscriptions,
      [selectedServiceId]: updated,
    });
  };

  const handleUpdateIncluded = (pIdx, iIdx, value) => {
    const updated = [...currentPlans];
    const inc = [...(updated[pIdx].included || [])];
    inc[iIdx] = value;
    updated[pIdx] = { ...updated[pIdx], included: inc };
    setSubscriptions({
      ...subscriptions,
      [selectedServiceId]: updated,
    });
  };

  const handleDeleteIncluded = (pIdx, iIdx) => {
    const updated = [...currentPlans];
    const inc = (updated[pIdx].included || []).filter((_, i) => i !== iIdx);
    updated[pIdx] = { ...updated[pIdx], included: inc };
    setSubscriptions({
      ...subscriptions,
      [selectedServiceId]: updated,
    });
  };

  // Not Included Items Handlers
  const handleAddNotIncluded = (pIdx) => {
    const updated = [...currentPlans];
    const notInc = updated[pIdx].notIncluded || [];
    updated[pIdx] = { ...updated[pIdx], notIncluded: [...notInc, 'Limitation / not included item'] };
    setSubscriptions({
      ...subscriptions,
      [selectedServiceId]: updated,
    });
  };

  const handleUpdateNotIncluded = (pIdx, niIdx, value) => {
    const updated = [...currentPlans];
    const notInc = [...(updated[pIdx].notIncluded || [])];
    notInc[niIdx] = value;
    updated[pIdx] = { ...updated[pIdx], notIncluded: notInc };
    setSubscriptions({
      ...subscriptions,
      [selectedServiceId]: updated,
    });
  };

  const handleDeleteNotIncluded = (pIdx, niIdx) => {
    const updated = [...currentPlans];
    const notInc = (updated[pIdx].notIncluded || []).filter((_, i) => i !== niIdx);
    updated[pIdx] = { ...updated[pIdx], notIncluded: notInc };
    setSubscriptions({
      ...subscriptions,
      [selectedServiceId]: updated,
    });
  };

  const activeService = services.find((s) => s.id === selectedServiceId);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-400 font-medium">Loading subscriptions &amp; services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 w-full min-w-0">
      {/* Sticky Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10 py-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Membership Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Service Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage WEEKLY, MONTHLY &amp; YEARLY subscription plans by service with Base Price, Sale Price, What is Included, and What is Not Included.
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
                <span>Save Subscriptions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscription Plans</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'approvals'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Payment Approvals</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'scanner'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Scanner &amp; UPI Setup</span>
        </button>
      </div>

      {/* Tab 2: Payment Approvals */}
      {activeTab === 'approvals' && <PaymentApprovalsTab />}

      {/* Tab 3: Payment Scanner & UPI Setup */}
      {activeTab === 'scanner' && <PaymentScannerTab />}

      {/* Tab 1: Subscription Plans Editor */}
      {activeTab === 'plans' && (
        <>
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Subscriptions updated successfully! Cached in Redis for 60s gymweb ISR delivery.</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Service Selector Strip */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>SELECT SERVICE TO CONFIGURE SUBSCRIPTIONS</span>
          </label>
          <span className="text-xs text-zinc-500">
            {services.length} services available
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full min-w-0">
          {services.map((service) => {
            const isSelected = service.id === selectedServiceId;
            const plansCount = (subscriptions[service.id] || []).length;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedServiceId(service.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md font-extrabold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <span>{service.shortTitle || service.title}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    isSelected ? 'bg-zinc-950 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {plansCount} plans
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Service Banner & Action Bar */}
      {activeService && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <div className="flex items-center gap-3.5">
            {activeService.image && (
              <img
                src={activeService.image}
                alt={activeService.title}
                className="w-12 h-12 rounded-xl object-cover border border-zinc-700 shrink-0"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight uppercase">
                  {activeService.title}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-400 uppercase">
                  {activeService.category || 'Discipline'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {currentPlans.length} subscription plans active for this discipline.
              </p>
            </div>
          </div>

          {/* Quick Add Plan Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-zinc-400 uppercase font-semibold mr-1">Add Tier:</span>
            <button
              type="button"
              onClick={() => handleAddPlan('WEEKLY')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white hover:border-amber-500/50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Weekly</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddPlan('MONTHLY')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white hover:border-amber-500/50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Monthly</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddPlan('YEARLY')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white hover:border-amber-500/50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Yearly</span>
            </button>
          </div>
        </div>
      )}

      {/* Subscription Plans Grid for Selected Service */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {currentPlans.map((plan, pIdx) => {
          const includedList = plan.included || [];
          const notIncludedList = plan.notIncluded || [];

          return (
            <div
              key={plan.id || pIdx}
              className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 relative ${
                plan.popular
                  ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-amber-500/50 shadow-xl'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-amber-400 font-mono text-xs font-black uppercase">
                    {plan.interval}
                  </span>
                  <label className="flex items-center gap-1 text-[11px] text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plan.popular || false}
                      onChange={(e) => handleUpdatePlan(pIdx, 'popular', e.target.checked)}
                      className="rounded accent-amber-500 w-3.5 h-3.5"
                    />
                    <span>Highlight</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePlan(pIdx)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                  title="Delete Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Badge */}
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-bold">Plan Title</label>
                  <input
                    type="text"
                    value={plan.title || ''}
                    onChange={(e) => handleUpdatePlan(pIdx, 'title', e.target.value)}
                    placeholder="e.g. Monthly Hypertrophy Pro"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-500 mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Billing Cycle</label>
                    <select
                      value={plan.interval || 'MONTHLY'}
                      onChange={(e) => handleUpdatePlan(pIdx, 'interval', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 mt-1"
                    >
                      <option value="WEEKLY">WEEKLY</option>
                      <option value="MONTHLY">MONTHLY</option>
                      <option value="YEARLY">YEARLY</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Badge Text</label>
                    <input
                      type="text"
                      value={plan.badge || ''}
                      onChange={(e) => handleUpdatePlan(pIdx, 'badge', e.target.value)}
                      placeholder="e.g. MOST POPULAR"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500 mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Row: Base Price vs Sale Price */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3 mb-5">
                <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  PRICING CONFIGURATION
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">
                      Base Price (Strike)
                    </label>
                    <input
                      type="text"
                      value={plan.basePrice || ''}
                      onChange={(e) => handleUpdatePlan(pIdx, 'basePrice', e.target.value)}
                      placeholder="e.g. ₹3,500"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-400 line-through focus:outline-none focus:border-amber-500 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-bold text-emerald-400">
                      Sale Price (Active)
                    </label>
                    <input
                      type="text"
                      value={plan.salePrice || ''}
                      onChange={(e) => handleUpdatePlan(pIdx, 'salePrice', e.target.value)}
                      placeholder="e.g. ₹2,500"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-black text-amber-400 focus:outline-none focus:border-amber-500 mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Section: WHAT IS INCLUDED (List Items) */}
              <div className="space-y-3 mb-5 p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>WHAT IS INCLUDED</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddIncluded(pIdx)}
                    className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {includedList.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center text-[10px] shrink-0 font-bold">
                        ✓
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateIncluded(pIdx, iIdx, e.target.value)}
                        placeholder="Included perk..."
                        className="flex-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteIncluded(pIdx, iIdx)}
                        className="text-zinc-600 hover:text-red-400 p-1 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {includedList.length === 0 && (
                    <p className="text-[11px] text-zinc-500 italic py-1">
                      No included items. Click &quot;Add Item&quot;.
                    </p>
                  )}
                </div>
              </div>

              {/* Section: WHATS NOT INCLUDED (List Items) */}
              <div className="space-y-3 p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400/90 uppercase tracking-wider">
                    <X className="w-4 h-4 stroke-[3]" />
                    <span>WHATS NOT INCLUDED</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddNotIncluded(pIdx)}
                    className="text-[10px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {notIncludedList.map((item, niIdx) => (
                    <div key={niIdx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-red-950/50 text-red-400 flex items-center justify-center text-[10px] shrink-0 font-bold">
                        ✗
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateNotIncluded(pIdx, niIdx, e.target.value)}
                        placeholder="Not included limitation..."
                        className="flex-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteNotIncluded(pIdx, niIdx)}
                        className="text-zinc-600 hover:text-red-400 p-1 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {notIncludedList.length === 0 && (
                    <p className="text-[11px] text-zinc-500 italic py-1">
                      No excluded items (All-inclusive plan).
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {currentPlans.length === 0 && (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4">
          <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white">No Subscription Plans Configured</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              This service does not have any active subscriptions yet. Click one of the buttons below to create a plan.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleAddPlan('WEEKLY')}
              className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white hover:border-amber-500 transition-colors"
            >
              + Add Weekly Plan
            </button>
            <button
              type="button"
              onClick={() => handleAddPlan('MONTHLY')}
              className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400 transition-colors"
            >
              + Add Monthly Plan
            </button>
            <button
              type="button"
              onClick={() => handleAddPlan('YEARLY')}
              className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white hover:border-amber-500 transition-colors"
            >
              + Add Yearly Plan
            </button>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
