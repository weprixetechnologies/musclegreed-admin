'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Dumbbell,
  LogIn,
  LogOut,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function AttendanceMarkerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { admin, login } = useAuth();

  const tokenParam = searchParams.get('token');

  // Login form state (if not logged in)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Punch process state
  const [punching, setPunching] = useState(false);
  const [punchResult, setPunchResult] = useState(null);
  const [punchError, setPunchError] = useState('');
  const [geoStatus, setGeoStatus] = useState('');

  // Auto-trigger punch if user is already logged in and token is present
  useEffect(() => {
    if (admin && tokenParam && !punchResult && !punching && !punchError) {
      executePunch();
    }
  }, [admin, tokenParam]);

  const executePunch = (authOverride = null) => {
    if (!tokenParam) {
      setPunchError('No attendance QR token was found in this link. Please scan the official gym poster.');
      return;
    }

    setPunching(true);
    setPunchError('');
    setGeoStatus('Acquiring device GPS coordinates for geofence verification...');

    if (!navigator.geolocation) {
      setPunchError('Geolocation is not supported by your browser. Please use a device with GPS capability.');
      setPunching(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeoStatus('Location verified. Punching attendance...');

        try {
          const payload = {
            token: tokenParam,
            latitude,
            longitude,
          };

          if (authOverride) {
            payload.email = authOverride.email;
            payload.password = authOverride.password;
          }

          const res = await api.post('/attendance/punch', payload);
          if (res.data?.success) {
            setPunchResult(res.data);
          } else {
            setPunchError(res.data?.message || 'Failed to record attendance punch.');
          }
        } catch (err) {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'Failed to record attendance punch.';
          setPunchError(msg);
        } finally {
          setPunching(false);
        }
      },
      (geoErr) => {
        console.error('Geolocation error:', geoErr);
        setPunchError(
          'Location (GPS) permission is required to verify gym geofence. Please enable location on your device and retry.'
        );
        setPunching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleLoginAndPunch = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!email.trim() || !password.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setLoggingIn(true);
    try {
      // 1. Authenticate with admin context
      await login(email.trim(), password);
      // 2. Execute attendance punch
      executePunch({ email: email.trim(), password });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your staff email and password.';
      setLoginError(msg);
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white block leading-none">
              MUSCLE<span className="text-amber-400">GREED</span>
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500/90">
              STAFF ATTENDANCE PORTAL
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-900 border border-zinc-800 text-zinc-400">
          GEOFENCED
        </span>
      </div>

      {/* Main Center Card */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
        {/* State 1: Punch Success */}
        {punchResult && (
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl backdrop-blur-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
                punchResult.punchType === 'IN'
                  ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                  : 'bg-amber-500/20 text-amber-400 border-2 border-amber-500/50 shadow-lg shadow-amber-500/20'
              }`}
            >
              {punchResult.punchType === 'IN' ? (
                <LogIn className="w-10 h-10" />
              ) : (
                <LogOut className="w-10 h-10" />
              )}
            </div>

            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black font-mono uppercase tracking-wider mb-2 ${
                  punchResult.punchType === 'IN'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                    : 'bg-amber-950 text-amber-400 border border-amber-500/50'
                }`}
              >
                PUNCH {punchResult.punchType} SUCCESSFUL
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                {punchResult.staffName}
              </h2>
              <p className="text-xs text-zinc-400 font-mono capitalize mt-0.5">
                Role: <strong>{punchResult.staffRole}</strong> &bull; {punchResult.punchTimeFormatted}
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <span className="text-zinc-400 text-[11px] uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Total Worked Today:
                </span>
                <span className="font-black text-emerald-400 text-sm">
                  {punchResult.totalWorkingHoursToday}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  Gym Proximity:
                </span>
                <span className="text-zinc-200">
                  {punchResult.distanceMeters !== null
                    ? `${punchResult.distanceMeters}m away (Within geofence)`
                    : 'Verified on-site'}
                </span>
              </div>
            </div>

            {/* Today Punches Summary */}
            {punchResult.todayPunches && punchResult.todayPunches.length > 0 && (
              <div className="text-left space-y-1.5 pt-1">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
                  Today&apos;s Punch History ({punchResult.todayPunches.length}):
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                  {punchResult.todayPunches.map((p, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.punch_type === 'IN'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {p.punch_type} @ {p.time_formatted}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  setPunchResult(null);
                  executePunch();
                }}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Punch Again</span>
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* State 2: Processing Punch with Location */}
        {punching && !punchResult && (
          <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              Verifying Geofence &amp; Punching...
            </h3>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed">{geoStatus}</p>
          </div>
        )}

        {/* State 3: Error Warning */}
        {punchError && !punching && !punchResult && (
          <div className="p-6 rounded-2xl bg-zinc-900 border border-red-500/40 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Punch Verification Failed
              </h3>
              <p className="text-xs text-red-300 mt-1 leading-relaxed">{punchError}</p>
            </div>

            <button
              onClick={() => executePunch()}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Punch</span>
            </button>
          </div>
        )}

        {/* State 4: Not Logged In Modal / Form */}
        {!admin && !punching && !punchResult && (
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-5">
            <div className="text-center space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-block">
                STAFF AUTHENTICATION
              </span>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                LOG IN TO RECORD ATTENDANCE
              </h2>
              <p className="text-xs text-zinc-400">
                Enter your Trainer or Receptionist staff credentials to clock IN / OUT.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginAndPunch} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. trainer@musclegreed.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>AUTHENTICATING &amp; PUNCHING...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>LOG IN &amp; PUNCH ATTENDANCE</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <span className="text-[11px] font-mono text-zinc-500">
                Token: {tokenParam ? `${tokenParam.slice(0, 16)}...` : 'Missing Token'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center py-2 text-[11px] text-zinc-500 font-mono">
        MuscleGreed Gym &bull; Geofence Protected Attendance System
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AttendanceMarkerContent />
    </Suspense>
  );
}
