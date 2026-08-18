import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Puzzle, 
  Brain, 
  Hash, 
  Calculator, 
  Type, 
  Zap, 
  Trophy, 
  Timer, 
  Play, 
  Settings,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GameType, GameSession, GameScore, AgeGroup } from '../types';

interface GameZoneProps {
  roomId: string;
  userName: string;
  isAdmin: boolean;
  initialLeaderboard?: {user_name: string, score: number}[];
  onClose: () => void;
  ageGroup?: AgeGroup;
}

export default function GameZone({ roomId, userName, isAdmin, initialLeaderboard = [], onClose, ageGroup }: GameZoneProps) {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'result'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [gameConfig, setGameConfig] = useState<any>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<{user_name: string, score: number}[]>(initialLeaderboard);

  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameStatus === 'playing') {
      finishGame();
    }
  }, [gameStatus, timeLeft]);

  const startGame = (type: GameType) => {
    const config = generateGameConfig(type);
    const id = Math.random().toString(36).substr(2, 9);
    
    setCurrentSessionId(id);
    setActiveGame(type);
    setGameConfig(config);
    setTimeLeft(60);
    setGameStatus('playing');
    setScore(0);
    setAccuracy(0);
    setAnswered(0);
    setCorrect(0);
  };

  const generateGameConfig = (type: GameType) => {
    const isKid = ageGroup === 'kid';
    switch (type) {
      case 'math':
        return Array.from({ length: 20 }, () => {
          const max = isKid ? 10 : 30;
          const a = Math.floor(Math.random() * max) + 1;
          const b = Math.floor(Math.random() * max) + 1;
          const ops = isKid ? ['+', '-'] : ['+', '-', '*'];
          const op = ops[Math.floor(Math.random() * ops.length)];
          let ans = 0;
          if (op === '+') ans = a + b;
          else if (op === '-') ans = a - b;
          else ans = a * b;
          return { q: `${a} ${op} ${b}`, a: ans };
        });
      case 'logic':
        return Array.from({ length: 10 }, () => {
          const start = Math.floor(Math.random() * 10);
          const diff = Math.floor(Math.random() * 5) + 1;
          const seq = [start, start + diff, start + diff * 2, start + diff * 3];
          return { q: seq.join(', ') + ', ?', a: start + diff * 4 };
        });
      case 'word':
        const words = ['BIOLOGY', 'PHYSICS', 'CHEMISTRY', 'GENETICS', 'NUCLEUS', 'ATOM', 'MOLECULE', 'ENERGY', 'FORCE', 'CELL'];
        return words.map(w => ({
          q: w.split('').sort(() => Math.random() - 0.5).join(''),
          a: w
        }));
      case 'pattern':
        return Array.from({ length: 8 }, () => { const start = Math.floor(Math.random() * 8) + 1; const diff = Math.floor(Math.random() * 4) + 1; return { q: `${start}, ${start + diff}, ${start + diff * 2}, ?`, a: start + diff * 3 }; });
      case 'puzzle':
        return Array.from({ length: 8 }, () => { const a = Math.floor(Math.random() * 12) + 1; const b = Math.floor(Math.random() * 12) + 1; return { q: `${a} × ${b} = ?`, a: a * b }; });
      case 'memory': {
        const values = ['DNA', 'Gene', 'Cell', 'Nucleus', 'Force', 'Newton', 'Energy', 'Joule', 'Atom', 'Electron', 'Plant', 'Photosynthesis'];
        const pairIds = values.flatMap((value, pairIndex) => [
          { value, pairId: Math.floor(pairIndex / 2) },
          { value, pairId: Math.floor(pairIndex / 2) }
        ]);
        return pairIds.sort(() => Math.random() - 0.5);
      }
      default:
        return null;
    }
  };

  const finishGame = () => {
    const finalAccuracy = answered > 0 ? Math.round((correct / answered) * 100) : (score > 0 ? 100 : 0);
    setAccuracy(finalAccuracy);
    setGameStatus('result');
    if (currentSessionId) {
      const gameData = {
        id: Math.random().toString(36).substr(2, 9),
        session_id: currentSessionId,
        user_name: userName,
        score,
        accuracy: finalAccuracy,
        time_taken: 60 - timeLeft,
        room_id: roomId
      };
      
      setLeaderboard(prev => {
        const existing = prev.find(p => p.user_name === userName);
        if (existing) {
          return prev.map(p => p.user_name === userName ? { ...p, score: p.score + score } : p).sort((a, b) => b.score - a.score);
        }
        return [...prev, { user_name: userName, score: score }].sort((a, b) => b.score - a.score);
      });

      // Log activity for AI Coach
      const activities = JSON.parse(localStorage.getItem('studysnap-activities') || '[]');
      activities.push({
        id: Math.random().toString(36).substr(2, 9),
        user_name: userName,
        type: 'game_played',
        score,
        accuracy: finalAccuracy,
        duration: 60 - timeLeft,
        metadata: { game_type: activeGame, room_id: roomId },
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('studysnap-activities', JSON.stringify(activities));
    }
  };

  // Game Components
  const MathGame = ({ config, onScore, onFinish }: { config: any, onScore: (s: number) => void, onFinish: () => void }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [input, setInput] = useState('');
    
    if (!config || !config[currentIdx]) return null;
    const currentQ = config[currentIdx];

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (parseInt(input) === currentQ.a) {
        onScore(10);
      }
      setInput('');
      if (currentIdx < config.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        onFinish();
      }
    };

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-6xl font-black mb-8 text-app-text">{currentQ.q}</div>
        <form onSubmit={handleSubmit} className="w-full max-w-xs">
          <input
            autoFocus
            type="number"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full p-6 text-3xl text-center rounded-3xl bg-app-card border-2 border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            placeholder="?"
          />
        </form>
      </div>
    );
  };

  const WordGame = ({ config, onScore, onFinish }: { config: any, onScore: (s: number) => void, onFinish: () => void }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [input, setInput] = useState('');
    
    if (!config || !config[currentIdx]) return null;
    const currentQ = config[currentIdx];

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (input.toUpperCase() === currentQ.a) {
        onScore(20);
      }
      setInput('');
      if (currentIdx < config.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        onFinish();
      }
    };

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-4xl font-black mb-4 tracking-widest text-indigo-600">{currentQ.q}</div>
        <div className="text-sm text-app-text-muted mb-8">Unscramble the science word</div>
        <form onSubmit={handleSubmit} className="w-full max-w-xs">
          <input
            autoFocus
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full p-6 text-2xl text-center rounded-3xl bg-app-card border-2 border-indigo-500 focus:outline-none uppercase"
            placeholder="Type word..."
          />
        </form>
      </div>
    );
  };

  const MemoryGame = ({ config, onScore, onFinish }: { config: any, onScore: (s: number) => void, onFinish: () => void }) => {
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matched, setMatched] = useState<number[]>([]);

    if (!config) return null;

    const handleFlip = (idx: number) => {
      if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
      
      const newFlipped = [...flipped, idx];
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        const [first, second] = newFlipped;
        if (config[first].pairId === config[second].pairId) {
          setMatched(prev => [...prev, first, second]);
          onScore(50);
          setFlipped([]);
          if (matched.length + 2 === config.length) {
            onFinish();
          }
        } else {
          setTimeout(() => setFlipped([]), 1000);
        }
      }
    };

    return (
      <div className="grid grid-cols-3 gap-3 h-full content-center">
        {config.map((item: {value: string; pairId: number}, idx: number) => (
          <button
            key={idx}
            onClick={() => handleFlip(idx)}
            className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              flipped.includes(idx) || matched.includes(idx)
                ? 'bg-indigo-600 text-white rotate-y-180'
                : 'bg-app-card border-2 border-app-border text-transparent'
            }`}
          >
            {item.value}
          </button>
        ))}
      </div>
    );
  };

  const SequenceGame = ({ config, onScore, onFinish }: { config: any[]; onScore: (s: number) => void; onFinish: () => void }) => {
    const [index, setIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [locked, setLocked] = useState(false);
    const current = config?.[index];
    if (!current) return null;
    const submit = () => {
      if (locked) return;
      setLocked(true);
      if (Number(answer.trim()) === Number(current.a)) onScore(10);
      setTimeout(() => {
        if (index >= config.length - 1) onFinish();
        else { setIndex(i => i + 1); setAnswer(''); setLocked(false); }
      }, 350);
    };
    return <div className="h-full flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center"><div className="text-xs font-bold text-app-text-muted uppercase tracking-widest mb-3">Question {index + 1} / {config.length}</div><div className="text-3xl font-black text-app-text">{current.q}</div></div>
      <div className="flex w-full max-w-sm gap-3"><input autoFocus inputMode="numeric" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} className="flex-1 p-4 rounded-2xl bg-app-card border border-app-border text-center text-xl font-black outline-none focus:border-indigo-500" placeholder="Answer" /><button onClick={submit} disabled={!answer.trim() || locked} className="px-6 rounded-2xl bg-indigo-600 text-white font-bold disabled:opacity-40">Check</button></div>
    </div>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-app-bg rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-app-card border-b border-app-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-app-text">Free Mind Zone</h2>
              <p className="text-xs text-app-text-muted">Keep your brain sharp</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-app-bg text-app-text-muted">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {gameStatus === 'idle' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'math', icon: <Calculator />, label: 'Speed Math', color: 'bg-blue-500' },
                  { id: 'word', icon: <Type />, label: 'Word Builder', color: 'bg-purple-500' },
                  { id: 'memory', icon: <Brain />, label: 'Memory Match', color: 'bg-emerald-500' },
                  { id: 'logic', icon: <Hash />, label: 'Number Logic', color: 'bg-amber-500' },
                  { id: 'puzzle', icon: <Puzzle />, label: 'Puzzle Grid', color: 'bg-rose-500' },
                  { id: 'pattern', icon: <Zap />, label: 'Pattern Recall', color: 'bg-indigo-500' },
                ].map(game => (
                  <button
                    key={game.id}
                    onClick={() => startGame(game.id as GameType)}
                    className={`p-6 rounded-3xl border-2 border-transparent transition-all text-left flex flex-col gap-4 group ${
                      isAdmin ? 'hover:border-indigo-500 hover:bg-indigo-50/50' : 'opacity-50 cursor-not-allowed'
                    } bg-app-card`}
                  >
                    <div className={`w-12 h-12 rounded-2xl ${game.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      {game.icon}
                    </div>
                    <div>
                      <div className="font-bold text-app-text">{game.label}</div>
                      <div className="text-[10px] text-app-text-muted uppercase tracking-wider">
                        Start Game
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {leaderboard.length > 0 && (
                <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-4 text-indigo-600">
                    <Trophy size={18} />
                    <h3 className="font-bold">Room Leaderboard</h3>
                  </div>
                  <div className="space-y-3">
                    {leaderboard.map((player, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-indigo-300">#{idx + 1}</span>
                          <span className="font-bold text-app-text">{player.user_name}</span>
                        </div>
                        <span className="font-black text-indigo-600">{player.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {gameStatus === 'playing' && (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-100 text-indigo-600 font-bold">
                    <Timer size={18} />
                    <span>{timeLeft}s</span>
                  </div>
                  <div className="text-lg font-black text-app-text">{score} pts</div>
                </div>
                <div className="text-xs font-bold text-app-text-muted uppercase tracking-widest">
                  {activeGame} Mode
                </div>
              </div>

              <div className="flex-1 min-h-[300px]">
                {activeGame === 'math' && <MathGame config={gameConfig} onScore={(s) => { setScore(prev => prev + s); setAnswered(prev => prev + 1); setCorrect(prev => prev + 1); }} onFinish={finishGame} />}
                {activeGame === 'word' && <WordGame config={gameConfig} onScore={(s) => { setScore(prev => prev + s); setAnswered(prev => prev + 1); setCorrect(prev => prev + 1); }} onFinish={finishGame} />}
                {activeGame === 'memory' && <MemoryGame config={gameConfig} onScore={(s) => { setScore(prev => prev + s); setAnswered(prev => prev + 1); setCorrect(prev => prev + 1); }} onFinish={finishGame} />}
                {['logic', 'pattern', 'puzzle'].includes(activeGame!) && <SequenceGame config={gameConfig} onScore={(s) => { setScore(prev => prev + s); setAnswered(prev => prev + 1); setCorrect(prev => prev + 1); }} onFinish={finishGame} />}
              </div>
            </div>
          )}

          {gameStatus === 'result' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <Trophy size={48} />
              </div>
              <h2 className="text-3xl font-black text-app-text mb-2">Round Finished!</h2>
              <p className="text-app-text-muted mb-8">Great job, {userName}!</p>
              
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="p-6 rounded-3xl bg-app-card border border-app-border">
                  <div className="text-3xl font-black text-indigo-600">{score}</div>
                  <div className="text-xs text-app-text-muted uppercase font-bold">Score</div>
                </div>
                <div className="p-6 rounded-3xl bg-app-card border border-app-border">
                  <div className="text-3xl font-black text-emerald-600">{accuracy}%</div>
                  <div className="text-xs text-app-text-muted uppercase font-bold">Accuracy</div>
                </div>
              </div>

              <button 
                onClick={() => setGameStatus('idle')}
                className="w-full p-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200"
              >
                Back to Lobby
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
