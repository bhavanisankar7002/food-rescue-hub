import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { api } from '../services/api';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const res = await api.getStats();
        if (res.leaderboard) {
          setLeaderboard(res.leaderboard);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-600 via-emerald-700 to-teal-800 text-white shadow-xl text-center space-y-3 relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300">
          <Trophy className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Donor Honor Roll & Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-100 max-w-xl mx-auto">
          Celebrating top restaurants and hostels rescuing surplus food for charities.
        </p>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* #2 SILVER */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3 flex flex-col justify-between order-2 md:order-1">
            <div className="space-y-2">
              <span className="inline-flex px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs">
                🥈 Rank #2 — Silver Hero
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {leaderboard[1]?.name}
              </h3>
              <p className="text-xs text-slate-500">{leaderboard[1]?.orgType}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 font-extrabold text-emerald-600 text-xl">
              {leaderboard[1]?.kgRescued} kg rescued ({leaderboard[1]?.mealsServed} meals)
            </div>
          </div>

          {/* #1 GOLD */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-900 border-2 border-amber-400 shadow-xl text-center space-y-4 flex flex-col justify-between order-1 md:order-2 scale-105">
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xl shadow-lg">
                🥇
              </div>
              <span className="inline-flex px-3.5 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs">
                Rank #1 — Gold Champion
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {leaderboard[0]?.name}
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">{leaderboard[0]?.orgType}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-100 dark:bg-amber-950/80 font-black text-amber-900 dark:text-amber-200 text-2xl">
              {leaderboard[0]?.kgRescued} kg rescued ({leaderboard[0]?.mealsServed} meals)
            </div>
          </div>

          {/* #3 BRONZE */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3 flex flex-col justify-between order-3">
            <div className="space-y-2">
              <span className="inline-flex px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                🥉 Rank #3 — Bronze Star
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {leaderboard[2]?.name}
              </h3>
              <p className="text-xs text-slate-500">{leaderboard[2]?.orgType}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 font-extrabold text-emerald-600 text-xl">
              {leaderboard[2]?.kgRescued} kg rescued ({leaderboard[2]?.mealsServed} meals)
            </div>
          </div>

        </div>
      )}

      {/* FULL RANKINGS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-slate-100">
          Leaderboard Standings
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Organization</th>
                <th className="p-4">Type</th>
                <th className="p-4">Badge</th>
                <th className="p-4">Surplus Rescued</th>
                <th className="p-4">Meals Served</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaderboard.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-extrabold text-slate-900 dark:text-slate-100">#{idx + 1}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{item.name}</td>
                  <td className="p-4 text-slate-500">{item.orgType}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                      {item.badge}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold text-emerald-600">{item.kgRescued} kg</td>
                  <td className="p-4 font-bold">{item.mealsServed} meals</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
