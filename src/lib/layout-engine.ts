import type { CareerArea, Discipline, Connection } from './types';
import type { Node } from '@xyflow/react';

const CANVAS_WIDTH = 3600;
const CAREER_Y = 80;
const DISCIPLINE_ROW_HEIGHT = 180;
const CAREER_SPACING = CANVAS_WIDTH / 9; // 8 careers + padding

export function computeLayout(
  careerAreas: CareerArea[],
  disciplines: Discipline[],
  connections: Connection[]
): Node[] {
  const nodes: Node[] = [];

  // Place career area nodes in a horizontal row at the top
  careerAreas.forEach((ca, i) => {
    nodes.push({
      id: ca.id,
      type: 'careerArea',
      position: { x: CAREER_SPACING * (i + 0.5) - 80, y: CAREER_Y },
      data: { careerArea: ca, isHighlighted: false },
    });
  });

  // Group disciplines by their primary career area (first connection found)
  const disciplineCareerMap = new Map<string, string>(); // disciplineId -> careerAreaId
  connections.forEach((conn) => {
    if (!disciplineCareerMap.has(conn.target)) {
      disciplineCareerMap.set(conn.target, conn.source);
    }
  });

  // Place discipline nodes below their primary career area
  const careerColumnCount = new Map<string, number>();
  disciplines.forEach((disc) => {
    const careerId = disciplineCareerMap.get(disc.id);
    const careerIndex = careerId
      ? careerAreas.findIndex((ca) => ca.id === careerId)
      : careerAreas.length - 1; // unclaimed disciplines go to last column

    const colCount = careerColumnCount.get(careerId ?? 'misc') ?? 0;
    careerColumnCount.set(careerId ?? 'misc', colCount + 1);

    const row = Math.floor(colCount / 2);
    const col = colCount % 2;
    const baseX = CAREER_SPACING * (careerIndex + 0.5) - 80;

    nodes.push({
      id: disc.id,
      type: 'discipline',
      position: {
        x: baseX + (col - 0.5) * 230,
        y: CAREER_Y + 200 + row * DISCIPLINE_ROW_HEIGHT,
      },
      data: { discipline: disc, isOptional: disc.nature === 'Optativa', isHighlighted: false },
    });
  });

  return nodes;
}
