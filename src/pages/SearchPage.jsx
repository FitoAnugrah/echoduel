import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { searchUsers } from '../services/friendService';
import { getRooms } from '../services/roomService';
import { getAvatarUrl } from '../utils/avatar';
import Button from '../components/Button';
import RoomCard from '../components/RoomCard';
import InputField from '../components/InputField';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialQuery = location.state?.search || '';
  const [query, setQuery] = useState(initialQuery);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setUsers([]);
      setRooms([]);
      return;
    }
    setLoading(true);
    try {
      const [fetchedUsers, fetchedRooms] = await Promise.all([
        searchUsers(searchQuery),
        getRooms('All')
      ]);
      setUsers(fetchedUsers);
      
      const lowerQuery = searchQuery.toLowerCase();
      const filteredRooms = fetchedRooms.filter(r => 
        r.name.toLowerCase().includes(lowerQuery) || 
        r.host.toLowerCase().includes(lowerQuery) || 
        r.genre.toLowerCase().includes(lowerQuery)
      );
      setRooms(filteredRooms);
    } catch (error) {
      toast.error('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 text-[#4a4a6a]">
      <header className="rounded-[2.5rem] bg-[#e0e5ec] p-6 shadow-neu sm:p-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#4a4a6a] sm:text-4xl">Global Search</h1>
        <p className="mt-3 text-sm font-medium text-slate-500">Discover players and active rooms to join.</p>
        <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-3">
          <div className="flex-1">
            <InputField 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a player, room name, or genre..."
            />
          </div>
          <Button type="submit" className="bg-[#a78bfa] text-white hover:bg-[#8b5cf6]">
            Search
          </Button>
        </form>
      </header>

      {loading ? (
        <div className="text-center py-10 font-semibold text-slate-500">Searching...</div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Active Rooms */}
          <div className="rounded-[2.5rem] bg-[#e0e5ec] p-6 shadow-neu sm:p-8">
            <h2 className="mb-6 text-xl font-bold text-[#4a4a6a]">Matching Rooms</h2>
            {rooms.length === 0 ? (
              <p className="text-sm text-slate-500 bg-[#f5f7fb] p-4 rounded-3xl">No active rooms found matching your search.</p>
            ) : (
              <div className="grid gap-4">
                {rooms.map(room => (
                  <RoomCard key={room.id} room={room} onJoin={() => navigate(`/game/${room.id}`)} />
                ))}
              </div>
            )}
          </div>

          {/* Players */}
          <div className="rounded-[2.5rem] bg-[#e0e5ec] p-6 shadow-neu sm:p-8">
            <h2 className="mb-6 text-xl font-bold text-[#4a4a6a]">Matching Players</h2>
            {users.length === 0 ? (
              <p className="text-sm text-slate-500 bg-[#f5f7fb] p-4 rounded-3xl">No players found matching your search.</p>
            ) : (
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between rounded-3xl bg-[#f5f7fb] p-4 shadow-neu-sm">
                    <div className="flex items-center gap-4">
                      <img src={getAvatarUrl(user.avatar, user.name)} alt={user.name} className="h-12 w-12 rounded-full object-cover shadow-sm" />
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">@{user.username}</p>
                      </div>
                    </div>
                    <Button onClick={() => navigate('/friends')} className="text-xs">View in Friends</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default SearchPage;
