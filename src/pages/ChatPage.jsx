import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPaperPlane, FaArrowLeft, FaSearch, FaUserFriends } from 'react-icons/fa';
import { getConversations, getChatHistory, sendMessage, getFriends } from '../services/friendService';
import { useAuthContext } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import { toast } from 'react-hot-toast';
import { getAvatarUrl } from '../utils/avatar';

const ChatPage = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  const [activeFriend, setActiveFriend] = useState(friendId || null);
  const [history, setHistory] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [newNotifications, setNewNotifications] = useState({});
  const [search, setSearch] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load conversations (existing chats) and friends list on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [convos, friendList] = await Promise.all([getConversations(), getFriends()]);
        setConversations(convos);
        setFriends(friendList);
      } catch (err) {
        console.error('Failed to load chat data:', err);
      }
    };
    load();
  }, []);

  // Sync activeFriend from URL param
  useEffect(() => {
    if (friendId) setActiveFriend(friendId);
  }, [friendId]);

  // Load chat history whenever activeFriend changes
  useEffect(() => {
    if (!activeFriend) { setHistory([]); return; }
    setLoadingHistory(true);
    const fetchHistory = async () => {
      try {
        const msgs = await getChatHistory(activeFriend);
        setHistory(msgs.map(m => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.isOwn ? (user?.name || 'You') : (getFriendName(activeFriend)),
          message: m.text,
          timestamp: m.timestamp,
          isSent: m.isOwn,
        })));
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [activeFriend]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Real-time incoming messages via socket
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (msg) => {
      if (activeFriend === msg.senderId) {
        setHistory(prev => [...prev, {
          id: msg.id,
          senderId: msg.senderId,
          senderName: getFriendName(msg.senderId),
          message: msg.text,
          timestamp: msg.timestamp,
          isSent: false,
        }]);
        // Refresh conversations to update lastMessage
        getConversations().then(setConversations).catch(() => {});
      } else {
        setNewNotifications(prev => ({ ...prev, [msg.senderId]: (prev[msg.senderId] || 0) + 1 }));
        toast(`💬 New message from ${getFriendName(msg.senderId)}`, { duration: 3000 });
      }
    };
    socket.on('new-message', handleNewMessage);
    return () => socket.off('new-message', handleNewMessage);
  }, [socket, activeFriend, friends]);

  const getFriendName = useCallback((id) => {
    const fromConvo = conversations.find(c => c.friendId === id);
    if (fromConvo?.name) return fromConvo.name;
    const fromFriends = friends.find(f => f.id === id);
    return fromFriends?.name || fromFriends?.username || 'Friend';
  }, [conversations, friends]);

  const getFriendAvatar = useCallback((id) => {
    const fromConvo = conversations.find(c => c.friendId === id);
    if (fromConvo?.avatar) return fromConvo.avatar;
    const fromFriends = friends.find(f => f.id === id);
    return fromFriends?.avatar || null;
  }, [conversations, friends]);

  const activeConversation = useMemo(
    () => conversations.find(c => c.friendId === activeFriend) || null,
    [conversations, activeFriend]
  );

  // Merge friends into the sidebar: show all friends, highlight ones with existing chats
  const sidebarList = useMemo(() => {
    const friendsWithChat = conversations.map(c => ({
      friendId: c.friendId,
      name: c.name || getFriendName(c.friendId),
      avatar: c.avatar,
      lastMessage: c.lastMessage,
      time: c.time,
      online: c.online,
      hasChat: true,
    }));
    const friendIdsWithChat = new Set(friendsWithChat.map(f => f.friendId));
    const friendsWithoutChat = friends
      .filter(f => !friendIdsWithChat.has(f.id))
      .map(f => ({
        friendId: f.id,
        name: f.name || f.username,
        avatar: f.avatar,
        lastMessage: 'Tap to start a conversation',
        time: '',
        online: false,
        hasChat: false,
      }));
    return [...friendsWithChat, ...friendsWithoutChat];
  }, [conversations, friends, getFriendName]);

  const filteredSidebar = useMemo(() => {
    if (!search.trim()) return sidebarList;
    return sidebarList.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));
  }, [sidebarList, search]);

  const handleSelectFriend = (item) => {
    setActiveFriend(item.friendId);
    setNewNotifications(prev => ({ ...prev, [item.friendId]: 0 }));
    navigate(`/chat/${item.friendId}`);
  };

  const handleSend = async (event) => {
    event?.preventDefault();
    if (!draft.trim() || !activeFriend || sending) return;
    setSending(true);
    try {
      const sentMsg = await sendMessage(activeFriend, draft.trim());
      setHistory(prev => [...prev, {
        id: sentMsg.id,
        senderName: user?.name || 'You',
        message: sentMsg.text,
        timestamp: sentMsg.timestamp,
        isSent: true,
      }]);
      setDraft('');
      const updatedConvos = await getConversations();
      setConversations(updatedConvos);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send message.';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const activeName = getFriendName(activeFriend);
  const activeAvatar = getFriendAvatar(activeFriend);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 text-[#4a4a6a]">
      {/* Header */}
      <header className="relative mb-6 overflow-hidden rounded-[2.5rem] bg-[#e0e5ec] p-6 shadow-neu sm:p-8">
        <div className="absolute -left-10 -top-10 h-40 w-40 animate-pulse-slow rounded-full bg-[#a78bfa] opacity-20 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 animate-pulse-slow rounded-full bg-fuchsia-400 opacity-20 blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-slate-600 shadow-neu-sm transition hover:shadow-neu hover:text-[#a78bfa]"
              title="Back"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#4a4a6a] sm:text-4xl">Messages 💬</h1>
              <p className="mt-1 text-sm font-medium text-slate-500">Chat with your friends in real-time.</p>
            </div>
          </div>
          {activeFriend && (
            <div className="flex items-center gap-3 rounded-3xl bg-[#a78bfa]/10 px-4 py-2 text-sm">
              <img
                src={getAvatarUrl(activeAvatar, activeName)}
                alt={activeName}
                className="h-9 w-9 rounded-full ring-2 ring-[#a78bfa]"
              />
              <div>
                <p className="font-semibold text-slate-900">{activeName}</p>
                <p className="text-xs text-slate-500">{activeConversation?.online ? '🟢 Online' : '⚫ Offline'}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar — friend/conversation list */}
        <aside className={`${activeFriend ? 'hidden lg:flex' : 'flex'} flex-col gap-4 rounded-[2rem] bg-[#e0e5ec] p-5 shadow-neu`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Chats & Friends</h2>
            <span className="rounded-full bg-[#a78bfa]/20 px-3 py-1 text-xs font-semibold text-[#5b21b6]">{sidebarList.length}</span>
          </div>

          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search friends..."
              className="w-full rounded-xl bg-[#e0e5ec] py-2.5 pl-9 pr-4 text-sm text-[#4a4a6a] shadow-neu-inset outline-none"
            />
          </div>

          {/* List */}
          <div className="flex-1 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            {filteredSidebar.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                <FaUserFriends className="mx-auto mb-2 text-2xl opacity-30" />
                <p>No friends yet.</p>
                <button onClick={() => navigate('/friends')} className="mt-2 text-[#a78bfa] underline text-xs">Add Friends</button>
              </div>
            ) : filteredSidebar.map(item => (
              <button
                key={item.friendId}
                type="button"
                onClick={() => handleSelectFriend(item)}
                className={`w-full rounded-2xl p-3 text-left transition-all ${
                  activeFriend === item.friendId
                    ? 'bg-[#a78bfa]/20 ring-2 ring-[#a78bfa]/40'
                    : 'hover:bg-[#f5f7fb]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={getAvatarUrl(item.avatar, item.name)}
                      alt={item.name}
                      className="h-11 w-11 rounded-full object-cover ring-2 ring-white"
                    />
                    {item.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="shrink-0 text-[10px] text-slate-400">{item.time}</p>
                    </div>
                    <p className="truncate text-xs text-slate-500 mt-0.5">
                      {item.hasChat ? item.lastMessage : '💬 Start chatting'}
                    </p>
                  </div>
                  {newNotifications[item.friendId] > 0 && (
                    <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#a78bfa] text-[10px] font-bold text-white">
                      {newNotifications[item.friendId]}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat window */}
        <div className="flex flex-col rounded-[2rem] bg-[#e0e5ec] shadow-neu" style={{ minHeight: '65vh' }}>
          {activeFriend ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                <button
                  onClick={() => { setActiveFriend(null); navigate('/chat'); }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-slate-600 shadow-neu-sm transition hover:shadow-neu lg:hidden"
                >
                  <FaArrowLeft />
                </button>
                <img
                  src={getAvatarUrl(activeAvatar, activeName)}
                  alt={activeName}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-[#a78bfa]/40"
                />
                <div>
                  <p className="font-bold text-slate-900">{activeName}</p>
                  <p className="text-xs text-slate-500">{activeConversation?.online ? '🟢 Online' : '⚫ Offline'}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-5" style={{ maxHeight: 'calc(100vh - 420px)' }}>
                {loadingHistory ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading messages...</div>
                ) : history.length ? (
                  history.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-neu-sm ${
                        msg.isSent
                          ? 'bg-gradient-to-br from-[#a78bfa] to-fuchsia-500 text-white rounded-br-sm'
                          : 'bg-[#f5f7fb] text-slate-800 rounded-bl-sm'
                      }`}>
                        <p>{msg.message}</p>
                        <p className={`mt-1 text-[10px] ${msg.isSent ? 'text-purple-200' : 'text-slate-400'}`}>{msg.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-slate-400">
                    <span className="text-4xl">👋</span>
                    <p>No messages yet. Say hello to <strong>{activeName}</strong>!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-3 border-t border-slate-200 p-4"
              >
                <input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={`Message ${activeName}...`}
                  className="flex-1 rounded-xl bg-[#e0e5ec] px-4 py-3 text-sm text-[#4a4a6a] shadow-neu-inset outline-none focus:ring-2 focus:ring-[#a78bfa]/30"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a78bfa] to-fuchsia-500 text-white shadow-neu-sm transition hover:scale-105 disabled:opacity-50"
                >
                  <FaPaperPlane />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
              <span className="text-6xl">💬</span>
              <h2 className="text-xl font-bold text-slate-700">Start a Conversation</h2>
              <p className="max-w-xs text-sm text-slate-500">Select a friend on the left to open a chat, or add new friends first.</p>
              <button
                onClick={() => navigate('/friends')}
                className="mt-2 rounded-full bg-gradient-to-r from-[#a78bfa] to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-neu transition hover:scale-[1.02]"
              >
                Find Friends
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ChatPage;
