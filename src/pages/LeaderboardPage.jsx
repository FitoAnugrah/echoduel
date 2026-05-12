import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';
import { fetchLeaderboard } from '../services/leaderboardService';
import { getAvatarUrl } from '../utils/avatar';
import Button from '../components/Button';

const medalStyles = {
  1: 'bg-[#fde68a] text-[#92400e]',
  2: 'bg-[#e2e8f0] text-[#475569]',
  3: 'bg-[#f4d5b2] text-[#713f12]',
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
      <header className="rounded-[2rem] bg-background p-6 shadow-neu">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>
            <p className="mt-2 text-slate-500">Track the highest-ranked EchoDuel players around the world.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/lobby')} className="min-w-[130px]">
              Back to Lobby
            </Button>
            <Button onClick={() => navigate('/lobby')} className="min-w-[130px] bg-[#a78bfa] text-white hover:bg-[#8b5cf6]">
              Play Again
            </Button>
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
            <div key={player.id} className="rounded-[2rem] bg-background p-5 shadow-neu">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={getAvatarUrl(player.avatar, player.username)} alt={player.username} className="h-16 w-16 rounded-full object-cover" />
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{player.username}</p>
                    <p className="text-sm text-slate-500">Score {player.score}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${medalStyles[player.rank] || 'bg-slate-100 text-slate-600'}`}>
                  {player.rank === 1 ? 'Gold' : player.rank === 2 ? 'Silver' : 'Bronze'}
                </span>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <div className="rounded-3xl bg-[#f5f7fb] p-4">
                  <p className="font-semibold text-slate-900">Games Played</p>
                  <p className="mt-2">{player.gamesPlayed}</p>
                </div>
                <div className="rounded-3xl bg-[#f5f7fb] p-4">
                  <p className="font-semibold text-slate-900">Win Rate</p>
                  <p className="mt-2">{player.winRate}%</p>
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
