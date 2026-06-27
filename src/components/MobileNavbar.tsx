import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  LayoutDashboard,
  Map,
  Calendar,
  Menu,
  X,
  Award,
  Terminal,
  FileCheck2,
  Video,
  DollarSign,
  User,
  BrainCircuit
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

export const MobileNavbar: React.FC = () => {
  const { roadmap } = useRoadmap();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const mainTabs = [
    { path: '/', label: 'Explore', icon: Compass },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/roadmap', label: 'Roadmap', icon: Map, requiresRoadmap: true },
    { path: '/planners', label: 'Planner', icon: Calendar, requiresRoadmap: true },
  ];

  const secondaryMenu = [
    { path: '/skills', label: 'Skills Tree', icon: Compass, requiresRoadmap: true }, // We'll map Network icon below
    { path: '/projects', label: 'Project Lab', icon: Terminal, requiresRoadmap: true },
    { path: '/certifications', label: 'Certifications', icon: Award, requiresRoadmap: true },
    { path: '/analyzer', label: 'AI Analyzers', icon: FileCheck2 },
    { path: '/interview', label: 'Mock Interview', icon: Video, requiresRoadmap: true },
    { path: '/salary', label: 'Salary Insights', icon: DollarSign },
    { path: '/profile', label: 'Profile Settings', icon: User },
  ];

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-slate-900 bg-slate-950/90 backdrop-blur-lg z-50 flex items-center justify-around px-2 text-slate-400">
        {mainTabs.map((tab) => {
          const isLocked = tab.requiresRoadmap && !roadmap;
          
          if (isLocked) {
            return (
              <div
                key={tab.path}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-700 cursor-not-allowed opacity-50"
              >
                <tab.icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">{tab.label}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
                  isActive ? 'text-neonBlue font-medium' : 'hover:text-slate-200'
                }`
              }
            >
              <tab.icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{tab.label}</span>
            </NavLink>
          );
        })}

        {/* More Options Tab */}
        <button
          onClick={toggleMenu}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
            isOpen ? 'text-neonPurple' : 'hover:text-slate-200'
          }`}
        >
          {isOpen ? <X className="w-5 h-5 mb-0.5" /> : <Menu className="w-5 h-5 mb-0.5" />}
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      {/* Slide-Up Bottom Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="lg:hidden fixed bottom-16 left-0 right-0 glass-panel-heavy border-t border-slate-800 rounded-t-3xl z-40 max-h-[80vh] overflow-y-auto p-6"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-900">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neonPurple to-neonBlue flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-white">PathWise Nav</h3>
                  <p className="text-[10px] text-accentCyan uppercase tracking-wider font-mono">Advanced Modules</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-6">
                {secondaryMenu.map((item) => {
                  const isLocked = item.requiresRoadmap && !roadmap;
                  const isActive = location.pathname === item.path;

                  if (isLocked) {
                    return (
                      <div
                        key={item.path}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-950 bg-slate-900/10 text-slate-700 cursor-not-allowed text-sm opacity-40"
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="truncate">{item.label}</span>
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={toggleMenu}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-sm ${
                        isActive
                          ? 'bg-slate-900/80 border-slate-800 text-white shadow-md'
                          : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-neonBlue' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
