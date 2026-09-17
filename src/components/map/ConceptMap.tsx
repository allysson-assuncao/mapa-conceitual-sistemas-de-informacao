'use client';
import { useCallback, useMemo } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  type Node, type Edge, useNodesState, useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CareerAreaNode } from './nodes/CareerAreaNode';
import { DisciplineNode } from './nodes/DisciplineNode';
import { ConnectionEdge } from './edges/ConnectionEdge';
import { MapControls } from './MapControls';
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
  const { showOptional, highlightedCareer, clearSelection } = useMapStore();

  const visibleDisciplines = useMemo(
    () => (showOptional ? disciplines : disciplines.filter((d) => d.nature === 'Obrigatória')),
    [disciplines, showOptional]
  );

  const initialNodes = useMemo(
    () => computeLayout(careerAreas, visibleDisciplines, connections),
    [careerAreas, visibleDisciplines, connections]
  );

  const initialEdges = useMemo<Edge[]>(() => {
    const visibleIds = new Set(visibleDisciplines.map((d) => d.id));
    return connections
      .filter((c) => visibleIds.has(c.target))
      .map((c) => {
        const career = careerAreas.find((ca) => ca.id === c.source);
        const isActive = highlightedCareer === null || highlightedCareer === c.source;
        return {
          id: c.id,
          source: c.source,
          target: c.target,
          type: 'connection',
          data: { strength: c.strength, color: career?.color ?? '#6366f1', active: isActive },
          animated: c.strength === 3,
          style: { opacity: isActive ? 1 : 0.08 },
        };
      });
  }, [connections, visibleDisciplines, careerAreas, highlightedCareer]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-screen relative">
      <MapControls />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.15}
        maxZoom={2}
        onPaneClick={clearSelection}
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
