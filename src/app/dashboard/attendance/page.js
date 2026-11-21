'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Printer,
  RefreshCw,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Users,
  Camera,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  LogIn,
  LogOut,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import PrintableA4Poster from '@/components/attendance/PrintableA4Poster';
import CameraScannerModal from '@/components/attendance/CameraScannerModal';

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AttendanceDashboardPage() {
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner', 'geofence', 'logs'

  // QR Settings State
  const [qrSettings, setQrSettings] = useState(null);
  const [loadingQr, setLoadingQr] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Geofence State
  const [geoLat, setGeoLat] = useState('');
  const [geoLng, setGeoLng] = useState('');
  const [geoRadius, setGeoRadius] = useState(100);
  const [geoEnabled, setGeoEnabled] = useState(true);
  const [geoLocationName, setGeoLocationName] = useState('MuscleGreed Main Facility');
  const [savingGeofence, setSavingGeofence] = useState(false);
  const [capturingGps, setCapturingGps] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState({ type: '', message: '' });

  // Attendance Logs State
  const [logs, setLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [expandedStaffId, setExpandedStaffId] = useState(null);

  // Modals
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [cameraScannerOpen, setCameraScannerOpen] = useState(false);

  const isReceptionist = admin?.role?.toLowerCase() === 'receptionist';
  const isTrainer = admin?.role?.toLowerCase() === 'trainer';
  const isAdminOrSuper = ['superadmin', 'admin'].includes(admin?.role?.toLowerCase());

  // Fetch QR Settings
  const fetchQRSettings = async () => {
    setLoadingQr(true);
    try {
      const res = await api.get('/attendance/qr-settings');
      if (res.data?.success) {
        setQrSettings(res.data.data);
        setGeoLat(res.data.data.geofenceLatitude || '');
        setGeoLng(res.data.data.geofenceLongitude || '');
        setGeoRadius(res.data.data.geofenceRadiusMeters || 100);
        setGeoEnabled(res.data.data.isGeofenceEnabled);
        setGeoLocationName(res.data.data.locationName || 'MuscleGreed Main Facility');
      }
    } catch (err) {
      console.error('Failed to load QR settings:', err);
    } finally {
      setLoadingQr(false);
    }
  };

  // Fetch Attendance Logs
  const fetchLogs = async (date) => {
    setLoadingLogs(true);
    try {
      const res = await api.get(`/attendance/logs?date=${date || selectedDate}`);
      if (res.data?.success) {
        setLogs(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    const today = getLocalDateString();
    setSelectedDate(today);
    if (admin) {
      fetchQRSettings();
      if (!isTrainer) {
        fetchLogs(today);
      }
    }
  }, [admin, isTrainer]);

  // Invalidate & Regenerate QR Scanner
  const handleRegenerateQR = async () => {
    const confirmMsg =
      'Are you sure you want to invalidate the current attendance scanner?\n\nThis will immediately revoke all existing printed posters and tokens. Staff will only be able to punch using the new QR poster.';
    if (!window.confirm(confirmMsg)) return;

    setRegenerating(true);
    try {
      const res = await api.post('/attendance/regenerate-qr');
      if (res.data?.success) {
        await fetchQRSettings();
        alert('New QR scanner generated successfully! All previous posters have been invalidated.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to regenerate QR code.');
    } finally {
      setRegenerating(false);
    }
  };

  // Copy Attendance URL
  const handleCopyLink = () => {
    if (qrSettings?.attendanceUrl) {
      navigator.clipboard.writeText(qrSettings.attendanceUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Capture Current GPS Location for Geofence
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGeoFeedback({ type: 'error', message: 'Geolocation is not supported by your browser.' });
      return;
    }

    setCapturingGps(true);
    setGeoFeedback({ type: 'info', message: 'Requesting device GPS coordinates...' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLat(pos.coords.latitude.toFixed(8));
        setGeoLng(pos.coords.longitude.toFixed(8));
        setCapturingGps(false);
        setGeoFeedback({
          type: 'success',
          message: `Location captured successfully (Accuracy: ~${Math.round(pos.coords.accuracy)}m). Adjust radius and click Save.`,
        });
      },
      (err) => {
        setCapturingGps(false);
        setGeoFeedback({
          type: 'error',
          message: `GPS permission denied or unavailable: ${err.message}. Please allow location access.`,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Save Geofence Configuration
  const handleSaveGeofence = async (e) => {
    e.preventDefault();
    setSavingGeofence(true);
    setGeoFeedback({ type: '', message: '' });

    try {
      const res = await api.put('/attendance/geofence', {
        latitude: parseFloat(geoLat),
        longitude: parseFloat(geoLng),
        radiusMeters: parseInt(geoRadius, 10),
        isEnabled: geoEnabled,
        locationName: geoLocationName,
      });

      if (res.data?.success) {
        setGeoFeedback({ type: 'success', message: 'Geofence configuration saved successfully!' });
        await fetchQRSettings();
      }
    } catch (err) {
      setGeoFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save geofence settings.',
      });
    } finally {
      setSavingGeofence(false);
    }
  };

  // Filter logs by role
  const filteredLogs = logs.filter((item) => {
    if (roleFilter === 'ALL') return true;
    return item.role?.toLowerCase() === roleFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                STAFF ATTENDANCE &amp; SCANNER
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-amber-950 text-amber-400 border border-amber-500/30">
                GEOFENCED
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Static attendance QR poster &bull; Multiple In/Out daily tracking &bull; GPS geofence validation
            </p>
          </div>
        </div>

        {/* Quick Punch Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCameraScannerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Open Camera Scanner</span>
          </button>

          <button
            onClick={() => setPrintModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-zinc-700 flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print A4 Poster</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'scanner'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Attendance Scanner &amp; Poster</span>
        </button>

        {isAdminOrSuper && (
          <button
            onClick={() => setActiveTab('geofence')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'geofence'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Geofence Configuration</span>
          </button>
        )}

        {!isTrainer && (
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Live Attendance Logs</span>
          </button>
        )}
      </div>

      {/* ================= TAB 1: ATTENDANCE SCANNER & POSTER ================= */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main QR Card */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center text-center space-y-4 shadow-xl">
            <div className="flex items-center justify-between w-full pb-3 border-b border-zinc-800 text-xs">
              <span className="font-bold text-amber-400 uppercase font-mono text-[11px]">
                ACTIVE ATTENDANCE QR
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                STATIC &bull; LIVE
              </span>
            </div>

            {/* QR Image Box */}
            <div className="p-4 bg-white rounded-2xl border-4 border-zinc-800 shadow-xl">
              {loadingQr ? (
                <div className="w-56 h-56 flex items-center justify-center text-zinc-400 font-mono text-xs">
                  Generating QR...
                </div>
              ) : qrSettings?.qrImageData ? (
                <img
                  src={qrSettings.qrImageData}
                  alt="MuscleGreed Attendance QR"
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-zinc-400 font-mono text-xs">
                  No QR Available
                </div>
              )}
            </div>

            <div className="space-y-1 w-full font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-400 text-[11px] p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="truncate">Token: {qrSettings?.qrToken}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 w-full pt-2">
              <button
                onClick={() => setPrintModalOpen(true)}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official A4 Poster</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider transition-colors border border-zinc-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Scanner Link</span>
                  </>
                )}
              </button>

              {/* Invalidate & Regenerate Button */}
              <button
                onClick={handleRegenerateQR}
                disabled={regenerating}
                className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-950 text-red-400 hover:text-red-300 font-bold text-[11px] uppercase tracking-wider transition-colors border border-red-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                <span>Invalidate &amp; Regenerate QR</span>
              </button>
            </div>
          </div>

          {/* How It Works & Geofence Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Summary Card */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SCANNER INTEGRITY &amp; SYSTEM STATUS</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block uppercase">QR Code Mode</span>
                  <span className="font-bold text-white text-sm">Static (Secured)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block uppercase">Geofencing Status</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {qrSettings?.isGeofenceEnabled ? 'Active (Protected)' : 'Disabled'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block uppercase">Premises Radius</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {qrSettings?.geofenceRadiusMeters || 100} Meters
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                <p className="font-bold uppercase tracking-wider text-[11px]">
                  &bull; Invalidation Security Policy:
                </p>
                <p className="text-amber-200/80 leading-relaxed text-[11px]">
                  The scanner code stays static and reliable until you click <strong>Invalidate &amp; Regenerate</strong>. Once invalidated, all older prints and saved links immediately reject any attempts to punch.
                </p>
              </div>
            </div>

            {/* Attendance Flow Guide */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
              <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>TRAINER &amp; RECEPTIONIST SCANNING WORKFLOW</span>
              </h3>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-white block font-sans">Open Scanner via Any Camera or Panel</strong>
                    <span className="text-zinc-400 text-[11px]">
                      Staff can scan with their phone camera, Google Lens, QR app, or the built-in <strong>Open Camera Scanner</strong> button above.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-white block font-sans">Seamless Staff Authentication</strong>
                    <span className="text-zinc-400 text-[11px]">
                      If not already logged in, an instant staff login modal appears. Entering credentials immediately validates and punches their attendance.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-white block font-sans">Automatic In/Out Toggle &amp; Cumulative Hours</strong>
                    <span className="text-zinc-400 text-[11px]">
                      1st scan punches IN &bull; 2nd scan punches OUT &bull; 3rd scan punches IN. Staff can clock in/out multiple times a day; total hours worked are totaled automatically.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <strong className="text-white block font-sans">Strict Geofence Enforcement</strong>
                    <span className="text-zinc-400 text-[11px]">
                      Any punch attempted outside the designated gym perimeter is blocked with an exact distance warning.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: GEOFENCE CONFIGURATION ================= */}
      {activeTab === 'geofence' && isAdminOrSuper && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>CONFIGURE GYM GEOFENCE PERIMETER</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Staff can only punch attendance when physical GPS coordinates match this radius
              </p>
            </div>
            <button
              onClick={handleCaptureGps}
              disabled={capturingGps}
              className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <MapPin className={`w-3.5 h-3.5 ${capturingGps ? 'animate-spin' : ''}`} />
              <span>{capturingGps ? 'Reading GPS...' : 'Capture GPS Now'}</span>
            </button>
          </div>

          {geoFeedback.message && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                geoFeedback.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : geoFeedback.type === 'error'
                  ? 'bg-red-950/60 border-red-500/40 text-red-300'
                  : 'bg-blue-950/60 border-blue-500/40 text-blue-300'
              }`}
            >
              {geoFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{geoFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSaveGeofence} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Facility / Location Name
              </label>
              <input
                type="text"
                value={geoLocationName}
                onChange={(e) => setGeoLocationName(e.target.value)}
                placeholder="e.g. MuscleGreed Main Facility"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  value={geoLat}
                  onChange={(e) => setGeoLat(e.target.value)}
                  placeholder="e.g. 22.572645"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  value={geoLng}
                  onChange={(e) => setGeoLng(e.target.value)}
                  placeholder="e.g. 88.363892"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Allowed Geofence Radius (Meters)
                </label>
                <span className="font-mono text-amber-400 font-bold text-xs">
                  {geoRadius} meters
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={geoRadius}
                onChange={(e) => setGeoRadius(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>20m (Strict Entrance)</span>
                <span>100m (Standard Gym Floor)</span>
                <span>500m+ (Campus/Parking)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <input
                type="checkbox"
                id="geoEnabledToggle"
                checked={geoEnabled}
                onChange={(e) => setGeoEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
              <label htmlFor="geoEnabledToggle" className="text-xs text-zinc-300 font-medium cursor-pointer">
                Enable Geofencing Enforcement (Punches outside radius will be blocked)
              </label>
            </div>

            <button
              type="submit"
              disabled={savingGeofence}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingGeofence ? 'Saving Settings...' : 'Save Geofence Settings'}
            </button>
          </form>
        </div>
      )}

      {/* ================= TAB 3: LIVE ATTENDANCE LOGS ================= */}
      {activeTab === 'logs' && !isTrainer && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setSelectedDate(newDate);
                    if (newDate) {
                      fetchLogs(newDate);
                    }
                  }}
                  className="bg-transparent text-white focus:outline-none font-mono cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const today = getLocalDateString();
                  setSelectedDate(today);
                  fetchLogs(today);
                }}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700/60 transition-colors"
              >
                Today
              </button>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="TRAINER">Trainers Only</option>
                <option value="RECEPTIONIST">Receptionists Only</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            <button
              onClick={() => fetchLogs(selectedDate)}
              disabled={loadingLogs}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 p-1 self-end sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </button>
          </div>

          {/* Logs Table */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Staff Member</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status Today</th>
                  <th className="px-5 py-3.5">First In</th>
                  <th className="px-5 py-3.5">Last Out</th>
                  <th className="px-5 py-3.5">Total Worked</th>
                  <th className="px-5 py-3.5 text-right">Punches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {loadingLogs ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-zinc-500">
                      Loading attendance logs for {selectedDate}...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-zinc-500">
                      No staff records found for this date.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((item) => {
                    const isExpanded = expandedStaffId === item.staffId;
                    const isCheckedIn = item.status === 'CHECKED IN';
                    const isCheckedOut = item.status === 'CHECKED OUT';

                    return (
                      <React.Fragment key={item.staffId}>
                        <tr className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-sans font-bold text-white text-xs">{item.name}</div>
                            <div className="text-[10px] text-zinc-500">{item.email}</div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {item.role}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isCheckedIn
                                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400'
                                  : isCheckedOut
                                  ? 'bg-amber-950/70 border border-amber-500/40 text-amber-400'
                                  : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isCheckedIn ? 'bg-emerald-400 animate-pulse' : isCheckedOut ? 'bg-amber-400' : 'bg-zinc-500'
                                }`}
                              />
                              <span>{item.status}</span>
                            </span>
                          </td>

                          <td className="px-5 py-4 text-zinc-300">{item.firstInTime}</td>
                          <td className="px-5 py-4 text-zinc-300">{item.lastOutTime}</td>

                          <td className="px-5 py-4">
                            <span className="font-bold text-amber-400">{item.totalWorkingHours}</span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => setExpandedStaffId(isExpanded ? null : item.staffId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold cursor-pointer"
                            >
                              <span>{item.totalPunchesCount} punches</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Punch History Drawer */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 bg-zinc-950/90 border-b border-zinc-800">
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                                  PUNCH TIMELINE FOR {item.name.toUpperCase()} ({selectedDate})
                                </span>

                                {item.punches.length === 0 ? (
                                  <p className="text-zinc-500 text-xs italic">No punches recorded today.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                                    {item.punches.map((p, idx) => (
                                      <div
                                        key={p.id || idx}
                                        className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                              p.punch_type === 'IN'
                                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                            }`}
                                          >
                                            {p.punch_type}
                                          </span>
                                          <span className="text-white font-bold">{p.time_formatted}</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-400">
                                          {p.distance_meters !== null ? `${p.distance_meters}m` : 'Verified'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* A4 Printable Sheet Modal */}
      <PrintableA4Poster
        qrSettings={qrSettings}
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
      />

      {/* Built-in Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={cameraScannerOpen}
        onClose={() => setCameraScannerOpen(false)}
        onPunchSuccess={() => {
          fetchLogs(selectedDate);
        }}
      />
    </div>
  );
}
