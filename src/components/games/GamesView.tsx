/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Timer,
  Award,
  RotateCcw,
  CheckCircle,
  XCircle,
  HelpCircle,
  Flame,
  ArrowRight,
  Shield,
  Zap,
  Sparkles,
  Trophy,
  Cpu,
  Coins,
  Brain,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext.tsx';
import { GameType } from '../../types.ts';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';

interface GamesViewProps {
  onOpenAuth: () => void;
}

export const GamesView: React.FC<GamesViewProps> = ({ onOpenAuth }) => {
  const { currentUser, addDemoCredits } = useAuth();
  const [activeGame, setActiveGame] = useState<GameType | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
            Skill Games & Cognitive Challenges
          </h1>
          <p className="text-xs text-gray-400">
            Train mental agility and mathematical intuition. Demo Credits awarded for verified practice sessions.
          </p>
        </div>

        {activeGame && (
          <button
            onClick={() => setActiveGame(null)}
            className="px-3.5 py-1.5 rounded-lg bg-[#1C2433] hover:bg-[#222C3D] text-gray-300 text-xs font-medium border border-[#2A3649] flex items-center gap-1.5 self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Select Another Game</span>
          </button>
        )}
      </div>

      {!activeGame ? (
        /* Game Selection Hub */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Game 1: Quick Math */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] hover:border-[#D4AF37]/50 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-4 group-hover:scale-105 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-medium mb-1">
                <span>30-Second Sprint</span>
                <span aria-hidden="true">·</span>
                <span>Arithmetic</span>
              </div>
              <h2 className="text-lg font-bold font-['Outfit'] text-white mb-2">
                Quick Math
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Solve fast arithmetic problems under pressure. Build answer streaks and test mental calculation speed.
              </p>
              <div className="text-[11px] text-gray-400 space-y-1 mb-6">
                <div>• Random operations: +, −, ×, ÷</div>
                <div>• 4 multiple choice options</div>
                <div>• Earn up to 25 Practice Credits</div>
              </div>
            </div>

            <button
              onClick={() => setActiveGame('quick-math')}
              className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Play Quick Math</span>
            </button>
          </div>

          {/* Game 2: Pattern Sprint */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] hover:border-[#10B981]/50 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] mb-4 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 text-xs text-[#10B981] font-medium mb-1">
                <span>Logic & Sequences</span>
                <span aria-hidden="true">·</span>
                <span>3 Difficulty Levels</span>
              </div>
              <h2 className="text-lg font-bold font-['Outfit'] text-white mb-2">
                Pattern Sprint
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Analyze numerical progressions and identify missing sequence terms in Fibonacci, powers, and staggered series.
              </p>
              <div className="text-[11px] text-gray-400 space-y-1 mb-6">
                <div>• Easy, Medium & Hard modes</div>
                <div>• 5 questions per sprint</div>
                <div>• Earn up to 30 Practice Credits</div>
              </div>
            </div>

            <button
              onClick={() => setActiveGame('pattern-sprint')}
              className="w-full py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#080B12] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Play Pattern Sprint</span>
            </button>
          </div>

          {/* Game 3: Memory Challenge */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] hover:border-purple-500/50 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-400 font-medium mb-1">
                <span>Visual Recall</span>
                <span aria-hidden="true">·</span>
                <span>12 Card Matrix</span>
              </div>
              <h2 className="text-lg font-bold font-['Outfit'] text-white mb-2">
                Memory Challenge
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Flip and pair 6 matching technology & security icons in minimal turns and shortest time.
              </p>
              <div className="text-[11px] text-gray-400 space-y-1 mb-6">
                <div>• Real card flipping mechanics</div>
                <div>• Tracks moves & completion time</div>
                <div>• Earn up to 35 Practice Credits</div>
              </div>
            </div>

            <button
              onClick={() => setActiveGame('memory-challenge')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Play Memory Challenge</span>
            </button>
          </div>
        </div>
      ) : activeGame === 'quick-math' ? (
        <QuickMathGame onOpenAuth={onOpenAuth} />
      ) : activeGame === 'pattern-sprint' ? (
        <PatternSprintGame onOpenAuth={onOpenAuth} />
      ) : (
        <MemoryChallengeGame onOpenAuth={onOpenAuth} />
      )}
    </div>
  );
};

/* =========================================================
   GAME 1: QUICK MATH
   ========================================================= */
const QuickMathGame: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { currentUser, addDemoCredits } = useAuth();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [question, setQuestion] = useState<{ text: string; answer: number; options: number[] }>({
    text: '',
    answer: 0,
    options: [],
  });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  const generateQuestion = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = 0;
    let b = 0;
    let ans = 0;

    if (op === '+') {
      a = Math.floor(Math.random() * 40) + 5;
      b = Math.floor(Math.random() * 40) + 5;
      ans = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 50) + 20;
      b = Math.floor(Math.random() * a) + 1;
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
      ans = a * b;
    }

    const distractors = new Set<number>();
    distractors.add(ans);
    while (distractors.size < 4) {
      const offset = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const val = ans + offset;
      if (val >= 0 && val !== ans) {
        distractors.add(val);
      }
    }

    const shuffled = Array.from(distractors).sort(() => Math.random() - 0.5);
    setQuestion({
      text: `${a} ${op === '*' ? '×' : op} ${b}`,
      answer: ans,
      options: shuffled,
    });
    setSelectedOption(null);
    setIsCorrectFeedback(null);
  };

  const startGame = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setScore(0);
    setStreak(0);
    setTotalAnswered(0);
    setTimeLeft(30);
    setGameOver(false);
    setRewardClaimed(false);
    setIsPlaying(true);
    generateQuestion();
  };

  useEffect(() => {
    if (!isPlaying) return;

    if (timeLeft <= 0) {
      setIsPlaying(false);
      setGameOver(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Handle game over reward
  useEffect(() => {
    const recordGame = async () => {
      if (gameOver && currentUser && !rewardClaimed && score > 0) {
        // Safe reward: 2 credits per correct answer up to 25
        const reward = Math.min(25, Math.max(5, Math.round(score * 2)));
        setRewardClaimed(true);

        await addDemoCredits(
          reward,
          'game_reward',
          `Quick Math High Score (${score} pts)`
        );

        try {
          await addDoc(collection(db, 'gameResults'), {
            userId: currentUser.uid,
            gameType: 'quick-math',
            score,
            rewardCredits: reward,
            playedAt: new Date().toISOString(),
          });
        } catch {}

        try {
          confetti({ particleCount: 50, spread: 50 });
        } catch {}
      }
    };

    recordGame();
  }, [gameOver, currentUser, rewardClaimed, score]);

  const handleSelectAnswer = (option: number) => {
    if (selectedOption !== null || !isPlaying) return;

    setSelectedOption(option);
    setTotalAnswered((prev) => prev + 1);

    if (option === question.answer) {
      setIsCorrectFeedback(true);
      setScore((prev) => prev + 1 + Math.floor(streak / 3));
      setStreak((prev) => prev + 1);
    } else {
      setIsCorrectFeedback(false);
      setStreak(0);
    }

    setTimeout(() => {
      if (timeLeft > 0) {
        generateQuestion();
      }
    }, 450);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] text-center space-y-6">
      <div className="flex items-center justify-between border-b border-[#2A3649] pb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-base font-bold font-['Outfit'] text-white">Quick Math</h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1 text-gray-300">
            <Timer className="w-4 h-4 text-[#D4AF37]" />
            <span className="tabular-nums font-bold text-white text-sm">{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-1 text-gray-300">
            <span>Score:</span>
            <span className="tabular-nums font-bold text-[#10B981] text-sm">{score}</span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1 text-amber-400">
              <Flame className="w-3.5 h-3.5" />
              <span>{streak}x</span>
            </div>
          )}
        </div>
      </div>

      {!isPlaying && !gameOver ? (
        <div className="py-10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mx-auto">
            <Brain className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-['Outfit'] text-white">Are You Ready?</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            You will have 30 seconds to answer as many arithmetic questions as you can. Maintain streaks to earn bonus points.
          </p>
          <button
            onClick={startGame}
            className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] font-bold text-sm tracking-wide shadow-lg shadow-[#D4AF37]/20"
          >
            Start 30s Challenge
          </button>
        </div>
      ) : isPlaying ? (
        <div className="py-6 space-y-8">
          <div className="text-4xl sm:text-5xl font-extrabold font-mono tracking-wider text-white">
            {question.text} = ?
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {question.options.map((option, idx) => {
              let btnStyle = 'bg-[#101828] text-white hover:border-[#D4AF37]';
              if (selectedOption !== null) {
                if (option === question.answer) {
                  btnStyle = 'bg-[#10B981] text-black font-bold';
                } else if (option === selectedOption) {
                  btnStyle = 'bg-red-500 text-white font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={selectedOption !== null}
                  className={`py-4 rounded-xl text-xl font-mono border border-[#2A3649] transition-all ${btnStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {isCorrectFeedback !== null && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
              {isCorrectFeedback ? (
                <span className="text-[#10B981] flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Correct!
                </span>
              ) : (
                <span className="text-red-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Incorrect!
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 space-y-4">
          <Award className="w-12 h-12 text-[#D4AF37] mx-auto" />
          <h3 className="text-xl font-bold font-['Outfit'] text-white">Game Complete!</h3>
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto p-4 rounded-xl bg-[#101828] border border-[#2A3649] text-center">
            <div>
              <div className="text-xs text-gray-400">Score</div>
              <div className="text-lg font-bold font-mono text-white">{score}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Total</div>
              <div className="text-lg font-bold font-mono text-white">{totalAnswered}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Accuracy</div>
              <div className="text-lg font-bold font-mono text-[#10B981]">
                {totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0}%
              </div>
            </div>
          </div>

          {score > 0 && (
            <p className="text-xs text-[#10B981] font-medium">
              +{Math.min(25, Math.max(5, Math.round(score * 2)))} Demo Credits earned and added to wallet!
            </p>
          )}

          <button
            onClick={startGame}
            className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] font-bold text-sm"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   GAME 2: PATTERN SPRINT
   ========================================================= */
const PATTERN_PUZZLES = [
  {
    difficulty: 'easy',
    sequence: [2, 4, 8, 16],
    answer: 32,
    options: [24, 30, 32, 64],
    rule: 'Multiply by 2 at each step (powers of 2)',
  },
  {
    difficulty: 'easy',
    sequence: [3, 7, 11, 15],
    answer: 19,
    options: [18, 19, 21, 23],
    rule: 'Arithmetic sequence adding 4 each time',
  },
  {
    difficulty: 'medium',
    sequence: [1, 1, 2, 3, 5, 8],
    answer: 13,
    options: [11, 12, 13, 15],
    rule: 'Fibonacci sequence (each number is sum of previous two)',
  },
  {
    difficulty: 'medium',
    sequence: [2, 6, 18, 54],
    answer: 162,
    options: [108, 154, 162, 172],
    rule: 'Multiply by 3 each time',
  },
  {
    difficulty: 'hard',
    sequence: [1, 4, 9, 16, 25],
    answer: 36,
    options: [30, 34, 36, 49],
    rule: 'Squares of natural numbers (1², 2², 3², 4², 5², 6²)',
  },
  {
    difficulty: 'hard',
    sequence: [3, 5, 9, 17, 33],
    answer: 65,
    options: [49, 57, 65, 68],
    rule: 'Double the difference added each time (+2, +4, +8, +16, +32)',
  },
];

const PatternSprintGame: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { currentUser, addDemoCredits } = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  const puzzles = PATTERN_PUZZLES.filter(
    (p) => selectedDifficulty === 'all' || p.difficulty === selectedDifficulty
  );

  const currentPuzzle = puzzles[currentIndex] || puzzles[0];

  const handleAnswer = async (opt: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(opt);
    setShowExplanation(true);

    const isCorrect = opt === currentPuzzle.answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex + 1 < puzzles.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setGameFinished(true);
      if (currentUser && score > 0) {
        const reward = Math.min(30, (score + 1) * 6);
        await addDemoCredits(reward, 'game_reward', `Pattern Sprint Completed (${score + 1}/${puzzles.length})`);
        try {
          confetti({ particleCount: 50, spread: 60 });
        } catch {}
      }
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameFinished(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-6">
      <div className="flex items-center justify-between border-b border-[#2A3649] pb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#10B981]" />
          <h2 className="text-base font-bold font-['Outfit'] text-white">Pattern Sprint</h2>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'easy', 'medium', 'hard'].map((d) => (
            <button
              key={d}
              onClick={() => {
                setSelectedDifficulty(d);
                restart();
              }}
              className={`px-2.5 py-1 text-[11px] rounded capitalize ${
                selectedDifficulty === d
                  ? 'bg-[#10B981] text-black font-bold'
                  : 'text-gray-400 bg-[#101828] hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {!gameFinished ? (
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Question {currentIndex + 1} of {puzzles.length}</span>
            <span className="capitalize text-[#10B981] font-medium">{currentPuzzle.difficulty}</span>
          </div>

          {/* Sequence Card */}
          <div className="p-6 rounded-xl bg-[#101828] border border-[#2A3649]">
            <p className="text-xs text-gray-400 mb-2">Find the next number in the pattern:</p>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-widest text-white">
              {currentPuzzle.sequence.join(', ')}, <span className="text-[#D4AF37] underline">?</span>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {currentPuzzle.options.map((opt, idx) => {
              let btnStyle = 'bg-[#101828] text-white hover:border-[#10B981]';
              if (selectedAnswer !== null) {
                if (opt === currentPuzzle.answer) {
                  btnStyle = 'bg-[#10B981] text-black font-bold';
                } else if (opt === selectedAnswer) {
                  btnStyle = 'bg-red-500 text-white font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={selectedAnswer !== null}
                  className={`py-3.5 rounded-xl font-mono text-lg border border-[#2A3649] transition-all ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="p-3.5 rounded-xl bg-[#101828] border border-[#2A3649] text-xs text-left space-y-1">
              <span className="font-bold text-[#10B981]">Pattern Rule: </span>
              <span className="text-gray-300">{currentPuzzle.rule}</span>
            </div>
          )}

          {selectedAnswer !== null && (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-xl bg-[#10B981] text-black text-xs font-bold hover:bg-[#059669]"
            >
              {currentIndex + 1 < puzzles.length ? 'Next Pattern →' : 'View Results'}
            </button>
          )}
        </div>
      ) : (
        <div className="py-8 text-center space-y-4">
          <Trophy className="w-12 h-12 text-[#10B981] mx-auto" />
          <h3 className="text-xl font-bold font-['Outfit'] text-white">Sprint Finished!</h3>
          <p className="text-sm text-gray-300">
            You scored <span className="font-bold font-mono text-[#10B981]">{score}</span> out of {puzzles.length} correctly.
          </p>
          <button
            onClick={restart}
            className="px-6 py-2.5 rounded-xl bg-[#10B981] text-black text-xs font-bold"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   GAME 3: MEMORY CHALLENGE (CARD MATCHING)
   ========================================================= */
interface MemoryCard {
  id: number;
  iconName: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_ICONS = ['Shield', 'Zap', 'Sparkles', 'Trophy', 'Cpu', 'Award'];

const MemoryChallengeGame: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { currentUser, addDemoCredits } = useAuth();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Initialize deck
  const initializeGame = () => {
    const deck: MemoryCard[] = [];
    const iconPairs = [...CARD_ICONS, ...CARD_ICONS];
    // Shuffle
    const shuffled = iconPairs.sort(() => Math.random() - 0.5);

    shuffled.forEach((icon, idx) => {
      deck.push({
        id: idx,
        iconName: icon,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(deck);
    setFlippedCards([]);
    setMoves(0);
    setTimer(0);
    setIsTimerRunning(false);
    setIsCompleted(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Timer tick
  useEffect(() => {
    if (!isTimerRunning || isCompleted) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isCompleted]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }

    const newCards = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find((c) => c.id === firstId);
      const secondCard = newCards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.iconName === secondCard.iconName) {
        // Matched
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);

          // Check if all matched
          const allMatched = newCards.every(
            (c) => c.isMatched || c.id === firstId || c.id === secondId
          );
          if (allMatched) {
            setIsCompleted(true);
            setIsTimerRunning(false);
            if (currentUser) {
              addDemoCredits(30, 'game_reward', `Memory Challenge Solved in ${moves + 1} moves`);
              try {
                confetti({ particleCount: 70, spread: 70 });
              } catch {}
            }
          }
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  const renderCardIcon = (name: string) => {
    switch (name) {
      case 'Shield':
        return <Shield className="w-6 h-6 text-[#10B981]" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-[#D4AF37]" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-amber-400" />;
      case 'Trophy':
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-cyan-400" />;
      default:
        return <Award className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 rounded-2xl bg-[#1C2433] border border-[#2A3649] space-y-6">
      <div className="flex items-center justify-between border-b border-[#2A3649] pb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold font-['Outfit'] text-white">Memory Challenge</h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-gray-300">
          <div className="flex items-center gap-1">
            <Timer className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-bold text-white">{timer}s</span>
          </div>
          <div>
            <span>Moves: </span>
            <span className="font-bold text-white">{moves}</span>
          </div>
          <button
            onClick={initializeGame}
            title="Restart Game"
            className="p-1 hover:text-white rounded"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isCompleted ? (
        <div className="py-8 text-center space-y-4">
          <Trophy className="w-14 h-14 text-[#D4AF37] mx-auto animate-bounce" />
          <h3 className="text-xl font-bold font-['Outfit'] text-white">Matrix Cleared!</h3>
          <p className="text-xs text-gray-300">
            Completed in <span className="text-[#D4AF37] font-bold">{timer} seconds</span> and{' '}
            <span className="text-[#10B981] font-bold">{moves} moves</span>.
          </p>
          <p className="text-xs text-[#10B981] font-semibold">+30 Demo Credits credited to wallet!</p>
          <button
            onClick={initializeGame}
            className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card) => {
            const isRevealed = card.isFlipped || card.isMatched;
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`h-20 sm:h-24 rounded-xl cursor-pointer flex items-center justify-center transition-all duration-300 select-none ${
                  card.isMatched
                    ? 'bg-[#10B981]/20 border border-[#10B981]/40'
                    : isRevealed
                    ? 'bg-[#101828] border border-[#D4AF37]/50 shadow-inner'
                    : 'bg-[#101828] hover:bg-[#152033] border border-[#2A3649]'
                }`}
              >
                {isRevealed ? (
                  renderCardIcon(card.iconName)
                ) : (
                  <span className="text-[#D4AF37]/40 font-mono font-bold text-xs">Z</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
