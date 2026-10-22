import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShieldCheck, AlertTriangle, Clock, CheckCircle2, Flame, Thermometer } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const QUICK_CHIPS = [
  { name: 'Basmati Rice', quantity: 15, unit: 'kg', category: 'Cooked Meal' },
  { name: 'Dal Curry', quantity: 10, unit: 'L', category: 'Cooked Meal' },
  { name: 'Fresh Chapati', quantity: 50, unit: 'portions', category: 'Cooked Meal' },
  { name: 'Veg Biryani', quantity: 12, unit: 'kg', category: 'Cooked Meal' },
  { name: 'Bakery Breads', quantity: 20, unit: 'portions', category: 'Bakery' },
  { name: 'Fruit Salad', quantity: 15, unit: 'portions', category: 'Cooked Meal' },
];

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop',
];

export default function PostFoodModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [items, setItems] = useState([
    { name: 'Steamed Rice', quantity: 10, unit: 'kg', category: 'Cooked Meal' },
  ]);
  
  // Default prep time: 1 hour ago
  const now = new Date();
  const oneHrAgoStr = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const fiveHrsLaterStr = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [preparedAt, setPreparedAt] = useState(oneHrAgoStr);
  const [expiresAt, setExpiresAt] = useState(fiveHrsLaterStr);
  const [qualityChecked, setQualityChecked] = useState(true);
  const [storageTempNotes, setStorageTempNotes] = useState('Insulated hot hold container (>65°C)');
  const [dietaryType, setDietaryType] = useState('Veg');
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0]);

  // NGO Involvement & Anti-Fraud State
  const [ngoInvolvement, setNgoInvolvement] = useState(false);
  const [selectedNgoId, setSelectedNgoId] = useState('');
  const [ngoReason, setNgoReason] = useState('');
  const [ngoList, setNgoList] = useState([]);

  useEffect(() => {
    const loadNgos = async () => {
      try {
        const ngos = await api.getNgos();
        setNgoList(ngos);
        if (ngos.length > 0) setSelectedNgoId(ngos[0]._id);
      } catch (e) {
        console.warn('Failed loading NGOs', e);
      }
    };
    loadNgos();
  }, []);

  // Dynamic Risk Computation State
  const [risk, setRisk] = useState({ level: 'Low', reason: 'Freshly prepared' });

  useEffect(() => {
    if (!preparedAt || !expiresAt) return;
    const prep = new Date(preparedAt);
    const exp = new Date(expiresAt);
    const curr = new Date();

    const hoursSincePrep = (curr - prep) / (1000 * 60 * 60);
    const hoursToExpire = (exp - curr) / (1000 * 60 * 60);

    if (!qualityChecked) {
      setRisk({
        level: 'High',
        reason: 'Food safety quality verification checkbox must be checked.',
      });
      return;
    }

    if (hoursToExpire <= 0.5 || hoursSincePrep >= 6) {
      setRisk({
        level: 'High',
        reason: 'Food prepared over 6 hours ago or expiring in under 30 minutes. High food safety risk.',
      });
    } else if (hoursSincePrep >= 3 || hoursToExpire <= 2) {
      setRisk({
        level: 'Medium',
        reason: 'Prepared 3-6 hours ago. Best consumed within 2 hours of pickup.',
      });
    } else {
      setRisk({
        level: 'Low',
        reason: 'Freshly prepared within 3 hours under temperature control.',
      });
    }
  }, [preparedAt, expiresAt, qualityChecked]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 5, unit: 'kg', category: 'Cooked Meal' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      toast.error('At least one food item is required');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleQuickChipAdd = (chip) => {
    setItems(prev => {
      // Check if item already exists
      const exists = prev.find(i => i.name.toLowerCase() === chip.name.toLowerCase());
      if (exists) {
        return prev.map(i => i.name.toLowerCase() === chip.name.toLowerCase() ? { ...i, quantity: i.quantity + chip.quantity } : i);
      }
      return [...prev, chip];
    });
    toast.success(`Added ${chip.name}`);
  };

  const handleSubmit = async () => {
    if (risk.level === 'High') {
      toast.error(`Cannot submit post: ${risk.reason}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createPost({
        items,
        preparedAt,
        expiresAt,
        qualityChecked,
        storageTempNotes,
        dietaryType,
        imageUrl: selectedImage,
        ngoInvolvement,
        assignedNgo: ngoInvolvement ? selectedNgoId : null,
        ngoInvolvementReason: ngoInvolvement ? ngoReason : '',
      });

      toast.success(res.message || 'Surplus food posted successfully!');
      if (onSuccess) onSuccess(res.post);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to post food');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-enter">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Flame className="w-5 h-5 text-emerald-600" />
              <span>Post Surplus Food</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Step {step} of 3 — {step === 1 ? 'Food Items' : step === 2 ? 'Safety Check' : 'Review & Risk Assessment'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 flex">
          <div
            className="bg-emerald-500 transition-all duration-300 h-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: Food Items Builder */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Quick Add Popular Items
                </label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_CHIPS.map((chip) => (
                    <button
                      key={chip.name}
                      type="button"
                      onClick={() => handleQuickChipAdd(chip)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:border-emerald-300 transition-all"
                    >
                      + {chip.name} ({chip.quantity} {chip.unit})
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Items List
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row gap-3 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Item name (e.g. Rice, Dal)"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].name = e.target.value;
                        setItems(updated);
                      }}
                      className="flex-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].quantity = Number(e.target.value);
                          setItems(updated);
                        }}
                        className="w-20 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      />

                      <select
                        value={item.unit}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].unit = e.target.value;
                          setItems(updated);
                        }}
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="kg">kg</option>
                        <option value="L">Liters</option>
                        <option value="portions">portions</option>
                        <option value="boxes">boxes</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dietary Type Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Dietary Classification
                </label>
                <div className="flex space-x-3">
                  {['Veg', 'Non-Veg', 'Vegan'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDietaryType(type)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        dietaryType === type
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {type === 'Veg' ? '🌱 Veg' : type === 'Vegan' ? '🌿 Vegan' : '🍖 Non-Veg'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Safety Check & Timestamps */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Preparation Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={preparedAt}
                    onChange={(e) => setPreparedAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Safe Expiry Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Temperature & Storage Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Storage Condition & Temperature Notes
                </label>
                <div className="relative">
                  <Thermometer className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={storageTempNotes}
                    onChange={(e) => setStorageTempNotes(e.target.value)}
                    placeholder="e.g. Stored in hot casserole at >60°C"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Quality Check Mandate Checkbox */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="qualityCheck"
                  checked={qualityChecked}
                  onChange={(e) => setQualityChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="qualityCheck" className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                    Food Quality & Hygiene Check Verified
                  </span>
                  I confirm that this food has been stored hygienically, untouched by consumers, and meets FSSAI zero-waste safety standards.
                </label>
              </div>

              {/* NGO Involvement & Anti-Fraud Logistics Selection */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Distribution Method & NGO Involvement
                    </label>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      Anti-Fraud Protected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Direct recipient pickup avoids NGO middlemen. Alternatively, involve a verified NGO partner for bulk transport.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNgoInvolvement(false)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      !ngoInvolvement
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500 text-emerald-900 dark:text-emerald-200'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs mb-1">
                      <span>🚀 Direct to Recipient</span>
                      {!ngoInvolvement && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] opacity-80 leading-snug">
                      Avoids NGO intermediary. Care homes & shelters collect directly with zero middlemen delay.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNgoInvolvement(true)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      ngoInvolvement
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 ring-1 ring-purple-500 text-purple-900 dark:text-purple-200'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs mb-1">
                      <span>🛡️ Involve Verified NGO</span>
                      {ngoInvolvement && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] opacity-80 leading-snug">
                      Request audited NGO with thermal transport vans. Subject to two-sided fraud audits.
                    </p>
                  </button>
                </div>

                {ngoInvolvement && (
                  <div className="pt-2 space-y-3 border-t border-slate-200 dark:border-slate-700/60 mt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Select Verified NGO Partner (Trust-Rated & Audited)
                      </label>
                      <select
                        value={selectedNgoId}
                        onChange={(e) => setSelectedNgoId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {ngoList.map((n) => (
                          <option key={n._id} value={n._id}>
                            {n.name} (★ {n.rating || 4.8} • {n.trustScore ?? 98}% Trust Score • {n.badge || 'Verified NGO'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Assistance Reason / Dispatch Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        value={ngoReason}
                        onChange={(e) => setNgoReason(e.target.value)}
                        placeholder="e.g. Bulk donation (>20kg) requiring thermal vehicle transit"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Photo Preview
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_IMAGES.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt="Food preview option"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`w-full h-16 object-cover rounded-xl cursor-pointer border-2 transition-all ${
                        selectedImage === imgUrl
                          ? 'border-emerald-500 ring-2 ring-emerald-500/40 scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Risk Meter */}
          {step === 3 && (
            <div className="space-y-6">
              
              {/* Dynamic Risk Meter Banner */}
              <div
                className={`p-5 rounded-2xl border ${
                  risk.level === 'High'
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    : risk.level === 'Medium'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl text-white ${
                    risk.level === 'High' ? 'bg-rose-600' : risk.level === 'Medium' ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}>
                    {risk.level === 'High' ? (
                      <AlertTriangle className="w-6 h-6" />
                    ) : (
                      <ShieldCheck className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider opacity-80">
                      Live Risk Assessment Score
                    </span>
                    <h3 className="text-lg font-bold">
                      {risk.level} Risk Level
                    </h3>
                  </div>
                </div>
                <p className="text-xs mt-3 opacity-90 leading-relaxed">
                  {risk.reason}
                </p>

                {risk.level === 'High' && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-100 dark:bg-rose-900/60 font-semibold text-xs text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700">
                    🚫 Submission Blocked: Food safety parameters violated. Adjust preparation timestamp or check quality box to proceed.
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Donation Summary
                </h4>
                <ul className="divide-y divide-slate-200 dark:divide-slate-700 text-xs">
                  {items.map((item, idx) => (
                    <li key={idx} className="py-2 flex justify-between font-medium">
                      <span>{item.name}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {item.quantity} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Distribution & NGO Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Distribution Routing</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {ngoInvolvement
                      ? `Involving NGO: ${ngoList.find((n) => n._id === selectedNgoId)?.name || 'Verified NGO'}`
                      : 'Direct Recipient Pickup (No NGO Middleman)'}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                    ngoInvolvement
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {ngoInvolvement ? '🛡️ NGO Assisted' : '🚀 Direct Delivery'}
                </span>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (items.some(i => !i.name || !i.quantity)) {
                  toast.error('Please enter name and quantity for all items');
                  return;
                }
                setStep(step + 1);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
            >
              Next Step →
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || risk.level === 'High'}
              onClick={handleSubmit}
              className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all ${
                risk.level === 'High'
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20 hover:scale-105'
              }`}
            >
              {submitting ? 'Publishing Post...' : 'Publish Surplus Post 🎉'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
