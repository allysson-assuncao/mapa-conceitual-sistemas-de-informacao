# Interactive Conceptual Map — Information Systems (IFMG Ouro Branco)
## Implementation Plan

This document is the complete, agent-ready implementation guide for building and deploying an interactive conceptual map static web application. The audience is a high-school student exploring the Information Systems bachelor's degree at IFMG Ouro Branco. The map shows knowledge areas, their related disciplines (from the official PPC), career possibilities, and the strength of connections between them.

---

## Repository State

| Item | State |
|---|---|
| Repo | `allysson-assuncao/mapa-conceitual-sistemas-de-informacao` |
| Existing files | `.git/`, `disciplines.json`, `extract.py`, `README.md`, `LICENSE` |
| Next.js project | **Not initialized** — root directory is clean |

> [!IMPORTANT]
> The Next.js project must be initialized **in the existing repo root** (`./`). Do NOT create a subdirectory.

---

## Design Decisions (Confirmed)

| Decision | Choice |
|---|---|
| Framework | Next.js 15 (App Router, SSG output) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Graph library | `@xyflow/react` (React Flow v12) |
| Data layer | Static JSON files (no backend) |
| Layout | Career Area nodes centered/top, Discipline nodes clustered around them |
| Detail view | Slide-in right-side `Sheet` (shadcn/ui) |
| Connection strength | Edge stroke-width + color opacity |
| Optional disciplines | Included, visually distinguished (dashed border), filter toggle provided |
| Deployment | GitHub Pages via GitHub Actions |
| Base path | `/mapa-conceitual-sistemas-de-informacao` |

---

## Truncated Discipline Names — Manual Fix Required

> [!WARNING]
> The following disciplines in `disciplines.json` have **truncated names** (likely extracted PDF artifacts). You must fix them manually after reviewing the official PPC document.

| ID | Current Truncated Name | Likely Full Name |
|---|---|---|
| OBBGSIN.024 | `Arquitetura e Organização de` | `Arquitetura e Organização de Computadores` |
| OBBGSIN.078 | `Tópicos Avançados em Engenharia de` | `Tópicos Avançados em Engenharia de Software` |
| OBBGSIN.096 | `Tópicos Avançados em Inteligência` | `Tópicos Avançados em Inteligência Artificial` |
| OBBGSIN.097 | `Tópicos em Desenvolvimento de` | `Tópicos em Desenvolvimento de Jogos Digitais` |
| OBBGSIN.066 | `Tópicos Especiais em Sistemas de` | `Tópicos Especiais em Sistemas de Informação` |
| OBBGSIN.065 | `Tópicos Especiais em Desenvolvimento de Software` | *(already full — verify)* |

Fix these directly in the `disciplines.json` file before running the app.

---

## Part 1 — Core Architecture & Data Structures

### 1.1 Next.js SSG Architecture

```
/                            ← repo root (existing .git/)
├── public/
│   └── data/
│       ├── disciplines.json       ← enriched version of existing file
│       ├── career-areas.json      ← new: career area definitions
│       └── map-data.json          ← new: connections + layout hints
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx               ← main map page (SSG)
│   │   └── globals.css
│   ├── components/
│   │   ├── map/
│   │   │   ├── ConceptMap.tsx     ← React Flow canvas wrapper
│   │   │   ├── nodes/
│   │   │   │   ├── DisciplineNode.tsx
│   │   │   │   └── CareerAreaNode.tsx
│   │   │   ├── edges/
│   │   │   │   └── ConnectionEdge.tsx
│   │   │   └── MapControls.tsx    ← filter toggle + minimap controls
│   │   ├── panel/
│   │   │   ├── DetailPanel.tsx    ← shadcn Sheet wrapper
│   │   │   ├── DisciplineDetail.tsx
│   │   │   └── CareerAreaDetail.tsx
│   │   └── ui/                    ← shadcn components (auto-generated)
│   ├── lib/
│   │   ├── data.ts                ← data-loading utilities
│   │   ├── layout-engine.ts       ← deterministic x/y positioning
│   │   └── types.ts               ← all TypeScript interfaces
│   └── store/
│       └── map-store.ts           ← Zustand global state
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .github/
    └── workflows/
        └── deploy.yml
```

### 1.2 TypeScript Interfaces (`src/lib/types.ts`)

```typescript
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
```

---

## Part 2 — AI-Generated Seed Data

### 2.1 Career Areas (`public/data/career-areas.json`)

Paste this file verbatim. It defines 8 career paths derived from the IS curriculum.

