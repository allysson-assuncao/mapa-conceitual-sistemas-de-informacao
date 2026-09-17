'use client';
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useMapStore } from '@/store/map-store';
import type { CareerAreaNodeData } from '@/lib/types';
import * as Icons from 'lucide-react';

export const CareerAreaNode = memo(({ data }: NodeProps) => {
  const nodeData = data as unknown as CareerAreaNodeData;
  const { careerArea } = nodeData;
  const { setSelectedNode, setHighlightedCareer } = useMapStore();
  const IconComponent = (Icons as any)[careerArea.icon] ?? Icons.Briefcase;

  const isHighlighted = (data as any).isHighlighted;
  const isDimmed = (data as any).isDimmed;

  return (
    <div
      className={`career-area-node ${isDimmed ? 'opacity-20 pointer-events-none' : ''} ${isHighlighted ? 'scale-105 z-10' : ''}`}
      style={{ 
        borderColor: careerArea.color, 
        boxShadow: isHighlighted ? `0 0 32px ${careerArea.color}88` : `0 0 24px ${careerArea.color}44`,
        transform: isHighlighted ? 'translateY(-4px) scale(1.05)' : undefined,
      }}
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
