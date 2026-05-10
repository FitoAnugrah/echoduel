import React from 'react';

// Compact player metadata card.
const PlayerCard = ({ name, score, isActive }) => {
  return (
    <div className="neu-card flex items-center justify-between gap-4 rounded-3xl px-4 py-4">
      <div>
        <p className="text-sm font-medium text-slate-900">{name}</p>
        <p className="text-xs text-slate-500">Score: {score}</p>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? 'bg-accent/20 text-accent' : 'bg-slate-200 text-slate-600'}`}>
        {isActive ? 'Active' : 'Waiting'}
      </span>
    </div>
  );
};

export default PlayerCard;
