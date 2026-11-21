'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  LayoutTemplate,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  ExternalLink,
  CreditCard,
  QrCode,
  UserCog,
  Camera,
} from 'lucide-react';
import CameraScannerModal from '@/components/attendance/CameraScannerModal';

export default function Sidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  const role = (admin?.role || 'admin').toLowerCase();

  let navItems = [];
  if (role === 'receptionist') {
    // Requirements: "for the receptionist give the options to MEMBERS, SUBSCRIPTIONS, DASHBOARD, QR SETTINGS."
    navItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Subscriptions',
        href: '/dashboard/subscriptions',
        icon: CreditCard,
      },
      {
        name: 'Members',
        href: '/dashboard/members',
        icon: Users,
      },
      {
        name: 'QR Settings & Attendance',
        href: '/dashboard/attendance',
        icon: QrCode,
      },
    ];
  } else if (role === 'trainer') {
    navItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Attendance & Scanner',
        href: '/dashboard/attendance',
        icon: QrCode,
      },
    ];
  } else {
    // Superadmin / Admin
    navItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Homepage Customise',
        href: '/dashboard/homepage',
        icon: LayoutTemplate,
      },
      {
        name: 'Services',
        href: '/dashboard/services',
        icon: Dumbbell,
      },
      {
        name: 'Subscriptions',
        href: '/dashboard/subscriptions',
        icon: CreditCard,
      },
      {
        name: 'Members',
        href: '/dashboard/members',
        icon: Users,
      },
      {
        name: 'Staff & Roles',
        href: '/dashboard/staff',
        icon: UserCog,
      },
      {
        name: 'Attendance & QR Settings',
        href: '/dashboard/attendance',
        icon: QrCode,
      },
    ];
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800 text-zinc-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight flex items-center gap-1">
              MUSCLE<span className="text-amber-400">GREED</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500/90 block">
              Control Panel
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Main Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-amber-400" />}
            </Link>
          );
        })}

        <div className="pt-4 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Live Sites
        </div>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-colors"
        >
          <span>View Gym Homepage</span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
        </a>
      </nav>

      {/* Admin Profile & Logout Footer */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center gap-3 px-2 py-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 font-semibold text-xs">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{admin?.name || 'Administrator'}</p>
            <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="capitalize">{admin?.role || 'admin'}</span>
            </p>
          </div>
        </div>

        {/* Quick Camera Punch Button */}
        <button
          onClick={() => {
            setMobileOpen(false);
            setCameraModalOpen(true);
          }}
          className="w-full mb-2.5 flex items-center justify-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Camera Scanner</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl border border-red-900/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Camera Scanner Modal mounted globally across sidebar */}
      <CameraScannerModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
      />
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-16 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 font-bold">
            <Dumbbell className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-sm">
            MUSCLE<span className="text-amber-400">GREED</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-64 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
