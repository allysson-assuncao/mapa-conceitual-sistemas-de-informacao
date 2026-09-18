import type { CareerArea, Discipline, Connection } from './types';
import type { Node } from '@xyflow/react';

const CAREER_RADIUS = 1600; // Radius for the main circle of Career Areas
const ORBIT_RADIUS_BASE = 400; // Base radius for exclusive disciplines

export function computeLayout(
  careerAreas: CareerArea[],
  disciplines: Discipline[],
  connections: Connection[]
): Node[] {
  const nodes: Node[] = [];
  
  // 1. Distribute Career Areas in a large circle
  const numCareers = careerAreas.length;
  const careerPos = new Map<string, { x: number; y: number }>();
  
  // To make it visually pleasing, we put the first career at the top (-90 degrees)
  const angleOffset = -Math.PI / 2;

  careerAreas.forEach((ca, i) => {
    const angle = angleOffset + (i * 2 * Math.PI) / numCareers;
    const x = Math.cos(angle) * CAREER_RADIUS;
    const y = Math.sin(angle) * CAREER_RADIUS;
    careerPos.set(ca.id, { x, y });
    
    nodes.push({
      id: ca.id,
      type: 'careerArea',
      position: { x, y },
      data: { careerArea: ca, isHighlighted: false },
    });
  });

  // 2. Map disciplines to their connected careers
  const discCareers = new Map<string, string[]>();
  disciplines.forEach(d => discCareers.set(d.id, []));
  
  connections.forEach(conn => {
    if (discCareers.has(conn.target)) {
      const careers = discCareers.get(conn.target)!;
      if (!careers.includes(conn.source)) {
        careers.push(conn.source);
      }
    }
  });

  // 3. Group disciplines
  const exclusive = new Map<string, Discipline[]>(); // careerId -> Discipline[]
  careerAreas.forEach(ca => exclusive.set(ca.id, []));
  
  const sharedGroups = new Map<string, Discipline[]>(); // "career1,career2" -> Discipline[]
  const orphans: Discipline[] = [];

  disciplines.forEach(disc => {
    const connected = discCareers.get(disc.id)!;
    if (connected.length === 0) {
      orphans.push(disc);
    } else if (connected.length === 1) {
      exclusive.get(connected[0])?.push(disc);
    } else {
      // Sort to ensure consistent grouping key
      const key = connected.sort().join(',');
      if (!sharedGroups.has(key)) sharedGroups.set(key, []);
      sharedGroups.get(key)!.push(disc);
    }
  });

  // 4. Place Exclusive Disciplines (Orbit)
  exclusive.forEach((discs, careerId) => {
    const caPos = careerPos.get(careerId)!;
    const numDiscs = discs.length;
    
    // Sort disciplines so that they appear somewhat organized (e.g., by semester or nature)
    discs.sort((a, b) => {
      if (a.nature !== b.nature) return a.nature === 'Obrigatória' ? -1 : 1;
      const semA = a.semester === 'Optativa' ? 99 : (a.semester ?? 99);
      const semB = b.semester === 'Optativa' ? 99 : (b.semester ?? 99);
      return semA - semB;
    });

    discs.forEach((disc, i) => {
      const ring = Math.floor(i / 10); // 10 disciplines per orbital ring
      const ringRadius = ORBIT_RADIUS_BASE + ring * 250;
      const countInRing = Math.min(10, numDiscs - ring * 10);
      
      // Calculate career's absolute angle relative to origin to push the orbit OUTWARDS
      const caAngle = Math.atan2(caPos.y, caPos.x);
      
      // Spread the disciplines along an arc pointing outwards from the center
      // We don't want them completely surrounding the career area and falling inside the main circle
      const arcSpread = Math.PI * 1.2; // 1.2 PI spread
      const startAngle = caAngle - arcSpread / 2;
      const angleStep = countInRing > 1 ? arcSpread / (countInRing - 1) : 0;
      const angle = startAngle + i * angleStep;
      
      const x = caPos.x + Math.cos(angle) * ringRadius;
      const y = caPos.y + Math.sin(angle) * ringRadius;

      nodes.push({
        id: disc.id,
        type: 'discipline',
        position: { x, y },
        data: { discipline: disc, isOptional: disc.nature === 'Optativa', isHighlighted: false },
      });
    });
  });

  // 5. Place Shared Disciplines (Bridges)
  sharedGroups.forEach((discs, key) => {
    const careerIds = key.split(',');
    
    // Centroid of connected careers
    let cx = 0, cy = 0;
    careerIds.forEach(cId => {
      const p = careerPos.get(cId);
      if (p) {
        cx += p.x;
        cy += p.y;
      }
    });
    cx /= careerIds.length;
    cy /= careerIds.length;

    // To push central clusters apart slightly if they perfectly overlap (like cross-connections)
    // we can scale the centroid vector slightly.
    const centroidDist = Math.sqrt(cx * cx + cy * cy);
    if (centroidDist > 0) {
       // Push them slightly inwards or outwards based on number of connections?
       // Just leave them at centroid for now.
    }

    // Distribute shared discs around their centroid in a small circle to avoid overlapping
    const numDiscs = discs.length;
    discs.forEach((disc, i) => {
      // If just 1, place at center. If more, place in small orbit
      const radius = numDiscs === 1 ? 0 : 120 + (Math.floor(i / 6) * 120);
      const angle = (i * 2 * Math.PI) / Math.min(numDiscs, 6);
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      nodes.push({
        id: disc.id,
        type: 'discipline',
        position: { x, y },
        data: { discipline: disc, isOptional: disc.nature === 'Optativa', isHighlighted: false },
      });
    });
  });

  // 6. Place Orphans (Center of the universe, just in case)
  orphans.forEach((disc, i) => {
      const radius = 300;
      const angle = (i * 2 * Math.PI) / orphans.length;
      nodes.push({
        id: disc.id,
        type: 'discipline',
        position: { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius },
        data: { discipline: disc, isOptional: disc.nature === 'Optativa', isHighlighted: false },
      });
  });

  return nodes;
}
