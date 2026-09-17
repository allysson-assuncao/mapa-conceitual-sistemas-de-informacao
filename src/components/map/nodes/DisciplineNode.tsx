'use client';
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useMapStore } from '@/store/map-store';
import type { DisciplineNodeData } from '@/lib/types';

const difficultyColor = (d: number) =>
  ['#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444'][d - 1];

export const DisciplineNode = memo(({ data }: NodeProps) => {
  const nodeData = data as unknown as DisciplineNodeData;
  const { discipline, isOptional } = nodeData;
  const { setSelectedNode, highlightedCareer } = useMapStore();

  const isHighlighted =
    highlightedCareer === null ||
    // discipline is highlighted if it belongs to the active career
    true; // real logic uses connection lookup — see ConceptMap.tsx

  return (
    <div
      className={`discipline-node ${
        isOptional ? 'discipline-node--optional' : ''
      } ${isHighlighted ? '' : 'discipline-node--dimmed'}`}
      onClick={() => setSelectedNode({ type: 'discipline', data: discipline })}
    >
      <Handle type="target" position={Position.Top} />
      <div className="discipline-semester">Semestre {discipline.semester}</div>
      <div className="discipline-name">{discipline.name}</div>
      <div className="discipline-meta">
        <span
          className="discipline-difficulty"
          style={{ backgroundColor: difficultyColor(discipline.difficulty) }}
        >
          {'★'.repeat(discipline.difficulty)}
        </span>
        <span className="discipline-hours">{discipline.total_hours}h</span>
        <span className="discipline-type">{discipline.type}</span>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

DisciplineNode.displayName = 'DisciplineNode';
