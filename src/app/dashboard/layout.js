'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  const { admin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.replace('/login');
    }
  }, [admin, loading, router]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative">
      <Sidebar />
      <div className="md:pl-64 pt-16 md:pt-0 min-h-screen flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>

      {/* Auth verification overlay if still verifying */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-zinc-500 font-medium">Verifying session...</span>
          </div>
        </div>
      )}
    </div>
  );
}
