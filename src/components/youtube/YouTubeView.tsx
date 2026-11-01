/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Tv,
  ExternalLink,
  HelpCircle,
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  RotateCcw,
  X,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext.tsx';
import { YouTubeTaskItem, YouTubeCompletion } from '../../types.ts';
import { DEFAULT_YOUTUBE_TASKS } from '../../lib/defaultData.ts';
import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';

interface YouTubeViewProps {
  onOpenAuth: () => void;
}

export const YouTubeView: React.FC<YouTubeViewProps> = ({ onOpenAuth }) => {
  const { currentUser, userProfile, addDemoCredits } = useAuth();
  const [tasks, setTasks] = useState<YouTubeTaskItem[]>(DEFAULT_YOUTUBE_TASKS);
  const [completions, setCompletions] = useState<Record<string, YouTubeCompletion>>({});
  const [activeQuizModal, setActiveQuizModal] = useState<YouTubeTaskItem | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [selectedEmbedVideo, setSelectedEmbedVideo] = useState<string | null>(null);

  // Load user completions
  useEffect(() => {
    const fetchCompletions = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'youtubeCompletions'),
          where('userId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        const map: Record<string, YouTubeCompletion> = {};
        snap.forEach((docSnap) => {
          const comp = docSnap.data() as YouTubeCompletion;
          map[comp.youtubeTaskId] = comp;
        });
        setCompletions(map);
      } catch (err) {
        console.warn('Could not load quiz completions:', err);
      }
    };

    fetchCompletions();
  }, [currentUser]);

  // Load custom YouTube tasks if added by admin in Firestore
  useEffect(() => {
    const fetchYouTubeTasks = async () => {
      try {
        const snap = await getDocs(collection(db, 'youtubeTasks'));
        if (!snap.empty) {
          const list: YouTubeTaskItem[] = [];
          snap.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<YouTubeTaskItem, 'id'>) });
          });
          const merged = [...DEFAULT_YOUTUBE_TASKS];
          list.forEach((t) => {
            if (!merged.find((m) => m.id === t.id)) {
              merged.push(t);
            }
          });
          setTasks(merged);
        }
      } catch {}
    };

    fetchYouTubeTasks();
  }, []);

  const handleStartQuiz = (task: YouTubeTaskItem) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setActiveQuizModal(task);
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuizModal || !currentUser) return;

    let correctCount = 0;
    activeQuizModal.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const totalQuestions = activeQuizModal.questions.length;
    const passed = correctCount >= Math.ceil(totalQuestions * 0.66);

    setQuizScore(correctCount);
    setQuizSubmitted(true);

    if (passed && !completions[activeQuizModal.id]) {
      const completionRecord: YouTubeCompletion = {
        id: `${currentUser.uid}_${activeQuizModal.id}`,
        userId: currentUser.uid,
        youtubeTaskId: activeQuizModal.id,
        score: correctCount,
        rewardCredits: activeQuizModal.rewardCredits,
        completedAt: new Date().toISOString(),
      };

      try {
        await setDoc(
          doc(db, 'youtubeCompletions', `${currentUser.uid}_${activeQuizModal.id}`),
          completionRecord
        );
      } catch {}

      await addDemoCredits(
        activeQuizModal.rewardCredits,
        'quiz_reward',
        `YouTube Quiz Passed: ${activeQuizModal.title}`,
        activeQuizModal.id
      );

      setCompletions((prev) => ({ ...prev, [activeQuizModal.id]: completionRecord }));

      try {
        confetti({ particleCount: 75, spread: 60 });
      } catch {}
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
            YouTube Educational Tasks
          </h1>
          <p className="text-xs text-gray-400">
            Watch curated technology, blockchain, and cybersecurity videos, then test your comprehension to earn practice Demo Credits.
          </p>
        </div>
      </div>

      {/* Compliance Note */}
      <div className="p-3.5 rounded-xl bg-[#1C2433] border border-[#2A3649] text-xs text-gray-300 flex items-start gap-2.5">
        <Tv className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
        <p>
          <strong className="text-white">Fair Learning Policy:</strong> Zentro never requires or rewards subscriptions, likes, or fake viewer retention. Demo Credits are awarded solely for answering educational quiz questions correctly.
        </p>
      </div>

      {/* YouTube Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tasks.map((task) => {
          const isDone = Boolean(completions[task.id]);

          return (
            <div
              key={task.id}
              className="flex flex-col justify-between rounded-xl bg-[#1C2433] border border-[#2A3649] overflow-hidden hover:border-[#D4AF37]/50 transition-all"
            >
              <div>
                {/* Video Thumbnail with Play Button */}
                <div className="relative aspect-video w-full bg-[#080B12] overflow-hidden group">
                  <img
                    src={`https://img.youtube.com/vi/${task.videoId}/hqdefault.jpg`}
                    alt={task.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    onClick={() => setSelectedEmbedVideo(task.videoId)}
                    className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono text-white bg-black/75 px-1.5 py-0.5 rounded">
                    {task.duration || 'Watch'}
                  </span>
                </div>

                {/* Video Info */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-semibold text-gray-300 truncate">{task.channelName}</span>
                    {isDone ? (
                      <span className="text-xs text-[#10B981] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" /> {task.questions.length} Questions
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold font-['Outfit'] text-white line-clamp-2 leading-snug">
                    {task.title}
                  </h3>

                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-0 border-t border-[#2A3649]/60 flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-sm font-bold font-mono text-white">
                    +{task.rewardCredits}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">Credits</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={task.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#222C3D]"
                    title="Open in YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {isDone ? (
                    <button
                      onClick={() => handleStartQuiz(task)}
                      className="px-3 py-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-semibold"
                    >
                      Review Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartQuiz(task)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] text-xs font-bold transition-colors shadow-sm"
                    >
                      Take Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded Video Player Modal */}
      {selectedEmbedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden bg-black border border-[#2A3649] shadow-2xl">
            <button
              onClick={() => setSelectedEmbedVideo(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-black/70 hover:bg-black text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${selectedEmbedVideo}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* Educational Quiz Modal */}
      {activeQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#101828] border border-[#2A3649] p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-[#2A3649] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-medium mb-1">
                  <span>Educational Quiz</span>
                  <span aria-hidden="true">·</span>
                  <span>+{activeQuizModal.rewardCredits} Demo Credits</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold font-['Outfit'] text-white">
                  {activeQuizModal.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveQuizModal(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1C2433]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {activeQuizModal.questions.map((q, qIdx) => {
                const selected = userAnswers[q.id];

                return (
                  <div key={q.id} className="p-4 rounded-xl bg-[#1C2433] border border-[#2A3649] space-y-3">
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {qIdx + 1}. {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selected === optIdx;
                        let optStyle = 'bg-[#101828] text-gray-300 hover:border-[#D4AF37]/50';

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            optStyle = 'bg-[#10B981]/20 border border-[#10B981] text-white font-medium';
                          } else if (isChosen) {
                            optStyle = 'bg-red-500/20 border border-red-500 text-white font-medium';
                          }
                        } else if (isChosen) {
                          optStyle = 'bg-[#D4AF37]/20 border border-[#D4AF37] text-white font-medium';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            disabled={quizSubmitted}
                            className={`w-full p-3 rounded-lg text-xs text-left border border-[#2A3649] transition-all flex items-center justify-between ${optStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                            )}
                            {quizSubmitted && isChosen && optIdx !== q.correctIndex && (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && q.explanation && (
                      <p className="text-[11px] text-gray-400 pt-2 border-t border-[#2A3649]/50">
                        <strong className="text-gray-300">Explanation: </strong>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Results or Submit Button */}
            {quizSubmitted ? (
              <div className="p-4 rounded-xl bg-[#101828] border border-[#2A3649] text-center space-y-3">
                <Award className="w-10 h-10 text-[#D4AF37] mx-auto" />
                <h3 className="text-base font-bold text-white">
                  Score: {quizScore} / {activeQuizModal.questions.length}
                </h3>
                {quizScore >= Math.ceil(activeQuizModal.questions.length * 0.66) ? (
                  <p className="text-xs text-[#10B981] font-semibold">
                    Passed! +{activeQuizModal.rewardCredits} Demo Credits credited to your wallet.
                  </p>
                ) : (
                  <p className="text-xs text-amber-400">
                    Did not pass. Review the video and try again to earn Demo Credits!
                  </p>
                )}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setUserAnswers({});
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1C2433] hover:bg-[#222C3D] text-gray-300 text-xs font-medium"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => setActiveQuizModal(null)}
                    className="px-5 py-2 rounded-xl bg-[#D4AF37] text-black text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setActiveQuizModal(null)}
                  className="px-4 py-2 rounded-xl bg-[#1C2433] text-gray-300 text-xs font-medium hover:bg-[#222C3D]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitQuiz}
                  disabled={
                    Object.keys(userAnswers).length < activeQuizModal.questions.length
                  }
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#080B12] text-xs font-bold disabled:opacity-50 transition-all shadow-md"
                >
                  Submit Quiz Answers
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
