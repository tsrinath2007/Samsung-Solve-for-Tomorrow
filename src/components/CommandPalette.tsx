import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, LayoutDashboard, Map, Calendar, Terminal, Award, FileCheck2, Video, DollarSign, User, Sparkles, LogOut, Bot } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

export const CommandPalette: React.FC = () => {
  const { roadmap, toggleNodeCompletion, addStudyHours } = useRoadmap();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle palette open/close on CTRL+K / CMD+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearchVal('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Command items catalog
  const navigationItems = [
    { label: 'Navigate to Explore', path: '/', icon: Compass, action: () => navigate('/') },
    { label: 'Navigate to Dashboard', path: '/dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { label: 'Navigate to AI Copilot', path: '/chat', icon: Bot, action: () => navigate('/chat') },
    { label: 'Navigate to Roadmap', path: '/roadmap', icon: Map, action: () => navigate('/roadmap') },
    { label: 'Navigate to Planners', path: '/planners', icon: Calendar, action: () => navigate('/planners') },
    { label: 'Navigate to Project Lab', path: '/projects', icon: Terminal, action: () => navigate('/projects') },
    { label: 'Navigate to Certifications', path: '/certifications', icon: Award, action: () => navigate('/certifications') },
    { label: 'Navigate to AI Analyzers', path: '/analyzer', icon: FileCheck2, action: () => navigate('/analyzer') },
    { label: 'Navigate to Mock Interviews', path: '/interview', icon: Video, action: () => navigate('/interview') },
    { label: 'Navigate to Salary Insights', path: '/salary', icon: DollarSign, action: () => navigate('/salary') },
    { label: 'Navigate to Mentor Profile', path: '/profile', icon: User, action: () => navigate('/profile') },
  ];

  const quickActionItems = [
    { label: 'Quick Action: Log 1 Hour Study', category: 'action', icon: Sparkles, action: () => { addStudyHours(1); setIsOpen(false); } },
    { label: 'Quick Action: Log 2 Hours Study', category: 'action', icon: Sparkles, action: () => { addStudyHours(2); setIsOpen(false); } },
    { 
      label: 'Quick Action: Toggle Active Milestone', 
      category: 'action', 
      icon: Sparkles, 
      action: () => { 
        if (roadmap && roadmap.milestones.length > 0) {
          toggleNodeCompletion(roadmap.milestones[0].id); 
        }
        setIsOpen(false);
      } 
    },
    { 
      label: 'Logout Session', 
      category: 'action', 
      icon: LogOut, 
      action: () => { 
        if ((window as any).pathwiseLogout) {
          (window as any).pathwiseLogout();
        }
        setIsOpen(false);
      } 
    }
  ];

  // Compile active roadmap milestone searches
  const roadmapSearchItems = roadmap 
    ? roadmap.milestones.map((m) => ({
        label: `Search Roadmap: View "${m.title}"`,
        category: 'roadmap',
        icon: Map,
        action: () => { navigate('/roadmap'); setIsOpen(false); }
      }))
    : [];

  const allItems = [
    ...navigationItems,
    ...quickActionItems,
    ...roadmapSearchItems
  ];

  // Filter items based on query
  const filteredItems = allItems.filter((item) =>
    item.label.toLowerCase().includes(searchVal.toLowerCase())
  );

  const handleSelectCommand = (item: typeof allItems[0]) => {
    item.action();
    setIsOpen(false);
  };

  // Handle arrow key select cycles
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[activeIndex]) {
        handleSelectCommand(filteredItems[activeIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh] px-4 select-none">
          {/* Backdrop click close */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-lg glass-panel-heavy rounded-2xl border border-white/5 shadow-2xl overflow-hidden z-10 flex flex-col h-[380px]"
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-white/5 bg-slate-900/35">
              <Search className="w-4.5 h-4.5 text-slate-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search commands, navigate tabs, or log hours..."
                value={searchVal}
                onChange={(e) => { setSearchVal(e.target.value); setActiveIndex(0); }}
                onKeyDown={handleInputKeyDown}
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-white placeholder-slate-600 text-xs"
              />
              <span className="text-[10px] text-slate-700 font-mono border border-slate-900 bg-slate-950/50 px-1.5 py-0.5 rounded">
                ESC
              </span>
            </div>

            {/* Commands List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-600">
                  No commands matched your query.
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const IconComp = item.icon;
                  const isSelected = activeIndex === idx;
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectCommand(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-xs ${
                        isSelected 
                          ? 'bg-gradient-to-r from-neonPurple/20 to-neonBlue/10 border-l-2 border-neonPurple text-white' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <IconComp className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-neonBlue' : 'text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isSelected && (
                        <span className="text-[9px] font-mono text-neonBlue uppercase tracking-wider">
                          Enter
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer tips */}
            <div className="p-3 border-t border-white/5 bg-slate-900/10 flex items-center justify-between text-[10px] text-slate-600 font-mono">
              <span>Use ↑ ↓ to navigate</span>
              <span>Press Enter to select</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
