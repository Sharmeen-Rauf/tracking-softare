'use client';

import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div>
      <div className="bg-slate-950 border-b border-slate-800 py-3 px-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Simulation Portal
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-1 rounded-full">
          <Shield className="w-3.5 h-3.5" />
          <span>Secured Admin Node</span>
        </div>
      </div>
      <AdminDashboard />
    </div>
  );
}

