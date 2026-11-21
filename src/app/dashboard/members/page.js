'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Search,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Phone,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  CheckCircle2,
  Ban,
  Layers,
} from 'lucide-react';

export default function MembersPage() {
  const { admin } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  const [copiedId, setCopiedId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (admin) {
      fetchMembers();
    }
  }, [admin]);

  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/members', {
        params: { search: searchTerm },
      });
      if (res.data?.success) {
        setMembers(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Could not load members from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleToggleBan = async (member) => {
    const isCurrentlyBanned = member.status === 'banned';
    const newStatus = isCurrentlyBanned ? 'active' : 'banned';
    let reason = '';
    if (!isCurrentlyBanned) {
      reason = window.prompt('Enter reason for suspending this member (optional):', 'Administrative review');
      if (reason === null) return; // User canceled
    }

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/members/${member.id}/status`, {
        status: newStatus,
        ban_reason: reason,
      });
      if (res.data?.success) {
        fetchMembers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update member status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateMembershipStatus = async (membershipId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/admin/memberships/${membershipId}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        fetchMembers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update membership pass status.');
    } finally {
      setActionLoading(false);
    }
  };

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'active').length;
  const bannedMembers = members.filter((m) => m.status === 'banned').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Member Directory &amp; Passes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Gym Members
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage athlete accounts and their associated Membership IDs. Each member can hold multiple passes.
          </p>
        </div>

        <button
          onClick={fetchMembers}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-200 bg-zinc-900 border border-zinc-800 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            REGISTERED MEMBERS
          </span>
          <span className="text-2xl font-black font-mono text-white">{totalMembers}</span>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
            ACTIVE ACCOUNTS
          </span>
          <span className="text-2xl font-black font-mono text-emerald-400">{activeMembers}</span>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block mb-1">
            SUSPENDED / BANNED
          </span>
          <span className="text-2xl font-black font-mono text-red-400">{bannedMembers}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by athlete name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </form>
      </div>

      {/* Members Table */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/90 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th scope="col" className="px-6 py-3.5 font-semibold">Member</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Phone Number</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Passes Held</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Joined Date</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Account Status</th>
                <th scope="col" className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No members registered in the database yet.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const isExpanded = expandedMemberId === member.id;
                  const passesCount = (member.memberships || []).length;
                  const isBanned = member.status === 'banned';

                  return (
                    <React.Fragment key={member.id}>
                      <tr className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-amber-400">
                              {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{member.name}</div>
                              <div className="text-[10px] text-zinc-500">ID #{member.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono text-zinc-300">
                          {member.phone}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 text-zinc-200 transition-colors cursor-pointer"
                          >
                            <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                            <span>{passesCount} {passesCount === 1 ? 'Pass' : 'Passes'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                            )}
                          </button>
                        </td>

                        <td className="px-6 py-4 text-zinc-400">{member.joined_date}</td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                              isBanned
                                ? 'bg-red-950/70 border border-red-500/40 text-red-400'
                                : 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400'
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleBan(member)}
                            disabled={actionLoading}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              isBanned
                                ? 'bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900'
                                : 'bg-red-950/60 border border-red-800/60 text-red-300 hover:bg-red-900/60'
                            }`}
                          >
                            {isBanned ? 'Unban Account' : 'Suspend / Ban'}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded View: All Membership IDs for this User */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-zinc-950/80 px-6 py-4 border-b border-zinc-800">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-zinc-800/80">
                                <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5" />
                                  <span>MEMBERSHIPS HELD BY {member.name.toUpperCase()}</span>
                                </span>
                                <span>Multiple Membership IDs under 1 account</span>
                              </div>

                              {member.memberships && member.memberships.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {member.memberships.map((m) => (
                                    <div
                                      key={m.membership_id}
                                      className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 font-mono">
                                          <span className="text-zinc-500 uppercase text-[10px]">ID:</span>
                                          <span className="font-black text-amber-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                                            {m.membership_id}
                                          </span>
                                          <button
                                            onClick={() => handleCopy(m.membership_id)}
                                            className="text-zinc-400 hover:text-white p-0.5"
                                            title="Copy ID"
                                          >
                                            {copiedId === m.membership_id ? (
                                              <Check className="w-3 h-3 text-emerald-400" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </button>
                                        </div>

                                        <span
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                                            m.status === 'active'
                                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                                              : m.status === 'paused'
                                              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                                              : 'bg-zinc-800 text-zinc-400'
                                          }`}
                                        >
                                          {m.status}
                                        </span>
                                      </div>

                                      <div className="font-semibold text-white">
                                        {m.plan_title}{' '}
                                        <span className="text-zinc-500 font-normal">
                                          ({m.service_title})
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                                        <span>
                                          Duration: {m.start_date || 'N/A'} &rarr; {m.end_date || 'N/A'}
                                        </span>
                                        <span className="text-emerald-400 font-bold">{m.price}</span>
                                      </div>

                                      {/* Upcoming Extensions if present */}
                                      {m.upcoming_passes && m.upcoming_passes.length > 0 && (
                                        <div className="p-2 rounded-lg bg-black/60 border border-amber-500/30 space-y-1 font-mono text-[11px]">
                                          <div className="text-amber-400 font-bold uppercase text-[10px] flex items-center justify-between">
                                            <span>Upcoming ({m.upcoming_passes.length})</span>
                                            {m.final_expiry_date && (
                                              <span className="text-zinc-500 text-[9px]">
                                                Thru: {m.final_expiry_date}
                                              </span>
                                            )}
                                          </div>
                                          {m.upcoming_passes.map((up, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-zinc-300 text-[10px]">
                                              <span>{up.planTitle} ({up.intervalType})</span>
                                              <span className="text-amber-400/80">{up.startDate} &rarr; {up.endDate}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Manual Status Override */}
                                      <div className="flex items-center gap-2 pt-1.5 border-t border-zinc-800/40">
                                        <span className="text-[10px] text-zinc-500 uppercase">Override:</span>
                                        {m.status !== 'active' && (
                                          <button
                                            onClick={() => handleUpdateMembershipStatus(m.membership_id, 'active')}
                                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800"
                                          >
                                            Activate
                                          </button>
                                        )}
                                        {m.status !== 'paused' && (
                                          <button
                                            onClick={() => handleUpdateMembershipStatus(m.membership_id, 'paused')}
                                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 hover:bg-amber-900 border border-amber-800"
                                          >
                                            Pause
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-zinc-500 italic py-2">
                                  No active or past membership IDs registered under this member yet.
                                </p>
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
    </div>
  );
}
