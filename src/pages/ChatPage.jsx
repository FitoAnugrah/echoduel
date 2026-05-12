import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatBubble from '../components/ChatBubble';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { getConversations, getChatHistory, sendMessage } from '../services/friendService';
import { useAuthContext } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import { toast } from 'react-hot-toast';

const ChatPage = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [activeFriend, setActiveFriend] = useState(friendId || null);
  const [history, setHistory] = useState([]);
  const [draft, setDraft] = useState('');
  const [newNotifications, setNewNotifications] = useState({});
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState([]);
  const socket = useSocket();
  // Ref for auto-scroll to latest message
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (err) {
        console.error("Failed to load conversations");
      }
    };
    fetchConvos();
  }, []);
  useEffect(() => {
    if (friendId) {
      setActiveFriend(friendId);
    }
  }, [friendId]);

  useEffect(() => {
    if (!activeFriend) {
      setHistory([]);
      return;
    }
    const fetchHistory = async () => {
      try {
        const msgs = await getChatHistory(activeFriend);
        setHistory(msgs.map(m => ({
          id: m.id,
          senderName: m.isOwn ? 'You' : (conversations.find(c => c.friendId === activeFriend)?.name || 'Friend'),
          message: m.text,
          timestamp: m.timestamp,
          isSent: m.isOwn
        })));
      } catch (err) {
        console.error("Failed to load chat history");
      }
    };
    fetchHistory();
  }, [activeFriend, conversations]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (msg) => {
      if (activeFriend === msg.senderId) {
        setHistory(prev => [...prev, {
          id: msg.id,
          senderName: conversations.find(c => c.friendId === activeFriend)?.name || 'Friend',
          message: msg.text,
          timestamp: msg.timestamp,
          isSent: false
        }]);
      } else {
        setNewNotifications(prev => ({ ...prev, [msg.senderId]: (prev[msg.senderId] || 0) + 1 }));
      }
    };

    socket.on('new-message', handleNewMessage);
    return () => socket.off('new-message', handleNewMessage);
  }, [socket, activeFriend, conversations]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.friendId === activeFriend) || null,
    [conversations, activeFriend]
  );

  // Auto-scroll to bottom whenever history changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSelectConversation = (conversation) => {
    setActiveFriend(conversation.friendId);
    setNewNotifications((prev) => ({ ...prev, [conversation.friendId]: 0 }));
    navigate(`/chat/${conversation.friendId}`);
  };

  const handleBack = () => {
    navigate('/friends');
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !activeFriend) return;

    try {
      const sentMsg = await sendMessage(activeFriend, draft.trim());
      
      const newMessage = {
        id: sentMsg.id,
        senderName: 'You',
        message: sentMsg.text,
        timestamp: sentMsg.timestamp,
        isSent: true,
      };

      setHistory((prev) => [...prev, newMessage]);
      setDraft('');
      
      const updatedConvos = await getConversations();
      setConversations(updatedConvos);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to send message.';
      toast.error(message);
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 text-[#4a4a6a]">
      <header className="rounded-[2rem] bg-background p-6 shadow-neu">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Chat</h1>
            <p className="mt-2 text-slate-500">Stay connected while you wait for the next match.</p>
          </div>
          {activeFriend && (
            <div className="hidden sm:flex items-center gap-3 rounded-3xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
              <span>Chatting with</span>
              <span className="font-semibold text-slate-900">{activeConversation?.name || activeFriend}</span>
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <aside className={`${activeFriend ? 'hidden sm:block' : 'block'} space-y-4 rounded-[2rem] bg-background p-5 shadow-neu`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Conversations</h2>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">{conversations.length}</span>
          </div>
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => handleSelectConversation(conversation)}
                className={`w-full rounded-3xl border p-4 text-left transition ${
                  activeFriend === conversation.friendId ? 'border-accent bg-accent/10' : 'border-transparent bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={getAvatarUrl(conversation.avatar, conversation.name)} alt={conversation.name} className="h-12 w-12 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center">
                      <p className="truncate font-semibold text-slate-900">{conversation.name}</p>
                      <p className="text-[10px] text-slate-400">{conversation.time}</p>
                    </div>
                    <p className="truncate text-sm text-slate-500">{conversation.lastMessage}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{conversation.online ? 'Online' : 'Offline'}</span>
                  {newNotifications[conversation.friendId] ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">{newNotifications[conversation.friendId]}</span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className={`rounded-[2rem] bg-background p-5 shadow-neu ${activeFriend ? 'block' : 'hidden sm:block'}`}>
          <div className="flex items-center justify-between gap-3 pb-4 sm:hidden">
            <Button onClick={handleBack}>Back</Button>
            <div>
              <p className="text-sm font-semibold text-slate-900">{activeConversation?.name || 'Select a conversation'}</p>
              <p className="text-xs text-slate-500">Tap on a friend to open the chat.</p>
            </div>
          </div>
          {activeFriend ? (
            <>
              <div className="space-y-4 overflow-y-auto pb-4" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                {history.length ? (
                  history.map((message) => (
                    <ChatBubble
                      key={message.id}
                      senderName={message.senderName}
                      message={message.message}
                      timestamp={message.timestamp}
                      isSent={message.isSent}
                    />
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    No messages yet. Say hello to start chatting.
                  </div>
                )}
                {/* Anchor element for auto-scroll */}
                <div ref={messagesEndRef} />
              </div>
              <form className="mt-4 grid gap-4 rounded-[2rem] bg-slate-50 p-4" onSubmit={handleSend}>
                <InputField
                  label="Message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message"
                />
                <Button type="submit" className="w-full">
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
              Select a conversation to open the chat window.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ChatPage;
