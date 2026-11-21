'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import CameraScannerModal from '@/components/attendance/CameraScannerModal';
import {
  Users,
  Activity,
  IndianRupee,
  UserCheck,
  TrendingUp,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Camera,
  QrCode,
  Shield,
} from 'lucide-react';

const stats = [
  {
    name: 'Total Members',
    value: '248',
    change: '+14% this month',
    trend: 'up',
    icon: Users,
    color: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30',
  },
  {
    name: 'Active Subscriptions',
    value: '186',
    change: '75% retention rate',
    trend: 'up',
    icon: Activity,
    color: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
  },
  {
    name: 'Monthly Revenue',
    value: '₹1,48,500',
    change: '+8.2% vs last month',
    trend: 'up',
    icon: IndianRupee,
    color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
  },
  {
    name: "Today's Check-ins",
    value: '42',
    change: 'Peak afternoon hour',
    trend: 'up',
    icon: UserCheck,
    color: 'from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/30',
  },
];

const recentActivity = [
  {
    id: 1,
    member: 'Rahul Sharma',
    action: 'Renewed Annual Gold Plan',
    time: '15 mins ago',
    status: 'Completed',
  },
  {
    id: 2,
    member: 'Vikram Mehta',
    action: 'Checked into Heavy Weights Area',
    time: '42 mins ago',
    status: 'Active',
  },
  {
    id: 3,
    member: 'Ananya Roy',
    action: 'New Registration (Quarterly)',
    time: '2 hours ago',
    status: 'Completed',
  },
  {
    id: 4,
    member: 'Karan Patel',
    action: 'Personal Training Session with Coach Sam',
    time: '3 hours ago',
    status: 'Completed',
  },
];

export default function DashboardPage() {
  const { admin } = useAuth();
  const [myAttendance, setMyAttendance] = useState(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState('');

  const fetchMyAttendance = async () => {
    try {
      const res = await api.get('/attendance/my-status');
      if (res.data?.success) {
        setMyAttendance(res.data.data);
      }
    } catch (e) {
      console.warn('Could not fetch personal attendance:', e);
    }
  };

  useEffect(() => {
    setCurrentDateStr(
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    );
  }, []);

  useEffect(() => {
    if (admin) {
      fetchMyAttendance();
    }
  }, [admin]);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MuscleGreed Operations</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {admin?.name || 'Admin'}
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {admin?.role || 'staff'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Here is a snapshot of gym performance, member check-ins, and your attendance.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>{currentDateStr || 'Today'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">System Live</span>
          </div>
        </div>
      </div>

      {/* Staff Attendance Status Banner */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${
              myAttendance?.isCurrentlyIn
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                YOUR STATUS TODAY:
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                  myAttendance?.isCurrentlyIn
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {myAttendance?.status || 'NOT PUNCHED'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Accumulated Work Hours Today:{' '}
              <strong className="text-amber-400">{myAttendance?.totalWorkingHoursToday || '0 hrs 0 mins'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setCameraModalOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Clock In / Out (Camera)</span>
          </button>
          <Link
            href="/dashboard/attendance"
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-colors border border-zinc-700"
          >
            Attendance Scanner
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/80 transition-all hover:shadow-lg hover:shadow-black/40 group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-zinc-400">{stat.name}</span>
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center bg-gradient-to-br ${stat.color} group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {stat.value}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Sections: Activity & Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Live Gym Activity</h2>
              <p className="text-xs text-zinc-400">Recent check-ins and membership transactions</p>
            </div>
            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              Real-time
            </span>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300 shrink-0">
                    {activity.member.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{activity.member}</p>
                    <p className="text-xs text-zinc-400 truncate">{activity.action}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>{activity.time}</span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{activity.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick System & Security Info */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Session Security</h2>
            <p className="text-xs text-zinc-400 mb-5">Current authentication and session status</p>

            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5">
                <div className="flex justify-between text-zinc-400">
                  <span>Logged in as</span>
                  <span className="font-semibold text-white">{admin?.email}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Role Access</span>
                  <span className="font-semibold uppercase tracking-wider text-amber-400">
                    {admin?.role}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Token Strategy</span>
                  <span className="text-emerald-400 font-medium">JWT In-Memory + HttpOnly Cookie</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-2">
                <p className="text-zinc-400 leading-relaxed">
                  Tokens auto-refresh smoothly in the background when making API requests. Refresh token rotation is active in MySQL.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <span className="text-[11px] text-zinc-500">
              MuscleGreed Gym Admin v1.0.0
            </span>
          </div>
        </div>
      </div>

      <CameraScannerModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onPunchSuccess={() => fetchMyAttendance()}
      />
    </div>
  );
}
