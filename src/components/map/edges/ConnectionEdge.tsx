'use client';
import { useState } from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';

// Visual config per strength level
const strengthConfig = {
  1: {
    strokeWidth: 1.5,
    opacity: 0.35,
    dashArray: '6 4',          // dashed — weak connection
    label: 'Complementar',
    icon: '🔗',
    pulseAnimation: false,
  },
  2: {
    strokeWidth: 3,
    opacity: 0.6,
    dashArray: undefined,      // solid — medium connection
    label: 'Importante',
    icon: '📌',
    pulseAnimation: false,
  },
  3: {
    strokeWidth: 5,
    opacity: 0.9,
    dashArray: undefined,      // solid + animated — strong connection
    label: 'Essencial',
    icon: '⚡',
    pulseAnimation: true,
  },
} as const;

export function ConnectionEdge({
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);
  const strength = (data?.strength as 1 | 2 | 3) ?? 1;
  const config = strengthConfig[strength];
  const color = (data?.color as string) ?? '#6366f1';
  const description = (data?.description as string) ?? '';

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <>
      {/* Invisible wide hit area for hover detection */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />

      {/* Visible edge — animated glow background for strength 3 */}
      {config.pulseAnimation && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={config.strokeWidth + 4}
          opacity={0.15}
          style={{
            animation: 'edgePulse 2s ease-in-out infinite',
            filter: `blur(3px)`,
          }}
        />
      )}

      <BaseEdge
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: hovered ? config.strokeWidth * 1.5 : config.strokeWidth,
          opacity: hovered ? 1 : config.opacity,
          strokeDasharray: config.dashArray,
          transition: 'strokeWidth 0.2s ease, opacity 0.2s ease',
        }}
      />

      {/* Tooltip rendered in React Flow's label layer — avoids SVG clipping */}
      {hovered && (
        <EdgeLabelRenderer>
          <div
            className="absolute pointer-events-none z-50"
            style={{
              transform: `translate(-50%, -130%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            <div
              className="px-3 py-2 rounded-lg text-xs font-medium shadow-xl
                         bg-slate-900/95 border border-slate-700 text-slate-100
                         backdrop-blur-sm whitespace-nowrap flex flex-col gap-1"
            >
              <div className="flex items-center gap-1.5">
                <span>{config.icon}</span>
                <span style={{ color }} className="font-semibold">
                  {config.label}
                </span>
                <span className="text-slate-500">
                  {'●'.repeat(strength)}{'○'.repeat(3 - strength)}
                </span>
              </div>
              {description && (
                <p className="text-slate-400 max-w-[200px] leading-snug whitespace-normal">
                  {description}
                </p>
              )}
            </div>
            {/* Arrow pointer */}
            <div
              className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45 mx-auto -mt-1"
            />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
