import React, { useEffect, useMemo, useRef, useState } from 'react';

const ScoreBoard = ({ scores = [], flashIds = [] }) => {
  const prevScoresRef = useRef([]);
  const [highlighted, setHighlighted] = useState([]);

  const sortedScores = useMemo(() => {
    return [...scores].sort((a, b) => b.score - a.score);
  }, [scores]);

  useEffect(() => {
    const changes = sortedScores
      .filter((current) => {
        const previous = prevScoresRef.current.find((item) => item.id === current.id);
        return previous && previous.score !== current.score;
      })
      .map((item) => item.id);

    if (changes.length) {
      setHighlighted(changes);
      const timeout = setTimeout(() => setHighlighted([]), 800);
      prevScoresRef.current = sortedScores;
      return () => clearTimeout(timeout);
    }

    prevScoresRef.current = sortedScores;
  }, [sortedScores]);

  return (
    <div className="neu-card rounded-[2rem] p-5 shadow-neu">
      <h2 className="mb-4 text-lg font-semibold text-[#4a4a6a]">Live Scoreboard</h2>
      <div className="space-y-3">
        {sortedScores.length === 0 ? (
          <div className="rounded-3xl bg-[#f5f7fb] p-4 text-sm text-slate-500">No scores yet. Stay tuned.</div>
        ) : (
          sortedScores.map((player, index) => {
            const isHighlighted = highlighted.includes(player.id) || flashIds.includes(player.id);
            const avatar = player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.username)}&background=A78BFA&color=ffffff`;
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between gap-3 rounded-3xl px-4 py-3 transition ${
                  isHighlighted ? 'bg-[#a78bfa]/20 ring-1 ring-[#a78bfa]/40' : 'bg-white/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#4a4a6a]">{index + 1}</span>
                  <img src={avatar} alt={player.username} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-[#4a4a6a]">{player.username}</p>
                    <p className="text-xs text-slate-500">{player.score} pts</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#4a4a6a]">{player.score}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ScoreBoard;
