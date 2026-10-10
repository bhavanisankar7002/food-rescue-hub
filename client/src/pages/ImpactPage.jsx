import React, { useState, useEffect } from 'react';
import { BarChart3, Leaf, Utensils, HeartHandshake, Building2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../services/api';
import StatCard from '../components/StatCard';

export default function ImpactPage() {
  const [stats, setStats] = useState({
    totalKgRescued: 485,
    totalMealsServed: 1212,
    activeDonors: 2,
    partnerHomes: 2,
  });
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.getStats();
        if (res.impact) setStats(res.impact);
        if (res.trendData) setTrendData(res.trendData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white shadow-xl text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-500/20 backdrop-blur-md flex items-center justify-center text-teal-300">
          <BarChart3 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Platform Impact Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto">
          Overview of total food rescued and meals delivered across partner charities.
        </p>
      </div>

      {/* STAT CARDS (Section 5: total food rescued kg, meals delivered, active donors, partner care homes) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Food Rescued" value={stats.totalKgRescued} unit="kg" subtitle="Surplus saved from waste" icon={Leaf} color="emerald" />
        <StatCard title="Meals Delivered" value={stats.totalMealsServed} unit="portions" subtitle="Served portions count" icon={Utensils} color="teal" />
        <StatCard title="Active Food Donors" value={stats.activeDonors} subtitle="Verified kitchens" icon={Building2} color="amber" />
        <StatCard title="Partner Care Homes" value={stats.partnerHomes} subtitle="Registered shelters" icon={HeartHandshake} color="purple" />
      </div>

      {/* DONATIONS OVER TIME CHART (Section 5) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Donations Over Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily weight rescued (kg) & meals delivered
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorKgImpact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="kgRescued" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorKgImpact)" name="Rescued (kg)" />
              <Area type="monotone" dataKey="mealsServed" stroke="#0d9488" strokeWidth={2} fillOpacity={0} name="Meals Served" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
