import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  MapPin, 
  Search, 
  Filter, 
  Clock, 
  ShieldCheck, 
  Utensils, 
  Phone, 
  CheckCircle2, 
  Map as MapIcon, 
  List, 
  Sparkles,
  Award,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

import RiskBadge from '../components/RiskBadge';
import StatusTimeline from '../components/StatusTimeline';
import ClaimConfirmationModal from '../components/ClaimConfirmationModal';
import MarkCollectedModal from '../components/MarkCollectedModal';
import RateNgoModal from '../components/RateNgoModal';
import InteractiveMap from '../components/InteractiveMap';
import SkeletonCard from '../components/SkeletonCard';

export default function RecipientDashboard() {
  const { user } = useAuth();
  
  const [availablePosts, setAvailablePosts] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'my-claims'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [dietaryFilter, setDietaryFilter] = useState('All');

  // Modal target post
  const [selectedClaimPost, setSelectedClaimPost] = useState(null);
  const [selectedCollectPost, setSelectedCollectPost] = useState(null);
  const [selectedRateNgoClaim, setSelectedRateNgoClaim] = useState(null);

  const fetchData = async () => {
    try {
      const [availData, claimsData] = await Promise.all([
        api.getAvailablePosts(),
        api.getMyClaims(),
      ]);
      setAvailablePosts(availData);
      setMyClaims(claimsData);
    } catch (err) {
      toast.error(err.message || 'Error fetching recipient feed');
    } finally {
      setLoading(false);
    }
  };

  // Background polling every 4 seconds for live-feel food arrival!
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Filter logic
  const filteredPosts = availablePosts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.donor?.name && p.donor.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'All' || p.items.some(i => i.category === categoryFilter);
    const matchesRisk = riskFilter === 'All' || p.riskLevel === riskFilter;
    const matchesDiet = dietaryFilter === 'All' || p.dietaryType === dietaryFilter;

    return matchesSearch && matchesCategory && matchesRisk && matchesDiet;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <HeartHandshake className="w-4 h-4 text-teal-400" />
            <span>Verified Recipient Care Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Hope Haven Shelter'}!
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Discover fresh surplus meals from top restaurants in your area. Real-time updates with automated food safety guarantees.
          </p>
        </div>

        <div className="flex items-center space-x-3 z-10">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-right">
            <span className="text-[11px] text-slate-300 uppercase font-semibold block">Available Surplus</span>
            <span className="text-xl font-bold text-teal-300">{availablePosts.length} Active Posts</span>
          </div>
        </div>
      </div>

      {/* TABS & VIEW TOGGLE BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Feed vs My Claims Tab Switch */}
        <div className="flex rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 p-1 self-start">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'feed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Available Food Feed ({availablePosts.length})
          </button>
          <button
            onClick={() => setActiveTab('my-claims')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my-claims'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            My Rescued Claims ({myClaims.length})
          </button>
        </div>

        {/* View Mode Switcher (Grid Card vs Map View) */}
        {activeTab === 'feed' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Cards Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'map'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Interactive Map</span>
            </button>
          </div>
        )}

      </div>

      {/* FILTER & SEARCH BAR */}
      {activeTab === 'feed' && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search food item or restaurant name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Risk Levels</option>
              <option value="Low">Low Risk Only</option>
              <option value="Medium">Medium Risk</option>
            </select>

            {/* Dietary Filter */}
            <select
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Dietary Types</option>
              <option value="Veg">Vegetarian 🌱</option>
              <option value="Vegan">Vegan 🌿</option>
              <option value="Non-Veg">Non-Veg 🍖</option>
            </select>

          </div>
        </div>
      )}

      {/* FEED CONTENT AREA */}
      {activeTab === 'feed' ? (
        viewMode === 'map' ? (
          <div className="space-y-4">
            <InteractiveMap
              posts={filteredPosts}
              onSelectPost={(post) => setSelectedClaimPost(post)}
            />
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
                <Utensils className="w-12 h-12 mx-auto text-slate-400 opacity-40" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No Available Food Matching Filters
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  New surplus posts arrive every few minutes. Check back soon or reset your search filters!
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setRiskFilter('All');
                    setDietaryFilter('All');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => {
                  const donor = post.donor || {};
                  return (
                    <div
                      key={post._id}
                      className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        
                        {/* Image preview or header */}
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-36 object-cover rounded-2xl border border-slate-100 dark:border-slate-800"
                          />
                        )}

                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-500" />
                              <span>{donor.name || 'GreenBite Eatery'}</span>
                            </p>
                          </div>
                          <RiskBadge level={post.riskLevel} expiresAt={post.expiresAt} reason={post.riskReason} />
                        </div>

                        {/* Weight & Meal pill */}
                        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                          <span className="font-extrabold text-emerald-800 dark:text-emerald-300">
                            {post.totalWeightKg} kg ({post.estimatedMeals} meals)
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
                            {post.dietaryType || 'Veg'}
                          </span>
                        </div>

                        {/* Donor contact & rating */}
                        <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center justify-between">
                            <span>Donor Rating:</span>
                            <span className="font-bold text-amber-500">★ {donor.rating || 4.9} ({donor.badge || 'Gold'})</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Storage Note:</span>
                            <span className="truncate max-w-[150px] font-medium">{post.storageTempNotes}</span>
                          </div>
                        </div>

                        {/* Routing & NGO Involvement Indicator */}
                        <div className="pt-1">
                          {post.ngoInvolvement && post.assignedNgo ? (
                            <div className="p-2 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 text-[11px] flex items-center justify-between">
                              <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center space-x-1">
                                <span>🛡️ Transport: {post.assignedNgo.name}</span>
                              </span>
                              <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400">
                                {post.assignedNgo.trustScore ?? 98}% Trust
                              </span>
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-semibold flex items-center justify-between">
                              <span>🚀 Direct Kitchen Pickup</span>
                              <span className="text-[10px] text-emerald-600 font-bold">No Middleman</span>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Claim CTA Button */}
                      <button
                        onClick={() => setSelectedClaimPost(post)}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-transform hover:scale-102"
                      >
                        Claim Surplus Food 🎉
                      </button>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      ) : (
        /* MY RESCUED CLAIMS TAB */
        <div className="space-y-4">
          {myClaims.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <HeartHandshake className="w-12 h-12 mx-auto text-slate-400 opacity-40" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Rescued Claims Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch to the feed tab above to claim available surplus food for your shelter!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myClaims.map((claim) => (
                <div
                  key={claim._id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {claim.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>Donor: {claim.donor?.name} ({claim.donor?.phone})</span>
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {claim.status}
                      </span>
                    </div>

                    {/* NGO Delivery Status & Anti-Fraud Pill */}
                    {claim.assignedNgo && (
                      <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-purple-900 dark:text-purple-200 text-[11px]">
                          <span>🛡️ Delivery Partner: {claim.assignedNgo.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                            {claim.assignedNgo.trustScore ?? 98}% Trust Score
                          </span>
                        </div>

                        {claim.ratingRecipientToNgo?.stars > 0 ? (
                          <div className="text-[11px] pt-0.5 flex items-center justify-between text-slate-700 dark:text-slate-300">
                            <span>Your NGO Rating: ★ {claim.ratingRecipientToNgo.stars}</span>
                            {claim.ratingRecipientToNgo.isFraudReported ? (
                              <span className="text-rose-600 font-extrabold">⚠️ Fraud Reported</span>
                            ) : (
                              <span className="text-emerald-600 font-semibold">✓ Verified Honest</span>
                            )}
                          </div>
                        ) : (
                          claim.status === 'Collected' && (
                            <button
                              onClick={() => setSelectedRateNgoClaim(claim)}
                              className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline pt-0.5 block"
                            >
                              ⭐ Rate NGO Partner & Submit Anti-Fraud Review
                            </button>
                          )
                        )}
                      </div>
                    )}

                    <StatusTimeline
                      status={claim.status}
                      claimedByName={user?.name}
                      collectedAt={claim.collectedAt}
                    />
                  </div>

                  {claim.status === 'Claimed' && (
                    <button
                      onClick={() => setSelectedCollectPost(claim)}
                      className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                    >
                      Mark Collected & Rate Experience ★
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <ClaimConfirmationModal
        post={selectedClaimPost}
        isOpen={!!selectedClaimPost}
        onClose={() => setSelectedClaimPost(null)}
        onSuccess={() => fetchData()}
      />

      <MarkCollectedModal
        post={selectedCollectPost}
        isOpen={!!selectedCollectPost}
        onClose={() => setSelectedCollectPost(null)}
        onSuccess={() => fetchData()}
      />

      <RateNgoModal
        post={selectedRateNgoClaim}
        isOpen={!!selectedRateNgoClaim}
        onClose={() => setSelectedRateNgoClaim(null)}
        onSuccess={() => fetchData()}
        userRole="recipient"
      />

    </div>
  );
}
