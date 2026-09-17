import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';

const strengthConfig = {
  1: { strokeWidth: 1.5, opacity: 0.3 },
  2: { strokeWidth: 3,   opacity: 0.55 },
  3: { strokeWidth: 5,   opacity: 0.85 },
};

export function ConnectionEdge({
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data,
}: EdgeProps) {
  const strength = (data?.strength as 1 | 2 | 3) ?? 1;
  const { strokeWidth, opacity } = strengthConfig[strength];

  const [edgePath] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <BaseEdge
      path={edgePath}
      style={{
        stroke: (data?.color as string) ?? '#6366f1',
        strokeWidth,
        opacity,
        transition: 'opacity 0.2s ease',
      }}
    />
  );
}
