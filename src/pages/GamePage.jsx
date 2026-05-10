import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaLightbulb, FaVolumeUp } from 'react-icons/fa';
import Timer from '../components/Timer';
import ScoreBoard from '../components/ScoreBoard';
import useSocket from '../hooks/useSocket';
import { useAuthContext } from '../context/AuthContext';

const USE_MOCK = false;
const MOCK_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
const MOCK_COVER_ART = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';

const initialRoomState = {
  id: null,
  name: '',
  host: '',
  genre: '',
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

  useEffect(() => {
    if (round.isActive && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Autoplay may be blocked until user interaction.
      });
    }
  }, [round.audioUrl, round.isActive]);

  useEffect(() => {
    if (!USE_MOCK && socket) {
      socket.emit('join-room', { roomId, token, user });
      socket.on('room-joined', handleRoomJoined);
      socket.on('game-start', handleGameStart);
      socket.on('round-start', handleRoundStart);
      socket.on('round-end', handleRoundEnd);
      socket.on('score-update', handleScoreUpdate);
      socket.on('game-end', handleGameEnd);
    }

    if (USE_MOCK) {
      const timers = [];
      timers.push(setTimeout(() => handleRoomJoined({ id: roomId, name: `EchoDuel Room ${roomId}`, host: 'Lyra', genre: 'K-Pop' }), 300));
      timers.push(setTimeout(() => handleGameStart({ countdown: 5 }), 1300));
      timers.push(setTimeout(() => handleRoundStart({ audioUrl: MOCK_AUDIO_URL, roundNumber: 1, totalRounds: 3, duration: 30, startTimestamp: Date.now(), coverArt: MOCK_COVER_ART }), 6500));
      timers.push(setTimeout(() => handleScoreUpdate({ scores: [
        { id: 'user_01', username: user?.username || 'You', avatar: user?.avatar, score: 850 },
        { id: 'player_02', username: 'Lyra', avatar: '', score: 900 },
        { id: 'player_03', username: 'Nova', avatar: '', score: 830 },
      ] }), 10500));
      timers.push(setTimeout(() => handleRoundEnd({ correctAnswer: 'Echo of Rhythm' }), 22000));
      timers.push(setTimeout(() => handleScoreUpdate({ scores: [
        { id: 'user_01', username: user?.username || 'You', avatar: user?.avatar, score: 930 },
        { id: 'player_02', username: 'Lyra', avatar: '', score: 940 },
        { id: 'player_03', username: 'Nova', avatar: '', score: 870 },
      ] }), 23500));
      timers.push(setTimeout(() => handleGameEnd({ finalScores: [
        { id: 'player_02', username: 'Lyra', avatar: '', score: 1200 },
        { id: 'user_01', username: user?.username || 'You', avatar: user?.avatar, score: 1150 },
        { id: 'player_03', username: 'Nova', avatar: '', score: 980 },
      ] }), 30000));

      return () => timers.forEach(clearTimeout);
    }

    return () => {
      if (socket) {
        socket.emit('leave-room', { roomId });
        socket.off('room-joined');
        socket.off('game-start');
        socket.off('round-start');
        socket.off('round-end');
        socket.off('score-update');
        socket.off('game-end');
      }
    };
  }, [socket, roomId, token, user]);

  useEffect(() => {
    setScoreFlashIds([]);
  }, []);

  const handleRoomJoined = (roomData) => {
    setRoomData(roomData);
    if (roomData.gameState === 'playing') {
       setStatusMessage('Game is already in progress');
    } else {
       setStatusMessage(roomData.host === (user?.username || socket?.id) ? 'You are the Host. Click Start Game when ready.' : 'Connected to room. Waiting for host to start.');
    }
  };

  const handleStartGame = () => {
    if (socket && roomData.host === (user?.username || socket.id)) {
      socket.emit('start-game', { roomId });
    }
  };

  const handleGameStart = ({ countdown: nextCountdown }) => {
    setCountdown(nextCountdown ?? 5);
    setStatusMessage('Game starting soon');
  };

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

  const handleRoundStart = ({ audioUrl, roundNumber, totalRounds, duration, startTimestamp, coverArt, hint }) => {
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
    setStatusMessage(`Round ${roundNumber} / ${totalRounds} is live`);
    setHintOpen(false);
  };

  const handleRoundEnd = ({ correctAnswer }) => {
    setCorrectAnswer(correctAnswer);
    setRound((prev) => ({ ...prev, isActive: false, trackName: correctAnswer }));
    setStatusMessage('Round ended — answer revealed');
    setTimeout(() => setCorrectAnswer(''), 3000);
  };

  const handleScoreUpdate = ({ scores: nextScores }) => {
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
  };

  const handleGameEnd = ({ finalScores }) => {
    navigate('/leaderboard', { state: { finalScores } });
  };

  const handleSubmitAnswer = (event) => {
    event.preventDefault();
    if (!answer.trim()) return;
    if (!USE_MOCK && socket) {
      socket.emit('submit-answer', { roomId, answer });
    }
    setAnswer('');
    setStatusMessage('Answer submitted');
  };

  const displayedScores = useMemo(() => {
    return [...scores].sort((a, b) => b.score - a.score);
  }, [scores]);

  return (
    <div className="min-h-screen bg-[#e0e5ec] text-[#4a4a6a]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <main className="space-y-6 lg:w-2/3">
          <div className="rounded-[2rem] bg-[#e0e5ec] p-6 shadow-neu">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{roomData.genre || 'Genre'}</p>
                <h1 className="mt-2 text-3xl font-semibold text-[#4a4a6a]">{roomData.name || `Room ${roomId}`}</h1>
                <p className="mt-1 text-sm text-slate-500">Host: {roomData.host || 'Host'}</p>
              </div>
              <div className="flex flex-col items-end gap-3 lg:flex-row lg:items-center">
                <div className="flex items-center gap-2 rounded-full bg-[#e0e5ec] px-4 py-3 shadow-neu-sm text-sm font-semibold text-[#4a4a6a]">
                  <FaVolumeUp /> {statusMessage}
                </div>
                {roomData.host === (user?.username || socket?.id) && countdown === null && round.roundNumber === 0 && (
                  <button 
                    onClick={handleStartGame}
                    className="rounded-full bg-[#a78bfa] px-6 py-3 text-sm font-semibold text-white shadow-neu hover:bg-[#8b5cf6]"
                  >
                    Start Game
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="space-y-6">
              <div className="rounded-[2rem] bg-[#e0e5ec] p-6 shadow-neu">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Round {round.roundNumber} of {round.totalRounds}</p>
                    <p className="mt-1 text-xl font-semibold text-[#4a4a6a]">Countdown</p>
                  </div>
                  <Timer duration={round.duration} remaining={round.remaining} startTimestamp={round.startTimestamp} />
                </div>
              </div>

              <div className="rounded-[2rem] bg-[#e0e5ec] p-6 shadow-neu">
                <div className="relative overflow-hidden rounded-[2rem] bg-[#1f2937]">
                  <img
                    src={round.coverArt || MOCK_COVER_ART}
                    alt="Cover art"
                    className={`h-56 w-full object-cover transition duration-500 ${round.isActive ? 'blur-xl' : 'blur-0'}`}
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                    <span className="text-sm uppercase tracking-[0.25em] text-white/70">Now Playing</span>
                    <h2 className="mt-2 text-2xl font-semibold">{round.trackName}</h2>
                  </div>
                </div>
                <div className="mt-5 rounded-[1.75rem] bg-[#e0e5ec] p-4 shadow-neu-inset">
                  <audio ref={audioRef} src={round.audioUrl} controls className="w-full" />
                  {!round.audioUrl && <p className="mt-3 text-sm text-slate-500">Waiting for the preview to load...</p>}
                </div>
              </div>

              <form onSubmit={handleSubmitAnswer} className="space-y-4 rounded-[2rem] bg-[#e0e5ec] p-6 shadow-neu">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#4a4a6a]">Submit your answer</p>
                    <p className="text-xs text-slate-500">Type the song title for this round.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHintOpen((prev) => !prev)}
                    className="rounded-full bg-[#f5f7fb] px-4 py-2 text-sm font-semibold text-[#4a4a6a] shadow-neu-sm"
                  >
                    <FaLightbulb className="inline mr-2" /> Hint
                  </button>
                </div>
                {hintOpen && (
                  <div className="rounded-3xl bg-white/80 p-4 text-sm text-slate-600 shadow-neu-sm">
                    💡 <strong>Hint:</strong> {round.hint}
                  </div>
                )}
                <input
                  type="text"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Your guess here"
                  className="w-full rounded-3xl bg-[#e0e5ec] px-4 py-4 text-[#4a4a6a] shadow-neu-inset outline-none"
                />
                <button type="submit" className="w-full rounded-full bg-[#a78bfa] px-6 py-3 text-sm font-semibold text-white shadow-neu hover:bg-[#8b5cf6]">
                  Submit Answer
                </button>
                {correctAnswer && <p className="text-center text-sm text-[#4a4a6a]">Correct answer: <span className="font-semibold text-[#a78bfa]">{correctAnswer}</span></p>}
              </form>
            </div>

            <aside className="hidden lg:block">
              <ScoreBoard scores={displayedScores} flashIds={scoreFlashIds} />
            </aside>
          </div>
        </main>

        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setScoreboardOpen((prev) => !prev)}
            className="mb-4 w-full rounded-full bg-[#a78bfa] px-6 py-3 text-sm font-semibold text-white shadow-neu hover:bg-[#8b5cf6]"
          >
            {scoreboardOpen ? 'Hide Scores' : 'View Scores'}
          </button>
          {scoreboardOpen && <ScoreBoard scores={displayedScores} flashIds={scoreFlashIds} />}
        </div>
      </div>
    </div>
  );
};

export default GamePage;
