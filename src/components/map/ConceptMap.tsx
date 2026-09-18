'use client';
import { useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  type Node, type Edge, useNodesState, useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CareerAreaNode } from '@/components/map/nodes/CareerAreaNode';
import { DisciplineNode } from '@/components/map/nodes/DisciplineNode';
import { ConnectionEdge } from '@/components/map/edges/ConnectionEdge';
import { MapControls } from '@/components/map/MapControls';
import { useMapStore } from '@/store/map-store';
import type { Discipline, CareerArea, Connection } from '@/lib/types';
import { computeLayout } from '@/lib/layout-engine';

const nodeTypes = {
  careerArea: CareerAreaNode,
  discipline: DisciplineNode,
};

const edgeTypes = { connection: ConnectionEdge };

interface Props {
  disciplines: Discipline[];
  careerAreas: CareerArea[];
  connections: Connection[];
}

export function ConceptMap({ disciplines, careerAreas, connections }: Props) {
  const initialized = useRef(false);
  if (!initialized.current) {
    useMapStore.setState({ disciplines, careerAreas, connections });
    initialized.current = true;
  }
  const { showOptional, highlightedCareer, hoveredNodeId, setHoveredNodeId, clearSelection } = useMapStore();

  const visibleDisciplines = useMemo(
    () => (showOptional ? disciplines : disciplines.filter((d) => d.nature === 'Obrigatória')),
    [disciplines, showOptional]
  );

  const initialNodes = useMemo(
    () => computeLayout(careerAreas, visibleDisciplines, connections),
    [careerAreas, visibleDisciplines, connections]
  );

  const computedEdges = useMemo<Edge[]>(() => {
    const visibleIds = new Set(visibleDisciplines.map((d) => d.id));
    return connections
      .filter((c) => visibleIds.has(c.target))
      .map((c) => {
        const career = careerAreas.find((ca) => ca.id === c.source);
        
        let isActive = true;
        let isHovered = false;

        if (hoveredNodeId) {
          isHovered = c.source === hoveredNodeId || c.target === hoveredNodeId;
          isActive = isHovered;
        } else if (highlightedCareer !== null) {
          isActive = highlightedCareer === c.source;
        }

        return {
          id: c.id,
          source: c.source,
          target: c.target,
          type: 'connection',
          data: { strength: c.strength, color: career?.color ?? '#6366f1', active: isActive, description: c.description },
          animated: c.strength === 3 || isHovered,
          style: { 
            opacity: isActive ? (hoveredNodeId ? 1 : 0.6) : 0.05,
            strokeWidth: isHovered ? 3 : 1
          },
          zIndex: isHovered ? 10 : 0
        };
      });
  }, [connections, visibleDisciplines, careerAreas, highlightedCareer, hoveredNodeId]);

  const computedNodes = useMemo<Node[]>(() => {
    const activeIds = new Set<string>();
    if (hoveredNodeId) {
      activeIds.add(hoveredNodeId);
      connections.forEach((c) => {
        if (c.source === hoveredNodeId) activeIds.add(c.target);
        if (c.target === hoveredNodeId) activeIds.add(c.source);
      });
    }

    return initialNodes.map((node) => {
      const isHighlighted = hoveredNodeId ? activeIds.has(node.id) : false;
      const isDimmed = hoveredNodeId ? !activeIds.has(node.id) : (highlightedCareer ? (node.type === 'careerArea' && node.id !== highlightedCareer) : false);
      return {
        ...node,
        data: {
          ...node.data,
          isHighlighted,
          isDimmed,
        },
      };
    });
  }, [initialNodes, connections, hoveredNodeId, highlightedCareer]);

  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(computedEdges);

  useEffect(() => {
    setNodes(computedNodes);
    setEdges(computedEdges);
  }, [computedNodes, computedEdges, setNodes, setEdges]);

  const layoutKey = showOptional ? 'with-optional' : 'required-only';

  return (
    <div className="w-full h-screen relative" key={layoutKey}>
      <MapControls />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.15}
        maxZoom={2}
        onPaneClick={clearSelection}
        onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        proOptions={{ hideAttribution: false }}
      >
        <Background gap={24} size={1} color="#ffffff08" />
        <Controls className="react-flow__controls--dark" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'careerArea') {
              const ca = careerAreas.find((c) => c.id === node.id);
              return ca?.color ?? '#6366f1';
            }
            return '#334155';
          }}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  );
}
