import React, { useState, useEffect, useRef } from 'react';

import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import type { NodeProps, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Terminal, 
  Award, 
  AlertTriangle,
  Notebook,
  Save,
  ArrowLeft,
  Compass,
  Sparkles,
  Send,
  Star,
  Zap,
  TrendingUp,
  Brain,
  Search,
  Network,
  Share2,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';
import { streamNovaAIResponse } from '../services/aiService';

// ----------------------------------------------------
// DYNAMIC NEURAL NETWORK CANVAS ANIMATION
// ----------------------------------------------------
const NeuralNetworkCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.3
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw Connections
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.12)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw Particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Update pos
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

// ----------------------------------------------------
// CENTER HUB NODE (DREAM JOB TARGET)
// ----------------------------------------------------
const CenterNode: React.FC<NodeProps> = (props) => {
  const data = props.data as any;
  return (
    <div className="px-6 py-4 rounded-3xl border border-neonPurple bg-slate-950 text-white font-heading font-extrabold text-xs uppercase tracking-widest text-center shadow-[0_0_25px_rgba(124,58,237,0.45)] relative z-20">
      <Handle type="source" position={Position.Top} className="!opacity-0" id="s-top" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" id="s-bottom" />
      <Handle type="source" position={Position.Left} className="!opacity-0" id="s-left" />
      <Handle type="source" position={Position.Right} className="!opacity-0" id="s-right" />
      <Handle type="target" position={Position.Top} className="!opacity-0" id="t-top" />
      <Handle type="target" position={Position.Bottom} className="!opacity-0" id="t-bottom" />
      <Handle type="target" position={Position.Left} className="!opacity-0" id="t-left" />
      <Handle type="target" position={Position.Right} className="!opacity-0" id="t-right" />
      
      <span className="text-[8px] tracking-widest text-slate-500 font-mono block mb-1">Dream Job Target</span>
      <span className="text-neonBlue text-[13px] font-extrabold block">{data.label}</span>
    </div>
  );
};

// ----------------------------------------------------
// FIGMA-GRADE CUSTOM NODE COMPONENT FOR REACT FLOW
// ----------------------------------------------------
const CustomMilestoneNode: React.FC<NodeProps> = (props) => {
  const data = props.data as any;
  const isCompleted = data.isCompleted;
  const isActive = data.isActive;

  // Render Star Ratings
  const renderStars = (diff: string) => {
    let count = 2;
    if (diff?.toLowerCase().includes('begin')) count = 1;
    if (diff?.toLowerCase().includes('inter')) count = 2;
    if (diff?.toLowerCase().includes('adv') || diff?.toLowerCase().includes('hard')) count = 3;

    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[...Array(3)].map((_, i) => (
          <Star key={i} className={`w-2.5 h-2.5 ${i < count ? 'fill-current' : 'opacity-20'}`} />
        ))}
      </div>
    );
  };

  let borderStyle = 'border-slate-800/80 bg-slate-950/80 text-slate-400 opacity-40';
  let glowStyle = 'shadow-[0_0_12px_rgba(30,41,59,0.2)]';

  if (isCompleted) {
    borderStyle = 'border-emerald-500/80 bg-slate-950/90 text-emerald-400 opacity-90';
    glowStyle = 'shadow-[0_0_20px_rgba(16,185,129,0.2)]';
  } else if (isActive) {
    borderStyle = 'border-neonBlue bg-slate-900/90 text-white animate-node-pulse';
    glowStyle = 'shadow-[0_0_25px_rgba(56,189,248,0.35)] animate-node-float';
  }

  return (
    <div className={`px-5 py-4 rounded-2xl border backdrop-blur-lg transition-all duration-300 w-72 hover:scale-[1.03] hover:translate-y-[-4px] hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] cursor-pointer relative z-10 ${borderStyle} ${glowStyle}`}>
      {/* Target & Source Handles at all 4 corners for orbital connections */}
      <Handle type="target" position={Position.Top} className="!opacity-0" id="t-top" />
      <Handle type="target" position={Position.Bottom} className="!opacity-0" id="t-bottom" />
      <Handle type="target" position={Position.Left} className="!opacity-0" id="t-left" />
      <Handle type="target" position={Position.Right} className="!opacity-0" id="t-right" />
      <Handle type="source" position={Position.Top} className="!opacity-0" id="s-top" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" id="s-bottom" />
      <Handle type="source" position={Position.Left} className="!opacity-0" id="s-left" />
      <Handle type="source" position={Position.Right} className="!opacity-0" id="s-right" />
      
      {/* Node Top details */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono font-bold">
          Step {data.index + 1 < 10 ? `0${data.index + 1}` : data.index + 1}
        </span>
        <div className="flex items-center gap-1.5">
          {renderStars(data.difficulty || 'Intermediate')}
          {isCompleted && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-slate-950 animate-pulse">
              <CheckCircle className="w-3.5 h-3.5 fill-current" />
            </span>
          )}
        </div>
      </div>
      
      {/* Node Title */}
      <h4 className="font-heading font-extrabold text-sm text-slate-100 truncate mb-1">
        {data.title}
      </h4>

      <p className="text-[10px] text-slate-400 line-clamp-1 mb-3">
        {data.description || 'Learn core frameworks and build projects.'}
      </p>
      
      {/* Footer telemetries */}
      <div className="grid grid-cols-2 gap-2 border-t border-slate-900/60 pt-2.5 text-[9px] text-slate-500 font-mono">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{data.duration}</span>
        </div>
        <div className="flex items-center gap-1 justify-end">
          <Zap className="w-3 h-3 text-neonPurple" />
          <span>+{data.xpReward || 300} XP</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-accentCyan" />
          <span>Impact: High</span>
        </div>
        <div className="text-right text-[8px] text-slate-400 font-bold">
          {isCompleted ? '100%' : isActive ? '20%' : '0%'} Complete
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  milestoneNode: CustomMilestoneNode,
  centerNode: CenterNode
};

