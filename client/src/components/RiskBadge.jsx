import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export default function RiskBadge({ level = 'Low', expiresAt, reason, showCountdown = true }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const exp = new Date(expiresAt);
      const diffMs = exp - now;

      if (diffMs <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  let bgClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
  let Icon = ShieldCheck;
  let label = 'Low Risk';

  if (isExpired) {
    bgClass = 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300';
    Icon = AlertTriangle;
    label = 'Expired';
  } else if (level === 'High') {
    bgClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    Icon = AlertTriangle;
    label = 'High Risk';
  } else if (level === 'Medium') {
    bgClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    Icon = Clock;
    label = 'Medium Risk';
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Risk Pill */}
      <span
        title={reason || label}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bgClass}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </span>

      {/* Expiry Countdown */}
      {showCountdown && expiresAt && (
        <span
          className={`inline-flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded-md ${
            isExpired
              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{timeLeft}</span>
        </span>
      )}
    </div>
  );
}
