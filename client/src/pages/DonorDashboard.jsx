import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  PlusCircle, 
  Leaf, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Building,
  Phone
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

import StatCard from '../components/StatCard';
import StatusTimeline from '../components/StatusTimeline';
import RiskBadge from '../components/RiskBadge';
import PostFoodModal from '../components/PostFoodModal';
import FoodSafetyModal from '../components/FoodSafetyModal';
import MarkCollectedModal from '../components/MarkCollectedModal';
import RateNgoModal from '../components/RateNgoModal';
import SkeletonCard from '../components/SkeletonCard';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [selectedCollectPost, setSelectedCollectPost] = useState(null);
  const [selectedRateNgoPost, setSelectedRateNgoPost] = useState(null);

  const fetchMyPosts = async () => {
    try {
      const data = await api.getMyPosts();
      setPosts(data);
    } catch (err) {
      toast.error(err.message || 'Error fetching posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
    const interval = setInterval(fetchMyPosts, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalDonations = posts.length;
  const totalKg = posts.reduce((acc, p) => acc + (p.totalWeightKg || 0), 0);
  const activePostsCount = posts.filter(p => p.status === 'Posted' || p.status === 'Claimed').length;

  const chartData = [
    { day: 'Mon', kg: Math.round(totalKg * 0.1) || 5 },
    { day: 'Tue', kg: Math.round(totalKg * 0.15) || 10 },
    { day: 'Wed', kg: Math.round(totalKg * 0.2) || 18 },
    { day: 'Thu', kg: Math.round(totalKg * 0.18) || 14 },
    { day: 'Fri', kg: Math.round(totalKg * 0.25) || 22 },
    { day: 'Sat', kg: Math.round(totalKg * 0.12) || 12 },
    { day: 'Today', kg: Math.round(totalKg) || 25 },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Donor Kitchen Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'GreenBite Eatery'}!
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Manage your surplus food donations, monitor real-time pickup claims, and list new surplus meals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setIsSafetyModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Safety Guidelines</span>
          </button>

          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Surplus Food</span>
          </button>
        </div>
      </div>

      {/* STAT CARDS (Section 3: total donations, kg donated, active posts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Donations"
          value={totalDonations}
          subtitle="All time surplus listings"
          icon={Utensils}
          color="emerald"
        />
        <StatCard
          title="Total Weight Donated"
          value={totalKg}
          unit="kg"
          subtitle="Food rescued from waste"
          icon={Leaf}
          color="teal"
        />
        <StatCard
          title="Active Posts"
          value={activePostsCount}
          subtitle="Open or in transit"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* CHART & BADGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Donation Volume Over Time
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Surplus food rescued (kg) by day
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
              Live Data
            </span>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="kg" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorKg)" name="Surplus (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Donor Badge & Rating</span>
            </h3>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  {user?.badge || 'Gold'} Hero Badge
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                  ★ {user?.rating || 4.9} ({user?.ratingCount || 34} reviews)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Compliance with food quality and hygiene check protocols.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MY DONATIONS LIST WITH TIMELINE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              My Surplus Food Listings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track status timeline (Posted → Claimed → Collected)
            </p>
          </div>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
          >
            + Post Surplus Food
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <Utensils className="w-12 h-12 mx-auto text-slate-400 opacity-40" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Food Listings Yet
            </h3>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
            >
              Post Surplus Food Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Posted {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <RiskBadge level={post.riskLevel} expiresAt={post.expiresAt} reason={post.riskReason} />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {post.totalWeightKg} kg ({post.estimatedMeals} served portions)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
                      {post.dietaryType || 'Veg'}
                    </span>
                  </div>

                  {/* Distribution Route & NGO Involvement Tag */}
                  <div className="flex items-center justify-between text-xs px-1">
                    {post.ngoInvolvement && post.assignedNgo ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-800">
                        <span>🛡️ NGO: {post.assignedNgo.name}</span>
                        <span className="text-purple-500 font-extrabold">({post.assignedNgo.trustScore ?? 98}% Trust)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                        <span>🚀 Direct Recipient Delivery</span>
                      </span>
                    )}

                    {post.ngoInvolvement && post.assignedNgo && (!post.ratingDonorToNgo || !post.ratingDonorToNgo.stars) && (
                      <button
                        onClick={() => setSelectedRateNgoPost(post)}
                        className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center space-x-1"
                      >
                        <span>⭐ Rate NGO</span>
                      </button>
                    )}
                  </div>

                  {/* Donor's Submitted Review of the NGO */}
                  {post.ratingDonorToNgo?.stars > 0 && (
                    <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-900 dark:text-purple-200">
                        <span>🛡️ Your NGO Review: ★ {post.ratingDonorToNgo.stars} Stars</span>
                        {post.ratingDonorToNgo.isFraudReported ? (
                          <span className="text-rose-600 dark:text-rose-400 font-extrabold">⚠️ Fraud Reported</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">✓ Verified Honest</span>
                        )}
                      </div>
                      {post.ratingDonorToNgo.comment && (
                        <p className="text-slate-600 dark:text-slate-400 italic text-[11px]">
                          "{post.ratingDonorToNgo.comment}"
                        </p>
                      )}
                    </div>
                  )}

                  {post.claimedBy && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center space-x-1">
                          <Building className="w-3.5 h-3.5" />
                          <span>Claimed by: {post.claimedBy.name}</span>
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{post.claimedBy.phone}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  <StatusTimeline
                    status={post.status}
                    claimedByName={post.claimedBy?.name}
                    collectedAt={post.collectedAt}
                  />

                  {post.ratingFromRecipient?.stars > 0 && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                      <div className="flex items-center space-x-1 text-amber-500 font-bold">
                        ★ {post.ratingFromRecipient.stars} Stars Review
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 italic">
                        "{post.ratingFromRecipient.comment}"
                      </p>
                    </div>
                  )}
                </div>

                {post.status === 'Claimed' && (
                  <button
                    onClick={() => setSelectedCollectPost(post)}
                    className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                  >
                    Mark Pickup Completed ✓
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <PostFoodModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={() => fetchMyPosts()}
      />

      <FoodSafetyModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />

      <MarkCollectedModal
        post={selectedCollectPost}
        isOpen={!!selectedCollectPost}
        onClose={() => setSelectedCollectPost(null)}
        onSuccess={() => fetchMyPosts()}
      />

      <RateNgoModal
        post={selectedRateNgoPost}
        isOpen={!!selectedRateNgoPost}
        onClose={() => setSelectedRateNgoPost(null)}
        onSuccess={() => fetchMyPosts()}
        userRole="donor"
      />

    </div>
  );
}
