import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, X, Send, Bot, User as UserIcon } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

interface Message {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: Date;
}

export const MentorChat: React.FC = () => {
  const { roadmap, completedNodes, settings } = useRoadmap();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'mentor',
      text: "Hello! I'm your PathWise AI Mentor. Ask me anything about your current career path, technical topics, or what to learn next!",
      timestamp: new Date(),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const presetQuestions = [
    { text: "What's my next task?", id: 'task' },
    { text: "Am I ready for interviews?", id: 'interview' },
    { text: "Explain React Hooks", id: 'explain_hooks' },
  ];

  const handlePresetClick = (q: string) => {
    handleSendMessage(q);
  };

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

    // Simulate AI response
    try {
      let replyText = '';

      if (settings.openAiKey && settings.openAiKey.trim() !== '') {
        // Run against OpenAI API
        const systemPrompt = `You are a helpful, encouraging AI Career Mentor for a student pursuing a career in: "${
          roadmap ? roadmap.career : 'Software Engineering'
        }".
        The student's active roadmap has the following description: "${
          roadmap ? roadmap.description : ''
        }".
        They have completed ${completedNodes.length} milestones out of ${
          roadmap ? roadmap.milestones.length : 0
        }.
        Answer their question in a professional, mentorship-style manner. Keep replies concise, formatting code blocks if necessary.`;

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.openAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map((m) => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text,
              })),
              { role: 'user', content: textToSend },
            ],
            temperature: 0.7,
          }),
        });

        if (res.ok) {
          const raw = await res.json();
          replyText = raw.choices[0].message.content;
        } else {
          replyText = "I encountered an issue querying the model. Here's a quick mentor response instead...";
        }
      }

      // Fallback local compiler if API failed or not set
      if (!replyText) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const lowercaseText = textToSend.toLowerCase();

        if (lowercaseText.includes('next task') || lowercaseText.includes('what\'s my next') || lowercaseText.includes("today's task")) {
          if (!roadmap) {
            replyText = "You haven't selected a career path yet! Head over to the Explore tab to search for your dream job and generate a roadmap.";
          } else {
            const nextMilestone = roadmap.milestones.find((m) => !completedNodes.includes(m.id));
            if (nextMilestone) {
              replyText = `Based on your "${roadmap.career}" roadmap, your next focus is the **${nextMilestone.title}** milestone. I suggest completing this practice task:
              
* "${nextMilestone.tasks[0]}"

You have completed ${completedNodes.length}/${roadmap.milestones.length} milestones. Keep pushing!`;
            } else {
              replyText = `Congratulations! You have completed all the milestones on your "${roadmap.career}" roadmap. You are fully ready to polish your portfolio, build final projects, and apply to job listings.`;
            }
          }
        } else if (lowercaseText.includes('interview') || lowercaseText.includes('ready')) {
          if (!roadmap) {
            replyText = "You'll be ready once we generate a roadmap and practice mock interviews! Try typing a career goal in the search box.";
          } else {
            const completionPct = Math.round((completedNodes.length / roadmap.milestones.length) * 100);
            if (completionPct < 40) {
              replyText = `You're currently at **${completionPct}%** completion on your roadmap. I recommend completing at least 2-3 more milestones (such as JavaScript/API foundations) before booking mock interviews. Continue practicing core coding exercises daily!`;
            } else {
              replyText = `You're at **${completionPct}%** progress. You have solid foundations in place! You should head to the **Mock Interview** tab and run a technical coding session on *${roadmap.keywords[0]}* to test your communication and confidence scores.`;
            }
          }
        } else if (lowercaseText.includes('react hook') || lowercaseText.includes('explain hook')) {
          replyText = `**React Hooks** are functions that let functional components store state and synchronize effects, which previously required Class Components.
          
1. **useState**: Stores local reactive values inside components.
2. **useEffect**: Runs side effects like API requests, event listeners, and manual DOM edits.
3. **useContext**: Directly accesses context values without manual prop drilling.

Here is a quick example of a counter hook:
\`\`\`tsx
const Counter = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Val: {count}</button>;
}
\`\`\``;
        } else {
          replyText = `That's a great question about ${roadmap ? roadmap.career : 'learning'}. To succeed in this area:
          
* Focus on hands-on project creation rather than passively watching video tutorials.
* Set aside 30-40 minutes of uninterrupted coding daily to keep your study streak active.
* Make sure you fully understand step-by-step logic before copying library code.

Let me know if you want me to outline a learning plan for this specific module!`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'mentor',
          text: replyText,
          timestamp: new Date(),
        },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-6 z-50">
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-neonPurple to-neonBlue flex items-center justify-center shadow-lg shadow-neonPurple/30 text-white cursor-pointer hover:scale-105 transition-transform"
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center text-white animate-bounce">
            1
          </span>
        )}
      </motion.button>

      {/* Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute bottom-16 right-0 w-[90vw] sm:w-[400px] h-[550px] rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900/60 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neonPurple to-neonBlue flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-heading font-bold text-white">PathWise AI Mentor</h4>
                  <span className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping inline-block" /> Active Guide
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.sender === 'user' ? 'bg-neonBlue/10 text-neonBlue border border-neonBlue/20' : 'bg-neonPurple/10 text-neonPurple border border-neonPurple/20'
                    }`}
                  >
                    {msg.sender === 'user' ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-neonBlue text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-900/80 text-slate-200 border border-slate-800 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-7 h-7 rounded-full bg-neonPurple/10 text-neonPurple border border-neonPurple/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neonPurple animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neonPurple animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neonPurple animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Presets and Input */}
            <div className="p-4 border-t border-slate-900 bg-slate-950">
              {/* Presets */}
              <div className="flex flex-wrap gap-2 mb-3.5">
                {presetQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handlePresetClick(q.text)}
                    className="text-[10px] px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                  >
                    {q.text}
                  </button>
                ))}
              </div>

              {/* Text Area Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputVal);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask a technical concept or suggest next step..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="flex-1 glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-neonPurple hover:bg-neonPurple/90 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
