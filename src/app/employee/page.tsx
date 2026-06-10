'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EmployeeForm from '@/components/EmployeeForm';
import { ArrowLeft, UserCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getEmployeePortalData } from '@/app/actions';

function EmployeePortalContent() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('id');

  const [employee, setEmployee] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) {
      setIsLoading(false);
      return;
    }

    async function loadPortalData() {
      try {
        const data = await getEmployeePortalData(employeeId as string);
        if (data) {
          setEmployee(data.employee);
          setSubmissions(data.submissions);
        }
      } catch (error) {
        console.error('Failed to load employee portal data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPortalData();
  }, [employeeId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <span className="text-sm font-semibold">Resolving employee credentials...</span>
      </div>
    );
  }

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
        initialSubmissions={submissions}
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

