import React, { useState, useEffect } from 'react';
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
  Compass
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

// ----------------------------------------------------
// CUSTOM NODE COMPONENT FOR REACT FLOW
// ----------------------------------------------------
const CustomMilestoneNode: React.FC<NodeProps> = (props) => {
  const data = props.data as any;
  const isCompleted = data.isCompleted;
  const isActive = data.isActive;

  let borderClass = 'border-slate-800 bg-slate-950/80 text-slate-400';
  let glowClass = '';

  if (isCompleted) {
    borderClass = 'border-emerald-500 bg-slate-950/90 text-emerald-400';
    glowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.25)]';
  } else if (isActive) {
    borderClass = 'border-neonBlue bg-slate-900/90 text-white';
    glowClass = 'shadow-[0_0_20px_rgba(56,189,248,0.3)] animate-pulse-glow';
  }

  return (
    <div className={`px-5 py-4 rounded-2xl border backdrop-blur-md transition-all duration-300 w-64 ${borderClass} ${glowClass}`}>
      <Handle type="target" position={Position.Top} className="!bg-slate-800" />
      
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono font-bold">
          Step {data.index + 1}
        </span>
        {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-400" />}
      </div>
      
      <h4 className="font-heading font-bold text-sm text-slate-200 truncate">
        {data.title}
      </h4>
      
      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500 font-mono">
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        <span>{data.duration}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-slate-800" />
    </div>
  );
};

const nodeTypes = {
  milestoneNode: CustomMilestoneNode,
};

// ----------------------------------------------------
// MAIN ROADMAP COMPONENT
// ----------------------------------------------------
export const Roadmap: React.FC = () => {
  const { roadmap, completedNodes, toggleNodeCompletion, notes, saveNodeNote } = useRoadmap();
  const navigate = useNavigate();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeNoteText, setActiveNoteText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  if (!roadmap) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Compass className="w-16 h-16 text-slate-700 mb-4 animate-spin-slow" />
        <h2 className="font-heading font-bold text-xl text-white mb-2">No Active Roadmap</h2>
        <p className="max-w-md text-xs text-slate-500 mb-6">
          Generate an AI-powered career roadmap first to populate your interactive pathway timeline visualization.
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

  const selectedMilestone = roadmap.milestones.find(m => m.id === selectedNodeId);

  // Sync React Flow nodes and edges when roadmap or completions change
  useEffect(() => {
    // Generate nodes vertically
    const flowNodes = roadmap.milestones.map((m, idx) => {
      const isCompleted = completedNodes.includes(m.id);
      // Determine active: first uncompleted node
      const firstUncompleted = roadmap.milestones.find(mile => !completedNodes.includes(mile.id));
      const isActive = firstUncompleted ? firstUncompleted.id === m.id : idx === 0;

      return {
        id: m.id,
        type: 'milestoneNode',
        position: { x: 100, y: idx * 180 + 30 },
        data: { 
          title: m.title, 
          duration: m.duration, 
          index: idx,
          isCompleted,
          isActive
        },
      };
    });

    // Generate edges connecting nodes sequentially
    const flowEdges: Edge[] = [];
    for (let i = 0; i < roadmap.milestones.length - 1; i++) {
      const sourceId = roadmap.milestones[i].id;
      const targetId = roadmap.milestones[i + 1].id;
      const isSourceCompleted = completedNodes.includes(sourceId);

      flowEdges.push({
        id: `e-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep',
        animated: isSourceCompleted, // Animate paths if source is complete
        style: { 
          stroke: isSourceCompleted ? '#10B981' : '#1e293b', 
          strokeWidth: 2.5 
        },
      });
    }

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [roadmap, completedNodes]);

  // Load note text when selected node changes
  useEffect(() => {
    if (selectedNodeId) {
      setActiveNoteText(notes[selectedNodeId] || '');
      setSaveSuccess(false);
    }
  }, [selectedNodeId, notes]);

  // Handle Note Save
  const handleSaveNote = () => {
    if (selectedNodeId) {
      saveNodeNote(selectedNodeId, activeNoteText);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  return (
    <div className="w-full h-screen relative flex select-none overflow-hidden pb-16 lg:pb-0">
      
      {/* Flow Canvas Area */}
      <div className="flex-1 h-full relative">
        {/* Floating breadcrumb top header */}
        <div className="absolute top-6 left-6 z-10 glass-panel px-4 py-2.5 rounded-xl border border-slate-800 max-w-sm">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Active Target</span>
          <h2 className="text-sm font-heading font-bold text-white truncate">{roadmap.career}</h2>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={(_evt: any, node: any) => setSelectedNodeId(node.id)}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          className="bg-background interactive-grid"
        >
          <Background color="#1e293b" gap={16} size={1} />
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
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNodeId(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20"
            />

            {/* Slide drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[500px] bg-slate-950 border-l border-slate-900 z-30 flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-900 bg-slate-900/40 flex items-center justify-between">
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
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
                  {completedNodes.includes(selectedMilestone.id) ? 'Completed' : 'Mark Complete'}
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Milestone Info */}
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-white mb-2">
                    {selectedMilestone.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedMilestone.description}
                  </p>
                </div>

                {/* Duration & XP details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-neonBlue" />
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono">Time Estimate</span>
                      <span className="text-xs font-bold text-white">{selectedMilestone.duration}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl flex items-center gap-3">
                    <Award className="w-5 h-5 text-neonPurple" />
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono">Completion XP</span>
                      <span className="text-xs font-bold text-white">250 XP Points</span>
                    </div>
                  </div>
                </div>

                {/* Skills list */}
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2.5">Skills to Master</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMilestone.skills.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-lg border border-slate-900 bg-slate-950 text-slate-300 text-xs font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Learning Resources */}
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3.5 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-neonBlue" /> Recommended Resources
                  </h4>
                  <div className="space-y-3">
                    {selectedMilestone.resources.map((res, i) => (
                      <div key={i} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl flex justify-between items-center hover:border-slate-800 transition-colors">
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
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3.5 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-neonPurple" /> Practical Projects
                  </h4>
                  <div className="space-y-4">
                    {selectedMilestone.projects.map((proj, i) => (
                      <div key={i} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-3">
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
                          {proj.deploymentTarget && <p><strong className="text-slate-400">Deploy to:</strong> {proj.deploymentTarget}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                {selectedMilestone.certifications && selectedMilestone.certifications.length > 0 && (
                  <div>
                    <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3.5 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-orange-500" /> Suggested Certifications
                    </h4>
                    <div className="space-y-3">
                      {selectedMilestone.certifications.map((cert, i) => (
                        <div key={i} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{cert.badge}</span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">{cert.name}</h5>
                              <span className="text-[9px] text-slate-500 block">{cert.provider} • {cert.cost}</span>
                            </div>
                          </div>
                          <a
                            href={cert.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white"
                          >
                            Details
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Mistakes */}
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <h4 className="text-[10px] text-red-400 uppercase font-bold tracking-widest mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-500" /> Common Mistakes
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400 leading-relaxed">
                    {selectedMilestone.commonMistakes.map((mistake, idx) => (
                      <li key={idx}>{mistake}</li>
                    ))}
                  </ul>
                </div>

                {/* Study Notes */}
                <div className="space-y-2 border-t border-slate-900 pt-6">
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
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
