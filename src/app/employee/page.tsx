'use client';

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EmployeeForm from '@/components/EmployeeForm';
import { ArrowLeft, UserCheck } from 'lucide-react';
import Link from 'next/link';

// Mock database registry for client accounts and users
const EMPLOYEE_REGISTRY = {
  'emp-1': {
    name: 'Alice Carter',
    accounts: [
      { id: 'acc-1a', name: 'AeroMax Aviation' },
      { id: 'acc-1b', name: 'Bella Fashions' },
      { id: 'acc-1c', name: 'CyberNetic Solutions' }
    ]
  },
  'emp-2': {
    name: 'Bob Sterling',
    accounts: [
      { id: 'acc-2a', name: 'Dexter Logistics' },
      { id: 'acc-2b', name: 'Echo Solar Energy' },
      { id: 'acc-2c', name: 'Fusion Bakeries' }
    ]
  },
  'emp-3': {
    name: 'Charlie Vance',
    accounts: [
      { id: 'acc-3a', name: 'Genesis BioTech' },
      { id: 'acc-3b', name: 'Horizon Travels' },
      { id: 'acc-3c', name: 'Apex Real Estate' }
    ]
  },
  'emp-4': {
    name: 'Diana Prince',
    accounts: [
      { id: 'acc-4a', name: 'Javalin Software' },
      { id: 'acc-4b', name: 'Krypton Minerals' },
      { id: 'acc-4c', name: 'Lunar Coffee Co.' }
    ]
  },
  'emp-5': {
    name: 'Ethan Hunt',
    accounts: [
      { id: 'acc-5a', name: 'Mission Logistics' },
      { id: 'acc-5b', name: 'Nova Marketing' },
      { id: 'acc-5c', name: 'Omega Watchmakers' }
    ]
  }
} as const;

function EmployeePortalContent() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('id');

  const employee = useMemo(() => {
    if (!employeeId || !(employeeId in EMPLOYEE_REGISTRY)) {
      return null;
    }
    return EMPLOYEE_REGISTRY[employeeId as keyof typeof EMPLOYEE_REGISTRY];
  }, [employeeId]);

  if (!employee || !employeeId) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="bg-slate-800/40 border border-slate-700/60 p-8 rounded-3xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <ArrowLeft className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Invalid Session Node</h2>
            <p className="text-sm text-slate-400 mt-2">Could not resolve a valid employee token. Please sign in via the simulation portal.</p>
          </div>
          <Link 
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-950 text-slate-300 font-bold py-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  // Create initial mock submissions to demonstrate progress rings on load
  const mockSubmissions = [
    {
      id: 'mock-1',
      url: 'https://www.youtube.com/watch?v=mockLink1',
      platform: 'YOUTUBE' as const,
      clientAccountId: employee.accounts[0].id,
      createdAt: new Date()
    },
    {
      id: 'mock-2',
      url: 'https://www.instagram.com/p/mockLink2',
      platform: 'INSTAGRAM' as const,
      clientAccountId: employee.accounts[0].id,
      createdAt: new Date()
    },
    {
      id: 'mock-3',
      url: 'https://www.tiktok.com/@user/video/mockLink3',
      platform: 'TIKTOK' as const,
      clientAccountId: employee.accounts[1].id,
      createdAt: new Date()
    },
    {
      id: 'mock-4',
      url: 'https://www.facebook.com/watch?v=mockLink4',
      platform: 'FACEBOOK' as const,
      clientAccountId: employee.accounts[2].id,
      createdAt: new Date()
    }
  ];

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
          <UserCheck className="w-3.5 h-3.5" />
          <span>Validated Employee Node</span>
        </div>
      </div>
      <EmployeeForm
        employeeName={employee.name}
        employeeId={employeeId}
        clientAccounts={employee.accounts as unknown as { id: string; name: string }[]}
        initialSubmissions={mockSubmissions}
      />
    </div>
  );
}

export default function EmployeePage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <span className="text-sm font-semibold">Resolving employee credentials...</span>
          </div>
        </div>
      }
    >
      <EmployeePortalContent />
    </Suspense>
  );
}
