import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        </div>
      </div>
      <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-24" />
      </div>
    </div>
  );
}
