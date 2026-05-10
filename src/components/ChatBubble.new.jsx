import React from 'react';

const ChatBubble = ({ message, isSent, senderName, timestamp }) => {
  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[82%] rounded-[2rem] p-4 shadow-neu-sm ${isSent ? 'bg-[#a78bfa] text-white' : 'bg-[#f8fafc] text-[#1f2937]'}`}>
        {!isSent && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{senderName}</p>}
        <p className="mt-2 text-sm leading-7">{message}</p>
        <p className="mt-3 text-right text-[11px] uppercase tracking-[0.2em] text-slate-400">{timestamp}</p>
      </div>
    </div>
  );
};

export default ChatBubble;
