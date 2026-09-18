import { create } from 'zustand';
import type { Discipline, CareerArea, Connection } from '@/lib/types';

type SelectedNode =
  | { type: 'discipline'; data: Discipline }
  | { type: 'career'; data: CareerArea }
  | null;

interface MapStore {
  disciplines: Discipline[];
  careerAreas: CareerArea[];
  connections: Connection[];
  selectedNode: SelectedNode;
  showOptional: boolean;
  highlightedCareer: string | null;    // careerArea.id
  hoveredNodeId: string | null;
  setSelectedNode: (node: SelectedNode) => void;
  toggleShowOptional: () => void;
  setHighlightedCareer: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
  clearSelection: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  disciplines: [],
  careerAreas: [],
  connections: [],
  selectedNode: null,
  showOptional: true,
  highlightedCareer: null,
  hoveredNodeId: null,
  setSelectedNode: (node) => set({ selectedNode: node }),
  toggleShowOptional: () =>
    set((state) => ({ showOptional: !state.showOptional })),
  setHighlightedCareer: (id) => set({ highlightedCareer: id }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  clearSelection: () => set({ selectedNode: null, highlightedCareer: null }),
}));