```json
[
  {
    "id": "career-fullstack",
    "name": "Desenvolvedor Full-Stack",
    "description": "Desenvolve aplicações web completas, atuando tanto no front-end (interfaces de usuário) quanto no back-end (servidores, APIs e bancos de dados). É um dos perfis mais demandados pelo mercado.",
    "color": "#6366f1",
    "icon": "Code2",
    "marketDemand": "high",
    "salaryRange": "R$ 5.000 – R$ 18.000",
    "disciplineIds": ["OBBGSIN.085", "OBBGSIN.010", "OBBGSIN.022", "OBBGSIN.016", "OBBGSIN.023", "OBBGSIN.017", "OBBGSIN.041", "OBBGSIN.026", "OBBGSIN.039", "OBBGSIN.103"]
  },
  {
    "id": "career-data-scientist",
    "name": "Cientista de Dados / Analista de BI",
    "description": "Coleta, processa e analisa grandes volumes de dados para gerar insights estratégicos. Utiliza machine learning, estatística e visualização de dados para apoiar decisões.",
    "color": "#0ea5e9",
    "icon": "BarChart3",
    "marketDemand": "high",
    "salaryRange": "R$ 6.000 – R$ 20.000",
    "disciplineIds": ["OBBGSIN.085", "OBBGSIN.016", "OBBGSIN.031", "OBBGSIN.034", "OBBGSIN.021", "OBBGSIN.020", "OBBGSIN.033", "OBBGSIN.068", "OBBGSIN.036", "OBBGSIN.019"]
  },
  {
    "id": "career-infra",
    "name": "Engenheiro de Infraestrutura / DevOps",
    "description": "Gerencia servidores, redes, pipelines de CI/CD e infraestrutura em nuvem. Garante a disponibilidade, segurança e escalabilidade dos sistemas.",
    "color": "#10b981",
    "icon": "Server",
    "marketDemand": "high",
    "salaryRange": "R$ 5.500 – R$ 17.000",
    "disciplineIds": ["OBBGSIN.029", "OBBGSIN.037", "OBBGSIN.030", "OBBGSIN.024", "OBBGSIN.013", "OBBGSIN.041", "OBBGSIN.019", "OBBGSIN.066"]
  },
  {
    "id": "career-ai-engineer",
    "name": "Engenheiro de Inteligência Artificial",
    "description": "Projeta e implementa sistemas inteligentes, incluindo machine learning, redes neurais, processamento de linguagem natural e visão computacional.",
    "color": "#f59e0b",
    "icon": "Brain",
    "marketDemand": "high",
    "salaryRange": "R$ 8.000 – R$ 25.000",
    "disciplineIds": ["OBBGSIN.085", "OBBGSIN.009", "OBBGSIN.015", "OBBGSIN.034", "OBBGSIN.031", "OBBGSIN.021", "OBBGSIN.020", "OBBGSIN.038", "OBBGSIN.096", "OBBGSIN.068", "OBBGSIN.095"]
  },
  {
    "id": "career-it-manager",
    "name": "Gestor de TI / Analista de Sistemas",
    "description": "Planeja estrategicamente o uso de tecnologia nas organizações, gerencia equipes técnicas, define processos de governança e alinha TI aos objetivos de negócio.",
    "color": "#8b5cf6",
    "icon": "Briefcase",
    "marketDemand": "medium",
    "salaryRange": "R$ 5.000 – R$ 15.000",
    "disciplineIds": ["OBBGSIN.011", "OBBGSIN.019", "OBBGSIN.036", "OBBGSIN.040", "OBBGSIN.044", "OBBGSIN.018", "OBBGSIN.049", "OBBGSIN.102", "OBBGSIN.081", "OBBGSIN.059"]
  },
  {
    "id": "career-mobile",
    "name": "Desenvolvedor Mobile",
    "description": "Cria aplicativos para smartphones e tablets (Android e iOS) com interfaces ricas e integração com APIs e serviços em nuvem.",
    "color": "#ec4899",
    "icon": "Smartphone",
    "marketDemand": "high",
    "salaryRange": "R$ 4.500 – R$ 16.000",
    "disciplineIds": ["OBBGSIN.085", "OBBGSIN.010", "OBBGSIN.022", "OBBGSIN.039", "OBBGSIN.016", "OBBGSIN.023", "OBBGSIN.026", "OBBGSIN.017"]
  },
  {
    "id": "career-security",
    "name": "Especialista em Segurança da Informação",
    "description": "Protege sistemas, redes e dados contra ameaças cibernéticas. Realiza testes de penetração, auditorias e implementa políticas de segurança.",
    "color": "#ef4444",
    "icon": "Shield",
    "marketDemand": "high",
    "salaryRange": "R$ 6.000 – R$ 20.000",
    "disciplineIds": ["OBBGSIN.029", "OBBGSIN.037", "OBBGSIN.030", "OBBGSIN.044", "OBBGSIN.019", "OBBGSIN.013", "OBBGSIN.028", "OBBGSIN.066"]
  },
  {
    "id": "career-game-dev",
    "name": "Desenvolvedor de Jogos",
    "description": "Cria jogos digitais para PC, console e mobile, combinando programação, computação gráfica, inteligência artificial e design de interação.",
    "color": "#14b8a6",
    "icon": "Gamepad2",
    "marketDemand": "medium",
    "salaryRange": "R$ 3.500 – R$ 12.000",
    "disciplineIds": ["OBBGSIN.085", "OBBGSIN.010", "OBBGSIN.022", "OBBGSIN.070", "OBBGSIN.034", "OBBGSIN.021", "OBBGSIN.097", "OBBGSIN.095", "OBBGSIN.026"]
  }
]
```

### 2.2 Connections (`public/data/map-data.json`)

This file encodes the edge graph — which disciplines connect to which career area and at what strength (1=weak, 2=medium, 3=strong).

