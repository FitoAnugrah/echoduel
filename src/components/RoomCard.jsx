import React from 'react';
import { FaMusic, FaUsers, FaPlay } from 'react-icons/fa';

const difficultyStyles = {
  Easy: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Medium: 'bg-amber-100 text-amber-700 ring-amber-200',
  Hard: 'bg-red-100 text-red-700 ring-red-200',
};

const difficultyInfo = {
  Easy: '3 Rds · 30s',
  Medium: '5 Rds · 25s',
  Hard: '7 Rds · 20s',
};

const RoomCard = ({ room, onJoin }) => {
  const isFull = room.currentPlayers >= room.maxPlayers;

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] bg-[#e0e5ec] p-6 shadow-neu transition-all duration-300 hover:-translate-y-2 hover:shadow-[10px_10px_20px_#b8b9be,-10px_-10px_20px_#ffffff]">
      {/* Decorative gradient blob */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-[#a78bfa] to-fuchsia-400 opacity-20 blur-2xl transition-transform duration-500 group-hover:scale-150"></div>

      <div className="relative z-10 mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f7fb] shadow-neu-inset text-[#a78bfa] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            <FaMusic className="text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#4a4a6a] line-clamp-1">{room.name}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Host: {room.host}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-gradient-to-r from-[#a78bfa] to-fuchsia-400 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-sm">
          {room.genre}
        </span>
        <span className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider ring-1 ${difficultyStyles[room.difficulty] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
          {room.difficulty}
        </span>
        <span className="rounded-full bg-[#f5f7fb] px-4 py-1.5 text-[10px] font-bold text-slate-500 shadow-neu-inset uppercase tracking-widest">
          {difficultyInfo[room.difficulty] || '3 Rds · 30s'}
        </span>
      </div>

      <div className="relative z-10 flex items-end justify-between border-t border-white/50 pt-5">
        <div className="flex items-center gap-2 rounded-full bg-[#f5f7fb] px-4 py-2 shadow-neu-inset">
          <FaUsers className={isFull ? 'text-red-500' : 'text-[#a78bfa]'} />
          <span className={`text-sm font-black ${isFull ? 'text-red-600' : 'text-[#4a4a6a]'}`}>
            {room.currentPlayers} <span className="text-slate-400 font-medium">/ {room.maxPlayers}</span>
          </span>
        </div>
        
        <button
          onClick={() => onJoin(room.id)}
          disabled={isFull}
          className={`group/btn flex items-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold shadow-neu transition-all duration-300 ${
            isFull
              ? 'bg-[#e0e5ec] text-slate-400 cursor-not-allowed shadow-neu-inset'
              : 'bg-[#a78bfa] text-white hover:bg-[#8b5cf6] hover:shadow-neu-sm hover:-translate-y-0.5 active:shadow-neu-inset'
          }`}
        >
          {isFull ? 'FULL' : 'JOIN'}
          {!isFull && <FaPlay className="text-xs transition-transform group-hover/btn:translate-x-1" />}
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
