import React from 'react';
import Button from './Button';

const difficultyStyles = {
  Easy: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-red-100 text-red-700',
};

const RoomCard = ({ room, onJoin }) => {
  return (
    <div className="neu-card rounded-[2rem] p-6 shadow-neu transition hover:-translate-y-1">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[#4a4a6a]">{room.name}</h3>
          <p className="mt-1 text-sm text-slate-500">Hosted by {room.host}</p>
        </div>
        <span className="rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-semibold text-[#4a4a6a]">
          {room.genre}
        </span>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyStyles[room.difficulty] || 'bg-slate-100 text-slate-700'}`}>
          {room.difficulty}
        </span>
        <span className="rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-semibold text-[#4a4a6a]">
          {room.currentPlayers}/{room.maxPlayers} players
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Mode</p>
          <p className="text-sm font-semibold text-[#4a4a6a]">{room.mode}</p>
        </div>
        <Button onClick={() => onJoin(room.id)} className="bg-[#a78bfa] text-white hover:bg-[#8b5cf6]">
          Join
        </Button>
      </div>
    </div>
  );
};

export default RoomCard;
