import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Sparkles, BookOpen, X } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

interface SkillNode {
  id: string;
  name: string;
  milestoneId: string;
  description: string;
  category: string;
  isUnlocked: boolean;
  isCompleted: boolean;
}

export const SkillsTree: React.FC = () => {
  const { roadmap, completedNodes } = useRoadmap();
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);

  if (!roadmap) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Network className="w-16 h-16 text-slate-700 mb-4 animate-bounce" />
        <h2 className="font-heading font-bold text-xl text-white mb-2">No Skills Tree Active</h2>
        <p className="max-w-md text-xs text-slate-500 mb-6">
          Generate an AI-powered career roadmap first to map your skills progression onto an interactive unlockable visual tree.
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

  // Compile skills from roadmap milestones
  const skillNodes: SkillNode[] = [];
  roadmap.milestones.forEach((m, mIdx) => {
    // Determine milestone status
    const isCompleted = completedNodes.includes(m.id);
    // Unlocked if previous milestone is completed, or it's the first milestone
    const isUnlocked = mIdx === 0 || completedNodes.includes(roadmap.milestones[mIdx - 1].id);

    m.skills.forEach((s, sIdx) => {
      const skillId = `s-${m.id}-${sIdx}`;
      skillNodes.push({
        id: skillId,
        name: s,
        milestoneId: m.id,
        description: `This node covers core elements of ${s} required for professional operations in ${roadmap.career}.`,
        category: m.title,
        isUnlocked,
        isCompleted
      });
    });
  });

  // Group nodes by milestone to render tiers
  const tiers = roadmap.milestones.map((m, idx) => {
    const tierSkills = skillNodes.filter((s) => s.milestoneId === m.id);
    return {
      milestoneId: m.id,
      title: m.title,
      skills: tierSkills,
      index: idx,
      isCompleted: completedNodes.includes(m.id)
    };
  });

  return (
    <div className="w-full max-w-5xl px-6 py-10 text-slate-100 pb-24 lg:pb-12 relative overflow-hidden">
      
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neonBlue/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="mb-10 pb-6 border-b border-slate-900">
        <h1 className="font-heading font-extrabold text-3xl text-white mb-1.5 flex items-center gap-2">
          <Network className="w-8 h-8 text-neonBlue" /> Skills Tree
        </h1>
        <p className="text-xs text-slate-500">
          Unlock core nodes to advance in: <span className="text-neonBlue font-mono">{roadmap.career}</span>
        </p>
      </div>

      {/* Skills Tree Tiers Layout */}
      <div className="space-y-12 relative pl-4 border-l border-slate-900/60 ml-4 py-4">
        {tiers.map((tier) => {
          const isTierUnlocked = tier.index === 0 || completedNodes.includes(roadmap.milestones[tier.index - 1].id);

          return (
            <div key={tier.milestoneId} className="relative space-y-4">
              
              {/* Connection point dot on the left line */}
              <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-background transition-all ${
                tier.isCompleted ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 
                isTierUnlocked ? 'bg-neonBlue shadow-[0_0_8px_#38bdf8]' : 'bg-slate-900'
              }`} />

              {/* Tier Title */}
              <div>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono font-bold">
                  Tier {tier.index + 1} • {tier.isCompleted ? 'Unlocked' : isTierUnlocked ? 'In Progress' : 'Locked'}
                </span>
                <h3 className="text-xs font-bold text-slate-400 truncate">{tier.title}</h3>
              </div>

              {/* Skills nodes row */}
              <div className="flex flex-wrap gap-4 pt-1">
                {tier.skills.map((skill) => {
                  let statusClass = 'border-slate-900 bg-slate-950/20 text-slate-600 opacity-50 cursor-not-allowed';
                  let glowClass = '';

                  if (skill.isCompleted) {
                    statusClass = 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400 cursor-pointer';
                    glowClass = 'shadow-[0_0_10px_rgba(16,185,129,0.15)]';
                  } else if (skill.isUnlocked) {
                    statusClass = 'border-slate-800 bg-slate-900/60 text-slate-200 cursor-pointer hover:border-slate-700';
                    glowClass = 'shadow-[0_0_10px_rgba(255,255,255,0.02)]';
                  }

                  return (
                    <motion.div
                      key={skill.id}
                      onClick={() => skill.isUnlocked && setSelectedSkill(skill)}
                      className={`px-4 py-2.5 rounded-xl border backdrop-blur-md text-xs font-heading font-medium tracking-wide transition-all ${statusClass} ${glowClass}`}
                      whileHover={skill.isUnlocked ? { scale: 1.03 } : {}}
                      whileTap={skill.isUnlocked ? { scale: 0.98 } : {}}
                    >
                      {skill.name}
                    </motion.div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* Skill Modal Detail */}
      <AnimatePresence>
        {selectedSkill && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel-heavy p-6 rounded-2xl border border-slate-800 relative"
            >
              <button 
                onClick={() => setSelectedSkill(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="text-[9px] uppercase tracking-wider text-neonBlue font-mono font-bold flex items-center gap-1 mb-2">
                <Sparkles className="w-3 h-3 text-neonPurple animate-spin-slow" /> Unlocked Skill Node
              </span>

              <h3 className="font-heading font-extrabold text-xl text-white mb-2">
                {selectedSkill.name}
              </h3>
              <span className="text-[10px] text-slate-500 block mb-4">
                Module: {selectedSkill.category}
              </span>

              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                {selectedSkill.description}
              </p>

              {/* Status details */}
              <div className="border-t border-slate-900 pt-4 flex justify-between items-center text-[10px] text-slate-500">
                <span>Status: <strong className={selectedSkill.isCompleted ? 'text-emerald-400 font-mono' : 'text-neonBlue font-mono'}>
                  {selectedSkill.isCompleted ? 'Completed' : 'In Progress'}
                </strong></span>
                <button
                  onClick={() => {
                    setSelectedSkill(null);
                    navigate('/roadmap');
                  }}
                  className="inline-flex items-center gap-1 text-neonBlue hover:text-neonPurple transition-colors font-bold uppercase tracking-wider"
                >
                  Learn Module <BookOpen className="w-3.5 h-3.5" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default SkillsTree;
