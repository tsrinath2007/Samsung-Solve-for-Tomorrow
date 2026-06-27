import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  Map, 
  TrendingUp, 
  Trophy, 
  Award, 
  FileText, 
  Video,
  Plus,
  Minus,
  CheckCircle,
  BrainCircuit
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

const placeholders = [
  "AI Engineer",
  "Software Engineer",
  "Robotics Engineer",
  "Product Manager",
  "Game Developer",
  "Cyber Security Engineer",
  "Blockchain Developer",
  "Data Scientist"
];

const features = [
  { title: "AI Generated Roadmap", desc: "Instantly create detailed timeline pathways with custom milestones.", icon: Map, color: "from-blue-500 to-cyan-400" },
  { title: "Personalized Learning Path", desc: "Tailored to your current level, weekly hours, and speed preferences.", icon: Trophy, color: "from-purple-500 to-pink-500" },
  { title: "Job Recommendations", desc: "Discover live job opportunities corresponding to your active skillset.", icon: TrendingUp, color: "from-emerald-500 to-teal-400" },
  { title: "Progress Tracking", desc: "Unlock skills tree nodes, earn XP points, and build streaks.", icon: CheckCircle, color: "from-indigo-500 to-blue-600" },
  { title: "Industry Certifications", desc: "Get targeted credentials and direct course link lists.", icon: Award, color: "from-amber-500 to-orange-400" },
  { title: "Resume & Portfolio Matcher", desc: "Analyze GitHub repositories and resume PDFs for compatibility.", icon: FileText, color: "from-pink-500 to-rose-400" },
  { title: "Mock Interview Console", desc: "Complete oral technical question sessions graded by AI mentors.", icon: Video, color: "from-violet-500 to-purple-600" },
];

const testimonials = [
  { name: "Sarah Jenkins", role: "AI Engineer at Vercel", quote: "PathWise took me from zero web development knowledge to understanding server components and LLM APIs in just 4 months.", avatar: "SJ" },
  { name: "David Kim", role: "DevOps at HashiCorp", quote: "The interactive roadmap and skills tree kept me highly accountable. The mock interview scorer helped me ace my real panel session.", avatar: "DK" },
  { name: "Amara Okoye", role: "Product Manager at Stripe", quote: "I changed careers completely. PathWise generated a custom roadmap with weekly planners that was incredibly realistic.", avatar: "AO" }
];

const faqs = [
  { q: "How does the career roadmap generator work?", a: "We analyze industry trends and hiring patterns. Using LLMs, we compile a step-by-step modular guide containing estimated study times, platform resources, sample projects, and certifications." },
  { q: "Can I track multiple careers at once?", a: "Yes! PathWise lets you save multiple career roadmaps and toggle between them from your profile settings." },
  { q: "Do I need to pay for the recommended courses?", a: "No! We prioritize open-source, free resources like freeCodeCamp, MDN, and YouTube, but we also include official industry certificates for formal accreditation." },
  { q: "How does the resume matching score function?", a: "We parse your uploaded resume text and compare its vocabulary/skills against the nodes of your active roadmap to output a match percentage and suggest optimizations." }
];

const loadingMessages = [
  "Analyzing industry trends...",
  "Generating personalized roadmap...",
  "Selecting best certifications...",
  "Finding latest job opportunities...",
  "Preparing learning plan...",
  "Formatting interactive skills tree..."
];

