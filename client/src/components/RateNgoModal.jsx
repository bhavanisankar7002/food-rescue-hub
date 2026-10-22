import React, { useState } from 'react';
import { X, Star, ShieldCheck, AlertTriangle, ThumbsUp, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const DONOR_TAGS = ['On-Time Logistics', 'Hygienic Transit', 'Transparent', 'Courteous Staff', 'Sealed Thermal Boxes'];
const RECIPIENT_TAGS = ['Full Quantity Received', 'Delivered Sealed', 'Punctual Handover', 'Courteous Staff', 'Fresh Temperature'];

export default function RateNgoModal({ post, isOpen, onClose, onSuccess, userRole = 'donor' }) {
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(5);
  const isDonor = userRole === 'donor';
  const tagList = isDonor ? DONOR_TAGS : RECIPIENT_TAGS;

  const [selectedTags, setSelectedTags] = useState(isDonor ? ['On-Time Logistics', 'Transparent'] : ['Full Quantity Received', 'Delivered Sealed']);
  const [comment, setComment] = useState('');
  const [isFraudReported, setIsFraudReported] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !post || !post.assignedNgo) return null;

  const ngo = post.assignedNgo;

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let res;
      if (isDonor) {
        res = await api.donorRateNgo(post._id, {
          stars,
          comment: comment || (isFraudReported ? 'Reported suspected irregularity during pickup.' : 'Smooth NGO logistics coordination.'),
          tags: selectedTags,
          isFraudReported,
        });
      } else {
        res = await api.recipientRateNgo(post._id, {
          stars,
          comment: comment || (isFraudReported ? 'Reported irregularity in food quantity or delivery.' : 'Food received in great condition via NGO partner.'),
          tags: selectedTags,
          isFraudReported,
        });
      }

      toast.success(res.message || 'NGO feedback submitted successfully!', {
        icon: isFraudReported ? '⚠️' : '🛡️',
      });
      if (onSuccess) onSuccess(res.post);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error saving NGO feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-enter">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-purple-50/60 dark:bg-purple-950/30">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {isDonor ? 'Donor Review of NGO Partner' : 'Recipient Review of NGO Delivery'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited feedback to prevent NGO fraud and reward honest partners
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

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* NGO Info Badge */}
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300">
                Involved NGO Organization
              </span>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                {ngo.name || 'Verified NGO'}
              </h4>
              <p className="text-[11px] text-slate-500">
                Post: {post.title}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-800">
                {ngo.trustScore ?? 98}% Trust Score
              </span>
            </div>
          </div>

          {/* Star Rating */}
          <div className="text-center space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Rate NGO Performance & Transparency (1-5 Stars)
            </label>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStars(star)}
                  onMouseEnter={() => setHoverStars(star)}
                  onMouseLeave={() => setHoverStars(stars)}
                  className="p-1 focus:outline-none transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= (hoverStars || stars)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Performance Highlights
            </label>
            <div className="flex flex-wrap gap-2">
              {tagList.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-400 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ✓ {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Review Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details on how the NGO handled food pickup and distribution..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Anti-Fraud Report Checkbox */}
          <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
            <div className="flex items-start space-x-2.5">
              <input
                type="checkbox"
                id="fraudCheck"
                checked={isFraudReported}
                onChange={(e) => setIsFraudReported(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="fraudCheck" className="text-xs cursor-pointer">
                <span className="font-bold text-rose-800 dark:text-rose-300 block">
                  Report Suspicious Behavior / Suspected Fraud
                </span>
                <span className="text-slate-600 dark:text-slate-300 text-[11px] leading-tight block">
                  Check this if the NGO failed to deliver, diverted food, demanded cash, or violated sanitation standards.
                </span>
              </label>
            </div>

            {isFraudReported && (
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 text-[11px] font-semibold flex items-center space-x-1.5 animate-enter">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Submitting this report will trigger a network safety audit and lower the NGO's trust score.</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20"
          >
            {submitting ? 'Submitting...' : isFraudReported ? 'Submit Fraud Audit Report' : 'Submit NGO Feedback'}
          </button>
        </div>

      </div>
    </div>
  );
}
