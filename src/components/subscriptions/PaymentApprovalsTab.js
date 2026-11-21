'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RotateCcw,
  ExternalLink,
  AlertCircle,
  Copy,
  Check,
  User,
  CreditCard,
  X,
} from 'lucide-react';

export default function PaymentApprovalsTab() {
  const { admin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Selected Order for Review Modal
  const [reviewOrder, setReviewOrder] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [copiedUtr, setCopiedUtr] = useState(false);

  useEffect(() => {
    if (admin) {
      fetchOrders();
    }
  }, [admin, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/subscription-orders', {
        params: {
          status: statusFilter,
          search: searchTerm,
        },
      });
      if (res.data?.success) {
        setOrders(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Could not load subscription orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleOpenReview = (order) => {
    setReviewOrder(order);
    setRemarks(order.admin_remarks || '');
    setActionError('');
  };

  const handleReviewAction = async (action) => {
    if (!reviewOrder) return;

    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.put(`/admin/subscription-orders/${reviewOrder.order_id}/review`, {
        action,
        remarks: remarks.trim() || undefined,
      });

      if (res.data?.success) {
        setReviewOrder(null);
        fetchOrders();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to ${action} order.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Payment Proof &amp; Subscription Approvals</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                {pendingCount} Pending
              </span>
            )}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Review uploaded payment receipts, verify UTR / UPI transaction numbers, and activate or extend gym membership passes.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="p-1 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-1 overflow-x-auto">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order ID, Membership ID, Phone, UTR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/90 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Order / Member ID</th>
                <th className="px-5 py-3.5 font-semibold">Athlete</th>
                <th className="px-5 py-3.5 font-semibold">Pass / Discipline</th>
                <th className="px-5 py-3.5 font-semibold">Type</th>
                <th className="px-5 py-3.5 font-semibold">Amount</th>
                <th className="px-5 py-3.5 font-semibold">UTR Reference</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-zinc-500">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-zinc-500">
                    No subscription orders found matching filter.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.order_id} className="hover:bg-zinc-800/30 transition-colors">
                    {/* Order ID & Membership ID */}
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-amber-400">{o.order_id}</div>
                      <div className="font-mono text-[10px] text-zinc-400">
                        Mem ID: <span className="text-white font-semibold">{o.membership_id}</span>
                      </div>
                    </td>

                    {/* Athlete Name & Phone */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white">{o.member_name}</div>
                      <div className="text-[11px] font-mono text-zinc-400">{o.member_phone}</div>
                    </td>

                    {/* Pass Tier */}
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-white">{o.plan_title}</div>
                      <div className="text-[10px] text-zinc-500">{o.service_title}</div>
                    </td>

                    {/* Type badge */}
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">
                        {o.type.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">
                      {o.amount}
                    </td>

                    {/* UTR */}
                    <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-300">
                      {o.utr_number}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          o.status === 'approved'
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40'
                            : o.status === 'pending'
                            ? 'bg-amber-950/70 text-amber-400 border border-amber-500/40 animate-pulse'
                            : 'bg-red-950/70 text-red-400 border border-red-500/40'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-zinc-400 text-[11px]">
                      {o.created_at}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenReview(o)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          o.status === 'pending'
                            ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{o.status === 'pending' ? 'Review & Verify' : 'View Details'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= REVIEW ORDER MODAL ================= */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4 py-8 sm:py-12">
            <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-200 my-auto">
              {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Review Payment Proof</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-400">
                    {reviewOrder.order_id}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verify the transaction screenshot against the member&apos;s UTR number before approving.
                </p>
              </div>
              <button
                onClick={() => setReviewOrder(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="my-3 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-300">
                {actionError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-5">
              {/* Left Column: Screenshot Proof */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                  Uploaded Payment Screenshot
                </span>
                <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group">
                  {reviewOrder.screenshot_url ? (
                    <>
                      <img
                        src={reviewOrder.screenshot_url}
                        alt="Payment Proof"
                        className="w-full max-h-[300px] object-contain rounded-lg"
                      />
                      <a
                        href={reviewOrder.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-semibold transition-opacity"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open Full Size Image</span>
                      </a>
                    </>
                  ) : (
                    <div className="p-8 text-center text-zinc-500 text-xs">
                      No screenshot image available
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Details */}
              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 uppercase">ATHLETE</span>
                    <span className="font-bold text-white">{reviewOrder.member_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 uppercase">PHONE</span>
                    <span className="font-mono text-white">{reviewOrder.member_phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 uppercase">MEMBERSHIP ID</span>
                    <span className="font-mono font-bold text-amber-400">{reviewOrder.membership_id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 uppercase">PASS TIER</span>
                    <span className="text-white font-medium">{reviewOrder.plan_title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 uppercase">DISCIPLINE</span>
                    <span className="text-zinc-300">{reviewOrder.service_title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 uppercase">ORDER TYPE</span>
                    <span className="font-mono uppercase font-bold text-zinc-200">
                      {reviewOrder.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                    <span className="text-zinc-500 uppercase">PAYABLE AMOUNT</span>
                    <span className="font-mono text-base font-black text-emerald-400">
                      {reviewOrder.amount}
                    </span>
                  </div>
                </div>

                {/* UTR Verification Box */}
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                  <div className="text-[10px] uppercase font-bold text-amber-400 mb-1">
                    SUBMITTED UTR NUMBER
                  </div>
                  <div className="flex items-center justify-between font-mono text-sm text-white font-bold">
                    <span>{reviewOrder.utr_number}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(reviewOrder.utr_number)}
                      className="text-zinc-400 hover:text-white p-1"
                      title="Copy UTR"
                    >
                      {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Admin Remarks Input */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
                    Admin Remarks (Optional for approval / Reason if rejecting)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. UTR verified against bank statement. / Invalid UTR reference."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800 gap-3">
              <button
                type="button"
                onClick={() => setReviewOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleReviewAction('reject')}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold uppercase transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Decline / Reject</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewAction('approve')}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-zinc-950 text-xs font-bold uppercase transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve &amp; Activate Pass</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