```json
{
  "version": "1.0.0",
  "connections": [
    { "id": "c001", "source": "career-fullstack", "target": "OBBGSIN.085", "strength": 3, "description": "Base de programação essencial" },
    { "id": "c002", "source": "career-fullstack", "target": "OBBGSIN.010", "strength": 3, "description": "POO é fundamental para desenvolvimento moderno" },
    { "id": "c003", "source": "career-fullstack", "target": "OBBGSIN.022", "strength": 3, "description": "Padrões de projeto e GUI avançada" },
    { "id": "c004", "source": "career-fullstack", "target": "OBBGSIN.016", "strength": 3, "description": "Todo sistema web precisa de banco de dados" },
    { "id": "c005", "source": "career-fullstack", "target": "OBBGSIN.023", "strength": 3, "description": "Disciplina central de desenvolvimento web" },
    { "id": "c006", "source": "career-fullstack", "target": "OBBGSIN.017", "strength": 2, "description": "Engenharia de Software I" },
    { "id": "c007", "source": "career-fullstack", "target": "OBBGSIN.041", "strength": 2, "description": "Engenharia de Software II (APIs REST, DevOps)" },
    { "id": "c008", "source": "career-fullstack", "target": "OBBGSIN.026", "strength": 2, "description": "UX/UI é essencial no front-end" },
    { "id": "c009", "source": "career-fullstack", "target": "OBBGSIN.039", "strength": 1, "description": "Apps mobile são parte do ecossistema full-stack" },
    { "id": "c010", "source": "career-fullstack", "target": "OBBGSIN.103", "strength": 2, "description": "Qualidade e testes de software" },

    { "id": "c011", "source": "career-data-scientist", "target": "OBBGSIN.085", "strength": 2, "description": "Python/programação base para scripts de dados" },
    { "id": "c012", "source": "career-data-scientist", "target": "OBBGSIN.016", "strength": 3, "description": "SQL e modelagem de dados são centrais" },
    { "id": "c013", "source": "career-data-scientist", "target": "OBBGSIN.031", "strength": 3, "description": "Estatística é a base da ciência de dados" },
    { "id": "c014", "source": "career-data-scientist", "target": "OBBGSIN.034", "strength": 3, "description": "Inteligência Artificial e Machine Learning" },
    { "id": "c015", "source": "career-data-scientist", "target": "OBBGSIN.021", "strength": 2, "description": "Álgebra Linear usada em ML" },
    { "id": "c016", "source": "career-data-scientist", "target": "OBBGSIN.020", "strength": 2, "description": "Matemática Discreta e teoria de grafos" },
    { "id": "c017", "source": "career-data-scientist", "target": "OBBGSIN.033", "strength": 2, "description": "Banco de Dados II (avançado)" },
    { "id": "c018", "source": "career-data-scientist", "target": "OBBGSIN.068", "strength": 3, "description": "Mineração de Dados é disciplina central" },
    { "id": "c019", "source": "career-data-scientist", "target": "OBBGSIN.036", "strength": 2, "description": "Sistemas de Apoio à Decisão" },
    { "id": "c020", "source": "career-data-scientist", "target": "OBBGSIN.019", "strength": 1, "description": "Governança e gestão da informação" },

    { "id": "c021", "source": "career-infra", "target": "OBBGSIN.029", "strength": 3, "description": "Redes de Computadores I é central" },
    { "id": "c022", "source": "career-infra", "target": "OBBGSIN.037", "strength": 3, "description": "Sistemas Distribuídos" },
    { "id": "c023", "source": "career-infra", "target": "OBBGSIN.030", "strength": 3, "description": "Sistemas Operacionais" },
    { "id": "c024", "source": "career-infra", "target": "OBBGSIN.024", "strength": 2, "description": "Arquitetura de Computadores" },
    { "id": "c025", "source": "career-infra", "target": "OBBGSIN.013", "strength": 1, "description": "Sistemas Digitais" },
    { "id": "c026", "source": "career-infra", "target": "OBBGSIN.041", "strength": 2, "description": "DevOps (ES II)" },
    { "id": "c027", "source": "career-infra", "target": "OBBGSIN.019", "strength": 2, "description": "Governança de TI" },
    { "id": "c028", "source": "career-infra", "target": "OBBGSIN.066", "strength": 2, "description": "Tópicos Especiais em Sistemas" },

    { "id": "c029", "source": "career-ai-engineer", "target": "OBBGSIN.085", "strength": 2, "description": "Programação base" },
    { "id": "c030", "source": "career-ai-engineer", "target": "OBBGSIN.009", "strength": 2, "description": "Estruturas de dados fundamentais" },
    { "id": "c031", "source": "career-ai-engineer", "target": "OBBGSIN.015", "strength": 2, "description": "Estruturas avançadas (árvores e grafos)" },
    { "id": "c032", "source": "career-ai-engineer", "target": "OBBGSIN.034", "strength": 3, "description": "Inteligência Artificial" },
    { "id": "c033", "source": "career-ai-engineer", "target": "OBBGSIN.031", "strength": 3, "description": "Probabilidade e Estatística" },
    { "id": "c034", "source": "career-ai-engineer", "target": "OBBGSIN.021", "strength": 3, "description": "Álgebra Linear" },
    { "id": "c035", "source": "career-ai-engineer", "target": "OBBGSIN.020", "strength": 2, "description": "Matemática Discreta" },
    { "id": "c036", "source": "career-ai-engineer", "target": "OBBGSIN.038", "strength": 2, "description": "Projeto e Análise de Algoritmos" },
    { "id": "c037", "source": "career-ai-engineer", "target": "OBBGSIN.096", "strength": 2, "description": "Tópicos Avançados em IA" },
    { "id": "c038", "source": "career-ai-engineer", "target": "OBBGSIN.068", "strength": 2, "description": "Mineração de Dados" },
    { "id": "c039", "source": "career-ai-engineer", "target": "OBBGSIN.095", "strength": 1, "description": "Processamento de Imagens (visão computacional)" },

    { "id": "c040", "source": "career-it-manager", "target": "OBBGSIN.011", "strength": 3, "description": "Princípios da Administração" },
    { "id": "c041", "source": "career-it-manager", "target": "OBBGSIN.019", "strength": 3, "description": "Governança e Gestão da Informação" },
    { "id": "c042", "source": "career-it-manager", "target": "OBBGSIN.036", "strength": 3, "description": "Sistemas de Apoio à Decisão" },
    { "id": "c043", "source": "career-it-manager", "target": "OBBGSIN.040", "strength": 3, "description": "Gestão de Projetos" },
    { "id": "c044", "source": "career-it-manager", "target": "OBBGSIN.044", "strength": 2, "description": "Ética e Legislação" },
    { "id": "c045", "source": "career-it-manager", "target": "OBBGSIN.018", "strength": 2, "description": "Contabilidade" },
    { "id": "c046", "source": "career-it-manager", "target": "OBBGSIN.049", "strength": 2, "description": "Gerência de Projetos de Software" },
    { "id": "c047", "source": "career-it-manager", "target": "OBBGSIN.102", "strength": 2, "description": "Empreendedorismo" },
    { "id": "c048", "source": "career-it-manager", "target": "OBBGSIN.081", "strength": 1, "description": "Consultoria Empresarial" },
    { "id": "c049", "source": "career-it-manager", "target": "OBBGSIN.059", "strength": 1, "description": "Gestão do Conhecimento" },

    { "id": "c050", "source": "career-mobile", "target": "OBBGSIN.085", "strength": 3, "description": "Programação base" },
    { "id": "c051", "source": "career-mobile", "target": "OBBGSIN.010", "strength": 3, "description": "POO I" },
    { "id": "c052", "source": "career-mobile", "target": "OBBGSIN.022", "strength": 3, "description": "POO II (GUI, threads, padrões)" },
    { "id": "c053", "source": "career-mobile", "target": "OBBGSIN.039", "strength": 3, "description": "Disciplina central de desenvolvimento mobile" },
    { "id": "c054", "source": "career-mobile", "target": "OBBGSIN.016", "strength": 2, "description": "Persistência de dados" },
    { "id": "c055", "source": "career-mobile", "target": "OBBGSIN.023", "strength": 2, "description": "Web como complemento mobile" },
    { "id": "c056", "source": "career-mobile", "target": "OBBGSIN.026", "strength": 2, "description": "UX para mobile" },
    { "id": "c057", "source": "career-mobile", "target": "OBBGSIN.017", "strength": 1, "description": "Boas práticas de engenharia de software" },

    { "id": "c058", "source": "career-security", "target": "OBBGSIN.029", "strength": 3, "description": "Redes de Computadores I" },
    { "id": "c059", "source": "career-security", "target": "OBBGSIN.037", "strength": 3, "description": "Segurança em Sistemas Distribuídos" },
    { "id": "c060", "source": "career-security", "target": "OBBGSIN.030", "strength": 3, "description": "Sistemas Operacionais (controle de acesso)" },
    { "id": "c061", "source": "career-security", "target": "OBBGSIN.044", "strength": 3, "description": "Ética, Legislação e LGPD" },
    { "id": "c062", "source": "career-security", "target": "OBBGSIN.019", "strength": 2, "description": "Governança de TIC" },
    { "id": "c063", "source": "career-security", "target": "OBBGSIN.013", "strength": 1, "description": "Sistemas Digitais" },
    { "id": "c064", "source": "career-security", "target": "OBBGSIN.028", "strength": 2, "description": "Linguagens Formais (criptografia/autômatos)" },
    { "id": "c065", "source": "career-security", "target": "OBBGSIN.066", "strength": 2, "description": "Tópicos em Infraestrutura e Segurança" },

    { "id": "c066", "source": "career-game-dev", "target": "OBBGSIN.085", "strength": 3, "description": "Programação base" },
    { "id": "c067", "source": "career-game-dev", "target": "OBBGSIN.010", "strength": 3, "description": "POO I" },
    { "id": "c068", "source": "career-game-dev", "target": "OBBGSIN.022", "strength": 2, "description": "POO II e padrões de projeto" },
    { "id": "c069", "source": "career-game-dev", "target": "OBBGSIN.070", "strength": 3, "description": "Computação Gráfica" },
    { "id": "c070", "source": "career-game-dev", "target": "OBBGSIN.034", "strength": 2, "description": "IA para comportamento de agentes em jogos" },
    { "id": "c071", "source": "career-game-dev", "target": "OBBGSIN.021", "strength": 2, "description": "Álgebra Linear para transformações 3D" },
    { "id": "c072", "source": "career-game-dev", "target": "OBBGSIN.097", "strength": 3, "description": "Tópicos em Desenvolvimento de Jogos" },
    { "id": "c073", "source": "career-game-dev", "target": "OBBGSIN.095", "strength": 2, "description": "Processamento de Imagens" },
    { "id": "c074", "source": "career-game-dev", "target": "OBBGSIN.026", "strength": 1, "description": "UX/Design de interação" }
  ]
}
```

