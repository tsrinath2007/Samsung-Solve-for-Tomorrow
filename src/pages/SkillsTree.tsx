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
import { Network, Sparkles, BookOpen, X } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

// ----------------------------------------------------
// CUSTOM NODE COMPONENT FOR SKILLS TREE
// ----------------------------------------------------
const SkillNodeComponent: React.FC<NodeProps> = (props) => {
  const data = props.data as any;
  const { isUnlocked, isCompleted, isBoss, isLegendary } = data;

  let borderClass = 'border-slate-800 bg-slate-950/70 text-slate-500 opacity-40';
  let glowClass = '';

  if (isCompleted) {
    if (isLegendary) {
      borderClass = 'border-amber-400 bg-slate-900/90 text-amber-300';
      glowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.3)] border-double';
    } else if (isBoss) {
      borderClass = 'border-orange-500 bg-slate-900/90 text-orange-400';
      glowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse-glow';
    } else {
      borderClass = 'border-emerald-500 bg-slate-950/90 text-emerald-400';
      glowClass = 'shadow-[0_0_10px_rgba(16,185,129,0.25)]';
    }
  } else if (isUnlocked) {
    borderClass = 'border-neonBlue bg-slate-900/80 text-white';
    glowClass = 'shadow-[0_0_12px_rgba(56,189,248,0.2)]';
  }

  return (
    <div className={`px-4 py-3 rounded-xl border backdrop-blur-md transition-all duration-300 w-44 text-center ${borderClass} ${glowClass}`}>
      <Handle type="target" position={Position.Left} className="!bg-slate-800" />
      <span className="text-[10px] font-heading font-semibold block truncate">{data.name}</span>
      {isBoss && <span className="text-[7px] text-orange-400 block uppercase font-mono tracking-widest mt-1">Boss Node</span>}
      {isLegendary && <span className="text-[7px] text-amber-300 block uppercase font-mono tracking-widest mt-1">Legendary</span>}
      <Handle type="source" position={Position.Right} className="!bg-slate-800" />
    </div>
  );
};

const nodeTypes = {
  skillNode: SkillNodeComponent,
};

// ----------------------------------------------------
// MAIN SKILLS TREE PAGE
// ----------------------------------------------------
export const SkillsTree: React.FC = () => {
  const { roadmap, completedNodes } = useRoadmap();
  const navigate = useNavigate();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  if (!roadmap) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Network className="w-16 h-16 text-slate-700 mb-4 animate-bounce" />
        <h2 className="font-heading font-bold text-xl text-white mb-2">No Skills Tree Active</h2>
        <p className="max-w-md text-xs text-slate-500 mb-6">
          Generate an AI career roadmap first to build your custom skills visual tree nodes.
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

  // Compile skills graph when roadmap updates
  useEffect(() => {
    const tempNodes: any[] = [];
    const tempEdges: Edge[] = [];

    let nodeIndex = 0;
    
    // Layout nodes horizontally tier-by-tier
    roadmap.milestones.forEach((m, mIdx) => {
      const isCompleted = completedNodes.includes(m.id);
      const isUnlocked = mIdx === 0 || completedNodes.includes(roadmap.milestones[mIdx - 1].id);
      const isBoss = mIdx === roadmap.milestones.length - 1;

      m.skills.forEach((skill, sIdx) => {
        const nodeId = `s-${m.id}-${sIdx}`;
        const isLegendary = sIdx === m.skills.length - 1 && mIdx > 1;

        // Position nodes in tiers
        tempNodes.push({
          id: nodeId,
          type: 'skillNode',
          position: { 
            x: mIdx * 250 + 50, 
            y: sIdx * 90 + 100 
          },
          data: {
            name: skill,
            isUnlocked,
            isCompleted,
            isBoss,
            isLegendary,
            milestoneTitle: m.title,
            description: `This node covers core elements of ${skill} required for professional operations in ${roadmap.career}.`
          }
        });

        // Add parent-child edge connections between skills of adjacent milestones
        if (mIdx > 0 && sIdx === 0) {
          // Connect first skill of tier to first skill of previous tier
          tempEdges.push({
            id: `edge-${mIdx}-${sIdx}`,
            source: `s-${roadmap.milestones[mIdx - 1].id}-0`,
            target: nodeId,
            animated: isUnlocked,
            style: { 
              stroke: isCompleted ? '#10B981' : isUnlocked ? '#38bdf8' : '#1e293b',
              strokeWidth: 2 
            }
          });
        }

        // Add local tree connections within the same tier
        if (sIdx > 0) {
          tempEdges.push({
            id: `edge-int-${mIdx}-${sIdx}`,
            source: `s-${m.id}-${sIdx - 1}`,
            target: nodeId,
            animated: isUnlocked && isCompleted,
            style: {
              stroke: isCompleted ? '#10B981' : '#1e293b',
              strokeWidth: 1.5
            }
          });
        }

        nodeIndex++;
      });
    });

    setNodes(tempNodes);
    setEdges(tempEdges);
  }, [roadmap, completedNodes]);

  return (
    <div className="w-full h-screen relative flex select-none overflow-hidden pb-16 lg:pb-0">
      
      {/* React Flow skills canvas */}
      <div className="flex-1 h-full relative">
        <div className="absolute top-6 left-6 z-10 glass-panel px-4 py-2.5 rounded-xl border border-slate-800 max-w-sm">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Interactive Tree</span>
          <h2 className="text-sm font-heading font-bold text-white truncate">{roadmap.career} Nodes</h2>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={(_evt, node) => setSelectedNode(node)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          className="bg-background interactive-grid animate-fade-in"
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls showInteractive={false} className="!left-auto !right-6 !bottom-6" />
        </ReactFlow>
      </div>

      {/* Detail drawer popup */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel-heavy p-6 rounded-2xl border border-white/5 relative"
            >
              <button 
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="text-[9px] uppercase tracking-wider text-neonBlue font-mono font-bold flex items-center gap-1 mb-2">
                <Sparkles className="w-3 h-3 text-neonPurple animate-spin-slow" /> Skill Telemetry Node
              </span>

              <h3 className="font-heading font-extrabold text-xl text-white mb-2">
                {selectedNode.data.name}
              </h3>
              <span className="text-[10px] text-slate-500 block mb-4">
                Module: {selectedNode.data.milestoneTitle}
              </span>

              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                {selectedNode.data.description}
              </p>

              <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[10px] text-slate-500">
                <span>Status: <strong className={selectedNode.data.isCompleted ? 'text-emerald-400 font-mono' : 'text-neonBlue font-mono'}>
                  {selectedNode.data.isCompleted ? 'Completed' : 'Unlocked & In Progress'}
                </strong></span>
                <button
                  onClick={() => {
                    setSelectedNode(null);
                    navigate('/roadmap');
                  }}
                  className="inline-flex items-center gap-1 text-neonBlue hover:text-neonPurple transition-colors font-bold uppercase tracking-wider cursor-pointer"
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
