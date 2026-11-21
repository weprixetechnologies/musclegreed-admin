'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  QrCode,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

export default function PaymentScannerTab() {
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [upiId, setUpiId] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [instructions, setInstructions] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/payment-settings');
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setQrImageUrl(d.qr_image_url || '');
        setUpiId(d.upi_id || 'musclegreed@upi');
        setMerchantName(d.merchant_name || 'MuscleGreed Gym & Fitness');
        setInstructions(d.instructions || '');
      }
    } catch (err) {
      console.error('Error fetching payment settings:', err);
      setError('Could not load payment settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadScanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.url) {
        setQrImageUrl(res.data.url);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload QR scanner image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      const res = await api.put('/admin/payment-settings', {
        qr_image_url: qrImageUrl,
        upi_id: upiId,
        merchant_name: merchantName,
        instructions: instructions,
      });

      if (res.data?.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save payment settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Intro Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Payment Scanner &amp; UPI Configuration
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Upload your gym&apos;s UPI QR scanner image. Athletes will scan this during subscription enrollment and pass renewals.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Payment scanner and UPI details saved and published successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: QR Scanner Image Upload */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <QrCode className="w-4 h-4" />
              <span>Scanner QR Image</span>
            </span>
            {uploading && (
              <span className="text-xs text-amber-400 animate-pulse">Uploading...</span>
            )}
          </div>

          {/* QR Preview Box */}
          <div className="p-4 bg-white rounded-xl flex items-center justify-center max-w-[240px] mx-auto shadow-inner">
            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="Payment QR Scanner"
                className="w-48 h-48 object-contain"
              />
            ) : (
              <div className="w-48 h-48 flex flex-col items-center justify-center text-zinc-400">
                <QrCode className="w-16 h-16 mb-2 text-zinc-300" />
                <span className="text-[11px]">No QR Uploaded</span>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div>
            <label className="block w-full text-center py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium cursor-pointer transition-colors border border-zinc-700">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadScanner}
                className="hidden"
                disabled={uploading}
              />
              <span className="inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Uploading Image...' : 'Upload New Scanner Image'}</span>
              </span>
            </label>
            <p className="text-[11px] text-zinc-500 text-center mt-1.5">
              Supports PNG, JPG, WebP. High contrast scanner recommended.
            </p>
          </div>
        </div>

        {/* Right Card: UPI & Instruction Fields */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                UPI ID (Virtual Payment Address) *
              </label>
              <input
                type="text"
                required
                placeholder="musclegreed@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Merchant / Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="MuscleGreed Gym & Fitness"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Payment Instructions for Members
              </label>
              <textarea
                rows={3}
                placeholder="Scan using Google Pay, PhonePe, Paytm or BHIM. Take a screenshot of the payment receipt and enter the 12-digit UTR."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Scanner Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