### 2.3 Enriched Discipline Metadata (additions to `disciplines.json`)

Each discipline in `public/data/disciplines.json` should have the following extra fields added. The file should be a **copy** of the original `disciplines.json` placed in `public/data/` with these enrichment fields merged in. Below is a condensed representative sample for mandatory disciplines:

```json
[
  {
    "id": "OBBGSIN.085",
    "name": "Introdução à Programação",
    "type": "mixed",
    "difficulty": 2,
    "skills": ["Lógica de programação", "Depuração de código", "Pensamento algorítmico", "Abstração de problemas"],
    "tools": ["Python", "VisualG", "VS Code"],
    "activities": ["Desenvolvimento de algoritmos", "Implementação de programas em linguagem de alto nível", "Resolução de exercícios práticos"],
    "dependencies": [],
    "tags": ["programação", "algoritmos", "iniciante"]
  },
  {
    "id": "OBBGSIN.010",
    "name": "Programação Orientada a Objetos I",
    "type": "mixed",
    "difficulty": 3,
    "skills": ["Abstração", "Encapsulamento", "Herança", "Polimorfismo", "Modelagem OO"],
    "tools": ["Java", "IntelliJ IDEA", "UML"],
    "activities": ["Modelagem de classes", "Implementação de herança e polimorfismo", "Tratamento de exceções"],
    "dependencies": ["OBBGSIN.085"],
    "tags": ["oop", "java", "programação"]
  },
  {
    "id": "OBBGSIN.016",
    "name": "Banco de Dados I",
    "type": "mixed",
    "difficulty": 3,
    "skills": ["Modelagem relacional", "SQL", "Normalização", "Design de esquemas"],
    "tools": ["MySQL", "PostgreSQL", "MySQL Workbench", "brModelo"],
    "activities": ["Modelagem ER", "Consultas SQL complexas", "Normalização de tabelas", "Integração com linguagem de programação"],
    "dependencies": ["OBBGSIN.085"],
    "tags": ["banco de dados", "sql", "modelagem"]
  },
  {
    "id": "OBBGSIN.023",
    "name": "Programação Web",
    "type": "practical",
    "difficulty": 3,
    "skills": ["HTML/CSS", "JavaScript", "Desenvolvimento responsivo", "Requisições HTTP", "Arquitetura cliente-servidor"],
    "tools": ["VS Code", "Node.js", "PHP", "MySQL", "Git"],
    "activities": ["Criação de páginas web", "Desenvolvimento de APIs", "Manipulação do DOM", "Integração com banco de dados"],
    "dependencies": ["OBBGSIN.085", "OBBGSIN.010"],
    "tags": ["web", "front-end", "back-end", "javascript"]
  },
  {
    "id": "OBBGSIN.034",
    "name": "Inteligência Artificial",
    "type": "mixed",
    "difficulty": 4,
    "skills": ["Machine Learning", "Busca heurística", "Redes neurais", "Representação do conhecimento"],
    "tools": ["Python", "scikit-learn", "TensorFlow", "Jupyter Notebook"],
    "activities": ["Implementação de algoritmos de busca", "Treinamento de modelos ML", "Projetos com redes neurais"],
    "dependencies": ["OBBGSIN.085", "OBBGSIN.031", "OBBGSIN.021"],
    "tags": ["IA", "machine learning", "redes neurais"]
  }
]
```