// ----------------------------------------------------
// MAIN ROADMAP UPGRADED COMPONENT
// ----------------------------------------------------
export const Roadmap: React.FC = () => {
  const { 
    roadmap, 
    completedNodes, 
    isGenerating, 
    generateRoadmap,
    toggleNodeCompletion, 
    notes, 
    saveNodeNote,
    userProfile,
    streak
  } = useRoadmap();
  

  // Left Search Sidebar open/close
  const [isExploreOpen, setIsExploreOpen] = useState(true);
  
  // Layout view mode
  const [layoutMode, setLayoutMode] = useState<'timeline' | 'spiderweb'>('spiderweb');

  // Detail Panel ID
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeNoteText, setActiveNoteText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Ask Nova Inline State inside Drawer
  const [askNovaInput, setAskNovaInput] = useState('');
  const [askNovaResponse, setAskNovaResponse] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  // Simulation loading states for progress bar
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeLogIdx, setActiveLogIdx] = useState(0);
  const [apiDone, setApiDone] = useState(false);

  // Search input state
  const [searchVal, setSearchVal] = useState('');

  const loaderLogs = [
    "Studying hiring trends & requirements...",
    "Finding required programming languages...",
    "Selecting premium certifications...",
    "Generating portfolio laboratory prompts...",
    "Compiling mockup interview questions...",
    "Finalizing pathwise parameters..."
  ];

  // Quick Suggested Careers
  const quickSuggs = ["AI Engineer", "Game Developer", "Cybersecurity Analyst", "Frontend Developer"];

  // Progress Bar Simulation
  useEffect(() => {
    if (isGenerating) {
      setGenerationProgress(0);
      setActiveLogIdx(0);
      setApiDone(false);

      const interval = setInterval(() => {
        setGenerationProgress((p) => {
          if (p >= 98) {
            clearInterval(interval);
            return 98;
          }
          const next = p + Math.floor(Math.random() * 15) + 3;
          return Math.min(next, 98);
        });
      }, 500);

      const logInterval = setInterval(() => {
        setActiveLogIdx((idx) => (idx + 1) % loaderLogs.length);
      }, 900);

      return () => {
        clearInterval(interval);
        clearInterval(logInterval);
      };
    } else {
      setApiDone(true);
      setGenerationProgress(100);
    }
  }, [isGenerating]);

  // Sync React Flow nodes and edges in selected layout (timeline or spiderweb)
  useEffect(() => {
    if (!roadmap) return;

    const isMobile = window.innerWidth < 768;

    if (layoutMode === 'spiderweb') {
      const center = { x: 450, y: 450 };
      const flowNodes = [];

      // Add Center Node
      flowNodes.push({
        id: 'center-node',
        type: 'centerNode',
        position: center,
        data: { label: roadmap.career }
      });

      // Distribute nodes in orbit circles around center
      roadmap.milestones.forEach((m, idx) => {
        const isCompleted = completedNodes.includes(m.id);
        const firstUncompleted = roadmap.milestones.find(mile => !completedNodes.includes(mile.id));
        const isActive = firstUncompleted ? firstUncompleted.id === m.id : idx === 0;

        const orbitNum = Math.floor(idx / 2) + 1; // Orbit rings 1, 2, 3...
        const radius = orbitNum * 155 + 50; 
        
        // Disperse angles
        const angleOffset = (orbitNum * Math.PI) / 4; 
        const angle = (idx * (2 * Math.PI)) / roadmap.milestones.length + angleOffset;

        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);

        flowNodes.push({
          id: m.id,
          type: 'milestoneNode',
          position: { x: x - 144, y: y - 50 }, // Offset to center 288px width card
          data: { 
            title: m.title, 
            description: m.description,
            duration: m.duration, 
            index: idx,
            isCompleted,
            isActive,
            xpReward: 300 + (idx * 50),
            difficulty: idx < 2 ? 'Beginner' : idx < 4 ? 'Intermediate' : 'Advanced'
          },
        });
      });

      const flowEdges: Edge[] = [];
      roadmap.milestones.forEach((m, idx) => {
        const isCompleted = completedNodes.includes(m.id);
        
        // Add spokes: translucent lines connecting center to all orbital nodes
        flowEdges.push({
          id: `spoke-${m.id}`,
          source: 'center-node',
          target: m.id,
          type: 'default',
          style: {
            stroke: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.12)',
            strokeWidth: 1.5,
            strokeDasharray: '4 4'
          }
        });

        // Add syllabus threads connecting nodes sequentially (forming the outer web loop)
        if (idx < roadmap.milestones.length - 1) {
          const nextId = roadmap.milestones[idx + 1].id;
          const isNextActive = completedNodes.includes(m.id) && !completedNodes.includes(nextId);
          flowEdges.push({
            id: `thread-${m.id}-${nextId}`,
            source: m.id,
            target: nextId,
            type: 'default',
            animated: isNextActive || (isCompleted && !completedNodes.includes(nextId)),
            style: {
              stroke: isCompleted ? '#10B981' : isNextActive ? '#38BDF8' : '#1e293b',
              strokeWidth: isNextActive ? 3.5 : 2.5,
              filter: isNextActive ? 'drop-shadow(0 0 8px #38BDF8)' : isCompleted ? 'drop-shadow(0 0 5px #10B981)' : 'none'
            }
          });
        }
      });

      setNodes(flowNodes);
      setEdges(flowEdges);

    } else {
      // Timeline layout mode (Zig-Zag snake positions)
      const flowNodes = roadmap.milestones.map((m, idx) => {
        const isCompleted = completedNodes.includes(m.id);
        const firstUncompleted = roadmap.milestones.find(mile => !completedNodes.includes(mile.id));
        const isActive = firstUncompleted ? firstUncompleted.id === m.id : idx === 0;

        const x = isMobile ? 120 : (idx % 2 === 0 ? 150 : 520);
        const y = idx * 230 + 50;

        return {
          id: m.id,
          type: 'milestoneNode',
          position: { x, y },
          data: { 
            title: m.title, 
            description: m.description,
            duration: m.duration, 
            index: idx,
            isCompleted,
            isActive,
            xpReward: 300 + (idx * 50),
            difficulty: idx < 2 ? 'Beginner' : idx < 4 ? 'Intermediate' : 'Advanced'
          },
        };
      });

      const flowEdges: Edge[] = [];
      for (let i = 0; i < roadmap.milestones.length - 1; i++) {
        const sourceId = roadmap.milestones[i].id;
        const targetId = roadmap.milestones[i + 1].id;
        const isSourceCompleted = completedNodes.includes(sourceId);
        const isTargetActive = completedNodes.includes(sourceId) && !completedNodes.includes(targetId);

        flowEdges.push({
          id: `e-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: 'default',
          animated: isTargetActive || (isSourceCompleted && !completedNodes.includes(targetId)),
          style: { 
            stroke: isSourceCompleted ? '#10B981' : isTargetActive ? '#38BDF8' : '#1e293b', 
            strokeWidth: isTargetActive ? 3.5 : 2.5,
            filter: isTargetActive ? 'drop-shadow(0 0 8px #38BDF8)' : isSourceCompleted ? 'drop-shadow(0 0 5px #10B981)' : 'none'
          },
        });
      }

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [roadmap, completedNodes, layoutMode]);

  // Load note text when selectedNodeId changes
  useEffect(() => {
    if (selectedNodeId) {
      setActiveNoteText(notes[selectedNodeId] || '');
      setSaveSuccess(false);
      setAskNovaResponse('');
      setAskNovaInput('');
    }
  }, [selectedNodeId, notes]);

  // Save custom study note
  const handleSaveNote = () => {
    if (selectedNodeId) {
      saveNodeNote(selectedNodeId, activeNoteText);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // Submit search and generate roadmap
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    generateRoadmap(searchVal);
    setSearchVal('');
  };

  // ----------------------------------------------------
  // RENDER CONDITIONAL STATES
  // ----------------------------------------------------

  // 1. Premium loading screen
  if (isGenerating || (apiDone && generationProgress < 100)) {
    return (
      <div className="w-full h-screen fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center px-6 overflow-hidden select-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neonPurple/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neonBlue/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-950 border border-white/5 rounded-full opacity-40 pointer-events-none" />

        <NeuralNetworkCanvas />

        <div className="relative z-10 max-w-md w-full text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neonPurple to-neonBlue flex items-center justify-center shadow-xl shadow-neonPurple/20 animate-pulse-glow">
              <Brain className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-neonBlue font-bold block">
              Nova AI Engine
            </span>
            <h2 className="text-xl font-heading font-extrabold text-white">
              Synthesizing learning path...
            </h2>
            <p className="text-xs text-slate-500 font-mono italic">
              {loaderLogs[activeLogIdx]}
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 text-left space-y-2.5 bg-slate-900/10">
            <div className="flex items-center gap-2.5 text-xs">
              <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] ${generationProgress > 15 ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-slate-800 text-slate-500'}`}>
                {generationProgress > 15 ? "✓" : "1"}
              </span>
              <span className={generationProgress > 15 ? "text-slate-200" : "text-slate-600"}>Analyze global hiring trends</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] ${generationProgress > 35 ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-slate-800 text-slate-500'}`}>
                {generationProgress > 35 ? "✓" : "2"}
              </span>
              <span className={generationProgress > 35 ? "text-slate-200" : "text-slate-600"}>Resolve prerequisite stack</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] ${generationProgress > 55 ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-slate-800 text-slate-500'}`}>
                {generationProgress > 55 ? "✓" : "3"}
              </span>
              <span className={generationProgress > 55 ? "text-slate-200" : "text-slate-600"}>Generate laboratory code tasks</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] ${generationProgress > 75 ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-slate-800 text-slate-500'}`}>
                {generationProgress > 75 ? "✓" : "4"}
              </span>
              <span className={generationProgress > 75 ? "text-slate-200" : "text-slate-600"}>Structure resume-building pointers</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-neonPurple to-neonBlue transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>PROGRESS</span>
              <span>{generationProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty state second
  if (!roadmap) {
    return (
      <div className="w-full min-h-[85vh] flex flex-col items-center justify-center p-6 text-center select-none bg-[#050816]">
        {/* Unified Search box in center when empty */}
        <div className="relative z-10 max-w-md w-full space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto shadow-xl animate-pulse">
            <Compass className="w-8 h-8 text-neonPurple" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-white">PathWise Skill Web</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter any target career below. Nova AI will build an interactive concentric spider-web skill map of nodes to master.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input 
              type="text"
              placeholder="e.g. Software Engineer, Game Developer..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="flex-1 glass-input px-4 py-3 rounded-xl text-xs"
            />
            <button 
              type="submit"
              className="px-4 py-3 rounded-xl bg-neonPurple text-white font-heading font-bold text-xs uppercase tracking-wider hover:bg-neonPurple/90 transition-colors shadow-lg cursor-pointer"
            >
              Generate
            </button>
          </form>

          {/* Quick suggestions */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {quickSuggs.map((sug) => (
              <button
                key={sug}
                onClick={() => generateRoadmap(sug)}
                className="text-[9px] font-mono border border-slate-900 bg-slate-950/40 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedMilestone = roadmap.milestones.find(m => m.id === selectedNodeId);

  // Ask Nova assistant inside Node Panel
  const handleAskNova = async (queryText: string) => {
    if (!queryText.trim() || isAsking || !selectedMilestone) return;

    setIsAsking(true);
    setAskNovaResponse('');
    setAskNovaInput(queryText);

    try {
      const context = {
        career: roadmap.career,
        completedCount: completedNodes.length,
        totalCount: roadmap.milestones.length,
        xp: userProfile.xp,
        level: userProfile.level,
        resumeScore: 78,
        githubScore: 'B+'
      };

      const promptText = `Milestone: "${selectedMilestone.title}". Description: "${selectedMilestone.description}". Question: "${queryText}". Give a high-fidelity explanation, mini exercises, or code sample.`;
      
      await streamNovaAIResponse(
        promptText,
        context,
        '', 
        (token) => {
          setAskNovaResponse((prev) => prev + token);
        }
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="w-full h-screen relative flex select-none overflow-hidden pb-16 lg:pb-0">
      
      {/* CSS Micro-Animations Style Block */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes borderPulse {
          0% { border-color: #38BDF8; }
          50% { border-color: #7C3AED; }
          100% { border-color: #38BDF8; }
        }
        .animate-node-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-node-pulse {
          animation: borderPulse 3s ease-in-out infinite;
        }
        .interactive-grid {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      {/* LEFT SIDEBAR: EXPLORE & TARGET CAREER */}
      <AnimatePresence initial={false}>
        {isExploreOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-70 bg-slate-950 border-r border-white/5 h-full flex flex-col overflow-hidden text-slate-300"
          >
            {/* Logo details */}
            <div className="p-5 border-b border-white/5 bg-slate-900/10">
              <span className="text-[10px] text-neonPurple font-heading font-bold uppercase tracking-wider block mb-0.5">
                CAREERCRAFT MODE
              </span>
              <h2 className="text-sm font-heading font-extrabold text-white">Dream job skill map</h2>
            </div>

            {/* Input target */}
            <div className="p-4 space-y-4">
              <form onSubmit={handleSearchSubmit} className="space-y-1.5">
                <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">
                  Enter your dream job
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search Career target..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="w-full glass-input pl-9 pr-3 py-2 rounded-xl text-[11px]"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </form>

              {/* Active description card */}
              <div className="p-4 rounded-xl border border-white/5 bg-slate-900/20 space-y-2">
                <span className="text-[8px] font-mono text-neonBlue uppercase tracking-wider block">
                  Active Roadmap
                </span>
                <h4 className="text-xs font-bold text-white leading-tight">{roadmap.career}</h4>
                <p className="text-[10.5px] text-slate-400 leading-normal line-clamp-4">
                  {roadmap.description}
                </p>
              </div>

              {/* Quick choices list */}
              <div className="space-y-2 pt-2 border-t border-slate-900/60">
                <span className="text-[9px] text-slate-500 uppercase font-mono font-bold block">
                  Suggested Careers
                </span>
                <div className="space-y-1.5">
                  {quickSuggs.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => generateRoadmap(sug)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex justify-between items-center cursor-pointer ${
                        roadmap.career.toLowerCase().includes(sug.toLowerCase())
                          ? 'border-neonPurple bg-neonPurple/5 text-white font-bold'
                          : 'border-slate-900 hover:border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{sug}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTER WORKSPACE: REACT FLOW CANVAS */}
      <div className="flex-1 h-full relative overflow-hidden bg-[#050816]">
        
        {/* Dynamic Glowing Aurora lights */}
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-neonPurple/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-neonBlue/5 rounded-full blur-[90px] pointer-events-none" />

        {/* Explore Sidebar toggle handle */}
        <button
          onClick={() => setIsExploreOpen(!isExploreOpen)}
          className="absolute top-6 left-6 z-10 p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer shadow-lg"
          title={isExploreOpen ? "Collapse explore bar" : "Expand explore bar"}
        >
          {isExploreOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Layout mode switcher toggle button */}
        <div className="absolute top-6 left-20 z-10 glass-panel p-1 rounded-xl border border-white/5 flex gap-1 text-[10px] font-heading font-bold uppercase tracking-wider">
          <button
            onClick={() => setLayoutMode('spiderweb')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              layoutMode === 'spiderweb' 
                ? 'bg-neonPurple text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Network className="w-3.5 h-3.5 inline mr-1" /> Spider Web
          </button>
          <button
            onClick={() => setLayoutMode('timeline')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              layoutMode === 'timeline' 
                ? 'bg-neonBlue text-slate-950 shadow-md' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 inline mr-1" /> Timeline
          </button>
        </div>

        {/* Floating Gamification summary badge */}
        <div className="absolute top-6 right-6 z-10 glass-panel px-4 py-2 rounded-xl border border-white/5 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-mono text-slate-200 font-bold">{streak || 5} Day Streak</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-neonPurple" />
            <span className="font-mono text-slate-200 font-bold">Level {userProfile.level}</span>
          </div>
        </div>

        {/* Concentric grid rings behind canvas (only in spiderweb mode) */}
        {layoutMode === 'spiderweb' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] z-0">
            <div className="w-[310px] h-[310px] rounded-full border border-white" />
            <div className="w-[620px] h-[620px] rounded-full border border-white" />
            <div className="w-[930px] h-[930px] rounded-full border border-white" />
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={(_evt: any, node: any) => {
            if (node.id !== 'center-node') {
              setSelectedNodeId(node.id);
            }
          }}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          className="interactive-grid"
        >
          <Background color="#0f172a" gap={24} size={1} className="opacity-35" />
          <Controls showInteractive={false} className="!left-auto !right-6 !bottom-6" />
        </ReactFlow>
      </div>

      {/* RIGHT SIDEBAR: WORKSPACE DETAILS PANEL */}
      <AnimatePresence>
        {selectedNodeId && selectedMilestone && (
          <>
            {/* Drawer backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNodeId(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-20"
            />

            {/* Right sidebar slide panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[500px] bg-slate-950 border-l border-white/5 z-30 flex flex-col shadow-2xl overflow-hidden backdrop-blur-xl"
            >
              {/* Header controls */}
              <div className="p-5 border-b border-white/5 bg-slate-900/30 flex items-center justify-between">
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Close Panel
                </button>
                
                <button
                  onClick={() => toggleNodeCompletion(selectedMilestone.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    completedNodes.includes(selectedMilestone.id)
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  {completedNodes.includes(selectedMilestone.id) ? 'Completed ✓' : 'Mark Complete'}
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                
                {/* Milestone Info */}
                <div>
                  <span className="px-2 py-0.5 rounded bg-neonBlue/10 text-neonBlue text-[8.5px] font-mono border border-neonBlue/20 uppercase inline-block mb-1.5">
                    Syllabus Node
                  </span>
                  <h3 className="font-heading font-extrabold text-lg text-white mb-2">
                    {selectedMilestone.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedMilestone.description}
                  </p>
                </div>

                {/* Duration & XP details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl flex items-center gap-3">
                    <Clock className="w-4 h-4 text-neonBlue" />
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-mono">Time Frame</span>
                      <span className="text-xs font-bold text-white">{selectedMilestone.duration}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl flex items-center gap-3">
                    <Award className="w-4 h-4 text-neonPurple" />
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-mono">XP Reward</span>
                      <span className="text-xs font-bold text-white">+300 XP Points</span>
                    </div>
                  </div>
                </div>

                {/* Skills Web Nodes (Chips) */}
                <div>
                  <h4 className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-2.5 font-mono">Skills Web Nodes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMilestone.skills.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-lg border border-white/5 bg-slate-900/40 text-slate-300 text-xs font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Where to Learn (YouTube, Coursera, freeCodeCamp) */}
                <div>
                  <h4 className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-1.5 font-mono">
                    <BookOpen className="w-4 h-4 text-neonBlue" /> Where to Learn
                  </h4>
                  <div className="space-y-2.5">
                    {selectedMilestone.resources.map((res, i) => (
                      <div key={i} className="p-3.5 bg-slate-900/20 border border-white/5 rounded-xl flex justify-between items-center hover:border-slate-800 transition-colors">
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="text-[8.5px] font-mono text-neonBlue block mb-0.5">{res.platform} • {res.difficulty}</span>
                          <h5 className="text-xs font-bold text-slate-200 truncate">{res.title}</h5>
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* People & Examples (LinkedIn profiles, GitHub code) */}
                <div>
                  <h4 className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-1.5 font-mono">
                    <Share2 className="w-4 h-4 text-accentCyan" /> People & Examples
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    <a
                      href="https://www.linkedin.com/search/results/people/"
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 bg-slate-900/30 border border-white/5 rounded-xl hover:border-slate-800 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-slate-200">LinkedIn Skill Profiles</h5>
                        <span className="text-[9px] text-slate-500">Find real professionals with these skills</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </a>
                    <a
                      href="https://github.com/search"
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 bg-slate-900/30 border border-white/5 rounded-xl hover:border-slate-800 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-slate-200">GitHub Code Examples</h5>
                        <span className="text-[9px] text-slate-500">Search repositories demonstrating modules</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </a>
                  </div>
                </div>

                {/* Practical Laboratory Projects */}
                <div>
                  <h4 className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-1.5 font-mono">
                    <Terminal className="w-4 h-4 text-neonPurple" /> Laboratory Projects
                  </h4>
                  <div className="space-y-3.5">
                    {selectedMilestone.projects.map((proj, i) => (
                      <div key={i} className="p-4 bg-slate-900/20 border border-white/5 rounded-xl space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <h5 className="text-xs font-bold text-white">{proj.title}</h5>
                            <span className="text-[9px] font-mono text-accentCyan px-1.5 py-0.5 border border-accentCyan/30 bg-accentCyan/5 rounded">
                              {proj.difficulty}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{proj.description}</p>
                        </div>
                        <div className="border-t border-slate-900/60 pt-2 text-[10px] text-slate-500 space-y-1">
                          <p><strong className="text-slate-400">Resume Impact:</strong> {proj.resumeImpact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common Mistakes */}
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <h4 className="text-[9px] text-red-400 uppercase font-bold tracking-widest mb-2 flex items-center gap-1.5 font-mono">
                    <AlertTriangle className="w-4 h-4 text-red-500" /> Common Mistakes
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                    {selectedMilestone.commonMistakes.map((mistake, idx) => (
                      <li key={idx}>{mistake}</li>
                    ))}
                  </ul>
                </div>

                {/* Ask Nova AI Copilot inline */}
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <h4 className="text-[9px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-4 h-4 text-neonPurple" /> Ask Nova Copilot
                  </h4>

                  {/* Preset Shortcuts */}
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleAskNova("Explain the core concepts of this milestone in detail.")}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-900 bg-slate-900/25 hover:border-slate-800 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Explain Milestone
                    </button>
                    <button 
                      onClick={() => handleAskNova("Generate a quick 3-question quiz with multiple choice answers for this topic.")}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-900 bg-slate-900/25 hover:border-slate-800 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Create Quiz
                    </button>
                  </div>

                  {/* Streaming output text block */}
                  { (askNovaResponse || isAsking) && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-60 overflow-y-auto relative">
                      <div className="absolute top-2 right-2 text-[8px] text-slate-500 font-mono tracking-widest">
                        STREAM ACTIVE
                      </div>
                      {isAsking && !askNovaResponse ? (
                        <div className="flex items-center gap-1 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-neonPurple animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-neonPurple animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-neonPurple animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        askNovaResponse
                      )}
                    </div>
                  )}

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (askNovaInput.trim()) {
                        handleAskNova(askNovaInput);
                        setAskNovaInput('');
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input 
                      name="novaPrompt"
                      type="text"
                      placeholder="Ask Nova about this topic..."
                      value={askNovaInput}
                      onChange={(e) => setAskNovaInput(e.target.value)}
                      className="flex-1 glass-input px-3 py-2 rounded-xl text-xs"
                      disabled={isAsking}
                    />
                    <button 
                      type="submit"
                      disabled={isAsking}
                      className="p-2.5 rounded-xl bg-neonPurple text-white cursor-pointer hover:bg-neonPurple/90 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Study Notes */}
                <div className="space-y-2 border-t border-white/5 pt-6">
                  <h4 className="text-[9px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5 font-mono">
                    <Notebook className="w-4 h-4 text-neonBlue" /> Custom Notes
                  </h4>
                  <textarea
                    placeholder="Jot down learning summaries, commands, or references for this milestone..."
                    value={activeNoteText}
                    onChange={(e) => setActiveNoteText(e.target.value)}
                    rows={4}
                    className="w-full glass-input p-3 rounded-xl text-xs"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNote}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-neonBlue" /> {saveSuccess ? 'Saved!' : 'Save Notes'}
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Roadmap;
