'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Instagram, 
  Youtube, 
  Facebook, 
  Video, 
  Search, 
  Filter, 
  ExternalLink, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  BarChart3 
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  accounts: {
    id: string;
    name: string;
  }[];
}

interface SubmissionLog {
  id: string;
  url: string;
  platform: 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK' | 'FACEBOOK';
  clientAccountId: string;
  clientAccountName: string;
  submittedById: string;
  submittedByName: string;
  createdAt: Date;
}

interface AdminDashboardProps {
  employees: Employee[];
  submissions: SubmissionLog[];
}

export default function AdminDashboard({
  employees,
  submissions: initialSubmissions
}: AdminDashboardProps) {
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('ALL');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState('ALL');
  const [selectedClientFilter, setSelectedClientFilter] = useState('ALL');

  // Platform definitions
  const platforms = [
    { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10 border-pink-500/20' },
    { id: 'YOUTUBE', name: 'YouTube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
    { id: 'TIKTOK', name: 'TikTok', icon: Video, color: 'text-slate-200', bg: 'bg-slate-800 border-slate-700' },
    { id: 'FACEBOOK', name: 'Facebook', icon: Facebook, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
  ];

  // 1. Math calculations - Daily summary numbers
  const stats = useMemo(() => {
    // Total System quota: 900 links
    const totalLinksSubmitted = initialSubmissions.length;
    const progressPercent = Math.min((totalLinksSubmitted / 900) * 100, 100);

    // Calculate platform split
    const platformCounts = { INSTAGRAM: 0, YOUTUBE: 0, TIKTOK: 0, FACEBOOK: 0 };
    initialSubmissions.forEach(sub => {
      if (platformCounts[sub.platform] !== undefined) {
        platformCounts[sub.platform]++;
      }
    });

    // Employee breakdown: track counts for each account
    const employeeMetrics = employees.map(emp => {
      const accountMetrics = emp.accounts.map(acc => {
        // Count how many links this employee submitted for this specific client account
        const subs = initialSubmissions.filter(
          s => s.submittedById === emp.id && s.clientAccountId === acc.id
        );
        
        // Group by platform to apply the 15-link target math rule per platform
        const platformBreakdown = { INSTAGRAM: 0, YOUTUBE: 0, TIKTOK: 0, FACEBOOK: 0 };
        subs.forEach(s => {
          if (platformBreakdown[s.platform] !== undefined) {
            platformBreakdown[s.platform]++;
          }
        });

        // Sum the platform counts, each capped at 15
        const validSum = Object.values(platformBreakdown).reduce((sum, count) => sum + Math.min(count, 15), 0);

        return {
          id: acc.id,
          name: acc.name,
          count: validSum // Capped total, max 60 per account
        };
      });

      const totalCappedLinks = accountMetrics.reduce((sum, acc) => sum + acc.count, 0);
      const remainingLinks = Math.max(180 - totalCappedLinks, 0);
      const isCompleted = totalCappedLinks >= 180;

      return {
        id: emp.id,
        name: emp.name,
        accounts: accountMetrics,
        totalSubmitted: totalCappedLinks,
        remaining: remainingLinks,
        isCompleted
      };
    });

    return {
      totalLinksSubmitted,
      progressPercent,
      platformCounts,
      employeeMetrics
    };
  }, [employees, initialSubmissions]);

  // 2. Filtered Submission logs
  const filteredSubmissions = useMemo(() => {
    return initialSubmissions.filter(sub => {
      const matchesSearch = sub.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            sub.clientAccountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            sub.submittedByName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesEmployee = selectedEmployeeFilter === 'ALL' || sub.submittedById === selectedEmployeeFilter;
      const matchesPlatform = selectedPlatformFilter === 'ALL' || sub.platform === selectedPlatformFilter;
      
      // Since client IDs can overlap in names across users, match by ID if selected, or match by sub field
      const matchesClient = selectedClientFilter === 'ALL' || sub.clientAccountId === selectedClientFilter;

      return matchesSearch && matchesEmployee && matchesPlatform && matchesClient;
    });
  }, [initialSubmissions, searchQuery, selectedEmployeeFilter, selectedPlatformFilter, selectedClientFilter]);

  // Generate helper list of unique client accounts for dropdown filter
  const allClientAccounts = useMemo(() => {
    const clients: { id: string; name: string }[] = [];
    employees.forEach(emp => {
      emp.accounts.forEach(acc => {
        if (!clients.some(c => c.name === acc.name)) {
          clients.push({ id: acc.id, name: acc.name });
        }
      });
    });
    return clients;
  }, [employees]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-md gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
              <TrendingUp className="w-5 h-5" />
              <span>Admin Console</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Social Media Posting Overview
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time daily quota audits across all team nodes.</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 px-4 py-2.5 rounded-xl text-xs text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Today's Log stream is Active</span>
          </div>
        </div>

        {/* Math Target Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Completed today */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Daily Target Status</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-indigo-400">{stats.totalLinksSubmitted}</span>
                <span className="text-slate-500 font-semibold">/ 900 links</span>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Overall Quota Progress</span>
                <span className="font-bold">{Math.round(stats.progressPercent)}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Platform Summary pills */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl shadow-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">Platform Distribution</span>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map(p => {
                const count = stats.platformCounts[p.id as keyof typeof stats.platformCounts] || 0;
                const Icon = p.icon;
                return (
                  <div key={p.id} className="bg-slate-900/50 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${p.bg}`}>
                        <Icon className={`w-4 h-4 ${p.color}`} />
                      </div>
                      <span className="text-xs font-semibold text-slate-300">{p.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-200">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Team Completion Status */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Team Summary</span>
              <div className="space-y-2.5 mt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Quota Achieved:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {stats.employeeMetrics.filter(e => e.isCompleted).length} / 5 Employees
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Pending:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {stats.employeeMetrics.filter(e => !e.isCompleted).length} Employees
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-700/30 flex items-center justify-between text-[11px] text-slate-500">
              <span>Required: 180 links/person</span>
              <span>Total Quota: 900</span>
            </div>
          </div>
        </div>

        {/* Employee breakdown grid */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-700/40 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold">Employee-wise Breakdown Grid</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                  <th className="py-4 px-6">Employee Name</th>
                  <th className="py-4 px-6">Account 1 Status</th>
                  <th className="py-4 px-6">Account 2 Status</th>
                  <th className="py-4 px-6">Account 3 Status</th>
                  <th className="py-4 px-6 text-center">Remaining</th>
                  <th className="py-4 px-6 text-right">Quota Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats.employeeMetrics.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/20 transition-all group">
                    {/* Employee info */}
                    <td className="py-4 px-6 font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                      {emp.name}
                    </td>

                    {/* Account 1 */}
                    <td className="py-4 px-6">
                      <div className="text-xs">
                        <span className="font-semibold text-slate-300 block mb-1">
                          {emp.accounts[0]?.name || 'N/A'}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full" 
                              style={{ width: `${((emp.accounts[0]?.count || 0) / 60) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {emp.accounts[0]?.count || 0}/60 Done
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Account 2 */}
                    <td className="py-4 px-6">
                      <div className="text-xs">
                        <span className="font-semibold text-slate-300 block mb-1">
                          {emp.accounts[1]?.name || 'N/A'}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full" 
                              style={{ width: `${((emp.accounts[1]?.count || 0) / 60) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {emp.accounts[1]?.count || 0}/60 Done
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Account 3 */}
                    <td className="py-4 px-6">
                      <div className="text-xs">
                        <span className="font-semibold text-slate-300 block mb-1">
                          {emp.accounts[2]?.name || 'N/A'}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full" 
                              style={{ width: `${((emp.accounts[2]?.count || 0) / 60) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {emp.accounts[2]?.count || 0}/60 Done
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Remaining */}
                    <td className="py-4 px-6 text-center font-bold text-sm text-slate-400">
                      {emp.remaining === 0 ? (
                        <span className="text-emerald-400 font-extrabold">0</span>
                      ) : (
                        emp.remaining
                      )}
                    </td>

                    {/* Target status badge */}
                    <td className="py-4 px-6 text-right">
                      {emp.isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit submission logs */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold">Audit submission logs</h2>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs (URL, employee...)"
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Filter className="w-4 h-4 text-slate-500" />
              <span>Filters:</span>
            </div>

            {/* Filter by Employee */}
            <select
              value={selectedEmployeeFilter}
              onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="ALL">All Employees</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>

            {/* Filter by Platform */}
            <select
              value={selectedPlatformFilter}
              onChange={(e) => setSelectedPlatformFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="ALL">All Platforms</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="YOUTUBE">YouTube</option>
              <option value="TIKTOK">TikTok</option>
              <option value="FACEBOOK">Facebook</option>
            </select>

            {/* Filter by Client Account name */}
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
            >
              <option value="ALL">All Client Accounts</option>
              {allClientAccounts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Reset Filters button */}
            {(selectedEmployeeFilter !== 'ALL' || selectedPlatformFilter !== 'ALL' || selectedClientFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedEmployeeFilter('ALL');
                  setSelectedPlatformFilter('ALL');
                  setSelectedClientFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline ml-auto"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Table display */}
          <div className="overflow-x-auto">
            {filteredSubmissions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-700/60 rounded-2xl">
                <Search className="w-10 h-10 mb-3 stroke-1 text-slate-600" />
                <span className="text-sm font-semibold">No logs matched your filter constraints</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/20 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3.5 px-4">Time</th>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Platform</th>
                    <th className="py-3.5 px-4">URL</th>
                    <th className="py-3.5 px-4 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {filteredSubmissions.map((log) => {
                    const plat = platforms.find(p => p.id === log.platform);
                    const PlatIcon = plat?.icon || Instagram;
                    const formattedTime = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <tr key={log.id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="py-3 px-4 text-slate-500 font-semibold">{formattedTime}</td>
                        <td className="py-3 px-4 font-bold text-slate-200">{log.submittedByName}</td>
                        <td className="py-3 px-4 text-slate-400 font-medium">{log.clientAccountName}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            log.platform === 'INSTAGRAM' ? 'text-pink-400 bg-pink-500/10 border border-pink-500/10' :
                            log.platform === 'YOUTUBE' ? 'text-red-400 bg-red-500/10 border border-red-500/10' :
                            log.platform === 'TIKTOK' ? 'text-slate-200 bg-slate-800 border border-slate-700' :
                            'text-blue-400 bg-blue-500/10 border border-blue-500/10'
                          }`}>
                            <PlatIcon className="w-3 h-3" />
                            {plat?.name || log.platform}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-indigo-400 hover:underline max-w-xs truncate">
                          <a href={log.url} target="_blank" rel="noopener noreferrer">{log.url}</a>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a 
                            href={log.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            Verify <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-750">
            <span>Showing {filteredSubmissions.length} of {initialSubmissions.length} submissions today</span>
            <span>Refreshes automatically</span>
          </div>

        </div>

      </div>
    </div>
  );
}