export const Landing: React.FC = () => {
  const { isGenerating, generateRoadmap } = useRoadmap();
  const [inputValue, setInputValue] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const navigate = useNavigate();

  // Typing effect for search input placeholder
  useEffect(() => {
    let timer: number;
    const currentWord = placeholders[placeholderIdx];
    
    if (isDeleting) {
      timer = window.setTimeout(() => {
        setPlaceholderText(currentWord.substring(0, placeholderText.length - 1));
      }, 50);
    } else {
      timer = window.setTimeout(() => {
        setPlaceholderText(currentWord.substring(0, placeholderText.length + 1));
      }, 100);
    }

    if (!isDeleting && placeholderText === currentWord) {
      timer = window.setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && placeholderText === '') {
      setIsDeleting(false);
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, placeholderIdx]);

  // Loading messages loop
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    generateRoadmap(inputValue);
    navigate('/roadmap');
  };

  const handleExampleClick = (example: string) => {
    setInputValue(example);
  };

  return (
    <div className="w-full min-h-screen text-slate-100 flex flex-col items-center select-none pb-12 lg:pb-0 lg:pl-0">
      
      {/* Aurora blurred circle blobs */}
      <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full bg-neonPurple/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-96 h-96 rounded-full bg-neonBlue/10 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative w-full max-w-5xl px-6 pt-24 pb-16 flex flex-col items-center text-center">
        {/* Sparkle Tag */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neonPurple/30 bg-neonPurple/5 text-[11px] font-medium tracking-wide uppercase font-heading text-neonBlue mb-6 shadow-lg shadow-neonPurple/5"
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-neonPurple" />
          Next-Gen AI Mentor
        </motion.div>

        {/* Title */}
        <h1 className="font-heading font-extrabold text-5xl md:text-7xl tracking-tight leading-none mb-6">
          <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">Become </span>
          <span className="bg-gradient-to-r from-neonBlue via-accentCyan to-neonPurple bg-clip-text text-transparent relative drop-shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            Anything.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-slate-400 text-sm md:text-base leading-relaxed mb-10">
          Generate a personalized AI career roadmap with skills, projects, certifications, interview preparation, and live job opportunities.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl relative group mb-6">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-neonBlue to-neonPurple opacity-30 blur-md group-focus-within:opacity-85 transition-opacity" />
          <div className="relative flex items-center bg-slate-950/80 border border-slate-800/80 rounded-2xl p-1.5 pl-4 backdrop-blur-xl">
            <Search className="w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder={`e.g., ${placeholderText}`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-white placeholder-slate-600 text-sm px-3.5 py-3"
            />
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-neonPurple to-neonBlue text-slate-950 font-heading font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-neonPurple/20 hover:scale-[1.02] transition-all"
            >
              Generate
            </button>
          </div>
        </form>

        {/* Dynamic Examples */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl text-xs text-slate-500">
          <span>Popular targets:</span>
          {placeholders.slice(0, 5).map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => handleExampleClick(ex)}
              className="px-2.5 py-1 rounded bg-slate-900/60 border border-slate-900 text-slate-400 hover:text-white hover:border-slate-800 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </section>

      {/* Why PathWise Section */}
      <section className="w-full max-w-5xl px-6 py-16 border-t border-slate-900/80">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl md:text-3xl bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-3">
            Fully Integrated Career Pilot
          </h2>
          <p className="text-xs md:text-sm text-slate-500">Everything you need to pilot your career transition in one SaaS app</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-slate-800 hover:bg-slate-900/35 transition-all duration-300"
            >
              {/* Highlight background lines */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-full -mr-8 -mt-8" />
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center mb-4">
                <feat.icon className="w-5 h-5 text-neonBlue group-hover:text-neonPurple transition-colors duration-300" />
              </div>
              <h3 className="font-heading font-bold text-base text-white mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full max-w-5xl px-6 py-16 border-t border-slate-900/80">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-3">Loved by Developers</h2>
          <p className="text-xs text-slate-500">From absolute beginners to tech professionals advancing their path</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all">
              <p className="text-xs text-slate-400 italic leading-relaxed mb-6">"{test.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neonPurple to-neonBlue flex items-center justify-center text-xs font-heading font-bold text-white shadow-md">
                  {test.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{test.name}</h4>
                  <span className="text-[10px] text-slate-500 block">{test.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full max-w-3xl px-6 py-16 border-t border-slate-900/80">
        <h2 className="font-heading font-bold text-2xl text-center text-white mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-xl overflow-hidden border border-slate-900">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/20 transition-colors"
              >
                <span className="text-xs md:text-sm font-heading font-semibold text-slate-200">{faq.q}</span>
                {activeFaq === idx ? <Minus className="w-4 h-4 text-neonPurple" /> : <Plus className="w-4 h-4 text-neonBlue" />}
              </button>
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 border-t border-slate-900/40 text-xs text-slate-400 leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* AI Loading Experience Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center select-none"
          >
            {/* Animated Neural Network */}
            <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
              {/* Pulsing center glow */}
              <div className="absolute w-24 h-24 rounded-full bg-neonPurple/20 animate-pulse-glow blur-xl" />
              
              {/* Orbiting nodes */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute w-full h-full"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-neonBlue shadow-[0_0_10px_#38bdf8]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-neonPurple shadow-[0_0_10px_#7c3aed]" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accentCyan shadow-[0_0_10px_#22d3ee]" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              </motion.div>

              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="absolute w-2/3 h-2/3"
              >
                <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-neonPurple shadow-[0_0_8px_#7c3aed]" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full bg-neonBlue shadow-[0_0_8px_#38bdf8]" />
              </motion.div>

              <BrainCircuit className="w-12 h-12 text-white animate-pulse" />
            </div>

            {/* Loading text messages */}
            <h2 className="font-heading font-extrabold text-2xl text-white mb-3">
              Compiling AI Career Roadmap
            </h2>
            <div className="h-6 overflow-hidden relative w-80 mb-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingMsgIdx}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-neonBlue font-mono uppercase tracking-wider w-full"
                >
                  {loadingMessages[loadingMsgIdx]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Glowing progress line bar */}
            <div className="w-64 h-1 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-neonPurple via-accentCyan to-neonBlue"
                animate={{
                  left: ['-100%', '100%']
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
                style={{ width: '40%', position: 'absolute' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