> [!NOTE]
> The full enriched file must include **all 50+ disciplines**. The 5 entries above are representative samples. In practice, you should author enrichment for every discipline, or auto-generate it using an AI prompt referencing each discipline's `description` and `objectives` fields.

---

## Part 3 — Exact Execution Steps

### Step 0 — Prerequisite Check

```bash
node -v   # must be >= 20
npm -v    # must be >= 10
git log --oneline -3  # verify you're in the repo root
```

### Step 1 — Initialize Next.js Project

> [!IMPORTANT]
> Run this from inside `c:\Users\anybo\Documents\Projects\mapa-conceitual-sistemas-de-informacao`. The `./` target keeps all files in the existing repo.

```bash
npx create-next-app@latest ./ --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

Expected output: Next.js project scaffolded. The existing `disciplines.json`, `extract.py`, `README.md`, and `LICENSE` files are preserved.

### Step 2 — Install Dependencies

```bash
npm install @xyflow/react zustand lucide-react
npm install -D @types/node
```

### Step 3 — Initialize shadcn/ui

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

Then install the specific components needed:

```bash
npx shadcn@latest add sheet badge scroll-area separator tooltip
```

### Step 4 — Configure `next.config.ts`

Create/replace `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'mapa-conceitual-sistemas-de-informacao';

