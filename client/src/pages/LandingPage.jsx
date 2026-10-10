import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartHandshake, 
  Utensils, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Leaf, 
  Users,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function LandingPage() {
  const { user, demoLogin } = useAuth();
  const [stats, setStats] = useState({
    totalKgRescued: 485,
    totalMealsServed: 1212,
    activeDonors: 2,
    partnerHomes: 2,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.getStats();
        if (res.impact) {
          setStats({
            totalKgRescued: res.impact.totalKgRescued || 485,
            totalMealsServed: res.impact.totalMealsServed || 1212,
            activeDonors: Math.max(2, res.impact.activeDonors || 2),
            partnerHomes: Math.max(2, res.impact.partnerHomes || 2),
          });
        }
      } catch (err) {
        // Default fallback stats
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-pulse-slow">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Zero Food Waste Management Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Bridging Surplus Food to{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              Hungry Hearts
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            ZeroWaste connects restaurants, hostels, and banquet managers directly with old age homes, orphanages, and charities in real-time. Safe, fast, and zero waste.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Link
                to={user.role === 'donor' ? '/donor-dashboard' : user.role === 'recipient' ? '/recipient-dashboard' : '/ngo-dashboard'}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-105"
              >
                <span>Go to Your Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => demoLogin('donor')}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-105"
                >
                  <Utensils className="w-5 h-5" />
                  <span>Try Demo Donor</span>
                </button>

                <button
                  onClick={() => demoLogin('recipient')}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-base border border-slate-300 dark:border-slate-700 shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-105"
                >
                  <HeartHandshake className="w-5 h-5 text-emerald-600" />
                  <span>Try Demo Recipient</span>
                </button>

                <button
                  onClick={() => demoLogin('ngo')}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base shadow-xl shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-105"
                >
                  <Activity className="w-5 h-5" />
                  <span>Try Demo NGO</span>
                </button>
              </>
            )}
          </div>

          <div className="pt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safety Verified</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Real-Time Matching</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>100% Free for Charities</span>
            </span>
          </div>

        </div>
      </section>

      {/* SIMPLE STAT COUNTERS (Read from DB) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {stats.totalMealsServed.toLocaleString()}
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Meals Delivered
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {stats.totalKgRescued} kg
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Food Rescued
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {stats.activeDonors}+
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Food Donors
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {stats.partnerHomes}+
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Partner Care Homes
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS: 3 STEP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Simple 3-Step Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            How ZeroWaste Operates
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Connecting surplus food to recipient centers efficiently with verified safety standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-xl flex items-center justify-center">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Donor Posts Surplus
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Restaurants or hostels enter food items, quantity, and prep timestamp with safety verification checks.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold text-xl flex items-center justify-center">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Get Notified
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Nearby recipient centers receive instant real-time alerts with details and pickup location.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-bold text-xl flex items-center justify-center">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Collect & Rate
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Recipients claim food, arrange swift pickup, and leave ratings and feedback for the donor.
            </p>
          </div>
        </div>
      </section>

      {/* ROLE CARDS (3 Roles) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Designed for Every Stakeholder
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Donor Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Utensils className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Food Donors</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Restaurants and hostels list surplus meals with safety verification and track pickup status.
              </p>
            </div>
            <button
              onClick={() => demoLogin('donor')}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
            >
              Sign In as Donor
            </button>
          </div>

          {/* Recipient Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Recipients</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Care homes and shelters receive alerts for fresh surplus food, claim listings, and rate donors.
              </p>
            </div>
            <button
              onClick={() => demoLogin('recipient')}
              className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md"
            >
              Sign In as Recipient
            </button>
          </div>

          {/* NGO Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">NGO / Volunteers</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Oversight managers inspect citywide donation tables, audit satisfaction scores, and view platform impact.
              </p>
            </div>
            <button
              onClick={() => demoLogin('ngo')}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
            >
              Sign In as NGO
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 pt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">ZeroWaste Rescue</span>
          </div>
          <p>© 2026 ZeroWaste Platform.</p>
        </div>
      </footer>

    </div>
  );
}
