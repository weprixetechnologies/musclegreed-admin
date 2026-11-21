'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldCheck,
  RefreshCw,
  LogOut as LogOutIcon,
  LogIn as LogInIcon,
  ExternalLink,
} from 'lucide-react';
import api from '@/lib/api';

export default function CameraScannerModal({ isOpen, onClose, onPunchSuccess }) {
  const [cameraPermission, setCameraPermission] = useState('prompt'); // prompt, granted, denied
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingPunch, setLoadingPunch] = useState(false);
  const [punchResult, setPunchResult] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'html5-camera-scanner-view';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setPunchResult(null);
      setErrorMsg('');
      setLoadingPunch(false);
    } else {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
    } catch (e) {
      console.warn('Error stopping html5-qrcode scanner:', e);
    }
    setScanning(false);
  };

  const startScanner = async () => {
    setErrorMsg('');
    setPunchResult(null);
    setLoadingPunch(false);
    setLocationStatus('');

    try {
      // Dynamic import to avoid SSR issues
      const { Html5Qrcode } = await import('html5-qrcode');

      // Request camera access
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setCameraPermission('denied');
        setErrorMsg('No camera found on this device. Please use a device with a working camera.');
        return;
      }

      setCameraPermission('granted');

      // Clean up previous instance if any
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
          html5QrCodeRef.current.clear();
        } catch (e) {}
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' }, // prefer rear camera on mobile
        config,
        async (decodedText) => {
          // Detected QR Code!
          await handleQrDetected(decodedText);
        },
        () => {
          // Frame failure callback (ignore frames without QR)
        }
      );

      setScanning(true);
    } catch (err) {
      console.error('Camera scanner start error:', err);
      setCameraPermission('denied');
      setErrorMsg(
        err.message || 'Camera permission was denied. Please allow camera permissions in your browser to scan.'
      );
    }
  };

  const handleQrDetected = async (rawText) => {
    // Extract token: either from URL query param `token=...` or raw text
    let token = rawText.trim();
    if (token.includes('token=')) {
      try {
        const url = new URL(token);
        token = url.searchParams.get('token') || token;
      } catch (e) {
        const match = token.match(/token=([a-zA-Z0-9_-]+)/);
        if (match) token = match[1];
      }
    }

    // Stop scanner while processing punch
    await stopScanner();
    setLoadingPunch(true);
    setErrorMsg('');
    setLocationStatus('Getting GPS coordinates for geofence verification...');

    // Request GPS location
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setLoadingPunch(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationStatus(`GPS Location acquired. Marking attendance...`);

        try {
          const res = await api.post('/attendance/punch', {
            token,
            latitude,
            longitude,
          });

          if (res.data?.success) {
            setPunchResult(res.data);
            if (onPunchSuccess) onPunchSuccess(res.data);
          } else {
            setErrorMsg(res.data?.message || 'Failed to record attendance punch.');
          }
        } catch (err) {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'Failed to record attendance punch.';
          setErrorMsg(msg);
        } finally {
          setLoadingPunch(false);
        }
      },
      (geoErr) => {
        console.error('Geolocation error:', geoErr);
        setErrorMsg(
          'Location (GPS) permission is required to verify gym geofence. Please enable location on your device.'
        );
        setLoadingPunch(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Built-in Camera Scanner
              </h3>
              <p className="text-[10px] text-zinc-400">
                Scan official gym attendance QR poster
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Punch Success Screen */}
          {punchResult && (
            <div className="space-y-4 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
              <div
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                  punchResult.punchType === 'IN'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {punchResult.punchType === 'IN' ? (
                  <LogInIcon className="w-8 h-8" />
                ) : (
                  <LogOutIcon className="w-8 h-8" />
                )}
              </div>

              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-black font-mono uppercase tracking-wider mb-1 ${
                    punchResult.punchType === 'IN'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                      : 'bg-amber-950 text-amber-400 border border-amber-500/50'
                  }`}
                >
                  PUNCH {punchResult.punchType} RECORDED
                </span>
                <h4 className="text-lg font-bold text-white mt-1">
                  {punchResult.staffName}
                </h4>
                <p className="text-xs text-zinc-400 capitalize">
                  {punchResult.staffRole} &bull; {punchResult.punchTimeFormatted}
                </p>
              </div>

              {/* Working Hours & Geofence Box */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-left space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
                  <span className="text-zinc-500 text-[11px] uppercase flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Total Worked Today:
                  </span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {punchResult.totalWorkingHoursToday}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    Geofence Proximity:
                  </span>
                  <span className="text-zinc-200">
                    {punchResult.distanceMeters !== null
                      ? `${punchResult.distanceMeters}m away (Inside gym)`
                      : 'Verified'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => startScanner()}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Loading Punch Verification */}
          {loadingPunch && !punchResult && (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-white">
                Verifying Geofence &amp; Punching...
              </h4>
              <p className="text-xs text-zinc-400 font-mono">{locationStatus}</p>
            </div>
          )}

          {/* Live Video Viewfinder */}
          {!punchResult && !loadingPunch && (
            <div className="space-y-3">
              <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden border border-zinc-700/80 flex items-center justify-center">
                {/* HTML5 QR Code Mount Element */}
                <div id={scannerContainerId} className="w-full h-full" />

                {/* Target Reticle Overlay */}
                {scanning && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-56 h-56 border-2 border-amber-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-amber-400" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-amber-400" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-amber-400" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-amber-400" />
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions / Error info */}
              {errorMsg ? (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 flex items-start gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{errorMsg}</p>
                    <button
                      onClick={() => startScanner()}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 underline cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry Scanner</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-400 text-center font-mono">
                  Point your camera at the MuscleGreed Attendance QR code. Device GPS will verify your gym premises location.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
