import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Track toasted notification IDs to dedupe and ensure max 1 toast per new alert
  const toastedNotifIdsRef = useRef(new Set());
  const isInitializedRef = useRef(false);

  // Clear notification state on logout or user switch
  useEffect(() => {
    setNotifications([]);
    setUnreadCount(0);
    setIsPanelOpen(false);
    toastedNotifIdsRef.current = new Set();
    isInitializedRef.current = false;
  }, [user?._id]);

  const fetchNotifications = async () => {
    // REQUIREMENT 6: Notifications go strictly to users with role "recipient"
    if (!user || user.role !== 'recipient') {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const data = await api.getNotifications();
      const notifs = data.notifications || [];
      const count = data.unreadCount || 0;

      const userLastSeenKey = `zerowaste_last_seen_notif_${user._id}`;
      const lastSeenId = localStorage.getItem(userLastSeenKey);

      // On first boot/login for this user: initialize baseline, DO NOT toast existing backlog!
      if (!isInitializedRef.current) {
        if (notifs.length > 0) {
          const newestId = notifs[0]._id;
          localStorage.setItem(userLastSeenKey, newestId);
          // Mark existing ones as already "seen" so backlog doesn't pop up
          notifs.forEach(n => toastedNotifIdsRef.current.add(n._id));
        }
        isInitializedRef.current = true;
        setNotifications(notifs);
        setUnreadCount(count);
        return;
      }

      // Check for truly NEW notifications since last seen baseline during polling
      if (notifs.length > 0) {
        const latestNotif = notifs[0];
        
        if (
          latestNotif._id !== lastSeenId &&
          !toastedNotifIdsRef.current.has(latestNotif._id) &&
          !latestNotif.isRead
        ) {
          toastedNotifIdsRef.current.add(latestNotif._id);
          localStorage.setItem(userLastSeenKey, latestNotif._id);

          // Trigger max ONE toast at a time
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white dark:bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-emerald-500/30 p-4 border-l-4 border-emerald-500 text-slate-900 dark:text-slate-100`}
            >
              <div className="flex-1 w-0">
                <div className="flex items-start">
                  <div className="text-2xl mr-3">🔔</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold">
                      {latestNotif.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {latestNotif.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ), { id: `notif-${latestNotif._id}`, duration: 5000 });
        }
      }

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err) {
      // Silent catch for background polling
    }
  };

  useEffect(() => {
    if (user && user.role === 'recipient') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 4000);
      return () => clearInterval(interval);
    }
  }, [user?._id, user?.role]);

  const markAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const togglePanel = () => {
    setIsPanelOpen(prev => !prev);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isPanelOpen,
        togglePanel,
        setIsPanelOpen,
        markAllRead,
        refetchNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
