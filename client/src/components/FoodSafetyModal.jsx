import React from 'react';
import { X, ShieldCheck, Thermometer, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function FoodSafetyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-enter">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/30">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                ZeroWaste Food Safety Protocol
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                FSSAI & WHO Aligned Guidelines for Surplus Food Rescue
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Rule 1: The 4-Hour Rule */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>1. The 4-Hour Hot & Cold Window</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Cooked hot food must be maintained above <strong>60°C (140°F)</strong> or consumed within <strong>4 hours</strong> of preparation. Cold perishable items (salads, dairy) must be maintained below <strong>5°C (41°F)</strong>.
            </p>
          </div>

          {/* Rule 2: Temperature Zones */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
              <Thermometer className="w-4 h-4" />
              <span>2. Temperature Danger Zone (5°C to 60°C)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Food stored within the temperature danger zone for over 4 hours accelerates bacterial growth and is automatically classified as <strong>High Risk</strong>. High Risk food cannot be listed on ZeroWaste.
            </p>
          </div>

          {/* Rule 3: Packaging & Transport */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>3. Hygienic Packaging & Sealed Transport</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Food must be untouched by consumers (unserved kitchen surplus only).</li>
              <li>Containers must be food-grade aluminium foil, food-safe plastic, or thermal stainless steel.</li>
              <li>Receiving volunteers must wear clean gloves and masks during collection.</li>
            </ul>
          </div>

          {/* Safety Guarantee Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-medium">
            🛡️ ZeroWaste Risk Engine automatically calculates food risk level based on preparation timestamps, ambient temperatures, and donor quality verifications.
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md"
          >
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );
}
