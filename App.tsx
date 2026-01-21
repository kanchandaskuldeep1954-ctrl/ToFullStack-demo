import React, { useState, useRef, useCallback } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { ChatInterface } from './components/ChatInterface';
import { generateAIResponse, validateCodeWithAI } from './services/groqService';
import { generateNaturalSpeech, speakWithEmotion } from './services/voiceService';
import { Message, GameState, Lesson, Badge } from './types';
import { LESSONS, BADGES, ROADMAP, SYSTEM_PROMPT } from './constants';
import { Trophy, Zap, Sparkles, Medal, Crown, Map, Info, Lock, CheckCircle, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  // --- State ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: "Yo! I'm Vibe. Check the Roadmap to see where we're heading, then hit the mic to start!",
      timestamp: Date.now()
    }
  ]);
  const [code, setCode] = useState<string>(LESSONS[0].initialCode);
  const [currentLesson, setCurrentLesson] = useState<Lesson>(LESSONS[0]);
  const [xp, setXp] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [badges, setBadges] = useState<Badge[]>(BADGES);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  // Real-time analysis state
  const [lastCodeLength, setLastCodeLength] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);
  const analysisTimeoutRef = useRef<NodeJS.Timeout>();

  // Challenge mode state
  const [challengeMode, setChallengeMode] = useState({
    enabled: false,
    lives: 3,
    streak: 0
  });

  const [roadmap, setRoadmap] = useState(ROADMAP);

  // Refs
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // --- Helpers ---

  const addMessage = (role: 'user' | 'ai', text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, text, timestamp: Date.now() }]);
  };

  const playNaturalVoice = async (text: string) => {
    setGameState(GameState.PROCESSING);

    // Attempt Natural TTS
    const audioBuffer = await generateNaturalSpeech(text);

    if (audioBuffer) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => setGameState(GameState.IDLE);
      setGameState(GameState.SPEAKING);
      source.start();
    } else {
      setGameState(GameState.IDLE);
    }
  };

  const analyzeCodeLive = useCallback(async (currentCode: string) => {
    // Only analyze on significant changes
    if (Math.abs(currentCode.length - lastCodeLength) < 30) return;

    setLastCodeLength(currentCode.length);

    // Debounce analysis
    if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
    analysisTimeoutRef.current = setTimeout(async () => {

      // Quick syntax check
      if (currentCode.includes('<h1') && !currentCode.includes('</h1>')) {
        const hint = "Yo, don't forget to close that h1 tag!";
        addMessage('ai', hint);
        speakWithEmotion(hint, 'chill');
        return;
      }

      if (currentCode.includes('<p') && !currentCode.includes('</p>')) {
        const hint = "Para tag needs a closer, fam!";
        addMessage('ai', hint);
        speakWithEmotion(hint, 'encouraging');
        return;
      }

      // AI-powered deeper analysis
      if (currentCode.length > 50 && !aiThinking) {
        setAiThinking(true);
        const prompt = `
          User is working on: ${currentLesson.objective}
          Current code:
          \`\`\`html
          ${currentCode}
          \`\`\`
          
          Give ONE quick tip or encouragement (max 8 words).
          If code is fine, return "null".
        `;

        const feedback = await generateAIResponse([], currentCode, prompt);
        if (feedback && feedback.toLowerCase() !== 'null' && feedback.length < 60) {
          addMessage('ai', feedback);
          speakWithEmotion(feedback, 'encouraging');
        }
        setAiThinking(false);
      }

    }, 4000);

  }, [code, currentLesson, lastCodeLength, aiThinking]);

  const handleAIInteraction = async (userText: string) => {
    setGameState(GameState.PROCESSING);

    // Check for "Run Code" voice command
    if (userText.toLowerCase().includes("run code") || userText.toLowerCase().includes("check code")) {
      await handleRunCode();
      return;
    }

    // Generate Chat Response
    const aiResponse = await generateAIResponse(messages, code, userText);

    addMessage('ai', aiResponse);
    await playNaturalVoice(aiResponse);

    // Check for "Next Level" intent
    if (userText.toLowerCase().includes('next') && currentLesson.id < LESSONS.length && code.includes(currentLesson.validationCriteria.split(' ')[0])) {
      // Allow manual skip if they insist, but usually we want validation first
      advanceLesson();
    }
  };

  const advanceLesson = () => {
    const nextIndex = LESSONS.findIndex(l => l.id === currentLesson.id) + 1;
    if (nextIndex < LESSONS.length) {
      const nextLesson = LESSONS[nextIndex];
      setCurrentLesson(nextLesson);
      setCode(prev => prev + '\n'); // Keep context

      const congrats = `Moving on! Next mission: ${nextLesson.title}. ${nextLesson.objective}`;
      addMessage('ai', congrats);
      playNaturalVoice(congrats);
    } else {
      const finishMsg = "You crushed all the demo levels! You're officially a Vibe Coder. 🏆";
      addMessage('ai', finishMsg);
      playNaturalVoice(finishMsg);
    }
  };

  const unlockBadge = (badgeId: string) => {
    setBadges(prev => prev.map(b => {
      if (b.id === badgeId && !b.unlocked) {
        // Show notification (could be a toast, for now just chat)
        addMessage('ai', `🏅 UNLOCKED BADGE: ${b.name}!`);
        return { ...b, unlocked: true };
      }
      return b;
    }));
  };

  // --- Voice Setup ---

  const toggleListening = () => {
    if (gameState === GameState.LISTENING) {
      recognitionRef.current?.stop();
      setGameState(GameState.IDLE);
    } else {
      window.speechSynthesis.cancel(); // Stop fallback audio

      if (!recognitionRef.current) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          alert("Voice not supported. Try Chrome.");
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setGameState(GameState.LISTENING);

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          addMessage('user', transcript);
          handleAIInteraction(transcript);
        };

        recognition.onend = () => {
          if (gameState === GameState.LISTENING) setGameState(GameState.IDLE);
        };

        recognitionRef.current = recognition;
      }

      recognitionRef.current.start();
    }
  };

  // --- Code Validation ---

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#EC4899', '#3B82F6']
    });
  };

  const celebrateSuccess = async (xpEarned: number, badgeId?: string) => {
    triggerConfetti();

    // Play success sound if you had one, or just hype voice
    const celebrations = [
      `YOOOO +${xpEarned} XP! You're cooking fr fr!`,
      `SHEESH! +${xpEarned} XP! Different breed!`,
      `W! +${xpEarned} XP! We're on one!`
    ];
    const celebText = celebrations[Math.floor(Math.random() * celebrations.length)];

    addMessage('ai', celebText);
    await playNaturalVoice(celebText);

    if (badgeId) {
      setTimeout(() => {
        unlockBadge(badgeId);
      }, 1000);
    }
  };

  const handleRunCode = async () => {
    setGameState(GameState.PROCESSING);
    addMessage('ai', "Checking your vibes... 👀");

    const result = await validateCodeWithAI(code, currentLesson);

    if (result.passed) {
      setXp(prev => prev + currentLesson.xpReward);
      await celebrateSuccess(currentLesson.xpReward, currentLesson.badgeReward);
    } else {
      if (challengeMode.enabled) {
        handleChallengeFail();
      } else {
        const failMsg = `Not quite. ${result.feedback}`;
        addMessage('ai', failMsg);
        await playNaturalVoice(failMsg);
      }
    }
  };

  const handleChallengeFail = () => {
    const newLives = challengeMode.lives - 1;
    if (newLives <= 0) {
      const failMsg = "Challenge failed! Life is hard, but we go again. Normal mode on.";
      addMessage('ai', failMsg);
      playNaturalVoice(failMsg);
      setChallengeMode({ enabled: false, lives: 3, streak: 0 });
    } else {
      const hintMsg = `Ouch! ${newLives} lives left. You got this!`;
      addMessage('ai', hintMsg);
      speakWithEmotion(hintMsg, 'encouraging');
      setChallengeMode(prev => ({ ...prev, lives: newLives }));
    }
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-purple-500/40 flex flex-col overflow-hidden relative">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Top Bar / HUD */}
      <header className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-lg">
            <Sparkles className="text-white" size={18} fill="currentColor" />
          </div>
          <h1 className="font-bold text-xl tracking-tighter bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            CODE VIBE
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowRoadmap(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors border border-white/10"
          >
            <Map className="text-blue-400" size={18} />
            <span className="text-sm font-bold hidden md:inline text-blue-100">Roadmap</span>
          </button>

          <button
            onClick={() => setChallengeMode(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${challengeMode.enabled ? 'bg-red-500/20 border-red-500 text-red-100' : 'hover:bg-white/10 border-white/10 text-slate-400'}`}
          >
            <Heart size={18} className={challengeMode.enabled ? 'fill-red-500' : ''} />
            <span className="text-sm font-bold hidden md:inline">{challengeMode.enabled ? `${challengeMode.lives} Lives` : 'Challenge'}</span>
          </button>

          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full px-4 py-1 border border-yellow-500/30">
            <Zap className="text-yellow-400" size={16} fill="currentColor" />
            <span className="font-mono font-bold text-yellow-100">{xp} XP</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 overflow-hidden max-w-[1600px] mx-auto w-full z-10">

        {/* Left Col: Chat (4 cols) */}
        <section className="md:col-span-4 h-[400px] md:h-full order-2 md:order-1 flex flex-col gap-4">
          <ChatInterface
            messages={messages}
            isListening={gameState === GameState.LISTENING}
            isSpeaking={gameState === GameState.SPEAKING}
            onToggleListening={toggleListening}
            onStopSpeaking={() => {
              if (audioContextRef.current) audioContextRef.current.close();
              audioContextRef.current = null;
              window.speechSynthesis.cancel();
              setGameState(GameState.IDLE);
            }}
          />

          {/* Badges Widget */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <Medal size={14} /> Badges
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {badges.map(b => (
                <div key={b.id} className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${b.unlocked ? 'bg-purple-500/20 border-purple-500/50 grayscale-0 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-slate-800 border-white/5 grayscale opacity-50'}`} title={b.name}>
                  {b.icon}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Col: Editor & Preview (8 cols) */}
        <section className="md:col-span-8 h-full order-1 md:order-2 flex flex-col gap-4">
          {/* Mission Bar with Context */}
          <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-4 rounded-xl flex flex-col gap-3 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white uppercase">Level {currentLesson.id}</span>
                  <h3 className="font-bold text-lg text-white">{currentLesson.title}</h3>
                </div>
                <p className="text-sm text-indigo-200">{currentLesson.objective}</p>
              </div>

              {code.includes(currentLesson.validationCriteria.split(' ')[0]) && (
                <button
                  onClick={advanceLesson}
                  className="bg-white text-indigo-950 px-5 py-2 rounded-lg font-bold text-sm hover:scale-105 hover:shadow-lg hover:shadow-white/20 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  NEXT LEVEL <Trophy size={16} />
                </button>
              )}
            </div>

            {/* Context / Why */}
            <div className="bg-black/20 rounded-lg p-3 flex gap-3 text-sm border border-white/5">
              <Info className="text-blue-400 shrink-0" size={18} />
              <p className="text-slate-300 leading-relaxed"><span className="text-blue-300 font-bold">Why this matters:</span> {currentLesson.why}</p>
            </div>
          </div>

          <div className="flex-1 h-full min-h-0">
            <CodeEditor
              code={code}
              onChange={(newCode) => {
                setCode(newCode);
                analyzeCodeLive(newCode);
              }}
              onRun={handleRunCode}
            />
          </div>
        </section>
      </main>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLeaderboard(false)}>
          <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h2 className="font-bold text-lg flex items-center gap-2"><Crown className="text-yellow-500" /> Leaderboard</h2>
              <button onClick={() => setShowLeaderboard(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-4 space-y-2">
              {[
                { name: "You", xp: xp, rank: 4, me: true },
                { name: "CodeNinja", xp: 2400, rank: 1 },
                { name: "ReactQueen", xp: 1850, rank: 2 },
                { name: "BugSlayer", xp: 1200, rank: 3 },
              ].sort((a, b) => b.xp - a.xp).map((user, i) => (
                <div key={user.name} className={`flex items-center justify-between p-3 rounded-xl ${user.me ? 'bg-purple-600/20 border border-purple-500/50' : 'bg-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold w-6 text-center ${i === 0 ? 'text-yellow-400' : 'text-slate-500'}`}>#{i + 1}</span>
                    <span className={user.me ? 'text-white font-bold' : 'text-slate-300'}>{user.name}</span>
                  </div>
                  <span className="font-mono text-sm text-yellow-100">{user.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Roadmap Modal */}
      {showRoadmap && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowRoadmap(false)}>
          <div className="w-full max-w-4xl bg-slate-900 border border-white/20 rounded-2xl overflow-hidden my-8" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950">
              <div>
                <h2 className="font-bold text-2xl text-white mb-1 flex items-center gap-2"><Map className="text-blue-400" /> Full Stack Journey</h2>
                <p className="text-slate-400">Your roadmap from Rookie to Pro.</p>
              </div>
              <button onClick={() => setShowRoadmap(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">✕</button>
            </div>

            <div className="p-6 grid gap-6">
              {roadmap.map((stage, i) => (
                <div key={stage.id} className={`relative p-5 rounded-2xl border ${stage.status === 'active' ? 'bg-indigo-900/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/5 opacity-70'} flex flex-col md:flex-row gap-6`}>
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${stage.status === 'active' ? 'bg-indigo-500 text-white' : stage.status === 'completed' ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                      {stage.status === 'completed' ? <CheckCircle size={24} /> : stage.status === 'active' ? <Sparkles size={24} /> : <Lock size={24} />}
                    </div>
                    {i < ROADMAP.length - 1 && (
                      <div className="absolute left-11 top-16 bottom-[-24px] w-0.5 bg-white/10 hidden md:block"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h3 className={`text-xl font-bold ${stage.status === 'active' ? 'text-white' : 'text-slate-300'}`}>{stage.title}</h3>
                      <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-slate-400 border border-white/5">{stage.duration}</span>
                    </div>
                    <p className="text-slate-400 mb-4">{stage.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {stage.topics.map(t => (
                        <span key={t} className="text-xs font-medium px-2 py-1 rounded-md bg-white/5 text-indigo-300 border border-indigo-500/20">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
