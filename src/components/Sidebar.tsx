import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  LayoutDashboard,
  Map,
  Network,
  Calendar,
  Terminal,
  Award,
  FileCheck2,
  Video,
  DollarSign,
  User,
  BrainCircuit
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

const menuItems = [
  { path: '/', label: 'Explore', icon: Compass },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/roadmap', label: 'Interactive Roadmap', icon: Map, requiresRoadmap: true },
  { path: '/skills', label: 'Skills Tree', icon: Network, requiresRoadmap: true },
  { path: '/planners', label: 'Study Planner', icon: Calendar, requiresRoadmap: true },
  { path: '/projects', label: 'Project Lab', icon: Terminal, requiresRoadmap: true },
  { path: '/certifications', label: 'Certifications', icon: Award, requiresRoadmap: true },
  { path: '/analyzer', label: 'AI Analyzers', icon: FileCheck2 },
  { path: '/interview', label: 'Mock Interview', icon: Video, requiresRoadmap: true },
  { path: '/salary', label: 'Salary Insights', icon: DollarSign },
  { path: '/profile', label: 'Mentor Profile', icon: User },
];

export const Sidebar: React.FC = () => {
  const { roadmap, userProfile } = useRoadmap();
  const location = useLocation();

  // Calculate XP progress percentage
  const nextLevelXp = userProfile.level * 1000;
  const prevLevelXp = (userProfile.level - 1) * 1000;
  const currentLevelProgressXp = userProfile.xp - prevLevelXp;
  const currentLevelMaxXp = nextLevelXp - prevLevelXp;
  const xpPercentage = Math.min(100, Math.max(0, (currentLevelProgressXp / currentLevelMaxXp) * 100));

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-md z-40 text-slate-300">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-900">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-neonPurple to-neonBlue flex items-center justify-center shadow-lg shadow-neonPurple/20 animate-pulse-glow">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-heading font-bold text-lg tracking-wide bg-gradient-to-r from-white via-slate-200 to-neonBlue bg-clip-text text-transparent">
            PathWise
          </span>
          <span className="text-[10px] block text-accentCyan font-heading tracking-wider uppercase font-medium">
            AI Career Pilot
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const isLocked = item.requiresRoadmap && !roadmap;
          const isActive = location.pathname === item.path;

          if (isLocked) {
            return (
              <div
                key={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 cursor-not-allowed text-sm group relative"
                title="Generate a roadmap first to unlock this section"
              >
                <item.icon className="w-4 h-4 text-slate-700" />
                <span className="font-medium">{item.label}</span>
                <span className="absolute right-4 text-[10px] text-slate-700 border border-slate-800 px-1.5 py-0.5 rounded font-mono uppercase bg-slate-950/40">
                  Locked
                </span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm relative group ${
                isActive
                  ? 'text-white font-semibold shadow-inner bg-slate-900/60 border border-slate-800/40 shadow-neonBlue/5'
                  : 'hover:text-slate-200 hover:bg-slate-900/30 border border-transparent'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 w-1 h-5 rounded-r bg-gradient-to-b from-neonBlue to-neonPurple"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-neonBlue' : 'text-slate-400 group-hover:text-neonPurple'
                }`}
              />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Profile/XP Tracker Footer */}
      <div className="p-4 border-t border-slate-900/80 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full border border-slate-800 bg-slate-900/80 flex items-center justify-center text-sm font-semibold text-neonBlue">
            {userProfile.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-white truncate">{userProfile.name}</span>
            <span className="block text-[11px] text-slate-500 truncate">
              {roadmap ? roadmap.career : 'Select career target'}
            </span>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>LVL {userProfile.level}</span>
            <span>{currentLevelProgressXp} / {currentLevelMaxXp} XP</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800/40">
            <motion.div
              className="h-full bg-gradient-to-r from-neonPurple to-neonBlue"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
