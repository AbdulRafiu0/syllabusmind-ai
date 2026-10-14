'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import MicroLessonModal from './MicroLessonModal';
import type { RoadmapEdge, RoadmapNode } from '@/lib/types';

// Defined outside the component so the reference is stable between renders.
const nodeTypes = { custom: CustomNode };

interface LearningRoadmapProps {
  initialNodes: RoadmapNode[];
  initialEdges: RoadmapEdge[];
}

export default function LearningRoadmap({ initialNodes, initialEdges }: LearningRoadmapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<RoadmapNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RoadmapEdge>(initialEdges);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const activeNode = useMemo(
    () => nodes.find((node) => node.id === activeNodeId) ?? null,
    [nodes, activeNodeId],
  );

  const counts = useMemo(
    () => ({
      mastered: nodes.filter((n) => n.data.status === 'mastered').length,
      weak: nodes.filter((n) => n.data.status === 'weak').length,
      next: nodes.filter((n) => n.data.status === 'next').length,
    }),
    [nodes],
  );

  const handleNodeClick: NodeMouseHandler<RoadmapNode> = useCallback((_event, node) => {
    if (node.data.status === 'weak') setActiveNodeId(node.id);
  }, []);

  const handleLessonSuccess = useCallback(
    (nodeId: string) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId && node.data.status === 'weak'
            ? { ...node, data: { ...node.data, status: 'mastered' } }
            : node,
        ),
      );
      // The edge leading into a mastered node no longer needs to animate.
      setEdges((current) =>
        current.map((edge) => (edge.target === nodeId ? { ...edge, animated: false } : edge)),
      );
    },
    [setNodes, setEdges],
  );

  const handleClose = useCallback(() => setActiveNodeId(null), []);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        nodesConnectable={false}
        colorMode="dark"
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#334155" />
        <Controls showInteractive={false} />
        <Panel position="top-left">
          <div className="rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-300 shadow-lg backdrop-blur">
            <p className="mb-1 font-semibold text-slate-100">Your learning path</p>
            <ul className="space-y-0.5">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> {counts.mastered} mastered
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> {counts.weak} to review
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500" /> {counts.next} up next
              </li>
            </ul>
            {counts.weak > 0 && (
              <p className="mt-1.5 text-slate-400">Click a red node to start a micro-lesson.</p>
            )}
          </div>
        </Panel>
      </ReactFlow>

      <MicroLessonModal
        nodeData={activeNode?.data ?? null}
        isOpen={activeNode !== null && activeNode.data.status === 'weak'}
        onClose={handleClose}
        onSuccess={() => {
          if (activeNodeId) handleLessonSuccess(activeNodeId);
        }}
      />
    </div>
  );
}
