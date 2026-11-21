'use client';

import React from 'react';
import { Dumbbell, MapPin, ShieldCheck, QrCode, Clock, Printer, X } from 'lucide-react';

export default function PrintableA4Poster({ qrSettings, isOpen, onClose }) {
  if (!isOpen || !qrSettings) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Outer wrapper: Hidden on print so only the #printable-a4-sheet is printed */}
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 my-8 print:p-0 print:border-none print:shadow-none print:bg-white print:m-0">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wide">
                A4 Official Attendance Scanner Poster
              </h2>
              <p className="text-xs text-zinc-400">
                Formatted specifically for standard A4 paper (210mm &times; 297mm)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Poster</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= A4 PRINTABLE CANVAS ================= */}
        {/* Designed to match standard A4 (aspect 1 : 1.414). In print media, size is set to A4 portrait */}
        <div
          id="printable-a4-sheet"
          className="mx-auto bg-white text-zinc-950 p-10 sm:p-14 rounded-xl border border-zinc-300 shadow-xl print:shadow-none print:border-none print:p-8 print:w-full print:h-screen print:rounded-none flex flex-col justify-between"
          style={{ minHeight: '840px', maxWidth: '700px' }}
        >
          {/* Header */}
          <div className="text-center space-y-3 pb-6 border-b-4 border-zinc-950">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-black text-amber-400 flex items-center justify-center shadow-md">
                <Dumbbell className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-black">
                  MUSCLE<span className="text-amber-500">GREED</span>
                </h1>
                <span className="text-xs font-bold tracking-widest text-zinc-600 uppercase block mt-0.5">
                  ELITE GYM &bull; ATHLETIC CLUB
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-block px-4 py-1.5 rounded-full bg-zinc-950 text-white font-mono font-black text-sm uppercase tracking-wider">
                STAFF ATTENDANCE PUNCH POINT
              </span>
              <p className="text-xs text-zinc-600 font-medium mt-1">
                Trainers &amp; Receptionists &bull; Check-IN / Check-OUT
              </p>
            </div>
          </div>

          {/* QR Code Center Stage */}
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-white border-4 border-zinc-950 rounded-2xl shadow-xl inline-block">
              {qrSettings.qrImageData ? (
                <img
                  src={qrSettings.qrImageData}
                  alt="Attendance QR Code"
                  className="w-64 h-64 sm:w-72 sm:h-72 object-contain mx-auto"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-zinc-100 text-zinc-400 font-mono text-xs">
                  Loading QR...
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-black uppercase tracking-wide text-zinc-900">
                POINT CAMERA OR STAFF SCANNER TO PUNCH
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-md text-[11px] font-mono text-zinc-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Security Token: {qrSettings.qrToken}</span>
              </div>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-xs">
            <div className="space-y-1">
              <div className="font-bold uppercase text-[11px] text-zinc-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Open Scanner</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-snug">
                Scan using any mobile camera or the <strong>Camera Scanner</strong> button inside your staff portal.
              </p>
            </div>

            <div className="space-y-1">
              <div className="font-bold uppercase text-[11px] text-zinc-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Staff Login</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-snug">
                Log in with your Trainer or Receptionist credentials if you are not already logged in.
              </p>
            </div>

            <div className="space-y-1">
              <div className="font-bold uppercase text-[11px] text-zinc-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Geofence GPS</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-snug">
                Allow device location. Punches are only accepted while inside the gym geofenced premises.
              </p>
            </div>

            <div className="space-y-1">
              <div className="font-bold uppercase text-[11px] text-zinc-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                <span>Multiple In / Out</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-snug">
                First scan punches IN, next scan punches OUT. Your daily worked hours accumulate automatically.
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t-2 border-zinc-200 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-zinc-700" />
              <span>Location: {qrSettings.locationName || 'MuscleGreed Main Facility'} (Radius: {qrSettings.geofenceRadiusMeters}m)</span>
            </div>
            <span>Official MuscleGreed Document &bull; Print Standard A4</span>
          </div>
        </div>
      </div>

      {/* Global CSS for Print Mode */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-a4-sheet,
          #printable-a4-sheet * {
            visibility: visible;
          }
          #printable-a4-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 2.5cm;
            border: none !important;
            box-shadow: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
