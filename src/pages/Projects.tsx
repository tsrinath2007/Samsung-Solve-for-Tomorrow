import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Terminal, 
  Clock, 
  GitFork, 
  CloudLightning, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

interface ProjectType {
  title: string;
  description: string;
  skillsUsed: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeEst: string;
  githubInspiration?: string;
  deploymentTarget?: string;
  resumeImpact: string;
  milestoneTitle: string;
}

export const Projects: React.FC = () => {
  const { roadmap } = useRoadmap();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);

  if (!roadmap) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Terminal className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
        <h2 className="font-heading font-bold text-xl text-white mb-2">No Projects Configured</h2>
        <p className="max-w-md text-xs text-slate-500 mb-6">
          Initialize a career roadmap first to automatically compile a custom list of beginner, intermediate, and advanced practical build specifications.
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

  // Aggregate all projects from all milestones in the roadmap
  const allProjects: ProjectType[] = [];
  roadmap.milestones.forEach((m) => {
    if (m.projects) {
      m.projects.forEach((p) => {
        allProjects.push({
          ...p,
          milestoneTitle: m.title
        });
      });
    }
  });

  // Filter based on active tab
  const filteredProjects = allProjects.filter((p) => p.difficulty === activeTab);

  const toggleProjectComplete = (title: string) => {
    setCompletedProjects(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title) 
        : [...prev, title]
    );
  };

  const tabs: ('Beginner' | 'Intermediate' | 'Advanced')[] = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="w-full max-w-5xl px-6 py-10 text-slate-100 pb-24 lg:pb-12">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-slate-900 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white mb-1.5 flex items-center gap-2">
            <Terminal className="w-8 h-8 text-neonPurple" /> Project Lab
          </h1>
          <p className="text-xs text-slate-500">
            Build practical tools for: <span className="text-neonBlue font-mono">{roadmap.career}</span>
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-900 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-slate-900 text-white border border-slate-800'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl">
          <Lock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-400">No Projects in this Tier</h3>
          <p className="text-xs text-slate-600 mt-1">Complete earlier modules to unlock advanced specifications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((proj, idx) => {
            const isCompleted = completedProjects.includes(proj.title);
            
            return (
              <div 
                key={idx} 
                className={`glass-panel p-6 rounded-2xl flex flex-col justify-between border transition-all duration-300 ${
                  isCompleted 
                    ? 'border-emerald-500/40 bg-slate-950/70 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                    : 'hover:border-slate-800'
                }`}
              >
                <div>
                  {/* Top Stats */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider">
                      Module: {proj.milestoneTitle}
                    </span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 border rounded uppercase tracking-wider ${
                      proj.difficulty === 'Beginner' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' :
                      proj.difficulty === 'Intermediate' ? 'border-sky-500/30 bg-sky-500/5 text-sky-400' :
                      'border-purple-500/30 bg-purple-500/5 text-purple-400'
                    }`}>
                      {proj.difficulty}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-white mb-2 flex items-center justify-between">
                    {proj.title}
                    {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  </h3>
                  
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {proj.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {proj.skillsUsed.map((sk) => (
                      <span key={sk} className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-900 rounded text-slate-400">
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Telemetry rows */}
                  <div className="border-t border-slate-900/60 pt-4 space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span><strong>Est. Build Time:</strong> {proj.timeEst}</span>
                    </div>
                    {proj.deploymentTarget && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <CloudLightning className="w-4 h-4 text-slate-600" />
                        <span><strong>Cloud Target:</strong> {proj.deploymentTarget}</span>
                      </div>
                    )}
                    {proj.githubInspiration && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <GitFork className="w-4 h-4 text-slate-600" />
                        <span>
                          <strong>Reference:</strong>{' '}
                          <a 
                            href={proj.githubInspiration} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-neonBlue hover:text-neonPurple transition-colors underline"
                          >
                            GitHub Template
                          </a>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resume Impact bullet */}
                <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1 mb-6 text-[10px] text-slate-500">
                  <span className="font-mono text-neonPurple font-bold uppercase tracking-wider text-[8px] block">
                    Resume Builder Bullet
                  </span>
                  <p className="italic leading-normal">
                    "{proj.resumeImpact}"
                  </p>
                </div>

                {/* Complete Button */}
                <button
                  onClick={() => toggleProjectComplete(proj.title)}
                  className={`w-full py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    isCompleted
                      ? 'border-slate-800 hover:border-slate-700 text-slate-400'
                      : 'border-neonBlue hover:bg-neonBlue/5 text-white shadow-sm shadow-neonBlue/5'
                  }`}
                >
                  {isCompleted ? 'Mark Incomplete' : 'Mark Completed (+500 XP)'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Projects;
