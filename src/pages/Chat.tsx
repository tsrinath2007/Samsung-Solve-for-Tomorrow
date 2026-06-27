import React, { useState, useRef, useEffect } from 'react';
import { Bot, User as UserIcon, Send, Copy, Check } from 'lucide-react';
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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeText = codeBlockLines.join('\n');
        renderedElements.push(
          <CodeBlockContainer key={`code-${idx}`} code={codeText} lang={codeBlockLang} onCopy={handleCopyCode} />
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
        <div key={`table-${idx}`} className="overflow-x-auto my-3">
          <table className="min-w-full divide-y divide-slate-800 border border-slate-900 rounded-xl overflow-hidden">
            <tbody className="divide-y divide-slate-900 bg-slate-950/40 text-[11px]">
              <tr>
                {cells.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-2.5 text-slate-300 font-mono border-r border-slate-900 last:border-r-0">
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
        <li key={`list-${idx}`} className="text-xs text-slate-300 ml-5 list-disc mb-1.5 leading-relaxed">
          {parseInlineFormatting(cleanText)}
        </li>
      );
      return;
    }

    if (line.trim() !== '') {
      renderedElements.push(
        <p key={`p-${idx}`} className="text-xs text-slate-300 leading-relaxed mb-3">
          {parseInlineFormatting(line)}
        </p>
      );
    }
  });

  return <div className="space-y-1">{renderedElements}</div>;
};

const CodeBlockContainer: React.FC<{ code: string; lang: string; onCopy: (c: string) => void }> = ({ code, lang, onCopy }) => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="my-4 rounded-2xl bg-slate-950 border border-white/5 overflow-hidden font-mono text-[11px] text-slate-300 shadow-lg">
      <div className="bg-slate-900/80 px-4 py-2 text-[9px] uppercase tracking-wider text-slate-500 border-b border-white/5 flex justify-between items-center">
        <span>{lang}</span>
        <button
          onClick={() => {
            onCopy(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const parseInlineFormatting = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-extrabold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// ----------------------------------------------------
// FULL PAGE CHAT COMPONENT
// ----------------------------------------------------
export const Chat: React.FC = () => {
  const { roadmap, completedNodes, userProfile } = useRoadmap();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'mentor',
      text: `Welcome back, ${userProfile.name || 'Pathfinder'}! I am Nova AI, your Career Copilot. I have loaded your current telemetry context for **${roadmap ? roadmap.career : 'your career goal'}**. How can I help you write code, design schemas, or review concepts today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

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
        '', // virtual fallback streaming
        (token) => {
          setStreamingText((prev) => prev + token);
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'mentor',
          text: streamingText || 'Compiled.',
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

  const quickPrompts = [
    { label: "Check Today's Action Plan", query: "Give me today's plan based on my roadmap." },
    { label: "Suggest Portfolio Project", query: "Can you suggest a portfolio project idea?" },
    { label: "Explain Coding Concept", query: "Explain what is modular coding and custom hooks." },
  ];

  return (
    <div className="w-full max-w-5xl px-6 py-10 text-slate-100 pb-24 lg:pb-12 flex flex-col h-[calc(100vh-80px)] select-none">
      
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-900 flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white mb-1 flex items-center gap-2">
            <Bot className="w-7 h-7 text-neonPurple animate-pulse-glow" /> AI Copilot Workspace
          </h1>
          <p className="text-[10px] text-slate-500">
            Nova AI is synchronizing telemetry for: <span className="text-neonBlue font-mono">{roadmap ? roadmap.career : 'Not Loaded'}</span>
          </p>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 overflow-hidden">
        
        {/* Left Telemetry Context Panel */}
        <div className="hidden lg:block lg:col-span-1 glass-panel p-5 rounded-2xl border border-slate-900 space-y-6 overflow-y-auto">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono font-bold block mb-1">Active User Context</span>
            <h3 className="text-xs font-bold text-white">{userProfile.name}</h3>
            <span className="text-[10px] text-neonBlue font-mono">Level {userProfile.level} ({userProfile.xp} XP)</span>
          </div>

          <div className="border-t border-slate-900 pt-4 space-y-2">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono font-bold block">Current Telemetry</span>
            <div className="p-3 bg-slate-950/50 border border-slate-900 rounded-xl space-y-1.5">
              <span className="text-[10px] text-slate-400 block">Milestones Done: <strong className="text-white font-mono">{completedNodes.length}</strong></span>
              <span className="text-[10px] text-slate-400 block">Resume Rating: <strong className="text-emerald-400 font-mono">78%</strong></span>
              <span className="text-[10px] text-slate-400 block">Portfolio Score: <strong className="text-neonPurple font-mono">B+</strong></span>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4 space-y-3">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono font-bold block">Quick Prompts</span>
            <div className="space-y-2">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p.query)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-900 hover:border-slate-800 bg-slate-950/40 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Messages Panel */}
        <div className="lg:col-span-3 glass-panel rounded-2xl border border-slate-900 flex flex-col min-h-0 overflow-hidden relative">
          
          {/* Messages Scroller */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    msg.sender === 'user'
                      ? 'bg-neonBlue/5 text-neonBlue border-neonBlue/15'
                      : 'bg-neonPurple/5 text-neonPurple border-neonPurple/15 animate-pulse-glow'
                  }`}
                >
                  {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-neonBlue text-slate-950 font-semibold rounded-tr-none'
                      : 'bg-slate-950/60 text-slate-200 border border-white/5 rounded-tl-none'
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

            {/* Streaming block */}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-xl bg-neonPurple/5 text-neonPurple border border-neonPurple/15 flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-none bg-slate-950/60 border border-white/5 flex flex-col gap-1.5 min-w-[120px]">
                  {streamingText ? (
                    <MarkdownRenderer content={streamingText} />
                  ) : (
                    <div className="flex items-center gap-1.5 py-1">
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

          {/* Input Box */}
          <div className="p-4 border-t border-slate-900 bg-slate-950/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputVal);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Nova to write code, design schemas, or explain models..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 glass-input px-4 py-3 rounded-xl text-xs"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="p-3 rounded-xl bg-neonPurple hover:bg-neonPurple/90 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-neonPurple/10"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
export default Chat;
