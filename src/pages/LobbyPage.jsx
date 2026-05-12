import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import RoomCard from '../components/RoomCard';
import { createRoom, getRooms, joinRoom } from '../services/roomService';
import { getFriends } from '../services/friendService';
import { useAuthContext } from '../context/AuthContext';

const genres = ['All', 'Pop Indo', 'Pop Barat', 'K-Pop', 'Rock', 'Indonesia Populer', 'Global Populer', 'Jazz', 'Hip Hop', 'Hip Dut', 'Alt Rock Indo'];
const difficulties = ['Easy', 'Medium', 'Hard'];
const maxPlayersOptions = ['2', '4'];

const LobbyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [activeGenre, setActiveGenre] = useState('All');
  const [rooms, setRooms] = useState([]);
  const [friends, setFriends] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [form, setForm] = useState({
    name: '',
    genre: 'Pop Indo',
    customArtist: '',
    difficulty: 'Easy',
    maxPlayers: '2',
  });

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const fetchedRooms = await getRooms(activeGenre);
      setRooms(fetchedRooms);
    } catch (err) {
      toast.error('Failed to load rooms');
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 10000);
    return () => clearInterval(interval);
  }, [activeGenre]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await getFriends();
        setFriends(data);
      } catch (err) {
        console.error("Failed to fetch friends");
      }
    };
    fetchFriends();
  }, []);

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    setCreatingRoom(true);

    try {
      console.log("Frontend mengirim:", form.genre, form.difficulty);
      const finalGenre = form.genre === 'Custom Artist' && form.customArtist.trim() 
        ? form.customArtist.trim() 
        : form.genre;

      const room = await createRoom({
        name: form.name || `${finalGenre} Room`,
        genre: finalGenre,
        difficulty: form.difficulty,
        maxPlayers: Number(form.maxPlayers),
      });

      setModalOpen(false);
      setForm({ name: '', genre: 'Pop Indo', customArtist: '', difficulty: 'Easy', maxPlayers: '2' });
      navigate(`/game/${room.id}`, { state: { fallbackName: form.name || `${finalGenre} Room`, fallbackGenre: finalGenre, fallbackDifficulty: form.difficulty } });
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create room. Please try again.';
      toast.error(message);
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleJoin = async (roomId) => {
    try {
      await joinRoom(roomId);
      navigate(`/game/${roomId}`);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to join room.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e5ec] text-[#4a4a6a]">
      <div className="mx-auto grid gap-6 px-4 py-6 sm:px-6 lg:max-w-7xl lg:grid-cols-[280px_1fr]">
        <aside className="hidden flex-col gap-4 lg:flex">
          <div className="rounded-[2rem] bg-[#e0e5ec] p-5 shadow-neu">
            <h2 className="mb-4 text-lg font-semibold text-[#4a4a6a]">Online Friends</h2>
            <div className="space-y-3">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between rounded-3xl bg-[#f5f7fb] p-4 shadow-neu-sm">
                    <div>
                      <p className="font-semibold text-[#4a4a6a]">{friend.name}</p>
                      <p className="text-xs text-slate-500">{friend.online ? 'Online' : 'Offline'}</p>
                    </div>
                    <button onClick={() => navigate(`/chat/${friend.id}`)} className="rounded-full bg-[#a78bfa] px-3 py-2 text-xs font-semibold text-white hover:bg-[#8b5cf6]">
                      Chat
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No friends available</p>
              )}
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#e0e5ec] p-6 shadow-neu sm:p-8">
            <div className="absolute -left-10 -top-10 h-40 w-40 animate-pulse-slow rounded-full bg-[#a78bfa] opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 animate-pulse-slow rounded-full bg-fuchsia-400 opacity-20 blur-3xl" style={{ animationDelay: '2s' }}></div>
            
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-3">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setActiveGenre(genre)}
                    className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition-all duration-300 ${
                      activeGenre === genre
                        ? 'bg-gradient-to-r from-[#a78bfa] to-fuchsia-400 text-white shadow-neu-sm scale-105'
                        : 'bg-[#e0e5ec] text-[#4a4a6a] shadow-neu-inset hover:shadow-neu hover:-translate-y-0.5'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#a78bfa] to-fuchsia-500 px-8 py-3.5 text-sm font-black text-white shadow-neu transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
                <span className="relative z-10 text-shadow-sm">+ Create Room</span>
              </button>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-[#e0e5ec] p-6 shadow-neu sm:p-8">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-black text-[#4a4a6a] tracking-tight">Active Rooms</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">Jump into a game and show off your music knowledge.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f7fb] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#a78bfa] shadow-neu-inset">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a78bfa] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a78bfa]"></span>
                </span>
                {rooms.length} Available
              </span>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              {loadingRooms ? (
                <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-[2.5rem] bg-[#f5f7fb] shadow-neu-inset">
                  <div className="h-8 w-8 animate-spin-slow rounded-full border-4 border-slate-200 border-t-[#a78bfa]"></div>
                  <p className="mt-4 text-sm font-bold text-slate-400">Scanning for rooms...</p>
                </div>
              ) : rooms.length > 0 ? (
                rooms.map((room) => <RoomCard key={room.id} room={room} onJoin={handleJoin} />)
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-300 py-16 text-center transition-colors hover:border-[#a78bfa]/50 hover:bg-white/50">
                  <div className="mb-4 flex h-16 w-16 animate-bounce-slight items-center justify-center rounded-full bg-[#f5f7fb] text-3xl text-[#a78bfa] shadow-neu-inset">
                    🎧
                  </div>
                  <h3 className="text-xl font-bold text-[#4a4a6a]">No Rooms Found</h3>
                  <p className="mt-2 text-sm font-medium text-slate-500 max-w-[250px]">Looks like it's quiet here. Be the first to create a room and invite your friends!</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4 py-6">
          <div className="w-full max-w-xl rounded-[2rem] bg-[#e0e5ec] p-6 shadow-neu">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#4a4a6a]">Create Room</h2>
                <p className="text-sm text-slate-500">Configure room details before inviting players.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full bg-[#f5f7fb] p-3 text-[#4a4a6a] shadow-neu-sm"
              >
                <FaTimes />
              </button>
            </div>
            <form className="space-y-5" onSubmit={handleCreateRoom}>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#4a4a6a]">Room Name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Enter a room name"
                  className="w-full rounded-xl bg-[#e0e5ec] px-4 py-3 text-[#4a4a6a] shadow-neu-inset outline-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm font-medium text-[#4a4a6a]">
                  Genre
                  <select
                    value={form.genre}
                    onChange={(event) => setForm((prev) => ({ ...prev, genre: event.target.value }))}
                    className="w-full rounded-xl bg-[#e0e5ec] px-4 py-3 text-[#4a4a6a] shadow-neu-inset outline-none"
                  >
                    <option>Pop Indo</option>
                    <option>Pop Barat</option>
                    <option>K-Pop</option>
                    <option>Rock</option>
                    <option>Indonesia Populer</option>
                    <option>Global Populer</option>
                    <option>Jazz</option>
                    <option>Hip Hop</option>
                    <option>Hip Dut</option>
                    <option>Alt Rock Indo</option>
                    <option>Custom Artist</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-[#4a4a6a]">
                  Difficulty
                  <select
                    value={form.difficulty}
                    onChange={(event) => setForm((prev) => ({ ...prev, difficulty: event.target.value }))}
                    className="w-full rounded-xl bg-[#e0e5ec] px-4 py-3 text-[#4a4a6a] shadow-neu-inset outline-none"
                  >
                    {difficulties.map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-[#4a4a6a]">
                  Max Players
                  <select
                    value={form.maxPlayers}
                    onChange={(event) => setForm((prev) => ({ ...prev, maxPlayers: event.target.value }))}
                    className="w-full rounded-xl bg-[#e0e5ec] px-4 py-3 text-[#4a4a6a] shadow-neu-inset outline-none"
                  >
                    {maxPlayersOptions.map((size) => (
                      <option key={size}>{size}</option>
                    ))}
                  </select>
                </label>
              </div>

              {form.genre === 'Custom Artist' && (
                <div className="space-y-2 animate-float">
                  <label className="block text-sm font-medium text-[#4a4a6a]">Artist Name</label>
                  <input
                    value={form.customArtist}
                    onChange={(event) => setForm((prev) => ({ ...prev, customArtist: event.target.value }))}
                    placeholder="e.g. Taylor Swift, Nadin Amizah, Sheila On 7"
                    className="w-full rounded-xl bg-[#e0e5ec] px-4 py-3 text-[#4a4a6a] shadow-neu-inset outline-none ring-2 ring-[#a78bfa]/50"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full bg-[#f5f7fb] px-6 py-3 text-sm font-semibold text-[#4a4a6a] shadow-neu transition hover:bg-[#eef2f7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingRoom}
                  className="rounded-full bg-[#a78bfa] px-6 py-3 text-sm font-semibold text-white shadow-neu hover:bg-[#8b5cf6] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creatingRoom ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LobbyPage;
