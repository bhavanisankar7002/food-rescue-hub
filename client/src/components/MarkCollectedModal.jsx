import React, { useState } from 'react';
import { X, Star, CheckCircle, ThumbsUp, Heart, ShieldCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const RATING_TAGS = ['Hot & Fresh', 'Punctual Pickup', 'Hygienic Packaging', 'Polite Staff', 'Generous Portion'];
const NGO_RECIPIENT_TAGS = ['Full Quantity Received', 'Delivered Sealed', 'Punctual Handover', 'Courteous Staff', 'Hygienic Transport'];

export default function MarkCollectedModal({ post, isOpen, onClose, onSuccess }) {
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Hot & Fresh', 'Hygienic Packaging']);
  const [comment, setComment] = useState('Food collected in great condition. Thank you!');
  const [submitting, setSubmitting] = useState(false);

  // NGO Specific Feedback State (for Anti-Fraud)
  const [ngoStars, setNgoStars] = useState(5);
  const [selectedNgoTags, setSelectedNgoTags] = useState(['Full Quantity Received', 'Delivered Sealed']);
  const [isNgoFraud, setIsNgoFraud] = useState(false);
  const [ngoComment, setNgoComment] = useState('');

  if (!isOpen || !post) return null;

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleNgoTag = (tag) => {
    if (selectedNgoTags.includes(tag)) {
      setSelectedNgoTags(selectedNgoTags.filter(t => t !== tag));
    } else {
      setSelectedNgoTags([...selectedNgoTags, tag]);
    }
  };

  const handleMarkCollected = async () => {
    setSubmitting(true);
    try {
      const payload = {
        stars,
        comment,
        tags: selectedTags,
      };

      if (post.assignedNgo) {
        payload.ngoRating = {
          stars: ngoStars,
          comment: ngoComment || (isNgoFraud ? 'Recipient reported suspicious delivery activity.' : 'Satisfactory NGO delivery.'),
          tags: selectedNgoTags,
          isFraudReported: isNgoFraud,
        };
      }

      const res = await api.collectPost(post._id, payload);

      toast.success(res.message || 'Collection marked complete! Impact recorded.', { icon: '🎉' });
      if (onSuccess) onSuccess(res.post);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error marking collected');
    } finally {
      setSubmitting(false);
    }
  };

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
                Complete Pickup & Rate Donor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mark food collected and share donor feedback
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
          
          {/* Post item title */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
            <span className="text-slate-400 block mb-0.5">Claimed Item:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {post.title}
            </span>
          </div>

          {/* Star Rating Selector */}
          <div className="text-center space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Rate Donor Experience (1-5 Stars)
            </label>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStars(star)}
                  onMouseEnter={() => setHoverStars(star)}
                  onMouseLeave={() => setHoverStars(stars)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-125"
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

          {/* Appreciation Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Highlights / Compliments
            </label>
            <div className="flex flex-wrap gap-2">
              {RATING_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ✓ {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Comment Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Feedback Notes for Donor (Optional)
            </label>
            <textarea
              rows="2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us how the food helped your beneficiaries..."
              className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* RECIPIENT REVIEW OF INVOLVED NGO (ANTI-FRAUD AUDIT) */}
          {post.assignedNgo && (
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3.5 animate-enter">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-extrabold text-xs text-purple-900 dark:text-purple-200">
                    Rate NGO Delivery: {post.assignedNgo.name || 'Assigned NGO'}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-extrabold">
                  Anti-Fraud Audit
                </span>
              </div>

              {/* Star rating for NGO */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Delivery & Quantity Accuracy:
                </span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNgoStars(s)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          s <= ngoStars ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* NGO Highlights Tags */}
              <div className="flex flex-wrap gap-1.5">
                {NGO_RECIPIENT_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleNgoTag(tag)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium border transition-all ${
                      selectedNgoTags.includes(tag)
                        ? 'bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 border-purple-400 font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ✓ {tag}
                  </button>
                ))}
              </div>

              {/* Anti-Fraud Checkbox */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 space-y-1.5">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="recipientFraudCheck"
                    checked={isNgoFraud}
                    onChange={(e) => setIsNgoFraud(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
                  />
                  <label htmlFor="recipientFraudCheck" className="text-[11px] text-rose-900 dark:text-rose-200 font-bold cursor-pointer">
                    Report Fraud / Discrepancy (Food missing, spoiled, or money demanded)
                  </label>
                </div>
                {isNgoFraud && (
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-[10px] text-rose-800 dark:text-rose-300 font-semibold flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span>This report will immediately flag the NGO and deduct 25 trust points.</span>
                  </div>
                )}
              </div>
            </div>
          )}

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
            onClick={handleMarkCollected}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            {submitting ? 'Submitting...' : 'Mark Collected & Submit Rating'}
          </button>
        </div>

      </div>
    </div>
  );
}