const nextConfig: NextConfig = {
  output: 'export',                    // SSG: generates /out directory
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  images: {
    unoptimized: true,                 // required for static export
  },
  trailingSlash: true,                 // needed for GitHub Pages routing
};

export default nextConfig;
```

### Step 5 — Set up Data Directory

```bash
mkdir -p public/data
```

Then copy and place:
1. `public/data/disciplines.json` — copy of original enriched with extra fields (see Part 2.3)
2. `public/data/career-areas.json` — paste from Part 2.1
3. `public/data/map-data.json` — paste from Part 2.2

### Step 6 — Create TypeScript Types (`src/lib/types.ts`)

Paste the full content from **Part 1.2** verbatim.

### Step 7 — Create Data Loading Utilities (`src/lib/data.ts`)

```typescript
import type { Discipline, CareerArea, MapData } from './types';

// These functions are called at build-time by the SSG page.
// They read from public/data/ using fetch during `next build`.

export async function getDisciplines(): Promise<Discipline[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/data/disciplines.json`,
    { cache: 'force-cache' }
  );
  return res.json();
}

export async function getCareerAreas(): Promise<CareerArea[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/data/career-areas.json`,
    { cache: 'force-cache' }
  );
  return res.json();
}

export async function getMapData(): Promise<MapData> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/data/map-data.json`,
    { cache: 'force-cache' }
  );
  return res.json();
}
```

> [!NOTE]
> For SSG with `output: 'export'`, fetch calls in `page.tsx` using `cache: 'force-cache'` are evaluated at build time. No runtime server is needed.

### Step 8 — Create Zustand Store (`src/store/map-store.ts`)

```typescript
import { create } from 'zustand';
import type { Discipline, CareerArea } from '@/lib/types';

type SelectedNode =
  | { type: 'discipline'; data: Discipline }
  | { type: 'career'; data: CareerArea }
  | null;

interface MapStore {
  selectedNode: SelectedNode;
  showOptional: boolean;
  highlightedCareer: string | null;    // careerArea.id
  setSelectedNode: (node: SelectedNode) => void;
  toggleShowOptional: () => void;
  setHighlightedCareer: (id: string | null) => void;
  clearSelection: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  selectedNode: null,
  showOptional: true,
  highlightedCareer: null,
  setSelectedNode: (node) => set({ selectedNode: node }),
  toggleShowOptional: () =>
    set((state) => ({ showOptional: !state.showOptional })),
  setHighlightedCareer: (id) => set({ highlightedCareer: id }),
  clearSelection: () => set({ selectedNode: null, highlightedCareer: null }),
}));
```

### Step 9 — Create Layout Engine (`src/lib/layout-engine.ts`)

This module computes static x/y positions for all nodes so the initial render is deterministic (required for SSG).

```typescript
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
```

### Step 10 — Create Custom Nodes

#### `src/components/map/nodes/CareerAreaNode.tsx`

```tsx
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
```

#### `src/components/map/nodes/DisciplineNode.tsx`

```tsx
'use client';
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useMapStore } from '@/store/map-store';
import type { DisciplineNodeData } from '@/lib/types';

const difficultyColor = (d: number) =>
  ['#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444'][d - 1];

export const DisciplineNode = memo(({ data }: NodeProps) => {
  const nodeData = data as DisciplineNodeData;
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
```

### Step 11 — Create Custom Edge (`src/components/map/edges/ConnectionEdge.tsx`)

```tsx
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
```

### Step 12 — Create Main Map Component (`src/components/map/ConceptMap.tsx`)

```tsx
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
```

### Step 13 — Create Detail Panel (`src/components/panel/DetailPanel.tsx`)

```tsx
'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMapStore } from '@/store/map-store';
import { DisciplineDetail } from './DisciplineDetail';
import { CareerAreaDetail } from './CareerAreaDetail';

export function DetailPanel() {
  const { selectedNode, clearSelection } = useMapStore();

  return (
    <Sheet open={selectedNode !== null} onOpenChange={() => clearSelection()}>
      <SheetContent
        side="right"
        className="w-full max-w-lg overflow-y-auto bg-slate-900 border-slate-700 text-slate-100"
      >
        <SheetHeader>
          <SheetTitle className="text-slate-100">
            {selectedNode?.type === 'discipline'
              ? selectedNode.data.name
              : selectedNode?.data.name ?? ''}
          </SheetTitle>
        </SheetHeader>

        {selectedNode?.type === 'discipline' && (
          <DisciplineDetail discipline={selectedNode.data} />
        )}
        {selectedNode?.type === 'career' && (
          <CareerAreaDetail careerArea={selectedNode.data} />
        )}
      </SheetContent>
    </Sheet>
  );
}
```

#### `src/components/panel/DisciplineDetail.tsx`

