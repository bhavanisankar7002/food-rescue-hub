import React, { useState } from 'react';
import { MapPin, Navigation, Utensils, ShieldCheck, Phone, CheckCircle2 } from 'lucide-react';

export default function InteractiveMap({ posts = [], onSelectPost }) {
  const [selectedPin, setSelectedPin] = useState(null);

  // Map coordinates (centered around Bengaluru area for demo pins)
  const pins = posts.map((p, idx) => {
    const lat = p.donor?.coordinates?.lat || (12.9352 + (idx % 3) * 0.02);
    const lng = p.donor?.coordinates?.lng || (77.6245 + (idx % 2) * 0.03);
    // Convert lat/lng to percentage X/Y on SVG canvas (600x400)
    const x = Math.min(85, Math.max(15, 25 + (idx * 22) % 60));
    const y = Math.min(85, Math.max(15, 25 + (idx * 18) % 55));
    return {
      post: p,
      x,
      y,
      donorName: p.donor?.name || 'Verified Donor',
      risk: p.riskLevel || 'Low',
    };
  });

  return (
    <div className="relative w-full h-[420px] rounded-3xl bg-slate-900 overflow-hidden border border-slate-800 shadow-xl group">
      
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(#10b981 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Recipient User Center Pulse Ring (Simulated location radius) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 rounded-full border border-emerald-500/30 bg-emerald-500/5 animate-ping" />
        <div className="w-24 h-24 rounded-full border border-teal-500/50 bg-teal-500/10" />
        <div className="w-6 h-6 rounded-full bg-teal-400 border-2 border-white flex items-center justify-center text-white shadow-lg text-[10px] font-bold">
          YOU
        </div>
      </div>

      {/* Donor Location Pins */}
      {pins.map((pin, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group/pin"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          onClick={() => {
            setSelectedPin(pin);
            if (onSelectPost) onSelectPost(pin.post);
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Tooltip Tag */}
            <div className="hidden group-hover/pin:flex whitespace-nowrap mb-1 px-2.5 py-1 bg-white dark:bg-slate-900 rounded-xl shadow-xl text-[11px] font-bold text-slate-800 dark:text-slate-100 border border-emerald-500/30">
              {pin.donorName} • {pin.post.totalWeightKg}kg
            </div>

            {/* Pin Badge */}
            <div className={`p-2.5 rounded-full shadow-lg transition-transform hover:scale-125 border-2 border-white ${
              pin.risk === 'High'
                ? 'bg-rose-500 text-white'
                : pin.risk === 'Medium'
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}>
              <Utensils className="w-4 h-4" />
            </div>

            <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[9px] font-semibold border border-slate-700">
              {pin.post.totalWeightKg} kg
            </span>
          </div>
        </div>
      ))}

      {/* Selected Pin Drawer Banner */}
      {selectedPin && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/40 shadow-2xl flex items-center justify-between z-30 animate-enter">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {selectedPin.post.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {selectedPin.donorName} • {selectedPin.post.totalWeightKg} kg ({selectedPin.post.estimatedMeals} meals)
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectPost && onSelectPost(selectedPin.post)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
          >
            Claim This Food
          </button>
        </div>
      )}

      {/* Legend Badge */}
      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 flex items-center space-x-3">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>Low Risk</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          <span>Medium Risk</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
          <span>Your Location</span>
        </span>
      </div>

    </div>
  );
}
