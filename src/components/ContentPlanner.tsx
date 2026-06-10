'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Image, Send, CheckCircle2, AlertCircle, Clock, Link2, Plus, RefreshCw } from 'lucide-react';

interface ScheduledPost {
  id: string;
  mediaUrl: string;
  caption: string;
  platform: string;
  scheduledTime: string;
  status: 'PENDING' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
  errorMessage?: string;
}

export default function ContentPlanner() {
  const [activePlatform, setActivePlatform] = useState('INSTAGRAM');
  const [caption, setCaption] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [queue, setQueue] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch the schedule queue
  const fetchQueue = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/scheduled');
      if (!res.ok) throw new Error('Failed to load queue');
      const data = await res.json();
      setQueue(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!mediaUrl || !caption || !scheduledTime) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl,
          caption,
          platform: activePlatform,
          scheduledTime
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to schedule post');

      setSuccess('Post scheduled successfully!');
      setCaption('');
      setMediaUrl('');
      setScheduledTime('');
      fetchQueue();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock function to trigger background cron locally
  const triggerCron = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/cron/publish', {
        headers: {
          'Authorization': 'Bearer local-cron-secret'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(`Cron run complete: ${data.message || 'Processed posts'}`);
        fetchQueue();
      } else {
        throw new Error(data.error || 'Cron run failed');
      }
    } catch (err: any) {
      setError(`Cron execution failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 p-6 md:p-10 font-sans rounded-3xl border border-slate-900 shadow-2xl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Content Planner & Queue
            </h1>
            <p className="text-slate-400 mt-1">Compose, schedule, and distribute media across all integrated social channels.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={triggerCron}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 h-11 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition duration-150 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Run Cron Bot</span>
            </button>
            <button className="flex items-center gap-2 px-4 h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition duration-150">
              <Link2 size={16} />
              <span>Connect OAuth</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-2 text-sm">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column 1: Post Composer Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-5 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <Plus size={20} className="text-indigo-400" />
              <span>Create Post</span>
            </h2>

            <div className="space-y-4">
              {/* Target Channel Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Select Platform</label>
                <div className="grid grid-cols-4 gap-2">
                  {['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'YOUTUBE'].map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setActivePlatform(plat)}
                      className={`h-10 text-xs font-bold rounded-lg border transition-all duration-150 ${
                        activePlatform === plat
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Media URL Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Media URL (Image / Video)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Image size={16} />
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full pl-10 pr-4 h-11 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-sm transition duration-150"
                  />
                </div>
              </div>

              {/* Caption Box */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Caption</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Draft your caption here. Add #tags..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-sm resize-none transition duration-150"
                />
              </div>

              {/* Scheduled Time picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Schedule Release</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Calendar size={16} />
                  </div>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full pl-10 pr-4 h-11 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-sm transition duration-150"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition duration-150 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={16} />
                <span>{isLoading ? 'Scheduling...' : 'Schedule Post'}</span>
              </button>

            </div>
          </form>

          {/* Column 2: Scheduled Queue List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                <Clock size={20} className="text-purple-400" />
                <span>Queue List ({queue.length})</span>
              </h2>
              <button 
                onClick={fetchQueue}
                className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition"
              >
                Refresh Queue
              </button>
            </div>

            {queue.length === 0 ? (
              <div className="border border-dashed border-slate-850 rounded-2xl p-12 text-center text-slate-500 text-sm">
                No posts scheduled in the queue. Complete the form to add one!
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {queue.map((post) => {
                  const formattedTime = new Date(post.scheduledTime).toLocaleString();
                  
                  return (
                    <div 
                      key={post.id} 
                      className="bg-slate-900/20 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all duration-150 shadow-md flex gap-5"
                    >
                      {/* Media Thumbnail */}
                      <div className="w-24 h-24 rounded-lg bg-slate-950 overflow-hidden relative shrink-0 border border-slate-850">
                        <img 
                          src={post.mediaUrl} 
                          alt="Post media preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // fallback placeholder
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500";
                          }}
                        />
                      </div>

                      {/* Post Info details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-indigo-400 tracking-wider">
                                {post.platform}
                              </span>
                              <span className="text-slate-600">•</span>
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={12} />
                                {formattedTime}
                              </span>
                            </div>

                            {/* Status Pill */}
                            {post.status === 'PUBLISHED' && (
                              <span className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                                <CheckCircle2 size={10} />
                                <span>Published</span>
                              </span>
                            )}
                            {post.status === 'PENDING' && (
                              <span className="flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                                <Clock size={10} />
                                <span>Pending</span>
                              </span>
                            )}
                            {post.status === 'PUBLISHING' && (
                              <span className="flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full animate-pulse">
                                <Clock size={10} />
                                <span>Publishing</span>
                              </span>
                            )}
                            {post.status === 'FAILED' && (
                              <span className="flex items-center gap-1 text-[11px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">
                                <AlertCircle size={10} />
                                <span>Failed</span>
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-slate-300 pr-2 leading-relaxed break-words">
                            {post.caption}
                          </p>
                        </div>

                        {/* Error details inside failed posts */}
                        {post.status === 'FAILED' && post.errorMessage && (
                          <div className="mt-2 text-xs text-rose-400 flex items-start gap-1 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                            <AlertCircle size={12} className="shrink-0 mt-0.5" />
                            <span className="truncate" title={post.errorMessage}>{post.errorMessage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