```tsx
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Discipline } from '@/lib/types';

const typeLabel: Record<string, string> = {
  theoretical: 'Teórica',
  practical: 'Prática',
  mixed: 'Teórico-Prática',
};

export function DisciplineDetail({ discipline: d }: { discipline: Discipline }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary">{typeLabel[d.type]}</Badge>
        <Badge variant="secondary">{d.total_hours}h totais</Badge>
        <Badge variant="secondary">Semestre {d.semester}</Badge>
        <Badge variant="outline" className="border-amber-400 text-amber-400">
          Dificuldade: {'★'.repeat(d.difficulty)}{'☆'.repeat(5 - d.difficulty)}
        </Badge>
      </div>

      <Separator className="bg-slate-700" />

      <section>
        <h3 className="font-semibold text-slate-300 mb-2">Descrição</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{d.description}</p>
      </section>

      {d.skills.length > 0 && (
        <section>
          <h3 className="font-semibold text-slate-300 mb-2">Competências Desenvolvidas</h3>
          <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
            {d.skills.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>
      )}

      {d.tools.length > 0 && (
        <section>
          <h3 className="font-semibold text-slate-300 mb-2">Ferramentas & Tecnologias</h3>
          <div className="flex flex-wrap gap-1">
            {d.tools.map((t) => (
              <Badge key={t} variant="outline" className="text-xs border-slate-500 text-slate-300">
                {t}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {d.activities.length > 0 && (
        <section>
          <h3 className="font-semibold text-slate-300 mb-2">Atividades Típicas</h3>
          <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
            {d.activities.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </section>
      )}

      {d.dependencies.length > 0 && (
        <section>
          <h3 className="font-semibold text-slate-300 mb-2">Pré-requisitos</h3>
          <div className="flex flex-wrap gap-1">
            {d.dependencies.map((dep) => (
              <Badge key={dep} className="text-xs bg-indigo-900 text-indigo-300">{dep}</Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

#### `src/components/panel/CareerAreaDetail.tsx`

```tsx
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { CareerArea } from '@/lib/types';

const demandLabel = { high: 'Alta', medium: 'Média', low: 'Baixa' };

export function CareerAreaDetail({ careerArea: ca }: { careerArea: CareerArea }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Badge style={{ backgroundColor: ca.color }}>Demanda: {demandLabel[ca.marketDemand]}</Badge>
        <Badge variant="secondary">{ca.salaryRange}</Badge>
      </div>

      <Separator className="bg-slate-700" />

      <section>
        <h3 className="font-semibold text-slate-300 mb-2">Sobre esta carreira</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{ca.description}</p>
      </section>
    </div>
  );
}
```

### Step 14 — Create Map Controls (`src/components/map/MapControls.tsx`)

```tsx
'use client';
import { useMapStore } from '@/store/map-store';

