import React from 'react';
import { Bell, Check, Utensils, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAllRead, setIsPanelOpen } = useNotifications();

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-enter">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium flex items-center space-x-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notification Items List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No new notifications yet.
          </div>
        ) : (
          notifications.map((n) => {
            let Icon = Info;
            let iconBg = 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400';
            if (n.type === 'new_post') {
              Icon = Utensils;
              iconBg = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400';
            } else if (n.type === 'claim_update') {
              Icon = CheckCircle;
              iconBg = 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400';
            } else if (n.type === 'safety_alert') {
              Icon = AlertTriangle;
              iconBg = 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400';
            }

            return (
              <div
                key={n._id}
                className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start space-x-3 ${
                  !n.isRead ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                }`}
              >
                <div className={`p-2 rounded-xl text-xs flex-shrink-0 ${iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {n.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 text-center border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setIsPanelOpen(false)}
          className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium"
        >
          Close panel
        </button>
      </div>

    </div>
  );
}
