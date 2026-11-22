'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Calendar,
  Clock,
  ShieldCheck,
  Search,
  RefreshCw,
  Printer,
  ChevronDown,
  ChevronUp,
  MapPin,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Dumbbell,
  Check,
  Copy,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import PrintableA4Poster from '@/components/attendance/PrintableA4Poster';

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function AttendanceDashboardPage() {
  const { admin } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [todayDate, setTodayDate] = useState('');
  const [memberAttendance, setMemberAttendance] = useState([]);
  const [loadingSheet, setLoadingSheet] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'IN' | 'OUT'
  const [expandedUserId, setExpandedUserId] = useState(null);

  // Settings / Poster Modal
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [qrSettings, setQrSettings] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Geofence configuration state inside modal
  const [geoLat, setGeoLat] = useState('');
  const [geoLng, setGeoLng] = useState('');
  const [geoRadius, setGeoRadius] = useState(100);
  const [geoEnabled, setGeoEnabled] = useState(true);
  const [geoLocationName, setGeoLocationName] = useState('MuscleGreed Main Facility');
  const [savingGeofence, setSavingGeofence] = useState(false);
  const [capturingGps, setCapturingGps] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState({ type: '', message: '' });

  const isAdminOrSuper = ['superadmin', 'admin'].includes(admin?.role?.toLowerCase());

  useEffect(() => {
    if (admin) {
      const today = getLocalDateString();
      setTodayDate(today);
      setSelectedDate(today);
      fetchMemberAttendanceSheet(today);
    }
  }, [admin]);

  const fetchMemberAttendanceSheet = async (date) => {
    setLoadingSheet(true);
    setErrorMsg('');
    try {
      const target = date || selectedDate;
      const res = await api.get(`/attendance/members?date=${target}`);
      if (res.data?.success) {
        setMemberAttendance(res.data.data || []);
      } else {
        setErrorMsg(res.data?.message || 'Failed to fetch member attendance sheet.');
      }
    } catch (err) {
      console.error('Error fetching member attendance:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load member attendance sheet.');
    } finally {
      setLoadingSheet(false);
    }
  };

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

  const handleOpenSettingsModal = () => {
    setSettingsModalOpen(true);
    fetchQRSettings();
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchMemberAttendanceSheet(newDate);
  };

  const handleJumpToToday = () => {
    const today = todayDate || getLocalDateString();
    setSelectedDate(today);
    fetchMemberAttendanceSheet(today);
  };

  const handleRegenerateQR = async () => {
    const confirmMsg =
      'Are you sure you want to invalidate the current attendance QR poster?\n\nAll existing printed posters will be revoked immediately. Members and staff will need to scan the newly generated poster.';
    if (!window.confirm(confirmMsg)) return;

    setRegenerating(true);
    try {
      const res = await api.post('/attendance/regenerate-qr');
      if (res.data?.success) {
        await fetchQRSettings();
        alert('New QR scanner generated successfully! Previous posters have been invalidated.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to regenerate QR code.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (qrSettings?.attendanceUrl) {
      navigator.clipboard.writeText(qrSettings.attendanceUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

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
          message: `Location captured: Lat ${pos.coords.latitude.toFixed(6)}, Lng ${pos.coords.longitude.toFixed(6)}. Click Save.`,
        });
      },
      (err) => {
        setCapturingGps(false);
        setGeoFeedback({
          type: 'error',
          message: `GPS permission denied or unavailable: ${err.message}`,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSaveGeofence = async (e) => {
    e.preventDefault();
    setSavingGeofence(true);
    setGeoFeedback({ type: '', message: '' });

    try {
      const res = await api.put('/attendance/geofence', {
        latitude: parseFloat(geoLat),
        longitude: parseFloat(geoLng),
        radiusMeters: parseInt(geoRadius, 10),
        isEnabled: Boolean(geoEnabled),
        locationName: geoLocationName,
      });

      if (res.data?.success) {
        setGeoFeedback({ type: 'success', message: 'Geofence configuration saved successfully!' });
      } else {
        setGeoFeedback({ type: 'error', message: res.data?.message || 'Failed to save geofence.' });
      }
    } catch (err) {
      setGeoFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error saving geofence configuration.',
      });
    } finally {
      setSavingGeofence(false);
    }
  };

  // Metrics
  const currentlyWorkingOutCount = useMemo(
    () => memberAttendance.filter((m) => m.isCurrentlyIn).length,
    [memberAttendance]
  );
  const completedWorkoutCount = useMemo(
    () => memberAttendance.filter((m) => !m.isCurrentlyIn).length,
    [memberAttendance]
  );

  // Filtered member attendance list
  const filteredList = useMemo(() => {
    return memberAttendance.filter((m) => {
      // Status filter
      if (statusFilter === 'IN' && !m.isCurrentlyIn) return false;
      if (statusFilter === 'OUT' && m.isCurrentlyIn) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = m.name?.toLowerCase().includes(q);
        const phoneMatch = m.phone?.toLowerCase().includes(q);
        const idMatch = m.membershipId?.toLowerCase().includes(q);
        const planMatch = m.planTitle?.toLowerCase().includes(q);
        return nameMatch || phoneMatch || idMatch || planMatch;
      }
      return true;
    });
  }, [memberAttendance, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ========================================================= */}
      {/* TOP HEADER: TITLE & CONTROLS */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono">
              DAILY FACILITY ATTENDANCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-amber-400" />
            <span>MEMBER ATTENDANCE SHEET</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Live check-in audit, facility occupancy, and workout hours for all gym members on{' '}
            <strong className="text-white">{formatDisplayDate(selectedDate)}</strong>.
          </p>
        </div>

        {/* Date Controls & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono">
            <Calendar className="w-4 h-4 text-amber-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="bg-transparent text-white focus:outline-none text-xs font-bold font-mono cursor-pointer"
            />
          </div>

          {/* Jump to Today Button */}
          {todayDate && selectedDate !== todayDate && (
            <button
              onClick={handleJumpToToday}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold uppercase transition-colors"
            >
              Today
            </button>
          )}

          {/* Refresh Sheet Button */}
          <button
            onClick={() => fetchMemberAttendanceSheet(selectedDate)}
            disabled={loadingSheet}
            title="Refresh Sheet"
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingSheet ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Print Sheet Button */}
          <button
            onClick={() => window.print()}
            title="Print Attendance Sheet"
            className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Print Sheet</span>
          </button>

          {/* QR Settings & Poster Config Button */}
          {isAdminOrSuper && (
            <button
              onClick={handleOpenSettingsModal}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/10"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Poster &amp; Geofence</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* KPI METRICS OVERVIEW */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Check-ins */}
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-zinc-900/90 border-amber-500/60 shadow-lg ring-1 ring-amber-500/40'
              : 'bg-zinc-900/50 hover:bg-zinc-900/80 border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-zinc-400 font-mono">
              TOTAL CHECK-INS TODAY
            </span>
            <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {memberAttendance.length}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Athletes attended on {formatDisplayDate(selectedDate)}
          </div>
        </button>

        {/* Currently Working Out */}
        <button
          onClick={() => setStatusFilter('IN')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'IN'
              ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/40'
              : 'bg-zinc-900/50 hover:bg-zinc-900/80 border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-400 font-mono">
              CURRENTLY IN FACILITY
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 flex items-baseline gap-2">
            {currentlyWorkingOutCount}
            {currentlyWorkingOutCount > 0 && (
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Live</span>
            )}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active workout sessions right now</span>
          </div>
        </button>

        {/* Completed Workouts */}
        <button
          onClick={() => setStatusFilter('OUT')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'OUT'
              ? 'bg-amber-950/40 border-amber-500/60 shadow-lg ring-1 ring-amber-500/40'
              : 'bg-zinc-900/50 hover:bg-zinc-900/80 border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-400 font-mono">
              SESSIONS COMPLETED
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
            {completedWorkoutCount}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Checked out after completing workout
          </div>
        </button>

        {/* Facility Protection Metric */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-blue-400 font-mono">
              GEOFENCE CHECK
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black uppercase text-white truncate">
            100% VERIFIED
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            GPS proximity verified on premises
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEARCH & FILTER CONTROLS */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Members', count: memberAttendance.length },
            { id: 'IN', label: 'Currently In', count: currentlyWorkingOutCount },
            { id: 'OUT', label: 'Checked Out', count: completedWorkoutCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-zinc-950 font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-black/20">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search athlete, phone, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-7 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Error Feedback */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ATTENDANCE SHEET TABLE */}
      {/* ========================================================= */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
        {loadingSheet ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400 font-mono">
              Loading member attendance sheet for {selectedDate}...
            </p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-20 px-6 text-center space-y-3">
            <Users className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold uppercase text-white">No Attendance Records Found</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {searchQuery
                ? `No members matched "${searchQuery}" on ${formatDisplayDate(selectedDate)}.`
                : `No members have scanned or checked in on ${formatDisplayDate(selectedDate)} yet.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 text-[10px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-bold">Athlete Member</th>
                  <th className="py-3.5 px-4 font-bold">Membership Pass</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Check-In Time</th>
                  <th className="py-3.5 px-4 font-bold">Check-Out Time</th>
                  <th className="py-3.5 px-4 font-bold">Workout Duration</th>
                  <th className="py-3.5 px-4 font-bold">Proximity</th>
                  <th className="py-3.5 px-4 font-bold text-right">Punches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredList.map((record) => {
                  const isExpanded = expandedUserId === record.userId;
                  return (
                    <React.Fragment key={record.userId}>
                      <tr className="hover:bg-zinc-800/40 transition-colors">
                        {/* Member Name & Phone */}
                        <td className="py-3 px-4">
                          <div className="font-sans font-bold text-white text-sm">
                            {record.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">{record.phone}</div>
                        </td>

                        {/* Membership ID & Plan Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold text-[11px]">
                              {record.membershipId}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-sans mt-0.5">
                            {record.planTitle}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono inline-flex items-center gap-1.5 ${
                              record.isCurrentlyIn
                                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
                                : 'bg-amber-950/80 border border-amber-500/50 text-amber-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                record.isCurrentlyIn ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                              }`}
                            />
                            <span>{record.status}</span>
                          </span>
                        </td>

                        {/* First IN Time */}
                        <td className="py-3 px-4 font-bold text-white">
                          {record.firstInTime}
                        </td>

                        {/* Last OUT Time */}
                        <td className="py-3 px-4 text-zinc-300">
                          {record.lastOutTime}
                        </td>

                        {/* Total Duration */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-400 text-xs">
                            {record.totalWorkoutDuration}
                          </span>
                        </td>

                        {/* Geofence Distance */}
                        <td className="py-3 px-4 text-zinc-400 text-[11px]">
                          {record.distanceMeters !== undefined && record.distanceMeters !== null
                            ? `${record.distanceMeters}m from gym`
                            : 'On-site'}
                        </td>

                        {/* Expandable Punches Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() =>
                              setExpandedUserId(isExpanded ? null : record.userId)
                            }
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{record.totalPunchesCount} Logs</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Punch Timeline for this Member */}
                      {isExpanded && (
                        <tr className="bg-zinc-950/40">
                          <td colSpan={8} className="p-4 px-6 border-y border-zinc-800">
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block mb-1">
                                Sequential Check-in Timeline for {record.name}:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {record.punches.map((p, idx) => (
                                  <div
                                    key={p.id || idx}
                                    className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                          p.punch_type === 'IN'
                                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                            : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                                        }`}
                                      >
                                        CHECK-{p.punch_type}
                                      </span>
                                      <span className="text-white font-bold">
                                        {p.time_formatted}
                                      </span>
                                    </div>
                                    {p.distance_meters !== null && (
                                      <span className="text-zinc-500 text-[10px]">
                                        {p.distance_meters}m
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: QR POSTER & GEOFENCE SETTINGS */}
      {/* ========================================================= */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase">
                    Gym Attendance Poster &amp; Geofence Configuration
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Official QR code scanned by members &amp; trainers at the gym entrance.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingQr ? (
              <div className="py-12 text-center text-zinc-400 text-xs">Loading QR settings...</div>
            ) : (
              <div className="space-y-6">
                {/* QR Poster Preview & Controls */}
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center gap-6">
                  {qrSettings?.qrImageData ? (
                    <img
                      src={qrSettings.qrImageData}
                      alt="Gym Attendance QR"
                      className="w-36 h-36 rounded-xl border border-zinc-700 bg-white p-2 shrink-0"
                    />
                  ) : (
                    <div className="w-36 h-36 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xs text-zinc-500">
                      Generating QR...
                    </div>
                  )}

                  <div className="space-y-3 flex-1 text-center sm:text-left">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                        ACTIVE QR TOKEN
                      </span>
                      <div className="text-sm font-mono font-bold text-white truncate">
                        {qrSettings?.qrToken || 'N/A'}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                      <button
                        onClick={() => setPrintModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Print A4 Poster</span>
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
                      </button>
                      <button
                        onClick={handleRegenerateQR}
                        disabled={regenerating}
                        className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/30 text-red-300 text-xs font-bold uppercase transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                        <span>Invalidate &amp; Regenerate</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Geofence Form */}
                <form onSubmit={handleSaveGeofence} className="space-y-4 pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-white uppercase">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>GPS Geofence Perimeter</span>
                    </div>
                    <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={geoEnabled}
                        onChange={(e) => setGeoEnabled(e.target.checked)}
                        className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="font-bold text-zinc-300">Enable Geofence Verification</span>
                    </label>
                  </div>

                  {geoFeedback.message && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        geoFeedback.type === 'success'
                          ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                          : 'bg-red-950/70 border border-red-500/40 text-red-300'
                      }`}
                    >
                      {geoFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span>{geoFeedback.message}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1 font-mono">
                        Latitude
                      </label>
                      <input
                        type="text"
                        value={geoLat}
                        onChange={(e) => setGeoLat(e.target.value)}
                        placeholder="e.g. 28.613939"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1 font-mono">
                        Longitude
                      </label>
                      <input
                        type="text"
                        value={geoLng}
                        onChange={(e) => setGeoLng(e.target.value)}
                        placeholder="e.g. 77.209021"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCaptureGps}
                      disabled={capturingGps}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{capturingGps ? 'Capturing GPS...' : 'Auto-Capture My GPS Location'}</span>
                    </button>
                    <button
                      type="submit"
                      disabled={savingGeofence}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase transition-all"
                    >
                      {savingGeofence ? 'Saving...' : 'Save Geofence'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* A4 Printable Poster Modal */}
      {printModalOpen && qrSettings && (
        <PrintableA4Poster
          qrSettings={qrSettings}
          onClose={() => setPrintModalOpen(false)}
        />
      )}
    </div>
  );
}
