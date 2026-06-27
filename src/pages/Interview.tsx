import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Video, 
  Sparkles, 
  HelpCircle, 
  Volume2, 
  ChevronDown, 
  ChevronUp, 
  UserCheck, 
  Radio
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

export const Interview: React.FC = () => {
  const { roadmap } = useRoadmap();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'prep' | 'mock'>('prep');
  const [prepCategory, setPrepCategory] = useState<'Technical' | 'Coding' | 'System Design' | 'Behavioral'>('Technical');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});

  // Mock Interview Simulator States
  const [mockStarted, setMockStarted] = useState(false);
  const [mockStage, setMockStage] = useState<'intro' | 'question' | 'evaluating' | 'result'>('intro');
  const [answerInput, setAnswerInput] = useState('');
  const [activeMockQuestionIdx, setActiveMockQuestionIdx] = useState(0);
  const [mockScoreCard, setMockScoreCard] = useState<any | null>(null);

  if (!roadmap) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Video className="w-16 h-16 text-slate-700 mb-4 animate-bounce" />
        <h2 className="font-heading font-bold text-xl text-white mb-2">No Interview Topics Active</h2>
        <p className="max-w-md text-xs text-slate-500 mb-6">
          Generate an AI-powered career roadmap first to automatically compile a custom list of role-specific interview questions.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-neonPurple to-neonBlue text-slate-950 font-heading font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          Generate Roadmap
        </button>
      </div>
    );
  }

  const prepQuestions = roadmap.interviewTopics.filter(q => q.category === prepCategory);

  const toggleReveal = (idx: number, type: 'ans' | 'hint') => {
    if (type === 'ans') {
      setRevealedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
    } else {
      setRevealedHints(prev => ({ ...prev, [idx]: !prev[idx] }));
    }
  };

  const handleStartMock = () => {
    setMockStarted(true);
    setMockStage('question');
    setActiveMockQuestionIdx(0);
    setAnswerInput('');
    setMockScoreCard(null);
  };

  const handleMockSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim()) return;

    setMockStage('evaluating');
    await new Promise(r => setTimeout(r, 2000));

    // Compile mock evaluation metrics
    setMockScoreCard({
      overall: 84,
      technical: 88,
      communication: 82,
      confidence: 80,
      feedback: "You demonstrated solid technical familiarity with Server vs Client routing boundaries. To improve, structure your answers using the STAR method (Situation, Task, Action, Result) for behavioral metrics.",
      improvements: [
        "Mention real-world project scenarios where you applied this architecture.",
        "Articulate bundles size implications (e.g. '0KB client-side bundles') when explaining server components."
      ]
    });
    setMockStage('result');
  };

  return (
    <div className="w-full max-w-5xl px-6 py-10 text-slate-100 pb-24 lg:pb-12">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-slate-900 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white mb-1.5 flex items-center gap-2">
            <Video className="w-8 h-8 text-neonPurple" /> Interview Preparation
          </h1>
          <p className="text-xs text-slate-500">
            Practice mock scenarios for target: <span className="text-neonBlue font-mono">{roadmap.career}</span>
          </p>
        </div>

        {/* Toggle navigation */}
        <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-900 rounded-xl">
          <button
            onClick={() => setActiveTab('prep')}
            className={`px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'prep' ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-500'
            }`}
          >
            Question Prep
          </button>
          <button
            onClick={() => setActiveTab('mock')}
            className={`px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'mock' ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-500'
            }`}
          >
            AI Mock Console
          </button>
        </div>
      </div>

      {/* VIEW 1: QUESTION PREPARATION LIST */}
      {activeTab === 'prep' && (
        <div className="space-y-6">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 pb-2">
            {(['Technical', 'Coding', 'System Design', 'Behavioral'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => { setPrepCategory(cat); setRevealedAnswers({}); setRevealedHints({}); }}
                className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer border ${
                  prepCategory === cat
                    ? 'bg-neonBlue/10 border-neonBlue text-neonBlue'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Prep Questions Render */}
          {prepQuestions.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-2xl">
              <HelpCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-400">No Questions Configured</h3>
              <p className="text-xs text-slate-600 mt-1">Try another category to view practice items.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prepQuestions.map((q, idx) => (
                <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-900 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-heading font-bold text-sm text-slate-200 leading-snug">
                      {q.question}
                    </h3>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 border border-slate-800 bg-slate-950 text-slate-500 rounded uppercase">
                      {q.difficulty}
                    </span>
                  </div>

                  {/* Hints */}
                  <div className="space-y-2">
                    <button
                      onClick={() => toggleReveal(idx, 'hint')}
                      className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 font-mono uppercase tracking-wider"
                    >
                      {revealedHints[idx] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />} Hints
                    </button>
                    {revealedHints[idx] && (
                      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400 leading-relaxed bg-slate-950/20 p-3 rounded-lg border border-slate-900/60">
                        {q.hints.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Reveal Answer */}
                  <div className="border-t border-slate-900/60 pt-4 flex justify-between items-center flex-wrap gap-4">
                    <button
                      onClick={() => toggleReveal(idx, 'ans')}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      {revealedAnswers[idx] ? 'Hide Guidelines' : 'Reveal Expected Answer'}
                    </button>
                    <button
                      onClick={() => setActiveTab('mock')}
                      className="text-xs text-neonBlue hover:text-neonPurple font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Practice in Mock Console <Volume2 className="w-4 h-4 text-neonBlue" />
                    </button>
                  </div>

                  {revealedAnswers[idx] && (
                    <div className="p-4 rounded-xl border border-neonPurple/20 bg-neonPurple/5 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                      <strong className="text-neonPurple block mb-2 uppercase tracking-widest text-[9px]">Answer Guidelines:</strong>
                      {q.expectedAnswer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: AI MOCK INTERVIEW CONSOLE */}
      {activeTab === 'mock' && (
        <div className="space-y-6">
          {!mockStarted ? (
            /* Intro State */
            <div className="glass-panel p-8 rounded-3xl text-center max-w-xl mx-auto space-y-6 border border-slate-800 shadow-xl shadow-neonPurple/5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neonPurple to-neonBlue flex items-center justify-center mx-auto shadow-md shadow-neonPurple/20">
                <Video className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-2xl text-white mb-2">Launch Mock Interview Session</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter an interactive session. The AI Interviewer will present a role-specific question, capture your response, and score your technical knowledge, confidence, and communication structures.
                </p>
              </div>
              <button
                onClick={handleStartMock}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-neonPurple to-neonBlue text-slate-950 font-heading font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-neonPurple/20 hover:scale-[1.02] transition-transform"
              >
                Connect Camera & Start
              </button>
            </div>
          ) : (
            /* Active Mock Session State */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Media Stream Simulation Column (Left) */}
              <div className="md:col-span-1 space-y-4">
                {/* Visual Video stream placeholder */}
                <div className="w-full aspect-[4/3] rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden group shadow-lg">
                  {/* Glowing camera scanning overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neonPurple/5 to-transparent pointer-events-none animate-pulse" />
                  
                  {/* Active Recording Dot */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-red-500/30 text-[9px] font-mono text-red-500 font-bold uppercase z-10">
                    <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Live Stream
                  </div>

                  <span className="text-xs text-slate-600 font-heading">Camera Active</span>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setMockStarted(false)}
                    className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Disconnect Session
                  </button>
                </div>
              </div>

              {/* Chat Assessment Column (Right) */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Question Block */}
                {mockStage === 'question' && (
                  <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-neonPurple animate-ping" />
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold">Interviewer Question</span>
                    </div>

                    <p className="font-heading font-extrabold text-base text-white leading-normal">
                      "{roadmap.interviewTopics[activeMockQuestionIdx]?.question || 'Can you introduce yourself and outline your experience?'}"
                    </p>

                    <form onSubmit={handleMockSubmitAnswer} className="space-y-4 pt-4 border-t border-slate-900/60">
                      <div>
                        <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">
                          Your Answer Response
                        </label>
                        <textarea
                          placeholder="Type or transcript your verbal response in detail..."
                          value={answerInput}
                          onChange={(e) => setAnswerInput(e.target.value)}
                          rows={6}
                          className="w-full glass-input p-3.5 rounded-xl text-xs"
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-neonPurple hover:bg-neonPurple/90 text-white text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Submit Answer
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Evaluating load block */}
                {mockStage === 'evaluating' && (
                  <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center h-[300px]">
                    <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-neonBlue animate-spin mb-4" />
                    <h3 className="text-sm font-bold text-slate-200 mb-1">Evaluating Response</h3>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider animate-pulse">Checking syntax accuracy and structural confidence...</p>
                  </div>
                )}

                {/* Score Card Result view */}
                {mockStage === 'result' && mockScoreCard && (
                  <div className="space-y-6">
                    {/* Scores row */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="glass-panel p-4 rounded-xl text-center border border-emerald-500/20 bg-emerald-500/5">
                        <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest block mb-1">Technical</span>
                        <span className="text-2xl font-heading font-extrabold text-emerald-400 block">{mockScoreCard.technical}%</span>
                      </div>
                      <div className="glass-panel p-4 rounded-xl text-center">
                        <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest block mb-1">Communication</span>
                        <span className="text-2xl font-heading font-extrabold text-neonBlue block">{mockScoreCard.communication}%</span>
                      </div>
                      <div className="glass-panel p-4 rounded-xl text-center">
                        <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest block mb-1">Confidence</span>
                        <span className="text-2xl font-heading font-extrabold text-neonPurple block">{mockScoreCard.confidence}%</span>
                      </div>
                    </div>

                    {/* Feedback summary */}
                    <div className="glass-panel p-6 rounded-2xl space-y-3">
                      <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-neonBlue" /> Interviewer Assessment
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {mockScoreCard.feedback}
                      </p>
                    </div>

                    {/* Improvements suggestions */}
                    <div className="glass-panel p-6 rounded-2xl space-y-3">
                      <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-neonPurple" /> Specific Improvement tips
                      </h4>
                      <ul className="list-disc pl-4 space-y-2 text-xs text-slate-400 leading-relaxed">
                        {mockScoreCard.improvements.map((imp: string, i: number) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={handleStartMock}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-heading font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
                      >
                        Try Next Question
                      </button>
                    </div>

                  </div>
                )}

              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
};
export default Interview;
