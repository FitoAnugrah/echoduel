import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';
import { fetchLeaderboard } from '../services/leaderboardService';
import { getAvatarUrl } from '../utils/avatar';
import Button from '../components/Button';

const medalStyles = {
  1: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-yellow-900 shadow-[0_0_15px_rgba(250,204,21,0.5)]',
  2: 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-800 shadow-[0_0_15px_rgba(203,213,225,0.5)]',
  3: 'bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600 text-orange-950 shadow-[0_0_15px_rgba(251,146,60,0.5)]',
};

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finalScores, setFinalScores] = useState(location.state?.finalScores || null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await fetchLeaderboard();
        const sorted = [...data].sort((a, b) => (a.rank || 0) - (b.rank || 0));
        setLeaderboard(sorted);
      } catch (error) {
        toast.error(error?.message || 'Unable to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const currentUserId = user?.id;
  const topThree = leaderboard.slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 text-[#4a4a6a]">
      <header className="relative overflow-hidden rounded-[2.5rem] bg-[#e0e5ec] p-6 shadow-neu sm:p-8">
        <div className="absolute -left-10 -top-10 h-40 w-40 animate-pulse-slow rounded-full bg-yellow-400 opacity-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#4a4a6a]">Leaderboard 🏆</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Track the highest-ranked EchoDuel players around the world.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/lobby')} className="min-w-[130px] rounded-full text-sm font-extrabold hover:-translate-y-0.5 transition-all">
              Back to Lobby
            </Button>
            <button
              onClick={() => navigate('/lobby')}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#a78bfa] to-fuchsia-500 px-6 py-3 text-sm font-extrabold text-white shadow-neu transition-all hover:scale-105 active:scale-95 min-w-[130px]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
              <span className="relative z-10 text-shadow-sm">Play Again</span>
            </button>
          </div>
        </div>
      </header>

      {finalScores && finalScores.length > 0 && (
        <div className="rounded-[2rem] bg-[#f8f2ff] p-6 shadow-neu">
          <h2 className="text-xl font-semibold text-[#4a4a6a]">Final Game Results</h2>
          <p className="mt-2 text-sm text-slate-500">Your last match results are shown here while the global leaderboard loads.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {finalScores.map((player) => (
              <div key={player.id} className="rounded-3xl bg-white p-5 shadow-neu-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{player.username}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{player.score}</p>
                <p className="mt-2 text-sm text-slate-500">Final score</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-[2rem] bg-[#f5f7fb] p-8 text-center text-slate-500 shadow-neu">Loading leaderboard...</div>
        ) : (
          topThree.map((player) => (
            <div key={player.id} className="group relative overflow-hidden rounded-[2.5rem] bg-[#e0e5ec] p-6 shadow-neu transition-all duration-300 hover:-translate-y-2 hover:shadow-[10px_10px_20px_#b8b9be,-10px_-10px_20px_#ffffff]">
              <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-br from-[#a78bfa] to-fuchsia-400 opacity-10 blur-2xl transition-transform duration-500 group-hover:scale-150"></div>
              
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={getAvatarUrl(player.avatar, player.username)} alt={player.username} className="h-16 w-16 rounded-full object-cover ring-4 ring-[#f5f7fb] shadow-neu-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#e0e5ec] text-xs shadow-neu-sm">
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#4a4a6a]">{player.username}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#a78bfa]">Score {player.score}</p>
                  </div>
                </div>
                <span className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider ${medalStyles[player.rank] || 'bg-slate-100 text-slate-600'}`}>
                  {player.rank === 1 ? 'Gold' : player.rank === 2 ? 'Silver' : 'Bronze'}
                </span>
              </div>
              <div className="relative z-10 mt-6 grid gap-4 text-sm text-[#4a4a6a]">
                <div className="flex items-center justify-between rounded-[2rem] bg-[#f5f7fb] px-5 py-4 shadow-neu-inset transition-colors group-hover:bg-white/50">
                  <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Games Played</p>
                  <p className="font-black text-lg">{player.gamesPlayed}</p>
                </div>
                <div className="flex items-center justify-between rounded-[2rem] bg-[#f5f7fb] px-5 py-4 shadow-neu-inset transition-colors group-hover:bg-white/50">
                  <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Win Rate</p>
                  <p className="font-black text-lg">{player.winRate}%</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-[2rem] bg-background p-6 shadow-neu">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Full Ranking</h2>
            <p className="text-sm text-slate-500">Browse player performance across the global leaderboard.</p>
          </div>
          <span className="rounded-full bg-[#f5f7fb] px-4 py-2 text-sm font-medium text-[#4a4a6a]">
            {leaderboard.length} players ranked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-left">
            <thead>
              <tr className="text-sm text-slate-500">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Games Played</th>
                <th className="px-4 py-3">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player) => {
                const isCurrent = player.id === currentUserId;
                return (
                  <tr key={player.id} className={`${isCurrent ? 'bg-[#f5efff] shadow-neu-sm' : ''}`}>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">{player.rank}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={getAvatarUrl(player.avatar, player.username)} alt={player.username} className="h-10 w-10 rounded-full object-cover" />
                        <div>
                          <p className="font-semibold text-slate-900">{player.username}</p>
                          <p className="text-xs text-slate-500">{player.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">{player.score}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-700">{player.gamesPlayed}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-700">{player.winRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardPage;
