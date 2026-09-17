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
