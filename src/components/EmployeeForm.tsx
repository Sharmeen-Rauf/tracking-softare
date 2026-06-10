'use client';

import React, { useState, useMemo } from 'react';
import { 
  Instagram, 
  Youtube, 
  Facebook, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Sparkles, 
  Layers, 
  PlusCircle, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';

interface ClientAccount {
  id: string;
  name: string;
}

interface Submission {
  id: string;
  url: string;
  platform: 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK' | 'FACEBOOK';
  clientAccountId: string;
  createdAt: Date;
}

interface EmployeeFormProps {
  employeeName: string;
  employeeId: string;
  clientAccounts: ClientAccount[];
  initialSubmissions?: Submission[];
}

export default function EmployeeForm({
  employeeName,
  employeeId,
  clientAccounts,
  initialSubmissions = []
}: EmployeeFormProps) {
  // Submission Form State
  const [selectedClient, setSelectedClient] = useState<string>(clientAccounts[0]?.id || '');
  const [selectedPlatform, setSelectedPlatform] = useState<'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK' | 'FACEBOOK'>('INSTAGRAM');
  const [url, setUrl] = useState<string>('');
  
  // Interaction & UI Feedback States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Submissions Log state for live preview
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);

  // Platform definitions
  const platforms = [
    { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram, color: 'from-pink-500 via-red-500 to-yellow-500', bgActive: 'bg-gradient-to-tr text-white shadow-pink-500/20 shadow-lg', textTheme: 'text-pink-500', domain: 'instagram.com' },
    { id: 'YOUTUBE', name: 'YouTube', icon: Youtube, color: 'from-red-600 to-red-700', bgActive: 'bg-red-600 text-white shadow-red-600/20 shadow-lg', textTheme: 'text-red-600', domain: 'youtube.com' },
    { id: 'TIKTOK', name: 'TikTok', icon: Video, color: 'from-slate-950 to-slate-900', bgActive: 'bg-slate-950 text-white shadow-slate-950/20 shadow-lg border border-cyan-400', textTheme: 'text-slate-900', domain: 'tiktok.com' },
    { id: 'FACEBOOK', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-700', bgActive: 'bg-blue-600 text-white shadow-blue-600/20 shadow-lg', textTheme: 'text-blue-600', domain: 'facebook.com' },
  ] as const;

  // Math & Limit Calculations (Targets: 15 per platform per account, 60 per account, 180 total)
  const stats = useMemo(() => {
    const countsByAccount: Record<string, Record<string, number>> = {};
    clientAccounts.forEach(c => {
      countsByAccount[c.id] = { INSTAGRAM: 0, YOUTUBE: 0, TIKTOK: 0, FACEBOOK: 0 };
    });

    submissions.forEach(sub => {
      if (countsByAccount[sub.clientAccountId] && countsByAccount[sub.clientAccountId][sub.platform] !== undefined) {
        countsByAccount[sub.clientAccountId][sub.platform]++;
      }
    });

    let totalSubmittedToday = 0;
    const accountTotals: Record<string, number> = {};

    clientAccounts.forEach(c => {
      let accSum = 0;
      ['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'FACEBOOK'].forEach(p => {
        // Cap count at 15 for target calculation but track full count
        const count = countsByAccount[c.id][p];
        accSum += Math.min(count, 15);
      });
      accountTotals[c.id] = accSum;
      totalSubmittedToday += accSum;
    });

    return {
      countsByAccount,
      accountTotals,
      totalSubmittedToday,
      remainingLinks: Math.max(180 - totalSubmittedToday, 0)
    };
  }, [submissions, clientAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double-clicks

    setStatusMsg(null);

    // Frontend validation checks
    if (!url.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter a URL first.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          platform: selectedPlatform,
          clientAccountId: selectedClient,
          userId: employeeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      // Append new submission to the local state list
      const newSub: Submission = {
        id: data.submission.id || Math.random().toString(),
        url: url.trim(),
        platform: selectedPlatform,
        clientAccountId: selectedClient,
        createdAt: new Date(),
      };

      setSubmissions(prev => [newSub, ...prev]);
      setUrl('');
      setStatusMsg({ type: 'success', text: 'URL submitted successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Submission failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPlatformInfo = platforms.find(p => p.id === selectedPlatform);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl backdrop-blur-md gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
              <Sparkles className="w-5 h-5" />
              <span>Employee Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Hello, {employeeName}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage client social posts and hit your daily quotas.</p>
          </div>
          
          <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-xl flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase tracking-wider font-bold">Daily Progress</span>
              <span className="text-lg font-extrabold text-white">{stats.totalSubmittedToday} / 180 Links</span>
            </div>
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" className="stroke-slate-700 fill-transparent" strokeWidth="4" />
                <circle 
                  cx="24" 
                  cy="24" 
                  r="20" 
                  className="stroke-indigo-500 fill-transparent transition-all duration-500" 
                  strokeWidth="4" 
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - Math.min(stats.totalSubmittedToday / 180, 1))}
                />
              </svg>
              <span className="absolute text-[10px] font-bold">
                {Math.round((stats.totalSubmittedToday / 180) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Progress Matrix Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clientAccounts.map((account) => {
            const accTotal = stats.accountTotals[account.id] || 0;
            return (
              <div 
                key={account.id} 
                className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-600 transition-all duration-300 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-bold text-slate-200">{account.name}</h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/60 text-slate-300">
                      {accTotal} / 60
                    </span>
                  </div>
                  
                  {/* Platforms Breakdown for this account */}
                  <div className="space-y-2 mt-4">
                    {platforms.map(p => {
                      const count = stats.countsByAccount[account.id]?.[p.id] || 0;
                      const pct = Math.min((count / 15) * 100, 100);
                      return (
                        <div key={p.id} className="text-xs">
                          <div className="flex justify-between items-center text-slate-400 mb-1">
                            <span className="flex items-center gap-1">
                              <p.icon className={`w-3.5 h-3.5 ${p.textTheme}`} />
                              {p.name}
                            </span>
                            <span className="font-semibold text-slate-300">{count} / 15</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`bg-gradient-to-r ${p.color} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/30 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Account status</span>
                  {accTotal >= 60 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Fully Completed
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {60 - accTotal} remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Form & Live Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Submission Form Card */}
          <div className="lg:col-span-7 bg-slate-800/55 border border-slate-700/60 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                Submit Social Link
              </h2>
              <p className="text-slate-400 text-sm mt-1">Select account and platform to index your post.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Select Client Account */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                  Client Account
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold"
                >
                  {clientAccounts.map((account) => (
                    <option key={account.id} value={account.id} className="bg-slate-800 text-slate-200">
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Platform grid */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                  Select Social Platform
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platforms.map((p) => {
                    const Icon = p.icon;
                    const isActive = selectedPlatform === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setSelectedPlatform(p.id)}
                        className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border font-semibold ${
                          isActive 
                            ? `${p.bgActive} border-transparent` 
                            : 'bg-slate-900/60 hover:bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Paste URL */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                  Paste Post URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder={`https://www.${currentPlatformInfo?.domain || 'instagram.com'}/...`}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-slate-200 pl-4 pr-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-slate-600 font-medium"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {currentPlatformInfo && <currentPlatformInfo.icon className="w-5 h-5" />}
                  </div>
                </div>
                <p className="text-slate-500 text-[10px] mt-1.5 italic">
                  Ensure the link belongs directly to the selected platform. Empty or duplicate links are rejected.
                </p>
              </div>

              {/* Toast / Validation Alert Box */}
              {statusMsg && (
                <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm transition-all duration-300 animate-fadeIn ${
                  statusMsg.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  {statusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  )}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying and Uploading...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Link</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Submission Stream Log */}
          <div className="lg:col-span-5 bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl flex flex-col max-h-[600px]">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-200">Recent Activity</h2>
              <p className="text-xs text-slate-500">Your submissions added during this session.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
              {submissions.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-700/60 rounded-2xl">
                  <Send className="w-8 h-8 mb-2 stroke-1" />
                  <span className="text-sm">No submissions yet today</span>
                </div>
              ) : (
                submissions.map((sub) => {
                  const client = clientAccounts.find(c => c.id === sub.clientAccountId);
                  const plat = platforms.find(p => p.id === sub.platform);
                  const PlatIcon = plat?.icon || Instagram;

                  return (
                    <div 
                      key={sub.id} 
                      className="bg-slate-900/60 border border-slate-700/40 p-4 rounded-xl flex items-center justify-between hover:bg-slate-900/95 transition-all group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2.5 rounded-lg shrink-0 ${
                          sub.platform === 'INSTAGRAM' ? 'bg-gradient-to-tr from-pink-500/10 to-yellow-500/10 border border-pink-500/20' :
                          sub.platform === 'YOUTUBE' ? 'bg-red-500/10 border border-red-500/20' :
                          sub.platform === 'TIKTOK' ? 'bg-slate-800 border border-slate-700' :
                          'bg-blue-500/10 border border-blue-500/20'
                        }`}>
                          <PlatIcon className={`w-4 h-4 ${plat?.textTheme || 'text-slate-400'}`} />
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-xs font-bold text-slate-200 block truncate">
                            {client?.name || 'Unknown Client'}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                            {sub.url}
                          </span>
                        </div>
                      </div>
                      
                      <a 
                        href={sub.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-indigo-400 p-2 rounded-lg hover:bg-slate-800 shrink-0 transition-colors"
                        title="Open Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-500">
              <span>Total platform limits cap at 15</span>
              <span>180 global cap</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
