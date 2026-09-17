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
