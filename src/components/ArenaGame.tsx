import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Trophy, 
  Timer, 
  Swords, 
  Target, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Video,
  VideoOff,
  Monitor
} from 'lucide-react';
import { GameType } from '../types';

interface ArenaGameProps {
  matchId: string;
  opponent: string;
  userName: string;
  opponentStream: MediaStream | null;
  myStream: MediaStream | null;
  onFinish: () => void;
  isLeague?: boolean;
}

export default function ArenaGame({ matchId, opponent, userName, opponentStream, myStream, onFinish, isLeague }: ArenaGameProps) {
  const [gameStatus, setGameStatus] = useState<'countdown' | 'playing' | 'round_end' | 'match_end'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [activeGame, setActiveGame] = useState<GameType>('math');
  const [gameConfig, setGameConfig] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [myScore, setMyScore] = useState(0);
  const [myAccuracy, setMyAccuracy] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [roundResults, setRoundResults] = useState<any[]>([]);
  
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const opponentVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (myVideoRef.current && myStream) myVideoRef.current.srcObject = myStream;
    if (opponentVideoRef.current && opponentStream) opponentVideoRef.current.srcObject = opponentStream;
  }, [myStream, opponentStream]);

  useEffect(() => {
    if (gameStatus === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        startRound();
      }
    }
  }, [gameStatus, countdown]);

  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameStatus === 'playing') {
      finishRound();
    }
  }, [gameStatus, timeLeft]);

  useEffect(() => {
    if (gameStatus === 'playing') {
      const botInterval = setInterval(() => {
        setOpponentScore(prev => prev + Math.floor(Math.random() * 5));
        setOpponentProgress(prev => Math.min(100, prev + Math.floor(Math.random() * 10)));
      }, 2000);
      return () => clearInterval(botInterval);
    }
  }, [gameStatus]);

  const startRound = () => {
    const types: GameType[] = ['math', 'word', 'memory', 'logic'];
    const type = types[Math.floor(Math.random() * types.length)];
    setActiveGame(type);
    setGameConfig(generateGameConfig(type));
    setTimeLeft(30);
    setGameStatus('playing');
  };

  const generateGameConfig = (type: GameType) => {
    switch (type) {
      case 'math':
        return Array.from({ length: 15 }, () => {
          const a = Math.floor(Math.random() * 20) + 5;
          const b = Math.floor(Math.random() * 20) + 5;
          return { q: `${a} + ${b}`, a: a + b };
        });
      case 'word':
        const words = ['NEURON', 'SYNAPSE', 'CORTEX', 'LOGIC', 'MEMORY', 'BRAIN', 'THINK', 'FOCUS'];
        return words.map(w => ({
          q: w.split('').sort(() => Math.random() - 0.5).join(''),
          a: w
        }));
      case 'memory':
        const items = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍒'];
        return [...items, ...items].sort(() => Math.random() - 0.5);
      default:
        return Array.from({ length: 10 }, (_, i) => ({ q: `${i}, ${i+2}, ${i+4}, ?`, a: i+6 }));
    }
  };

  const finishRound = () => {
    setGameStatus('round_end');
    
    // Simulate opponent round end
    const opponentRoundScore = Math.floor(Math.random() * 50) + 50;
    setOpponentScore(prev => prev + opponentRoundScore);
    
    setRoundResults(prev => [
      ...prev, 
      { userName, score: myScore, totalScore: myScore },
      { userName: opponent, score: opponentRoundScore, totalScore: opponentScore + opponentRoundScore }
    ]);

    if (currentRound < 3) {
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        setCountdown(3);
        setGameStatus('countdown');
      }, 5000);
    } else {
      setTimeout(() => setGameStatus('match_end'), 5000);
    }
  };

  const handleProgress = (progress: number, currentScore: number, isCorrect?: boolean) => {
    setMyScore(currentScore);
    
    if (isCorrect !== undefined) {
      setTotalAnswers(prev => prev + 1);
      if (isCorrect) setCorrectAnswers(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (totalAnswers > 0) {
      setMyAccuracy(Math.round((correctAnswers / totalAnswers) * 100));
    }
  }, [totalAnswers, correctAnswers]);

  const finishMatch = () => {
    const win = myScore > opponentScore;
    
    // Update local profile
    const profiles = JSON.parse(localStorage.getItem('arena-profiles') || '{}');
    if (profiles[userName]) {
      profiles[userName].matches_played += 1;
      if (win) {
        profiles[userName].matches_won += 1;
        profiles[userName].points += 25;
      } else {
        profiles[userName].points += 5;
      }
      profiles[userName].avg_accuracy = (profiles[userName].avg_accuracy + myAccuracy) / 2;
      localStorage.setItem('arena-profiles', JSON.stringify(profiles));
    }

    // Log activity for AI Coach
    const activities = JSON.parse(localStorage.getItem('studysnap-activities') || '[]');
    activities.push({
      id: Math.random().toString(36).substr(2, 9),
      user_name: userName,
      type: 'arena_match',
      score: myScore,
      accuracy: myAccuracy || 100,
      duration: 90, // Approx 3 rounds
      metadata: { opponent, win, matchId },
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('studysnap-activities', JSON.stringify(activities));

    onFinish();
  };

  // Mini Game Components
  const MathGame = () => {
    const [idx, setIdx] = useState(0);
    const [input, setInput] = useState('');
    const q = gameConfig[idx];

    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      const isCorrect = parseInt(input) === q.a;
      if (isCorrect) {
        const newScore = myScore + 10 + Math.floor(timeLeft / 2);
        handleProgress(((idx + 1) / gameConfig.length) * 100, newScore, true);
      } else {
        handleProgress(((idx + 1) / gameConfig.length) * 100, myScore, false);
      }
      setInput('');
      if (idx < gameConfig.length - 1) setIdx(idx + 1);
      else finishRound();
    };

    return (
      <div className="flex flex-col items-center justify-center gap-8 h-full">
        <div className="text-7xl font-black text-app-text">{q.q}</div>
        <form onSubmit={submit} className="w-full max-w-xs">
          <input 
            autoFocus type="number" value={input} onChange={e => setInput(e.target.value)}
            className="w-full p-6 text-4xl text-center rounded-3xl bg-app-card border-4 border-indigo-500 focus:outline-none"
            placeholder="?"
          />
        </form>
      </div>
    );
  };

  const WordGame = () => {
    const [idx, setIdx] = useState(0);
    const [input, setInput] = useState('');
    const q = gameConfig[idx];

    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      const isCorrect = input.toUpperCase() === q.a;
      if (isCorrect) {
        const newScore = myScore + 15 + Math.floor(timeLeft / 2);
        handleProgress(((idx + 1) / gameConfig.length) * 100, newScore, true);
      } else {
        handleProgress(((idx + 1) / gameConfig.length) * 100, myScore, false);
      }
      setInput('');
      if (idx < gameConfig.length - 1) setIdx(idx + 1);
      else finishRound();
    };

    return (
      <div className="flex flex-col items-center justify-center gap-8 h-full">
        <div className="text-xs font-black text-app-text-muted uppercase tracking-widest">Unscramble the word</div>
        <div className="text-6xl font-black text-app-text tracking-widest">{q.q}</div>
        <form onSubmit={submit} className="w-full max-w-xs">
          <input 
            autoFocus type="text" value={input} onChange={e => setInput(e.target.value)}
            className="w-full p-6 text-3xl text-center rounded-3xl bg-app-card border-4 border-indigo-500 focus:outline-none uppercase"
            placeholder="WORD"
          />
        </form>
      </div>
    );
  };

  const MemoryGame = () => {
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matched, setMatched] = useState<number[]>([]);

    const handleFlip = (idx: number) => {
      if (flipped.length === 2 || matched.includes(idx) || flipped.includes(idx)) return;
      
      const newFlipped = [...flipped, idx];
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        if (gameConfig[newFlipped[0]] === gameConfig[newFlipped[1]]) {
          setMatched([...matched, ...newFlipped]);
          setFlipped([]);
          const newScore = myScore + 20;
          handleProgress(((matched.length + 2) / gameConfig.length) * 100, newScore, true);
          if (matched.length + 2 === gameConfig.length) finishRound();
        } else {
          setTimeout(() => {
            setFlipped([]);
            handleProgress((matched.length / gameConfig.length) * 100, myScore, false);
          }, 1000);
        }
      }
    };

    return (
      <div className="grid grid-cols-4 gap-4 h-full content-center max-w-md mx-auto">
        {gameConfig.map((item: string, i: number) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleFlip(i)}
            className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all ${
              flipped.includes(i) || matched.includes(i) 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-app-card border-2 border-app-border text-transparent'
            }`}
          >
            {(flipped.includes(i) || matched.includes(i)) ? item : '?'}
          </motion.button>
        ))}
      </div>
    );
  };

  const LogicGame = () => {
    const [idx, setIdx] = useState(0);
    const [input, setInput] = useState('');
    const q = gameConfig[idx];

    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      const isCorrect = parseInt(input) === q.a;
      if (isCorrect) {
        const newScore = myScore + 15 + Math.floor(timeLeft / 2);
        handleProgress(((idx + 1) / gameConfig.length) * 100, newScore, true);
      } else {
        handleProgress(((idx + 1) / gameConfig.length) * 100, myScore, false);
      }
      setInput('');
      if (idx < gameConfig.length - 1) setIdx(idx + 1);
      else finishRound();
    };

    return (
      <div className="flex flex-col items-center justify-center gap-8 h-full">
        <div className="text-xs font-black text-app-text-muted uppercase tracking-widest">Complete the sequence</div>
        <div className="text-5xl font-black text-app-text">{q.q}</div>
        <form onSubmit={submit} className="w-full max-w-xs">
          <input 
            autoFocus type="number" value={input} onChange={e => setInput(e.target.value)}
            className="w-full p-6 text-4xl text-center rounded-3xl bg-app-card border-4 border-indigo-500 focus:outline-none"
            placeholder="?"
          />
        </form>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-app-bg flex flex-col">
      {/* HUD Header */}
      <div className="p-6 bg-app-card border-b border-app-border flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs font-black text-app-text-muted uppercase tracking-widest">{userName}</span>
            <span className="text-2xl font-black text-indigo-600">{myScore}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Swords size={24} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-black text-app-text-muted uppercase tracking-widest">{opponent}</span>
            <span className="text-2xl font-black text-rose-600">{opponentScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Accuracy</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-app-border rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${myAccuracy > 80 ? 'bg-emerald-500' : myAccuracy > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  animate={{ width: `${myAccuracy}%` }}
                />
              </div>
              <span className="text-sm font-black text-app-text">{myAccuracy}%</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
          <div className="px-6 py-2 rounded-2xl bg-app-bg border border-app-border flex items-center gap-3">
            <Timer size={20} className={timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-indigo-600'} />
            <span className={`text-xl font-black ${timeLeft < 10 ? 'text-rose-500' : 'text-app-text'}`}>
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-indigo-600 text-white font-bold">
            Round {currentRound}/3
          </div>
        </div>
      </div>
    </div>

    {/* Main Arena Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: My View */}
        <div className="flex-1 p-8 flex flex-col gap-6 relative">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-app-text-muted uppercase tracking-widest">Your Screen</h3>
            <div className="w-48 h-2 bg-app-border rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-600"
                animate={{ width: `${(myScore / (opponentScore + myScore || 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex-1 bg-app-card rounded-[40px] border border-app-border shadow-inner relative overflow-hidden">
            <AnimatePresence mode="wait">
              {gameStatus === 'countdown' && (
                <motion.div 
                  key="countdown"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-9xl font-black text-indigo-600">{countdown}</div>
                </motion.div>
              )}

              {gameStatus === 'playing' && (
                <motion.div 
                  key="game"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full p-8"
                >
                  {activeGame === 'math' && <MathGame />}
                  {activeGame === 'word' && <WordGame />}
                  {activeGame === 'memory' && <MemoryGame />}
                  {activeGame === 'logic' && <LogicGame />}
                </motion.div>
              )}

              {gameStatus === 'round_end' && (
                <motion.div 
                  key="round_end"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center gap-4"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-app-text">Round Complete!</h2>
                  <p className="text-app-text-muted">Waiting for next round...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* My Live Feed (Selfie/Screen) */}
          <div className="absolute bottom-12 right-12 w-40 h-24 rounded-2xl bg-black border-2 border-indigo-500 overflow-hidden shadow-2xl">
            <video ref={myVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-indigo-600 text-[8px] font-black text-white uppercase tracking-widest">
              Live
            </div>
          </div>
        </div>

        {/* Right: Opponent View (The "Anti-Cheat" Stream) */}
        <div className="w-full md:w-96 bg-app-card border-l border-app-border p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-app-text-muted uppercase tracking-widest">Opponent Feed</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Live</span>
            </div>
          </div>

          <div className="aspect-video rounded-3xl bg-black border border-app-border overflow-hidden shadow-lg relative">
            <video ref={opponentVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {!opponentStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 gap-2">
                <VideoOff size={32} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Connecting...</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-app-text-muted uppercase tracking-widest">
                <span>Progress</span>
                <span>{Math.round(opponentProgress)}%</span>
              </div>
              <div className="h-2 bg-app-bg rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-rose-500"
                  animate={{ width: `${opponentProgress}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-app-bg border border-app-border space-y-3">
              <h4 className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Match Log</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {roundResults.map((res, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-app-text">{res.userName}</span>
                    <span className="text-indigo-600 font-black">+{res.score}</span>
                  </div>
                ))}
                {roundResults.length === 0 && (
                  <div className="text-[10px] text-app-text-muted italic">Waiting for results...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Match End Overlay */}
      <AnimatePresence>
        {gameStatus === 'match_end' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] bg-indigo-600 flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center text-white space-y-8">
              <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mx-auto"
              >
                <Trophy size={64} />
              </motion.div>
              
              <div>
                <h2 className="text-5xl font-black mb-2">{myScore > opponentScore ? 'Victory!' : 'Defeat'}</h2>
                <p className="text-white/70">Final Score: {myScore} vs {opponentScore}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/10 border border-white/20">
                  <div className="text-3xl font-black">+{myScore > opponentScore ? 25 : 5}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Rank Points</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/10 border border-white/20">
                  <div className="text-3xl font-black">{myAccuracy}%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Accuracy</div>
                </div>
              </div>

              <button 
                onClick={finishMatch}
                className="w-full py-5 bg-white text-indigo-600 rounded-3xl font-black shadow-2xl"
              >
                Return to Arena
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
