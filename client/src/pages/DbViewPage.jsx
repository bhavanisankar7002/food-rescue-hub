import React, { useState, useEffect, useRef } from 'react';
import { Database, RefreshCw, Sparkles, Search, Play, CheckCircle2, ShieldCheck, FileText, Layers, Activity, Users, Utensils, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function DbViewPage() {
  const [activeTab, setActiveTab] = useState('posts'); // 'users' | 'posts' | 'notifications' | 'logs'
  const [dbData, setDbData] = useState({
    summary: { usersCount: 0, postsCount: 0, notificationsCount: 0, logsCount: 0 },
    users: [],
    foodPosts: [],
    notifications: [],
    activityLogs: [],
  });

  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedRowId, setHighlightedRowId] = useState(null);

  const prevPostsCountRef = useRef(0);

  const fetchDbData = async () => {
    try {
      const data = await api.getDbView();
      
      // Check if new food post was inserted
      if (data.foodPosts.length > prevPostsCountRef.current && prevPostsCountRef.current > 0) {
        const latestId = data.foodPosts[0]?._id;
        setHighlightedRowId(latestId);
        toast.success('Live MongoDB Mutation: New row inserted!', { icon: '⚡' });
        setTimeout(() => setHighlightedRowId(null), 3500);
      }

      prevPostsCountRef.current = data.foodPosts.length;
      setDbData(data);
    } catch (err) {
      console.warn('DB View fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbData();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDbData, 3000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Evaluator Simulation Handlers
  const handleSeed = async () => {
    try {
      toast.loading('Seeding fresh demo dataset into MongoDB...', { id: 'seed' });
      await api.seedDatabase();
      await fetchDbData();
      toast.success('Database reset & seeded with fresh records!', { id: 'seed' });
    } catch (err) {
      toast.error('Error seeding DB', { id: 'seed' });
    }
  };

  const handleSimulatePost = async () => {
    try {
      toast.loading('Simulating live donor food post...', { id: 'sim-post' });
      const res = await api.simulatePost();
      await fetchDbData();
      toast.success(`Inserted live post: "${res.post?.title}"`, { id: 'sim-post' });
    } catch (err) {
      toast.error('Simulation error: ' + err.message, { id: 'sim-post' });
    }
  };

  const handleSimulateClaim = async () => {
    try {
      toast.loading('Simulating live recipient claim...', { id: 'sim-claim' });
      const res = await api.simulateClaim();
      await fetchDbData();
      toast.success(`Claim updated live on MongoDB!`, { id: 'sim-claim' });
    } catch (err) {
      toast.error('Simulation error: ' + err.message, { id: 'sim-claim' });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Database className="w-4 h-4 text-purple-400" />
            <span>MongoDB Live Showcase & Evaluator Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Database Browser & Live Inspector
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Inspect raw MongoDB collections live without page reloads. Watch newly inserted donor posts and recipient claims flash with real-time glow animation.
          </p>
        </div>

        <div className="flex items-center space-x-3 z-10">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center space-x-2 ${
              autoRefresh
                ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                : 'bg-white/10 text-slate-300 border-white/20'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>Auto-Refresh (3s): {autoRefresh ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* MAIN DATA TABLES AREA (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Collection Tab Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 p-1">
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'posts'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Food Posts ({dbData.summary.postsCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'users'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Users ({dbData.summary.usersCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notifications ({dbData.summary.notificationsCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'logs'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Activity Logs ({dbData.summary.logsCount})</span>
              </button>
            </div>

            {/* Filter Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter table rows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* TABLE RENDERING */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            
            {/* FOOD POSTS TABLE */}
            {activeTab === 'posts' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Donor Name</th>
                      <th className="p-4">Food Items (Formatted)</th>
                      <th className="p-4">Weight / Meals</th>
                      <th className="p-4">Risk Level</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Claimed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dbData.foodPosts.map((post) => (
                      <tr
                        key={post._id}
                        className={`transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                          highlightedRowId === post._id ? 'row-flash font-bold text-emerald-600' : ''
                        }`}
                      >
                        <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{post.donorName}</td>
                        <td className="p-4 font-semibold text-emerald-700 dark:text-emerald-400">{post.itemsFormatted}</td>
                        <td className="p-4">{post.totalWeightKg} kg ({post.estimatedMeals} meals)</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            post.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' : post.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {post.riskLevel}
                          </span>
                        </td>
                        <td className="p-4 font-bold">{post.status}</td>
                        <td className="p-4 text-slate-500">{post.claimedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* USERS TABLE */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Organization Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Badge / Rating</th>
                      <th className="p-4">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dbData.users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{u.name}</td>
                        <td className="p-4 text-slate-500">{u.email}</td>
                        <td className="p-4 font-bold uppercase text-[10px]">{u.role}</td>
                        <td className="p-4">{u.orgType}</td>
                        <td className="p-4 font-bold text-amber-500">{u.badge || 'Bronze'} (★ {u.rating})</td>
                        <td className="p-4">{u.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* NOTIFICATIONS TABLE */}
            {activeTab === 'notifications' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Title</th>
                      <th className="p-4">Message</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Target Recipient</th>
                      <th className="p-4">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dbData.notifications.map((n) => (
                      <tr key={n._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{n.title}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs">{n.message}</td>
                        <td className="p-4 font-semibold text-emerald-600">{n.type}</td>
                        <td className="p-4">{n.recipient?.name || 'All Recipients (Broadcast)'}</td>
                        <td className="p-4 text-slate-400">{new Date(n.createdAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ACTIVITY LOGS TABLE */}
            {activeTab === 'logs' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Action</th>
                      <th className="p-4">Actor</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dbData.activityLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-bold text-purple-600 dark:text-purple-400">{log.action}</td>
                        <td className="p-4 font-semibold">{log.userName}</td>
                        <td className="p-4 uppercase text-[10px] font-bold">{log.userRole}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs">{log.details}</td>
                        <td className="p-4 text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>

        {/* WORKFLOW DEMO SIDE PANEL FOR EVALUATORS (1 col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-xl space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Workflow Evaluation Script</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-Click buttons to trigger live MongoDB events & test real-time UI reactions!
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleSeed}
                className="w-full py-2.5 px-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>1-Click Seed Fresh Data</span>
              </button>

              <button
                onClick={handleSimulatePost}
                className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Simulate New Donor Post</span>
              </button>

              <button
                onClick={handleSimulateClaim}
                className="w-full py-2.5 px-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Recipient Claim</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">
                2-Minute Evaluation Checklist:
              </h4>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
                <li>Click <strong>"Demo Donor"</strong> at login page.</li>
                <li>Post surplus food (Rice 10 kg). Watch risk meter check prep time.</li>
                <li>Switch window or log in as <strong>"Demo Recipient"</strong>.</li>
                <li>See instant toast & bell badge notification without page refresh!</li>
                <li>Claim food & observe DB row highlight flash on this page.</li>
              </ol>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
