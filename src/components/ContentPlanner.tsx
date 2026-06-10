'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Image, Send, CheckCircle2, AlertCircle, Clock, Link2, Plus, RefreshCw, Upload } from 'lucide-react';

interface ScheduledPost {
  id: string;
  mediaUrl: string;
  caption: string;
  platform: string;
  scheduledTime: string;
  status: 'PENDING' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
  errorMessage?: string;
}

// Helper to get default date and time values (1 hour from now)
const getDefaults = () => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };
};

export default function ContentPlanner() {
  const defaults = getDefaults();
  const [activePlatform, setActivePlatform] = useState('INSTAGRAM');
  const [caption, setCaption] = useState('');
  const [scheduledDate, setScheduledDate] = useState(defaults.date);
  const [scheduledTime, setScheduledTime] = useState(defaults.time);
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [queue, setQueue] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // OAuth states
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [oauthPlatform, setOauthPlatform] = useState('INSTAGRAM');
  const [oauthToken, setOauthToken] = useState('mock_access_token_instagram_66504abc1293e');
  const [isOauthConnecting, setIsOauthConnecting] = useState(false);

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

  const handleOAuthConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOauthConnecting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/auth/mock-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: oauthPlatform,
          token: oauthToken
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to connect account');

      setSuccess(data.message || 'Connected successfully!');
      setShowOAuthModal(false);
    } catch (err: any) {
      setError(`OAuth Error: ${err.message}`);
    } finally {
      setIsOauthConnecting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setMediaUrl(data.url);
      setSuccess('Media file uploaded successfully!');
    } catch (err: any) {
      setError(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!mediaUrl || !caption || !scheduledDate || !scheduledTime) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      const combinedTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      const response = await fetch('/api/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl,
          caption,
          platform: activePlatform,
          scheduledTime: combinedTime
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to schedule post');

      setSuccess('Post scheduled successfully!');
      setCaption('');
      setMediaUrl('');
      const freshDefaults = getDefaults();
      setScheduledDate(freshDefaults.date);
      setScheduledTime(freshDefaults.time);
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
            <button 
              onClick={() => setShowOAuthModal(true)}
              className="flex items-center gap-2 px-4 h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition duration-150"
            >
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

              {/* Media Input Type Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Media Attachment</label>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 mb-3">
                  <button
                    type="button"
                    onClick={() => { setUploadType('url'); setMediaUrl(''); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition duration-150 ${
                      uploadType === 'url' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Remote URL
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUploadType('file'); setMediaUrl(''); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition duration-150 ${
                      uploadType === 'file' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    File Upload
                  </button>
                </div>

                {uploadType === 'url' ? (
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
                ) : (
                  <div className="relative border border-dashed border-slate-800 hover:border-slate-700/80 rounded-xl p-4 bg-slate-950 transition duration-150">
                    <div className="flex flex-col items-center justify-center space-y-2 text-center">
                      <Upload size={24} className={`text-slate-500 ${isUploading ? 'animate-bounce' : ''}`} />
                      <div className="text-xs text-slate-400 font-semibold">
                        {isUploading ? (
                          <span>Uploading file...</span>
                        ) : mediaUrl ? (
                          <span className="text-emerald-400 truncate max-w-[250px] block font-mono text-[10px]">{mediaUrl}</span>
                        ) : (
                          <span>Click to upload image or video</span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        disabled={isUploading}
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="date"
                      required
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full pl-10 pr-4 h-11 bg-slate-955 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-sm transition duration-150"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Clock size={16} />
                    </div>
                    <input
                      type="time"
                      required
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full pl-10 pr-4 h-11 bg-slate-955 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-sm transition duration-150"
                    />
                  </div>
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

      {/* OAuth Connection Modal */}
      {showOAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative">
            <div>
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Link2 size={20} className="text-indigo-400" />
                <span>Simulate OAuth Connection</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Since full API connections require developer portal credentials, you can simulate and save encrypted token credentials for test posting.
              </p>
            </div>

            <form onSubmit={handleOAuthConnect} className="space-y-4">
              {/* Platform selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Platform</label>
                <div className="grid grid-cols-4 gap-2">
                  {['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'YOUTUBE'].map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => {
                        setOauthPlatform(plat);
                        setOauthToken(`mock_access_token_${plat.toLowerCase()}_${Math.random().toString(36).substring(2, 12)}`);
                      }}
                      className={`h-9 text-[10px] font-bold rounded-lg border transition-all duration-150 ${
                        oauthPlatform === plat
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Token Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Mock Access Token</label>
                <input
                  type="text"
                  required
                  placeholder="Enter token..."
                  value={oauthToken}
                  onChange={(e) => setOauthToken(e.target.value)}
                  className="w-full px-4 h-11 bg-slate-950 border border-slate-850 rounded-xl focus:border-indigo-500 focus:outline-none text-xs font-mono transition duration-150"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOAuthModal(false)}
                  className="flex-1 h-11 bg-slate-955 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded-xl text-sm transition duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOauthConnecting}
                  className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition duration-150 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isOauthConnecting ? 'Connecting...' : 'Save Connection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
