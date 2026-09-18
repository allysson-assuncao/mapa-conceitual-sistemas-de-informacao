import type { CareerArea, Discipline, Connection } from './types';
import type { Node } from '@xyflow/react';

const CAREER_RADIUS = 2200; // Increased radius for the main circle of Career Areas
const ORBIT_RADIUS_BASE = 500; // Increased base radius for exclusive disciplines
const NODE_REPULSION_RADIUS = 280; // Distance needed between nodes to avoid overlap

export function computeLayout(
  careerAreas: CareerArea[],
  disciplines: Discipline[],
  connections: Connection[]
): Node[] {
  const nodes: Node[] = [];
  
  // 1. Distribute Career Areas in a large circle
  const numCareers = careerAreas.length;
  const careerPos = new Map<string, { x: number; y: number }>();
  
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
  const exclusive = new Map<string, Discipline[]>();
  careerAreas.forEach(ca => exclusive.set(ca.id, []));
  
  const sharedGroups = new Map<string, Discipline[]>();
  const orphans: Discipline[] = [];

  disciplines.forEach(disc => {
    const connected = discCareers.get(disc.id)!;
    if (connected.length === 0) {
      orphans.push(disc);
    } else if (connected.length === 1) {
      exclusive.get(connected[0])?.push(disc);
    } else {
      const key = connected.sort().join(',');
      if (!sharedGroups.has(key)) sharedGroups.set(key, []);
      sharedGroups.get(key)!.push(disc);
    }
  });

  // 4. Place Exclusive Disciplines (Orbit)
  exclusive.forEach((discs, careerId) => {
    const caPos = careerPos.get(careerId)!;
    const numDiscs = discs.length;
    
    discs.sort((a, b) => {
      if (a.nature !== b.nature) return a.nature === 'Obrigatória' ? -1 : 1;
      const semA = a.semester === 'Optativa' ? 99 : (a.semester ?? 99);
      const semB = b.semester === 'Optativa' ? 99 : (b.semester ?? 99);
      return semA - semB;
    });

    discs.forEach((disc, i) => {
      const ring = Math.floor(i / 10);
      const ringRadius = ORBIT_RADIUS_BASE + ring * 250;
      const countInRing = Math.min(10, numDiscs - ring * 10);
      
      const caAngle = Math.atan2(caPos.y, caPos.x);
      
      const arcSpread = Math.PI * 1.3;
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
  const sharedNodes: Node[] = [];
  
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

    // Distribute shared discs around their centroid initially
    const numDiscs = discs.length;
    discs.forEach((disc, i) => {
      const radius = numDiscs === 1 ? 0 : 120 + (Math.floor(i / 6) * 120);
      const angle = (i * 2 * Math.PI) / Math.min(numDiscs, 6);
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      sharedNodes.push({
        id: disc.id,
        type: 'discipline',
        position: { x, y },
        data: { discipline: disc, isOptional: disc.nature === 'Optativa', isHighlighted: false },
      });
    });
  });

  // 6. Relaxation pass to prevent overlapping of shared nodes
  // Many cross-career disciplines end up exactly at (0,0), so we simulate physics to push them apart.
  for (let step = 0; step < 50; step++) {
    for (let i = 0; i < sharedNodes.length; i++) {
      for (let j = i + 1; j < sharedNodes.length; j++) {
        const n1 = sharedNodes[i].position;
        const n2 = sharedNodes[j].position;
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // If nodes are too close or exactly overlapping
        if (dist < NODE_REPULSION_RADIUS) {
          // If perfectly overlapping, apply random jitter to separate them
          const jitterX = dist === 0 ? (Math.random() - 0.5) * 10 : 0;
          const jitterY = dist === 0 ? (Math.random() - 0.5) * 10 : 0;
          
          const effDist = dist === 0 ? 1 : dist;
          const overlap = NODE_REPULSION_RADIUS - effDist;
          const force = overlap / 2; 
          
          const fx = ((dx + jitterX) / effDist) * force;
          const fy = ((dy + jitterY) / effDist) * force;
          
          n1.x -= fx;
          n1.y -= fy;
          n2.x += fx;
          n2.y += fy;
        }
      }
    }
  }

  // Push the relaxed shared nodes into the main array
  nodes.push(...sharedNodes);

  // 7. Place Orphans (Center of the universe, just in case)
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
