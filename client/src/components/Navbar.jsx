import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  UtensilsCrossed, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  ShieldCheck, 
  Trophy, 
  BarChart3, 
  User, 
  Home, 
  PlusCircle, 
  LayoutDashboard,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar({ onOpenPostModal }) {
  const { user, role, logout, theme, toggleTheme, demoLogin } = useAuth();
  const { unreadCount, togglePanel, isPanelOpen } = useNotifications();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Determine user dashboard route
  const getDashboardRoute = () => {
    if (role === 'donor') return '/donor-dashboard';
    if (role === 'recipient') return '/recipient-dashboard';
    if (role === 'ngo') return '/ngo-dashboard';
    return '/';
  };

  return (
    <>
      {/* Desktop Topbar Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ZeroWaste
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Rescue Hub
              </span>
            </div>
          </Link>

          {/* Role-Based Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              Home
            </Link>

            {user && (
              <Link
                to={getDashboardRoute()}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive(getDashboardRoute())
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* Leaderboard: NGO and Donor only */}
            {(!user || role === 'ngo' || role === 'donor') && (
              <Link
                to="/leaderboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/leaderboard')
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Leaderboard</span>
              </Link>
            )}

            {/* Impact: NGO only */}
            {(!user || role === 'ngo') && (
              <Link
                to="/impact"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/impact')
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-teal-500" />
                <span>Impact</span>
              </Link>
            )}

            {/* Monitoring: NGO only */}
            {(!user || role === 'ngo') && (
              <Link
                to="/monitoring"
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 ${
                  isActive('/monitoring') ? 'bg-purple-100 dark:bg-purple-950 font-bold ring-1 ring-purple-500' : ''
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Monitoring</span>
              </Link>
            )}
          </nav>

          {/* Action Tools & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Post Button: Donor ONLY */}
            {user && role === 'donor' && onOpenPostModal && (
              <button
                onClick={onOpenPostModal}
                className="hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Surplus</span>
              </button>
            )}

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>

            {/* Notification Bell: Recipient ONLY */}
            {user && role === 'recipient' && (
              <div className="relative">
                <button
                  onClick={togglePanel}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 relative transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-subtle shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {isPanelOpen && <NotificationDropdown />}
              </div>
            )}

            {/* Auth Buttons or Profile Badge */}
            {user ? (
              <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Log In
                </Link>
                <button
                  onClick={() => demoLogin('donor')}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
                >
                  Demo Login
                </button>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around shadow-lg">
        <Link
          to="/"
          className={`flex flex-col items-center text-xs space-y-1 ${
            isActive('/') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        {user ? (
          <Link
            to={getDashboardRoute()}
            className={`flex flex-col items-center text-xs space-y-1 ${
              isActive(getDashboardRoute())
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={`flex flex-col items-center text-xs space-y-1 ${
              isActive('/login') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Login</span>
          </Link>
        )}

        {(!user || role === 'ngo' || role === 'donor') && (
          <Link
            to="/leaderboard"
            className={`flex flex-col items-center text-xs space-y-1 ${
              isActive('/leaderboard') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Ranks</span>
          </Link>
        )}

        {(!user || role === 'ngo') && (
          <Link
            to="/monitoring"
            className={`flex flex-col items-center text-xs space-y-1 ${
              isActive('/monitoring') ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Activity className="w-5 h-5 text-purple-600" />
            <span>Monitoring</span>
          </Link>
        )}
      </div>
    </>
  );
}
