import React, { useState } from 'react';
import { X, CheckCircle, MapPin, Phone, Clock, Utensils, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export default function ClaimConfirmationModal({ post, isOpen, onClose, onSuccess }) {
  const [claiming, setClaiming] = useState(false);

  if (!isOpen || !post) return null;

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await api.claimPost(post._id);
      
      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success(res.message || 'Food claimed successfully!');
      if (onSuccess) onSuccess(res.post);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error claiming food post');
    } finally {
      setClaiming(false);
    }
  };

  const donor = post.donor || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-enter">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/30">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Confirm Food Claim
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reserve food for your shelter / care home
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* Item details card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>{post.title}</span>
            </h4>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                {post.totalWeightKg} kg ({post.estimatedMeals} meals)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
                {post.dietaryType}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                Risk: {post.riskLevel}
              </span>
            </div>
          </div>

          {/* Donor details */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Donor Organization:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{donor.name || 'Verified Donor'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Phone Contact:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5" />
                <span>{donor.phone || '+91 98765 43210'}</span>
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500">Pickup Address:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 max-w-[220px] text-right flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span>{donor.address || post.pickupAddress}</span>
              </span>
            </div>
          </div>

          {/* Pickup Terms Warning */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              By claiming, you agree to collect the food within 60 minutes and follow sanitary transport guidelines.
            </span>
          </div>

        </div>

        {/* Action Controls */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            {claiming ? 'Claiming Food...' : 'Confirm Claim Food'}
          </button>
        </div>

      </div>
    </div>
  );
}
