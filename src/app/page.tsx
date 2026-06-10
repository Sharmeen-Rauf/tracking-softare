'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEmployees } from '@/app/actions';
import ContentPlanner from '@/components/ContentPlanner';
import { 
  ShieldAlert, 
  Users, 
  Layers, 
  TrendingUp, 
  Instagram, 
  Youtube, 
  Facebook, 
  Video,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portal' | 'planner'>('portal');

  useEffect(() => {
    async function loadData() {
      const data = await getEmployees();
      setEmployees(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-955 text-slate-100 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header logo & Tab Switcher */}
      <header className="max-w-6xl mx-auto w-full z-10 flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-lg">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>Antigravity Posting Hub</span>
        </div>
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button 
            type="button"
            onClick={() => setActiveTab('portal')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${activeTab === 'portal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Access Portal
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('planner')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${activeTab === 'planner' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Content Planner
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto w-full my-12 z-10">
        {activeTab === 'portal' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Col: Explanations */}
            <div className="lg:col-span-6 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                Social Posting <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Target Auditor
                </span>
              </h1>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-lg">
                Track daily social media links across Instagram, YouTube, TikTok, and Facebook. Keep your posting agents aligned with visual goals, real-time uniqueness validation, and anti-glitch protection.
              </p>

              {/* Posting Math breakdown box */}
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3.5 max-w-md">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Mechanics</span>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xl font-bold text-indigo-400">60</span>
                    <span className="text-[10px] text-slate-500 block">Links / Account</span>
                  </div>
                  <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xl font-bold text-indigo-400">180</span>
                    <span className="text-[10px] text-slate-500 block">Links / Employee</span>
                  </div>
                  <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xl font-bold text-indigo-400">900</span>
                    <span className="text-[10px] text-slate-500 block">System Total / Day</span>
                  </div>
                </div>
                
                {/* Platforms row */}
                <div className="flex items-center justify-around pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1"><Instagram className="w-3.5 h-3.5 text-pink-500" /> 15 Insta</span>
                  <span className="flex items-center gap-1"><Youtube className="w-3.5 h-3.5 text-red-500" /> 15 YT</span>
                  <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5 text-slate-300" /> 15 TikTok</span>
                  <span className="flex items-center gap-1"><Facebook className="w-3.5 h-3.5 text-blue-500" /> 15 FB</span>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Entry Panel */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-800/40 border border-slate-700/50 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Select Access Node</h2>
                  <p className="text-xs text-slate-400 mt-1">Jump to the admin dashboard or pick an employee token to submit logs.</p>
                </div>

                <div className="space-y-4">
                  {/* Admin Access Button */}
                  <Link 
                    href="/admin" 
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-700/10 hover:shadow-emerald-700/25 active:scale-[0.99] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 p-2 rounded-xl">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm block">Boss Dashboard (Admin)</span>
                        <span className="text-[10px] text-emerald-200 block font-normal">Audit daily team quotas & search submissions</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-750"></div>
                    <span className="flex-shrink mx-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Or Login As Employee</span>
                    <div className="flex-grow border-t border-slate-750"></div>
                  </div>

                  {/* Employee list dropdown simulator */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {isLoading ? (
                      <div className="col-span-2 text-center text-xs text-slate-500 py-6 animate-pulse">
                        Connecting to Supabase...
                      </div>
                    ) : employees.length === 0 ? (
                      <div className="col-span-2 text-center text-xs text-slate-500 border border-dashed border-slate-800 py-6 rounded-2xl">
                        No employees in database.<br />Click the Boss Dashboard button to add them.
                      </div>
                    ) : (
                      employees.map((emp) => (
                        <Link 
                          key={emp.id}
                          href={`/employee?id=${emp.id}`}
                          className="p-3 bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-slate-300 hover:text-white transition-all group text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-400" />
                            <span className="font-semibold">{emp.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <ContentPlanner />
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs text-slate-500 pt-6 border-t border-slate-900 z-10">
        <span>&copy; 2026 Antigravity Social Poster Inc. All rights reserved. Vercel-ready structure.</span>
      </footer>

    </main>
  );
}

// Helper chevron icon
function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