export function MapControls() {
  const { showOptional, toggleShowOptional } = useMapStore();

  return (
    <div className="absolute top-4 left-4 z-10 flex gap-2">
      <button
        onClick={toggleShowOptional}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
          showOptional
            ? 'bg-indigo-600 border-indigo-500 text-white'
            : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-indigo-500'
        }`}
      >
        {showOptional ? 'Ocultar Optativas' : 'Mostrar Optativas'}
      </button>
    </div>
  );
}
```

### Step 15 — Create Main Page (`src/app/page.tsx`)

```tsx
import { getDisciplines, getCareerAreas, getMapData } from '@/lib/data';
import { ConceptMap } from '@/components/map/ConceptMap';
import { DetailPanel } from '@/components/panel/DetailPanel';

export const dynamic = 'force-static';

export default async function HomePage() {
  const [disciplines, careerAreas, mapData] = await Promise.all([
    getDisciplines(),
    getCareerAreas(),
    getMapData(),
  ]);

  return (
    <main className="w-full h-screen bg-slate-950 overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="text-center pt-3">
          <h1 className="text-lg font-bold text-white drop-shadow">
            Mapa Conceitual — Sistemas de Informação · IFMG Ouro Branco
          </h1>
        </div>
      </header>
      <ConceptMap
        disciplines={disciplines}
        careerAreas={careerAreas}
        connections={mapData.connections}
      />
      <DetailPanel />
    </main>
  );
}
```

### Step 16 — Update Global CSS (`src/app/globals.css`)

Append these custom classes after the default Tailwind imports:

```css
@import 'tailwindcss';
@import '@xyflow/react/dist/style.css';

:root {
  --background: #020617;  /* slate-950 */
}

body {
  background-color: var(--background);
  color: #f1f5f9;
  font-family: 'Inter', system-ui, sans-serif;
}

/* Career Area Node */
.career-area-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  min-width: 160px;
  background: rgba(15, 23, 42, 0.92);
  border: 2px solid;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  backdrop-filter: blur(8px);
}
.career-area-node:hover {
  transform: translateY(-4px) scale(1.03);
}
.career-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.career-label {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: #e2e8f0;
  max-width: 140px;
}

/* Discipline Node */
.discipline-node {
  padding: 10px 14px;
  min-width: 180px;
  max-width: 210px;
  background: rgba(30, 41, 59, 0.9);
  border: 1.5px solid #334155;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  backdrop-filter: blur(4px);
}
.discipline-node:hover {
  border-color: #6366f1;
  box-shadow: 0 0 16px #6366f144;
  transform: scale(1.02);
}
.discipline-node--optional {
  border-style: dashed;
  border-color: #475569;
  opacity: 0.85;
}
.discipline-node--dimmed {
  opacity: 0.18;
  pointer-events: none;
}
.discipline-semester {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}
.discipline-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1.3;
  margin-bottom: 6px;
}
.discipline-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.discipline-difficulty {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 99px;
  color: white;
  letter-spacing: 1px;
}
.discipline-hours {
  font-size: 10px;
  color: #94a3b8;
}
.discipline-type {
  font-size: 10px;
  color: #64748b;
  text-transform: capitalize;
}

/* React Flow overrides */
.react-flow__background {
  background-color: #020617 !important;
}
.react-flow__controls {
  background: rgba(15, 23, 42, 0.9) !important;
  border: 1px solid #334155 !important;
  border-radius: 12px !important;
}
.react-flow__minimap {
  border-radius: 12px !important;
  border: 1px solid #334155 !important;
}
```

### Step 17 — Update `src/app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mapa Conceitual — Sistemas de Informação | IFMG Ouro Branco',
  description:
    'Explore o curso de Bacharelado em Sistemas de Informação do IFMG campus Ouro Branco: áreas de conhecimento, disciplinas, carreiras e conexões curriculares em um mapa interativo.',
  keywords: ['sistemas de informação', 'IFMG', 'mapa conceitual', 'currículo', 'carreiras TI'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

## Part 4 — Deployment Strategy

### 4.1 Environment Variable

Create `.env.production` in the repo root:

```bash
NEXT_PUBLIC_BASE_URL=https://allysson-assuncao.github.io/mapa-conceitual-sistemas-de-informacao
```

### 4.2 `.nojekyll` File

GitHub Pages uses Jekyll by default, which ignores `_next/` directories. Prevent this:

```bash
touch public/.nojekyll
```

### 4.3 GitHub Actions Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build (SSG)
        run: npm run build
        env:
          NODE_ENV: production
          NEXT_PUBLIC_BASE_URL: https://allysson-assuncao.github.io/mapa-conceitual-sistemas-de-informacao

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 4.4 GitHub Repository Settings

1. Go to **Settings → Pages** in the repository.
2. Under **Source**, select **GitHub Actions** (not `main` branch).
3. Save. The workflow will trigger automatically on the next push to `main`.

---

## Part 5 — Manual Testing Strategy

### 5.1 Local Development

```bash
npm run dev
# Open http://localhost:3000
```

Verify:
- [ ] Map renders with career area nodes in a top row
- [ ] Discipline nodes appear below career areas
- [ ] Edges are visible with varying thickness
- [ ] Clicking a career area node opens the right-side panel
- [ ] Clicking a discipline node opens the right-side panel with enriched metadata
- [ ] "Mostrar/Ocultar Optativas" toggle hides optional disciplines (dashed-border nodes)
- [ ] When a career area is clicked, non-related edges dim
- [ ] MiniMap is visible and reflects node positions
- [ ] Dragging nodes works correctly
- [ ] Scroll/pinch-to-zoom works on the canvas

### 5.2 Static Export Validation

```bash
npm run build
# Expected: "Export successful" in terminal
# Expected: ./out directory created with index.html + _next/ assets

# Serve locally to test the static export:
npx serve out
# Open http://localhost:3000/mapa-conceitual-sistemas-de-informacao
# OR:
npx http-server out -p 3000
```

Verify the static export:
- [ ] `./out/index.html` exists and is non-empty
- [ ] `./out/_next/` contains JS chunks
- [ ] `./out/data/` contains the three JSON files
- [ ] `./out/.nojekyll` exists
- [ ] Map loads correctly when served from `npx serve out`
- [ ] The basePath `/mapa-conceitual-sistemas-de-informacao` prefix is correct in asset URLs

### 5.3 UI Interaction Checklist (Pre-Push)

| Feature | Expected Behavior |
|---|---|
| Career area node click | Right panel opens showing career name, demand, salary, description |
| Discipline node click | Right panel opens with semester, hours, type, difficulty, skills, tools, activities, dependencies |
| Click empty canvas | Panel closes |
| Optional filter toggle | Dashed-border nodes disappear; edges connecting to them disappear |
| Career hover | Edges dim except those belonging to clicked career |
| Zoom in/out | Canvas zooms; nodes and edges scale correctly |
| Minimap | Reflects real-time node positions |
| Resize browser window | Layout remains usable; panel is scrollable |

---

## Open Questions

> [!IMPORTANT]
> Before beginning execution, confirm the following items:

1. **Discipline enrichment approach**: The plan says to author enrichment for all 50+ disciplines. Do you want to generate this automatically (via another AI prompt) before executing Step 5, or will you manually author/review it? This data must exist in `public/data/disciplines.json` before the build works.
2. **Discipline dependencies**: The `dependencies` field (prerequisite IDs) in the enriched data is currently empty or manually authored. Do you want a precise mapping from the PPC's formal prerequisites, or a best-effort approximation?
3. **Truncated names**: The 6 disciplines listed in the table above have truncated names from PDF extraction. These must be fixed **in `public/data/disciplines.json`** before the app runs correctly. Please cross-reference the PPC document.

