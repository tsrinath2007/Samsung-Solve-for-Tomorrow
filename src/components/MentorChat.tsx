import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User as UserIcon } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';
import { streamNovaAIResponse } from '../services/aiService';

interface Message {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: Date;
}

// ----------------------------------------------------
// DYNAMIC COMPACT MARKDOWN RENDERER
// ----------------------------------------------------
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        renderedElements.push(
          <div key={`code-${idx}`} className="my-3 rounded-xl bg-slate-950 border border-slate-900 overflow-hidden font-mono text-[11px] text-slate-300">
            {codeBlockLang && (
              <div className="bg-slate-900/60 px-3 py-1 text-[9px] uppercase tracking-wider text-slate-500 border-b border-slate-900/50 flex justify-between items-center">
                <span>{codeBlockLang}</span>
              </div>
            )}
            <pre className="p-3.5 overflow-x-auto leading-relaxed">
              <code>{codeBlockLines.join('\n')}</code>
            </pre>
          </div>
        );
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
        inCodeBlock = true;
        codeBlockLang = line.replace('```', '').trim() || 'code';
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    if (line.trim().startsWith('|') && line.includes('-|-')) {
      return;
    }
    
    if (line.trim().startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
      renderedElements.push(
        <div key={`table-${idx}`} className="overflow-x-auto my-2">
          <table className="min-w-full divide-y divide-slate-900 border border-slate-900">
            <tbody className="divide-y divide-slate-900 bg-slate-950/20 text-[11px]">
              <tr>
                {cells.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-2 text-slate-300 font-mono border-r border-slate-900 last:border-r-0">
                    {cell}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      );
      return;
    }

    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const cleanText = line.replace(/^[\*\-]\s+/, '');
      renderedElements.push(
        <li key={`list-${idx}`} className="text-xs text-slate-300 ml-4 list-disc mb-1.5 leading-relaxed">
          {parseInlineFormatting(cleanText)}
        </li>
      );
      return;
    }

    if (line.trim() !== '') {
      renderedElements.push(
        <p key={`p-${idx}`} className="text-xs text-slate-300 leading-relaxed mb-2.5">
          {parseInlineFormatting(line)}
        </p>
      );
    }
  });

  return <div className="space-y-1">{renderedElements}</div>;
};

const parseInlineFormatting = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// ----------------------------------------------------
// DRAGGABLE MENTOR CHAT & SLIDE DRAWER
// ----------------------------------------------------
export const MentorChat: React.FC = () => {
  const { roadmap, completedNodes, userProfile } = useRoadmap();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'mentor',
      text: "Hello! I am Nova AI, your Career Copilot. Ask me anything about your active roadmap milestones.",
      timestamp: new Date(),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);
    setStreamingText('');

    try {
      const context = {
        career: roadmap ? roadmap.career : 'Software Engineering',
        completedCount: completedNodes.length,
        totalCount: roadmap ? roadmap.milestones.length : 1,
        xp: userProfile.xp,
        level: userProfile.level,
        resumeScore: 78,
        githubScore: 'B+'
      };

      await streamNovaAIResponse(
        textToSend,
        context,
        '', 
        (token) => {
          setStreamingText((prev) => prev + token);
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'mentor',
          text: streamingText || 'Done.',
          timestamp: new Date(),
        },
      ]);
      setStreamingText('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && streamingText) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'mentor',
          text: streamingText,
          timestamp: new Date(),
        },
      ]);
      setStreamingText('');
    }
  }, [isLoading]);

  const presetQuestions = [
    { text: "Today's plan", query: "Give me today's plan based on my roadmap." },
    { text: "Suggest project", query: "Suggest a project idea for my current step." },
  ];

  return (
    <>
      {/* Invisible container for drag bounds */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* Draggable circular orb bubble */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.05}
        dragConstraints={constraintsRef}
        className="fixed bottom-20 lg:bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing pointer-events-auto"
      >
        <motion.button
          onTap={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-neonPurple via-indigo-600 to-neonBlue flex items-center justify-center shadow-lg text-white relative group focus:outline-none"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
        >
          {/* Pulsing glow background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-neonPurple to-neonBlue blur-md opacity-45 group-hover:opacity-75 transition-opacity animate-pulse-glow" />
          {isOpen ? <X className="w-5.5 h-5.5 z-10" /> : <Bot className="w-5.5 h-5.5 z-10 animate-bounce" />}
        </motion.button>
      </motion.div>

      {/* Slide-over panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 35 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            className="fixed bottom-36 lg:bottom-24 right-6 w-[90vw] sm:w-[380px] h-[500px] rounded-3xl border border-white/5 bg-slate-950/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden z-40"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900/40 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-neonPurple to-neonBlue flex items-center justify-center animate-pulse-glow">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-heading font-extrabold text-white flex items-center gap-1.5">
                    Nova AI <Sparkles className="w-3 h-3 text-neonBlue animate-pulse" />
                  </h4>
                  <span className="text-[9px] text-green-400 font-mono">
                    Context Sync Active
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      msg.sender === 'user' 
                        ? 'bg-neonBlue/5 text-neonBlue border-neonBlue/15' 
                        : 'bg-neonPurple/5 text-neonPurple border-neonPurple/15 animate-pulse-glow'
                    }`}
                  >
                    {msg.sender === 'user' ? <UserIcon className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  </div>
                  <div
                    className={`p-3 rounded-xl text-[10.5px] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-neonBlue text-slate-950 font-semibold rounded-tr-none'
                        : 'bg-slate-900/50 text-slate-200 border border-white/5 rounded-tl-none'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      msg.text
                    ) : (
                      <MarkdownRenderer content={msg.text} />
                    )}
                  </div>
                </div>
              ))}

              {/* Loader/Stream output */}
              {isLoading && (
                <div className="flex gap-2.5 max-w-[88%]">
                  <div className="w-6 h-6 rounded-full bg-neonPurple/5 text-neonPurple border border-neonPurple/15 flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="p-3 rounded-xl rounded-tl-none bg-slate-900/50 border border-white/5 flex flex-col gap-1 min-w-[100px]">
                    {streamingText ? (
                      <MarkdownRenderer content={streamingText} />
                    ) : (
                      <div className="flex items-center gap-1 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-neonPurple animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-neonPurple animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-neonPurple animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Presets and Input */}
            <div className="p-3.5 border-t border-white/5 bg-slate-950">
              <div className="flex gap-1.5 mb-2.5">
                {presetQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q.query)}
                    className="text-[8.5px] px-2 py-1.5 rounded-lg border border-slate-900 bg-slate-900/20 text-slate-500 hover:text-white hover:border-slate-800 transition-colors cursor-pointer"
                  >
                    {q.text}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputVal);
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  placeholder="Ask Nova to write code or review steps..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="flex-1 glass-input px-3 py-2.5 rounded-xl text-[10.5px]"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-neonPurple hover:bg-neonPurple/90 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-neonPurple/10"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default MentorChat;
