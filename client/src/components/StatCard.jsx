import React from 'react';

export default function StatCard({ title, value, unit = '', subtitle, icon: Icon, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400 border-teal-200 dark:border-teal-800/50',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
  };

  const styleClass = colorMap[color] || colorMap.emerald;

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && (
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl border transition-transform group-hover:scale-110 ${styleClass}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
