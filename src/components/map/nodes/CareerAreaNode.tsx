'use client';
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useMapStore } from '@/store/map-store';
import type { CareerAreaNodeData } from '@/lib/types';
import * as Icons from 'lucide-react';

export const CareerAreaNode = memo(({ data }: NodeProps) => {
  const nodeData = data as CareerAreaNodeData;
  const { careerArea } = nodeData;
  const { setSelectedNode, setHighlightedCareer } = useMapStore();
  const IconComponent = (Icons as Record<string, React.ElementType>)[careerArea.icon] ?? Icons.Briefcase;

  return (
    <div
      className="career-area-node"
      style={{ borderColor: careerArea.color, boxShadow: `0 0 24px ${careerArea.color}44` }}
      onClick={() => {
        setSelectedNode({ type: 'career', data: careerArea });
        setHighlightedCareer(careerArea.id);
      }}
    >
      <div className="career-icon" style={{ backgroundColor: careerArea.color }}>
        <IconComponent size={24} color="white" />
      </div>
      <span className="career-label">{careerArea.name}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

CareerAreaNode.displayName = 'CareerAreaNode';
