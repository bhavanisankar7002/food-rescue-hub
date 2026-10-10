import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, Utensils, Sparkles, Building, Lock, Mail, Phone, MapPin, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('donor');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgType, setOrgType] = useState('Restaurant');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = (userRole) => {
    if (userRole === 'donor') navigate('/donor-dashboard');
    else if (userRole === 'recipient') navigate('/recipient-dashboard');
    else navigate('/ngo-dashboard');
  };

  const handleDemoClick = async (demoRole) => {
    setLoading(true);
    try {
      const user = await demoLogin(demoRole);
      redirectByRole(user.role);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const user = await login(email, password);
        redirectByRole(user.role);
      } else {
        const user = await register({
          name,
          email,
          password,
          role,
          orgType,
          phone,
          address,
        });
        redirectByRole(user.role);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {isLogin ? 'Sign In to ZeroWaste' : 'Create ZeroWaste Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Connect surplus food to verified charities in your city
          </p>
        </div>

        {/* Demo Login Panel for Evaluators */}
        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Instant Demo Login</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('donor')}
              disabled={loading}
              className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-md flex items-center justify-center space-x-1"
            >
              <Utensils className="w-3 h-3" />
              <span>Donor</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('recipient')}
              disabled={loading}
              className="py-2.5 px-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-md flex items-center justify-center space-x-1"
            >
              <HeartHandshake className="w-3 h-3" />
              <span>Recipient</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('ngo')}
              disabled={loading}
              className="py-2.5 px-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-md flex items-center justify-center space-x-1"
            >
              <Activity className="w-3 h-3" />
              <span>NGO</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isLogin
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                !isLogin
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Register
            </button>
          </div>

          {/* 3 Role Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Account Role
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center space-x-1 ${
                  role === 'donor'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Utensils className="w-3 h-3" />
                <span>Donor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('recipient')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center space-x-1 ${
                  role === 'recipient'
                    ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <HeartHandshake className="w-3 h-3" />
                <span>Recipient</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ngo')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center space-x-1 ${
                  role === 'ngo'
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>NGO</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {!isLogin && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Organization / User Name *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={role === 'donor' ? 'e.g. GreenBite Eatery' : role === 'recipient' ? 'e.g. Hope Haven Shelter' : 'e.g. City Food Rescue NGO'}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  >
                    {role === 'donor' ? (
                      <>
                        <option value="Restaurant">Restaurant / Bistro</option>
                        <option value="Hostel/PG">Hostel / PG Mess</option>
                        <option value="Bakery">Bakery & Cafe</option>
                        <option value="Banquet">Banquet & Event Catering</option>
                      </>
                    ) : role === 'recipient' ? (
                      <>
                        <option value="Shelter">Homeless Shelter</option>
                        <option value="Old Age Home">Old Age Care Home</option>
                        <option value="Orphanage">Child Orphanage</option>
                        <option value="NGO">Community Charity</option>
                      </>
                    ) : (
                      <option value="NGO">Community NGO / Oversight</option>
                    )}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, Area, City"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
            >
              {loading
                ? 'Processing...'
                : isLogin
                ? `Sign In as ${role.toUpperCase()}`
                : `Create ${role.toUpperCase()} Account`}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
