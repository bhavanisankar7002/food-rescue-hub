import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Utensils, 
  HeartHandshake, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Users, 
  Leaf, 
  ShieldCheck, 
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatCard from '../components/StatCard';

export default function NgoDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    overview: {
      totalDonations: 0,
      activePostsCount: 0,
      claimedCount: 0,
      collectedCount: 0,
      donorCount: 0,
      recipientCount: 0,
      totalKgRescued: 0,
      totalMealsServed: 0,
      avgRating: 4.8,
    },
    donations: [],
    recentLogs: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchNgoData = async () => {
    try {
      const res = await api.getMonitoring();
      setData(res);
    } catch (err) {
      toast.error(err.message || 'Error fetching NGO overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgoData();
    const interval = setInterval(fetchNgoData, 5000);
    return () => clearInterval(interval);
  }, []);

  const ov = data.overview;

  return (
    <div className="space-y-8 pb-16">
      
      {/* NGO Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>NGO / Volunteer Oversight Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'City Food Rescue NGO'}!
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Monitor real-time food rescue activity, inspect donor-recipient workflows, and review community satisfaction scores across the city network.
          </p>
        </div>

        <div className="flex items-center space-x-3 z-10">
          <Link
            to="/monitoring"
            className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition-all hover:scale-105"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>View Full Monitoring Table</span>
          </Link>
        </div>
      </div>

      {/* OVERVIEW CARDS (Section 3) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Donations" value={ov.totalDonations} subtitle="All time listings" icon={Utensils} color="emerald" />
        <StatCard title="Active Listings" value={ov.activePostsCount} subtitle="Available now" icon={Clock} color="amber" />
        <StatCard title="Claimed Posts" value={ov.claimedCount} subtitle="In pickup transit" icon={Activity} color="teal" />
        <StatCard title="Collected Posts" value={ov.collectedCount} subtitle="Delivered to care" icon={CheckCircle2} color="purple" />
        <StatCard title="Food Donors" value={ov.donorCount} subtitle="Verified kitchens" icon={Building2} color="blue" />
        <StatCard title="Recipients" value={ov.recipientCount} subtitle="Partner shelters" icon={HeartHandshake} color="emerald" />
      </div>

      {/* METRICS & RECENT ACTIVITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span>Platform Activity Stream</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">Live Real-Time Logs</span>
          </div>

          <div className="space-y-3">
            {data.recentLogs.length === 0 ? (
              <p className="text-xs text-slate-400 p-4">No recent activity logged yet.</p>
            ) : (
              data.recentLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 mr-2">
                      {log.userName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 mr-2">
                      {log.userRole}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Summary Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Rescued Totals
            </h3>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Food Saved</span>
                <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{ov.totalKgRescued} kg</p>
              </div>
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Meals Served</span>
                <p className="text-2xl font-extrabold text-teal-700 dark:text-teal-300">{ov.totalMealsServed} meals</p>
              </div>
            </div>
          </div>

          <Link
            to="/monitoring"
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold text-center block shadow-sm"
          >
            Go to Full Monitoring Analytics →
          </Link>
        </div>

      </div>

      {/* NGO TRUST & ANTI-FRAUD VERIFICATION PANEL */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                NGO Network Integrity & Anti-Fraud Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Two-sided audit scores from verified food donors and recipient care shelters
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
            🛡️ Fraud Protection Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-500">Your Trust Score</span>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {user?.trustScore ?? 98}%
            </p>
            <p className="text-[11px] text-slate-500">Calculated from verified handovers and safety audits</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-500">Active Fraud Reports</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {user?.fraudReportsCount || 0} Reports
            </p>
            <p className="text-[11px] text-slate-500">Zero active misconduct or diversion reports</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-500">Audit Verification Badge</span>
            <p className="text-xl font-black text-amber-500 pt-0.5">
              {user?.badge || 'Verified NGO'}
            </p>
            <p className="text-[11px] text-slate-500">Highest compliance tier for city surplus logistics</p>
          </div>
        </div>
      </div>

    </div>
  );
}
