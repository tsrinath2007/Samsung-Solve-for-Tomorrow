import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Brain
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
      <Handle type="target" position={Position.Top} className="!bg-slate-850 !w-2.5 !h-2.5" />
      
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

      <Handle type="source" position={Position.Bottom} className="!bg-slate-850 !w-2.5 !h-2.5" />
    </div>
  );
};

const nodeTypes = {
  milestoneNode: CustomMilestoneNode,
};

// ----------------------------------------------------
// MAIN ROADMAP UPGRADED COMPONENT
// ----------------------------------------------------
export const Roadmap: React.FC = () => {
  const { 
    roadmap, 
    completedNodes, 
    isGenerating, 
    toggleNodeCompletion, 
    notes, 
    saveNodeNote,
    userProfile,
    streak
  } = useRoadmap();
  
  const navigate = useNavigate();
  
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

  // Simulation loading states for high-fidelity AI progress bar
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeLogIdx, setActiveLogIdx] = useState(0);
  const [apiDone, setApiDone] = useState(false);

  const loaderLogs = [
    "Studying hiring trends & requirements...",
    "Finding required programming languages...",
    "Selecting premium certifications...",
    "Generating portfolio laboratory prompts...",
    "Compiling mockup interview questions...",
    "Finalizing pathwise parameters..."
  ];

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
      // If V2 API returns, bump to 100% and close loading
      setApiDone(true);
      setGenerationProgress(100);
    }
  }, [isGenerating]);

  // Sync React Flow nodes and edges in a snake zig-zag layout
  useEffect(() => {
    if (!roadmap) return;

    const isMobile = window.innerWidth < 768;

    const flowNodes = roadmap.milestones.map((m, idx) => {
      const isCompleted = completedNodes.includes(m.id);
      const firstUncompleted = roadmap.milestones.find(mile => !completedNodes.includes(mile.id));
      const isActive = firstUncompleted ? firstUncompleted.id === m.id : idx === 0;

      // Zig-Zag snake positions
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
        type: 'default', // Bezier curved
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
  }, [roadmap, completedNodes]);

  // Load note text and reset Ask Nova panel when selectedNodeId changes
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

  // ----------------------------------------------------
  // RENDER CONDITIONAL STATES
  // ----------------------------------------------------

  // 1. Premium loading screen
  if (isGenerating || (apiDone && generationProgress < 100)) {
    return (
      <div className="w-full h-screen fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center px-6 overflow-hidden select-none">
        {/* Animated Aurora Blur Backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neonPurple/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neonBlue/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-950 border border-white/5 rounded-full opacity-40 pointer-events-none" />

        {/* Neural network animated background */}
        <NeuralNetworkCanvas />

        <div className="relative z-10 max-w-md w-full text-center space-y-8">
          {/* Breathing Orb Logo */}
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

          {/* Sequential Checkmarks */}
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

          {/* Progress Bar Container */}
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
      <div className="w-full min-h-[85vh] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl animate-pulse">
          <Compass className="w-8 h-8 text-neonPurple" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-white mb-2">No Active Pilot Roadmap</h2>
        <p className="max-w-md text-xs text-slate-500 mb-6 leading-relaxed">
          Unlock your personalized roadmap by exploring career titles. Once generated, your interactive pathwise nodes will compile here.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-3 rounded-xl bg-neonPurple text-white font-heading font-bold text-xs uppercase tracking-wider hover:bg-neonPurple/90 transition-colors shadow-lg shadow-neonPurple/25 cursor-pointer"
        >
          Explore Careers
        </button>
      </div>
    );
  }

  // At this point, typescript knows roadmap is not null
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
            linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      {/* Flow Canvas Area */}
      <div className="flex-1 h-full relative overflow-hidden bg-[#050816]">
        
        {/* Dynamic Glowing Aurora lights */}
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-neonPurple/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-neonBlue/5 rounded-full blur-[90px] pointer-events-none" />

        {/* Floating breadcrumb top header */}
        <div className="absolute top-6 left-6 z-10 glass-panel px-4 py-2.5 rounded-xl border border-white/5 max-w-sm flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono block">Active Pathway</span>
            <h2 className="text-xs font-heading font-extrabold text-white truncate">{roadmap.career}</h2>
          </div>
        </div>

        {/* Floating Gamification summary badge (Streak & Level) */}
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

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={(_evt: any, node: any) => setSelectedNodeId(node.id)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          className="interactive-grid"
        >
          <Background color="#0f172a" gap={24} size={1} className="opacity-45" />
          <Controls showInteractive={false} className="!left-auto !right-6 !bottom-6" />
        </ReactFlow>
      </div>

      {/* Side Details Drawer */}
      <AnimatePresence>
        {selectedNodeId && selectedMilestone && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNodeId(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-20"
            />

            {/* Slide drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[520px] bg-slate-950/95 border-l border-white/5 z-30 flex flex-col shadow-2xl overflow-hidden backdrop-blur-xl"
            >
              {/* Drawer Header */}
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

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                
                {/* Milestone Info */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-neonBlue/10 text-neonBlue text-[8.5px] font-mono border border-neonBlue/20 uppercase">
                      Core Concept
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Estimated: {selectedMilestone.duration}
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-white mb-2">
                    {selectedMilestone.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedMilestone.description}
                  </p>
                </div>

                {/* Duration & XP details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-neonBlue" />
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-mono">Time Frame</span>
                      <span className="text-xs font-bold text-white">{selectedMilestone.duration}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl flex items-center gap-3">
                    <Award className="w-5 h-5 text-neonPurple" />
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-mono">Telemetry reward</span>
                      <span className="text-xs font-bold text-white">+300 XP Points</span>
                    </div>
                  </div>
                </div>

                {/* Skills list */}
                <div>
                  <h4 className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-2.5 font-mono">Skills to Master</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMilestone.skills.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-lg border border-white/5 bg-slate-900/50 text-slate-300 text-xs font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Learning Resources */}
                <div>
                  <h4 className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-1.5 font-mono">
                    <BookOpen className="w-4 h-4 text-neonBlue" /> Recommended Resources
                  </h4>
                  <div className="space-y-3">
                    {selectedMilestone.resources.map((res, i) => (
                      <div key={i} className="p-3 bg-slate-900/30 border border-white/5 rounded-xl flex justify-between items-center hover:border-slate-800 transition-colors">
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="text-[9px] font-mono text-neonBlue block mb-0.5">{res.platform} • {res.difficulty}</span>
                          <h5 className="text-xs font-bold text-slate-200 truncate">{res.title}</h5>
                          <span className="text-[10px] text-slate-500 font-mono">{res.duration} • ⭐ {res.rating}</span>
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-white hover:bg-slate-800 transition-colors flex-shrink-0"
                        >
                          Launch
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Projects */}
                <div>
                  <h4 className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-1.5 font-mono">
                    <Terminal className="w-4 h-4 text-neonPurple" /> Laboratory Projects
                  </h4>
                  <div className="space-y-4">
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
                          {proj.deploymentTarget && <p><strong className="text-slate-400">Target Server:</strong> {proj.deploymentTarget}</p>}
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

                {/* ASK NOVA AI ASSISTANT INLINE DOCK */}
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <h4 className="text-[9px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-4 h-4 text-neonPurple" /> Ask Nova Copilot
                  </h4>

                  {/* Preset Assistant Shortcuts */}
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
                    <button 
                      onClick={() => handleAskNova("Suggest a simple mini project to practice this milestone.")}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-900 bg-slate-900/25 hover:border-slate-800 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Suggest Mini Project
                    </button>
                  </div>

                  {/* Nova Stream Window */}
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

                  {/* Custom Prompt Box */}
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

                {/* Custom Notes */}
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
