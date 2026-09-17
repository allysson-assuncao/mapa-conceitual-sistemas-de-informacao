// ─── Discipline ──────────────────────────────────────────────────────────────
export type DisciplineType = 'theoretical' | 'practical' | 'mixed';
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export type DisciplineNature = 'Obrigatória' | 'Optativa';

export interface Discipline {
  id: string;                      // e.g. "OBBGSIN.085"
  name: string;                    // display name
  description: string;             // from PPC
  objectives: string;              // from PPC
  semester: number | 'Optativa';   // 1–8 or 'Optativa'
  total_hours: number;
  theory_hours: number;
  practice_hours: number;
  nature: DisciplineNature;
  // Enriched fields (authored in public/data/disciplines.json)
  type: DisciplineType;            // theoretical / practical / mixed
  difficulty: DifficultyLevel;     // 1 (easy) → 5 (very hard)
  skills: string[];                // key competencies developed
  tools: string[];                 // software/tools used
  activities: string[];            // typical activities in this discipline
  dependencies: string[];          // IDs of prerequisite disciplines
  tags: string[];                  // free-form tags for search/filter
}

// ─── Career Area ──────────────────────────────────────────────────────────────
export interface CareerArea {
  id: string;                      // e.g. "career-fullstack"
  name: string;                    // e.g. "Desenvolvedor Full-Stack"
  description: string;             // what this career does
  color: string;                   // Tailwind-compatible hex or HSL
  icon: string;                    // lucide-react icon name
  marketDemand: 'high' | 'medium' | 'low';
  salaryRange: string;             // e.g. "R$ 4.000 – R$ 15.000"
  disciplineIds: string[];         // all related discipline IDs
}

// ─── Connection ───────────────────────────────────────────────────────────────
export type ConnectionStrength = 1 | 2 | 3;  // 1=weak, 2=medium, 3=strong

export interface Connection {
  id: string;
  source: string;   // careerArea.id or discipline.id
  target: string;   // discipline.id or careerArea.id
  strength: ConnectionStrength;
  description: string;  // why this connection exists
}

// ─── Map Data ─────────────────────────────────────────────────────────────────
export interface MapData {
  careerAreas: CareerArea[];
  connections: Connection[];
  version: string;
}

// ─── React Flow Node Data ─────────────────────────────────────────────────────
export interface DisciplineNodeData {
  discipline: Discipline;
  isOptional: boolean;
  isHighlighted: boolean;
}

export interface CareerAreaNodeData {
  careerArea: CareerArea;
  isHighlighted: boolean;
}
