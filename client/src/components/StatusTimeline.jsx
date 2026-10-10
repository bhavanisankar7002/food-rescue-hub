import React from 'react';
import { CheckCircle2, Circle, Clock, Check } from 'lucide-react';

export default function StatusTimeline({ status = 'Posted', claimedByName, collectedAt }) {
  const steps = [
    { key: 'Posted', label: 'Surplus Posted', desc: 'Listed on Rescue Feed' },
    { key: 'Claimed', label: 'Claimed', desc: claimedByName ? `By ${claimedByName}` : 'Awaiting recipient' },
    { key: 'Collected', label: 'Rescued', desc: collectedAt ? 'Pickup completed' : 'Pending pickup' },
  ];

  const getStepStatus = (stepKey) => {
    if (status === 'Expired' || status === 'Cancelled') {
      return 'disabled';
    }
    if (status === 'Collected') return 'completed';
    if (status === 'Claimed') {
      if (stepKey === 'Posted' || stepKey === 'Claimed') return 'completed';
      return 'pending';
    }
    if (status === 'Posted') {
      if (stepKey === 'Posted') return 'completed';
      return 'pending';
    }
    return 'pending';
  };

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
        
        {steps.map((step, idx) => {
          const stepStatus = getStepStatus(step.key);
          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  stepStatus === 'completed'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-50 dark:ring-emerald-950'
                    : stepStatus === 'disabled'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                {stepStatus === 'completed' ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span className={`text-[11px] font-medium mt-1.5 ${
                stepStatus === 'completed'
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {step.label}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[90px] text-center truncate">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
