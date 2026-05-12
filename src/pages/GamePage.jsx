import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaLightbulb, FaVolumeUp, FaTimes } from 'react-icons/fa';
import Timer from '../components/Timer';
import ScoreBoard from '../components/ScoreBoard';
import useSocket from '../hooks/useSocket';
import { useAuthContext } from '../context/AuthContext';
import { getFriends } from '../services/friendService';
import { toast } from 'react-hot-toast';

const USE_MOCK = false;
const MOCK_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
const MOCK_COVER_ART = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';

const initialRoomState = {
  id: null,
  name: '',
  host: '',
  genre: '',
  difficulty: '',
  gameState: 'waiting',
};

const difficultyColors = {
  Easy: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-red-100 text-red-700',
};

const initialRoundState = {
  roundNumber: 0,
  totalRounds: 0,
  duration: 30,
  remaining: 0,
  startTimestamp: null,
  audioUrl: '',
  coverArt: '',
  isActive: false,
  trackName: '???',
  hint: 'Wait for the round to start...',
};

const GamePage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const { token, user } = useAuthContext();
  const socket = useSocket();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [roomData, setRoomData] = useState(initialRoomState);
  const [round, setRound] = useState(initialRoundState);
  const [countdown, setCountdown] = useState(null);
  const [scores, setScores] = useState([]);
  const [answer, setAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [statusMessage, setStatusMessage] = useState('Waiting for game events...');
  const [hintOpen, setHintOpen] = useState(false);
  const [scoreFlashIds, setScoreFlashIds] = useState([]);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);

  useEffect(() => {
    if (inviteModalOpen) {
      getFriends().then(setFriendsList).catch(console.error);
    }
  }, [inviteModalOpen]);

  const handleInviteFriend = (friendId) => {
    if (socket) {
      socket.emit('send-invite', { friendId, roomId });
      toast.success('Invite sent!');
    }
    setInviteModalOpen(false);
  };

  // ── Timer countdown for round ──────────────────────────────────────────────
  useEffect(() => {
    let interval = null;
    if (round.isActive && round.startTimestamp) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - round.startTimestamp) / 1000);
        const remaining = Math.max(round.duration - elapsed, 0);
        setRound((prev) => ({ ...prev, remaining }));
        if (remaining === 0) {
          setRound((prev) => ({ ...prev, isActive: false }));
        }
      }, 250);
    }

    return () => clearInterval(interval);
  }, [round.isActive, round.startTimestamp, round.duration]);

  // ── Audio playback control ─────────────────────────────────────────────────
  useEffect(() => {
    if (round.isActive && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        toast('Autoplay blocked. Please click Play manually!', { icon: '🔇' });
      });
    }
    // BUG-05 FIX: Pause audio when round ends
    if (!round.isActive && audioRef.current) {
      audioRef.current.pause();
    }
  }, [round.audioUrl, round.isActive]);

  // ── Socket event handlers (using useCallback to avoid stale closures) ──────
  const handleRoomJoined = useCallback((data) => {
    setRoomData(data);
    if (data.gameState === 'playing') {
      setStatusMessage('Game is already in progress');
    } else {
      // We check host inside here using data.host
      const currentUsername = user?.username;
      const isHost = data.host === currentUsername;
      setStatusMessage(
        isHost
          ? 'You are the Host. Click Start Game when ready.'
          : 'Connected to room. Waiting for host to start.'
      );
    }
  }, [user?.username]);

  const handleGameStart = useCallback(({ countdown: nextCountdown }) => {
    setCountdown(nextCountdown ?? 5);
    setStatusMessage('Game starting soon');
  }, []);

  const handleRoundStart = useCallback(({ audioUrl, roundNumber, totalRounds, duration, startTimestamp, coverArt, hint }) => {
    setRound({
      roundNumber,
      totalRounds,
      duration,
      remaining: duration,
      startTimestamp: startTimestamp || Date.now(),
      audioUrl,
      coverArt,
      isActive: true,
      trackName: '???',
      hint: hint || 'Listen closely to the lyrics!',
    });
    setCorrectAnswer('');
    setHasAnsweredCorrectly(false);
    setStatusMessage(`Round ${roundNumber} / ${totalRounds} is live`);
    setHintOpen(false);
  }, []);

  const handleRoundEnd = useCallback(({ correctAnswer: answer }) => {
    setCorrectAnswer(answer);
    setRound((prev) => ({ ...prev, isActive: false, trackName: answer }));
    setStatusMessage('Round ended — answer revealed');
    setTimeout(() => setCorrectAnswer(''), 5000);
  }, []);

  const handleScoreUpdate = useCallback(({ scores: nextScores }) => {
    setScores((prevScores) => {
      const flashes = nextScores
        .filter((next) => {
          const previous = prevScores.find((item) => item.id === next.id);
          return previous && previous.score !== next.score;
        })
        .map((item) => item.id);
      if (flashes.length) {
        setScoreFlashIds(flashes);
        setTimeout(() => setScoreFlashIds([]), 800);
      }
      return nextScores;
    });
  }, []);

  const handleGameEnd = useCallback(({ finalScores }) => {
    navigate('/leaderboard', { state: { finalScores } });
  }, [navigate]);

  const handleAnswerResult = useCallback(({ correct, points, alreadyAnswered }) => {
    if (alreadyAnswered) {
      toast('You already answered this round', { icon: '⚠️' });
    } else if (correct) {
      toast.success(`Correct! +${points} pts 🎉`);
      setHasAnsweredCorrectly(true);
    } else {
      toast.error('Wrong answer, try again! ❌');
    }
  }, []);

  // ── Socket connection & event binding ──────────────────────────────────────
  // Store handlers in refs so the effect cleanup always removes the latest one
  const handlersRef = useRef({});
  handlersRef.current = {
    handleRoomJoined,
    handleGameStart,
    handleRoundStart,
    handleRoundEnd,
    handleScoreUpdate,
    handleGameEnd,
    handleAnswerResult,
  };

  useEffect(() => {
    if (!USE_MOCK && socket) {
      // Wrapper functions that delegate to the latest handler via ref
      const onRoomJoined = (data) => handlersRef.current.handleRoomJoined(data);
      const onGameStart = (data) => handlersRef.current.handleGameStart(data);
      const onRoundStart = (data) => handlersRef.current.handleRoundStart(data);
      const onRoundEnd = (data) => handlersRef.current.handleRoundEnd(data);
      const onScoreUpdate = (data) => handlersRef.current.handleScoreUpdate(data);
      const onGameEnd = (data) => handlersRef.current.handleGameEnd(data);
      const onAnswerResult = (data) => handlersRef.current.handleAnswerResult(data);
      const onError = (data) => {
        toast.error(data.message || 'An error occurred');
        if (data.message === 'Room is full.') {
          navigate('/lobby');
        }
      };

      const fallbackName = location.state?.fallbackName;
      const fallbackGenre = location.state?.fallbackGenre;
      const fallbackDifficulty = location.state?.fallbackDifficulty;

      socket.emit('join-room', { roomId, token, fallbackName, fallbackGenre, fallbackDifficulty });
      socket.on('room-joined', onRoomJoined);
      socket.on('game-start', onGameStart);
      socket.on('round-start', onRoundStart);
      socket.on('round-end', onRoundEnd);
      socket.on('score-update', onScoreUpdate);
      socket.on('game-end', onGameEnd);
      socket.on('answer-result', onAnswerResult);
      socket.on('game-error', onError);

      return () => {
        socket.emit('leave-room', { roomId });
        socket.off('room-joined', onRoomJoined);
        socket.off('game-start', onGameStart);
        socket.off('round-start', onRoundStart);
        socket.off('round-end', onRoundEnd);
        socket.off('score-update', onScoreUpdate);
        socket.off('game-end', onGameEnd);
        socket.off('answer-result', onAnswerResult);
        socket.off('game-error', onError);
      };
    }

    if (USE_MOCK) {
      const timers = [];
      timers.push(setTimeout(() => handlersRef.current.handleRoomJoined({ id: roomId, name: `EchoDuel Room ${roomId}`, host: 'Lyra', genre: 'K-Pop', difficulty: 'Easy', gameState: 'waiting' }), 300));
      timers.push(setTimeout(() => handlersRef.current.handleGameStart({ countdown: 5 }), 1300));
      timers.push(setTimeout(() => handlersRef.current.handleRoundStart({ audioUrl: MOCK_AUDIO_URL, roundNumber: 1, totalRounds: 3, duration: 30, startTimestamp: Date.now(), coverArt: MOCK_COVER_ART }), 6500));
      timers.push(setTimeout(() => handlersRef.current.handleScoreUpdate({ scores: [
        { id: 'user_01', username: user?.username || 'You', avatar: user?.avatar, score: 850 },
        { id: 'player_02', username: 'Lyra', avatar: '', score: 900 },
        { id: 'player_03', username: 'Nova', avatar: '', score: 830 },
      ] }), 10500));
      timers.push(setTimeout(() => handlersRef.current.handleRoundEnd({ correctAnswer: 'Echo of Rhythm' }), 22000));
      timers.push(setTimeout(() => handlersRef.current.handleGameEnd({ finalScores: [
        { id: 'player_02', username: 'Lyra', avatar: '', score: 1200 },
        { id: 'user_01', username: user?.username || 'You', avatar: user?.avatar, score: 1150 },
        { id: 'player_03', username: 'Nova', avatar: '', score: 980 },
      ] }), 30000));

      return () => timers.forEach(clearTimeout);
    }
  }, [socket, roomId]);

  // ── Countdown ticker ───────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      setStatusMessage('Get ready for the first round');
      return;
    }

    const timer = setTimeout(() => setCountdown((value) => Math.max((value ?? 0) - 1, 0)), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleStartGame = () => {
    if (!socket) {
      toast.error('Connection lost. Please refresh the page.');
      return;
    }
    if (roomData.host === user?.username) {
      socket.emit('start-game', { roomId });
    }
  };

  const handleSubmitAnswer = (event) => {
    event.preventDefault();
    if (!answer.trim()) return;
    if (!round.isActive) return;
    if (hasAnsweredCorrectly) {
      toast('You already got it right! Wait for the next round.', { icon: '✅' });
      return;
    }
    if (!USE_MOCK && socket) {
      socket.emit('submit-answer', { roomId, answer: answer.trim() });
    }
    setAnswer('');
    setStatusMessage('Answer submitted — waiting for result...');
  };

  const displayedScores = useMemo(() => {
    return [...scores].sort((a, b) => b.score - a.score);
  }, [scores]);

  return (
    <div className="min-h-screen bg-[#e0e5ec] text-[#4a4a6a]">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        
        {/* ── HEADER SECTION ── */}
        <div className="rounded-[2.5rem] bg-[#e0e5ec] p-6 shadow-neu sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#a78bfa]">{roomData.genre || 'Genre'}</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#4a4a6a] sm:text-4xl">{roomData.name || `Room ${roomId}`}</h1>
              <div className="mt-3 flex items-center gap-4">
                <p className="text-sm font-medium text-slate-500">Host: <span className="font-bold text-[#4a4a6a]">{roomData.host || 'Host'}</span></p>
                {roomData.difficulty && (
                  <span className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-neu-sm ${difficultyColors[roomData.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                    {roomData.difficulty}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-5 md:items-end">
              <div className="flex items-center gap-3 rounded-full bg-[#e0e5ec] px-6 py-3.5 text-sm font-bold text-[#4a4a6a] shadow-neu-inset">
                <FaVolumeUp className="text-[#a78bfa]" /> {statusMessage}
              </div>
              
              <div className="flex flex-wrap items-center justify-end gap-4">
                <button
                  onClick={() => navigate('/lobby')}
                  className="rounded-full bg-[#e0e5ec] px-7 py-3.5 text-sm font-extrabold text-red-500 shadow-neu transition-all hover:text-red-600 hover:shadow-neu-sm"
                >
                  {roomData.host === user?.username ? 'Hentikan Permainan' : 'Keluar Permainan'}
                </button>

                {roomData.host === user?.username && countdown === null && round.roundNumber === 0 && (
                  <>
                    <button 
                      onClick={() => setInviteModalOpen(true)}
                      className="rounded-full bg-[#e0e5ec] px-7 py-3.5 text-sm font-extrabold text-[#4a4a6a] shadow-neu transition-all hover:shadow-neu-sm"
                    >
                      Invite Friends
                    </button>
                    <button 
                      onClick={handleStartGame}
                      className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#a78bfa] to-fuchsia-500 px-8 py-3.5 text-sm font-extrabold text-white shadow-neu transition-all hover:scale-105 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
                      <span className="relative z-10 text-shadow-sm">Start Game</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN GAME GRID ── */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Game Area */}
          <div className="space-y-8 lg:col-span-8">
            
            <div className="rounded-[2.5rem] bg-[#e0e5ec] p-6 shadow-neu sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Round Status</p>
                  <p className="mt-1 text-3xl font-black text-[#4a4a6a]">
                    {round.roundNumber} <span className="text-xl font-semibold text-slate-400">/ {round.totalRounds}</span>
                  </p>
                </div>
                <Timer duration={round.duration} remaining={round.remaining} startTimestamp={round.startTimestamp} />
              </div>
            </div>

            <div className="overflow-hidden rounded-[3rem] bg-[#e0e5ec] p-5 shadow-neu">
              <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-inner">
                <img
                  src={round.coverArt || MOCK_COVER_ART}
                  alt="Cover art"
                  className={`h-[340px] w-full object-cover transition-all duration-[1500ms] ease-out ${round.isActive ? 'scale-110 blur-2xl' : 'scale-100 blur-0'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white sm:p-10">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-[#a78bfa] drop-shadow-md">Now Playing</span>
                  <h2 className="mt-2 text-3xl font-black leading-tight drop-shadow-lg sm:text-4xl">{round.trackName}</h2>
                </div>
              </div>
              <div className="mt-5 rounded-[2.5rem] bg-[#e0e5ec] p-5 shadow-neu-inset">
                <audio ref={audioRef} src={round.audioUrl} controls className="w-full" />
                {!round.audioUrl && <p className="mt-2 text-center text-sm font-medium text-slate-500">Waiting for audio preview...</p>}
              </div>
            </div>

            <form onSubmit={handleSubmitAnswer} className="rounded-[2.5rem] bg-[#e0e5ec] p-6 shadow-neu sm:p-8">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-[#4a4a6a]">Submit your answer</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">Guess the correct song title.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHintOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full bg-[#e0e5ec] px-6 py-3 text-sm font-extrabold text-[#a78bfa] shadow-neu transition-all hover:shadow-neu-sm"
                >
                  <FaLightbulb /> Hint
                </button>
              </div>

              {hintOpen && (
                <div className="mb-6 rounded-[1.5rem] bg-amber-50 p-5 shadow-inner ring-1 ring-amber-100">
                  <p className="text-sm font-bold text-amber-800">
                    💡 <span className="ml-1 opacity-80">Hint:</span> {round.hint}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-5 sm:flex-row">
                <input
                  type="text"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder={hasAnsweredCorrectly ? 'You got it right! 🎉' : 'Type your guess here...'}
                  disabled={hasAnsweredCorrectly || !round.isActive}
                  className="flex-1 rounded-full bg-[#e0e5ec] px-8 py-5 text-lg font-bold text-[#4a4a6a] shadow-neu-inset outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-[#a78bfa]/30 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={hasAnsweredCorrectly || !round.isActive}
                  className="group relative overflow-hidden whitespace-nowrap rounded-full bg-gradient-to-r from-[#a78bfa] to-fuchsia-500 px-10 py-5 text-lg font-extrabold text-white shadow-neu transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
                  <span className="relative z-10 text-shadow-sm">{hasAnsweredCorrectly ? 'Answered ✅' : 'Submit'}</span>
                </button>
              </div>

              {correctAnswer && (
                <div className="mt-8 rounded-[1.5rem] bg-emerald-50 p-5 text-center shadow-inner ring-1 ring-emerald-100">
                  <p className="text-sm font-bold text-emerald-800">
                    The correct answer was: <span className="ml-2 text-lg font-black text-emerald-600">{correctAnswer}</span>
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* RIGHT COLUMN: Scoreboard */}
          <div className="flex flex-col gap-8 lg:col-span-4">
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setScoreboardOpen((prev) => !prev)}
                className="w-full rounded-full bg-[#e0e5ec] px-8 py-4 text-base font-extrabold text-[#a78bfa] shadow-neu transition-all hover:shadow-neu-sm"
              >
                {scoreboardOpen ? 'Hide Scoreboard' : 'Show Scoreboard'}
              </button>
            </div>
            
            <div className={`h-full ${scoreboardOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-8">
                <ScoreBoard scores={displayedScores} flashIds={scoreFlashIds} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2.5rem] bg-[#e0e5ec] p-8 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-[#4a4a6a]">Invite Friends</h2>
              <button onClick={() => setInviteModalOpen(false)} className="rounded-full bg-[#e0e5ec] p-4 text-[#4a4a6a] shadow-neu-sm transition-all hover:shadow-neu-inset">
                <FaTimes className="text-lg" />
              </button>
            </div>
            <div className="max-h-72 space-y-4 overflow-y-auto pr-3">
              {friendsList.length > 0 ? friendsList.map(f => (
                <div key={f.id} className="flex items-center justify-between rounded-[2rem] bg-[#e0e5ec] p-4 shadow-neu-sm">
                  <span className="font-bold text-[#4a4a6a]">{f.name}</span>
                  <button onClick={() => handleInviteFriend(f.id)} className="rounded-full bg-[#a78bfa] px-5 py-2 text-xs font-black text-white shadow-neu-sm transition-all hover:bg-[#8b5cf6]">Invite</button>
                </div>
              )) : (
                <p className="py-6 text-center text-sm font-medium text-slate-500">No friends available to invite.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
