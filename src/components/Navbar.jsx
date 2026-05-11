import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBell, FaBars, FaSignOutAlt, FaTimes, FaUserFriends } from 'react-icons/fa';
import { useAuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import useSocket from '../hooks/useSocket';
import { useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    
    const handleRoomInvite = (data) => {
      toast(
        (t) => (
          <div>
            <p className="font-semibold text-sm">{data.hostName} invited you to a room!</p>
            <div className="mt-3 flex gap-2">
              <button 
                onClick={() => { toast.dismiss(t.id); navigate(`/game/${data.roomId}`); }}
                className="rounded bg-[#a78bfa] px-4 py-2 text-xs font-semibold text-white hover:bg-[#8b5cf6]"
              >Join Room</button>
              <button 
                onClick={() => toast.dismiss(t.id)}
                className="rounded bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-300"
              >Decline</button>
            </div>
          </div>
        ),
        { duration: 15000, position: 'top-center' }
      );
    };

    socket.on('room-invite', handleRoomInvite);
    return () => socket.off('room-invite', handleRoomInvite);
  }, [socket, navigate]);

  const avatarUrl =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Player')}&background=A78BFA&color=ffffff`;

  return (
    <header className="sticky top-0 z-30 bg-[#e0e5ec] shadow-neu">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <NavLink to="/lobby" className="text-xl font-bold tracking-tight text-[#4a4a6a]">
          EchoDuel
        </NavLink>

        <div className="hidden flex-1 justify-center sm:flex">
          <form 
            className="w-full max-w-xl"
            onSubmit={(e) => {
              e.preventDefault();
              const val = e.target.search.value.trim();
              if (val) {
                navigate('/friends', { state: { search: val } });
                e.target.search.value = '';
              }
            }}
          >
            <input
              name="search"
              type="search"
              placeholder="Search friends..."
              className="w-full rounded-full bg-[#e0e5ec] px-4 py-3 text-[#4a4a6a] shadow-neu-inset outline-none focus:ring-2 focus:ring-[#a78bfa]/30"
            />
          </form>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <button onClick={() => toast('No new notifications', { icon: '🔔' })} className="rounded-full bg-[#e0e5ec] p-3 text-[#4a4a6a] shadow-neu transition hover:shadow-neu-sm">
            <FaBell />
          </button>
          <button onClick={() => navigate('/friends')} className="rounded-full bg-[#e0e5ec] p-3 text-[#4a4a6a] shadow-neu transition hover:shadow-neu-sm">
            <FaUserFriends />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-full bg-[#e0e5ec] px-3 py-2 text-left shadow-neu transition hover:shadow-neu-sm"
            >
              <img src={avatarUrl} alt="User avatar" className="h-10 w-10 rounded-full object-cover" />
              <div className="hidden min-w-[120px] flex-col text-sm sm:flex">
                <span className="font-semibold text-[#4a4a6a]">{user?.username || 'Player'}</span>
                <span className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-3 w-48 rounded-[1.5rem] bg-[#e0e5ec] p-3 shadow-neu">
                <NavLink to="/profile" className="block rounded-3xl px-3 py-2 text-sm text-[#4a4a6a] transition hover:bg-[#f5f7fb]">
                  Profile
                </NavLink>
                <button onClick={() => { setMenuOpen(false); navigate('/settings'); }} className="mt-1 w-full rounded-3xl px-3 py-2 text-left text-sm text-[#4a4a6a] transition hover:bg-[#f5f7fb]">
                  Settings
                </button>
                <button
                  onClick={logout}
                  className="mt-1 flex w-full items-center gap-2 rounded-3xl px-3 py-2 text-sm text-[#4a4a6a] transition hover:bg-[#f5f7fb]"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          className="sm:hidden rounded-full bg-[#e0e5ec] p-3 text-[#4a4a6a] shadow-neu"
          onClick={() => setDrawerOpen(true)}
        >
          <FaBars />
        </button>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 sm:hidden">
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-[#e0e5ec] p-5 shadow-neu">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-[#4a4a6a]">EchoDuel</p>
                <p className="text-sm text-slate-500">{user?.username || 'Player'}</p>
              </div>
              <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-full bg-[#f5f7fb] p-2 text-[#4a4a6a] shadow-neu-sm">
                <FaTimes />
              </button>
            </div>
            <nav className="space-y-3">
              <NavLink onClick={() => setDrawerOpen(false)} to="/lobby" className="block rounded-3xl bg-[#e0e5ec] px-4 py-3 text-sm text-[#4a4a6a] shadow-neu transition hover:bg-[#f5f7fb]">
                Lobby
              </NavLink>
              <NavLink onClick={() => setDrawerOpen(false)} to="/profile" className="block rounded-3xl bg-[#e0e5ec] px-4 py-3 text-sm text-[#4a4a6a] shadow-neu transition hover:bg-[#f5f7fb]">
                Profile
              </NavLink>
              <NavLink onClick={() => setDrawerOpen(false)} to="/leaderboard" className="block rounded-3xl bg-[#e0e5ec] px-4 py-3 text-sm text-[#4a4a6a] shadow-neu transition hover:bg-[#f5f7fb]">
                Leaderboard
              </NavLink>
              <NavLink onClick={() => setDrawerOpen(false)} to="/friends" className="block rounded-3xl bg-[#e0e5ec] px-4 py-3 text-sm text-[#4a4a6a] shadow-neu transition hover:bg-[#f5f7fb]">
                Friends
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
                className="w-full rounded-3xl bg-[#e0e5ec] px-4 py-3 text-left text-sm text-[#4a4a6a] shadow-neu transition hover:bg-[#f5f7fb]"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
