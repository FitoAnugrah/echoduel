import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatBubble from '../components/ChatBubble';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { mockChatHistory, mockConversations } from '../services/mockData';

const ChatPage = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [activeFriend, setActiveFriend] = useState(friendId || null);
  const [history, setHistory] = useState([]);
  const [draft, setDraft] = useState('');
  const [newNotifications, setNewNotifications] = useState({});
  const [conversations] = useState(mockConversations);

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
    setHistory(mockChatHistory[activeFriend] || []);
  }, [activeFriend]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeFriend) || null,
    [conversations, activeFriend]
  );

  const handleSelectConversation = (conversation) => {
    setActiveFriend(conversation.id);
    setNewNotifications((prev) => ({ ...prev, [conversation.id]: 0 }));
    navigate(`/chat/${conversation.id}`);
  };

  const handleBack = () => {
    navigate('/friends');
  };

  const handleSend = (event) => {
    event.preventDefault();
    if (!draft.trim() || !activeFriend) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      senderName: 'You',
      message: draft.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      isSent: true,
    };

    setHistory((prev) => [...prev, newMessage]);
    setDraft('');
  };

  return (
    <section className="space-y-6">
      <header className="rounded-[2rem] bg-background p-6 shadow-neu">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Chat</h1>
            <p className="mt-2 text-slate-500">Stay connected while you wait for the next match.</p>
          </div>
          {activeFriend && (
            <div className="hidden sm:flex items-center gap-3 rounded-3xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
              <span>Chatting with</span>
              <span className="font-semibold text-slate-900">{activeConversation?.username || activeFriend}</span>
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
                  activeFriend === conversation.id ? 'border-accent bg-accent/10' : 'border-transparent bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={conversation.avatar} alt={conversation.username} className="h-12 w-12 rounded-full" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{conversation.username}</p>
                    <p className="truncate text-sm text-slate-500">{conversation.lastMessage}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{conversation.online ? 'Online' : 'Offline'}</span>
                  {newNotifications[conversation.id] ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">{newNotifications[conversation.id]}</span>
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
              <p className="text-sm font-semibold text-slate-900">{activeConversation?.username || 'Select a conversation'}</p>
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
