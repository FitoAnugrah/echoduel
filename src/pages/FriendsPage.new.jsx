import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { mockFriendRequests, mockFriends, mockUsers } from '../services/mockData';

const tabs = [
  { id: 'friends', label: 'Friends' },
  { id: 'requests', label: 'Requests' },
  { id: 'find', label: 'Find People' },
];

const FriendsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState(mockFriends);
  const [incoming, setIncoming] = useState(mockFriendRequests.incoming);
  const [outgoing, setOutgoing] = useState(mockFriendRequests.outgoing);
  const statusMap = Object.fromEntries(mockFriends.map((friend) => [friend.id, friend.online]));

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return mockUsers.filter((user) => {
      const alreadyFriend = friends.some((friend) => friend.id === user.id);
      const pending = incoming.some((request) => request.id === user.id) || outgoing.some((request) => request.id === user.id);
      return (
        !alreadyFriend &&
        !pending &&
        (user.username.toLowerCase().includes(query) || user.name.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, friends, incoming, outgoing]);

  const handleInvite = (friendId) => navigate(`/chat/${friendId}`);

  const handleSendRequest = (userId) => {
    const user = mockUsers.find((item) => item.id === userId);
    if (!user || outgoing.some((request) => request.id === userId)) return;
    setOutgoing((prev) => [...prev, user]);
  };

  const handleAccept = (userId) => {
    const request = incoming.find((item) => item.id === userId);
    if (!request) return;
    setIncoming((prev) => prev.filter((item) => item.id !== userId));
    setFriends((prev) => [...prev, { ...request, online: true }]);
  };

  const handleDecline = (userId) => {
    setIncoming((prev) => prev.filter((item) => item.id !== userId));
  };

  const handleCancel = (userId) => {
    setOutgoing((prev) => prev.filter((request) => request.id !== userId));
  };

  return (
    <section className="space-y-6">
      <header className="rounded-[2rem] bg-background p-6 shadow-neu">
        <h1 className="text-3xl font-bold text-slate-900">Friends</h1>
        <p className="mt-2 text-slate-500">Browse your social feed, accept requests, and start a match with a friend.</p>
      </header>

      <div className="space-y-4 sm:hidden">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === item.id ? 'bg-[#a78bfa] text-white shadow-neu-sm' : 'bg-[#e0e5ec] text-slate-700 hover:bg-[#f5f7fb]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden sm:grid gap-6 xl:grid-cols-[1.2fr_1.4fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-background p-5 shadow-neu">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Discover Players</h2>
                <p className="mt-1 text-sm text-slate-500">Search new opponents and send friend requests.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <InputField
                label="Search users"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by username or display name"
              />
              {searchQuery ? (
                <div className="space-y-3">
                  {searchResults.length ? (
                    searchResults.map((user) => (
                      <div key={user.id} className="rounded-[2rem] bg-[#f5f7fb] p-4 shadow-neu-sm">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full" />
                            <div>
                              <p className="font-semibold text-slate-900">{user.name}</p>
                              <p className="text-sm text-slate-500">@{user.username}</p>
                            </div>
                          </div>
                          <Button onClick={() => handleSendRequest(user.id)}>Add</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No players found. Try a different search.</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Search for players to send a request.</p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-background p-5 shadow-neu">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Your Friends</h2>
                <p className="mt-1 text-sm text-slate-500">Available players that you can challenge or message.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {friends.length ? (
                friends.map((friend) => (
                  <div key={friend.id} className="rounded-[2rem] bg-[#f5f7fb] p-4 shadow-neu-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <img src={friend.avatar} alt={friend.name} className="h-14 w-14 rounded-full" />
                        <div>
                          <p className="font-semibold text-slate-900">{friend.name}</p>
                          <p className="text-sm text-slate-500">Score {friend.score}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMap[friend.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {statusMap[friend.id] ? 'Online' : 'Offline'}
                        </span>
                        <Button onClick={() => handleInvite(friend.id)}>Message</Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">You have no friends yet. Send a request to get started.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-background p-5 shadow-neu">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Friend Requests</h2>
              <p className="mt-1 text-sm text-slate-500">Manage incoming and outgoing invites.</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Incoming</p>
              {incoming.length ? (
                incoming.map((request) => (
                  <div key={request.id} className="rounded-[2rem] bg-[#f5f7fb] p-4 shadow-neu-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <img src={request.avatar} alt={request.name} className="h-12 w-12 rounded-full" />
                        <div>
                          <p className="font-semibold text-slate-900">{request.name}</p>
                          <p className="text-sm text-slate-500">@{request.username}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => handleAccept(request.id)}>Accept</Button>
                        <Button className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => handleDecline(request.id)}>
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No incoming requests at the moment.</p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Outgoing</p>
              {outgoing.length ? (
                outgoing.map((request) => (
                  <div key={request.id} className="rounded-[2rem] bg-[#f5f7fb] p-4 shadow-neu-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <img src={request.avatar} alt={request.name} className="h-12 w-12 rounded-full" />
                        <div>
                          <p className="font-semibold text-slate-900">{request.name}</p>
                          <p className="text-sm text-slate-500">Pending</p>
                        </div>
                      </div>
                      <Button className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => handleCancel(request.id)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No outgoing requests right now.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 sm:hidden">
        {tab === 'find' && (
          <div className="rounded-[2rem] bg-background p-5 shadow-neu">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Find People</h2>
                <p className="mt-1 text-sm text-slate-500">Search and add new players.</p>
              </div>
              <InputField
                label="Search users"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by username or display name"
              />
              <div className="space-y-3">
                {searchQuery ? (
                  searchResults.length ? (
                    searchResults.map((user) => (
                      <div key={user.id} className="rounded-[2rem] bg-[#f5f7fb] p-4 shadow-neu-sm">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full" />
                            <div>
                              <p className="font-semibold text-slate-900">{user.name}</p>
                              <p className="text-sm text-slate-500">@{user.username}</p>
                            </div>
                          </div>
                          <Button onClick={() => handleSendRequest(user.id)}>Add</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No players found. Try a different search.</p>
                  )
                ) : (
                  <p className="text-sm text-slate-500">Search for players to send a request.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'friends' && (
          <div className="rounded-[2rem] bg-background p-5 shadow-neu">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Your Friends</h2>
                <p className="mt-1 text-sm text-slate-500">Tap a friend to message them.</p>
              </div>
              <div className="space-y-3">
                {friends.length ? (
                  friends.map((friend) => (
                    <div key={friend.id} className="rounded-[2rem] bg-[#f5f7fb] p-4 shadow-neu-sm">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <img src={friend.avatar} alt={friend.name} className="h-14 w-14 rounded-full" />
                          <div>
                            <p className="font-semibold text-slate-900">{friend.name}</p>
                            <p className="text-sm text-slate-500">Score {friend.score}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMap[friend.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {statusMap[friend.id] ? 'Online' : 'Offline'}
                          </span>
                          <Button onClick={() => handleInvite(friend.id)}>Message</Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">You have no friends yet. Send a request to get started.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div className="rounded-[2rem] bg-background p-5 shadow-neu">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Friend Requests</h2>
                <p className="mt-1 text-sm text-slate-500">Accept or decline friend invites.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Incoming</p>
                  {incoming.length ? (
                    incoming.map((request) => (
                      <div key={request.id} className="rounded-[2rem] bg-[#f5f7fb] p-4 shadow-neu-sm">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <img src={request.avatar} alt={request.name} className="h-12 w-12 rounded-full" />
                            <div>
                              <p className="font-semibold text-slate-900">{request.name}</p>
                              <p className="text-sm text-slate-500">@{request.username}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button onClick={() => handleAccept(request.id)}>Accept</Button>
                            <Button className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => handleDecline(request.id)}>
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No incoming requests at the moment.</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">Outgoing</p>
                  {outgoing.length ? (
                    outgoing.map((request) => (
                      <div key={request.id} className="rounded-[2rem] bg-[#f5f7fb] p-4 shadow-neu-sm">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <img src={request.avatar} alt={request.name} className="h-12 w-12 rounded-full" />
                            <div>
                              <p className="font-semibold text-slate-900">{request.name}</p>
                              <p className="text-sm text-slate-500">Pending</p>
                            </div>
                          </div>
                          <Button className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => handleCancel(request.id)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No outgoing requests right now.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FriendsPage;
