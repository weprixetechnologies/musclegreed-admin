'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Mail,
  Lock,
  Phone,
  Shield,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Search,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function StaffManagementPage() {
  const { admin } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('trainer');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/staff');
      if (res.data?.success) {
        setStaffList(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchStaff();
    }
  }, [admin]);

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('trainer');
    setFormPhone('');
    setFormStatus('active');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setFormName(staff.name || '');
    setFormEmail(staff.email || '');
    setFormPassword('');
    setFormRole(staff.role || 'trainer');
    setFormPhone(staff.phone || '');
    setFormStatus(staff.status || 'active');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formEmail.trim() || !formRole) {
      setFormError('Name, email, and role are required.');
      return;
    }

    if (!editingStaff && (!formPassword || formPassword.length < 6)) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingStaff) {
        const payload = {
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          phone: formPhone.trim(),
          status: formStatus,
        };
        if (formPassword && formPassword.trim().length >= 6) {
          payload.password = formPassword.trim();
        }
        await api.put(`/admin/staff/${editingStaff.id}`, payload);
      } else {
        await api.post('/admin/staff', {
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword.trim(),
          role: formRole,
          phone: formPhone.trim(),
        });
      }

      setModalOpen(false);
      await fetchStaff();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staff) => {
    if (staff.id === admin?.id) {
      alert('You cannot delete your own account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to remove staff member "${staff.name}" (${staff.role})?`)) {
      return;
    }

    try {
      await api.delete(`/admin/staff/${staff.id}`);
      await fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete staff member.');
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.phone || '').includes(search);
    const matchesRole = roleFilter === 'ALL' || s.role?.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                STAFF &amp; ROLES MANAGEMENT
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-amber-950 text-amber-400 border border-amber-500/30">
                {staffList.length} STAFF
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Manage gym trainers, receptionists, and administrative access credentials
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by staff name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none shrink-0"
          >
            <option value="ALL">All Roles</option>
            <option value="TRAINER">Trainers</option>
            <option value="RECEPTIONIST">Receptionists</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        <button
          onClick={fetchStaff}
          disabled={loading}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 p-1 self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
            <tr>
              <th className="px-6 py-4">Staff Member</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Phone Number</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  Loading staff roster...
                </td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  No staff members found matching criteria.
                </td>
              </tr>
            ) : (
              filteredStaff.map((staff) => {
                const isSuper = staff.role === 'superadmin';
                const isTrainer = staff.role === 'trainer';
                const isReceptionist = staff.role === 'receptionist';

                return (
                  <tr key={staff.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-amber-400">
                          {staff.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="font-sans font-bold text-white text-xs">{staff.name}</div>
                          <div className="text-[10px] text-zinc-500">{staff.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          isSuper
                            ? 'bg-purple-950 text-purple-400 border border-purple-500/40'
                            : isTrainer
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : isReceptionist
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                            : 'bg-blue-950 text-blue-400 border border-blue-500/40'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        <span>{staff.role}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-zinc-300">{staff.phone || 'N/A'}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          staff.status === 'active'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {staff.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-zinc-400">{staff.joined_date || 'N/A'}</td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(staff)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit Staff Member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {staff.id !== admin?.id && (
                          <button
                            onClick={() => handleDeleteStaff(staff)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-950 text-red-400 hover:text-red-300 transition-colors border border-red-500/20 cursor-pointer"
                            title="Delete Staff Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Staff Modal (Create / Edit) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <UserCog className="w-4 h-4 text-amber-400" />
                <span>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Marcus Blade"
                  className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. trainer@musclegreed.com"
                  className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Role Assignment
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="trainer">TRAINER (Floor / Coach / Attendance)</option>
                  <option value="receptionist">RECEPTIONIST (Members, Subs, QR, Attendance)</option>
                  <option value="admin">ADMIN (Full Operations Management)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Password {editingStaff && '(Leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={editingStaff ? '••••••••' : 'Min. 6 characters'}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  {...(!editingStaff ? { required: true } : {})}
                />
              </div>

              {editingStaff && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Account Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingStaff ? 'Update Staff' : 'Create Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
