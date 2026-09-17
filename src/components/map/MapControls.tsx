'use client';
import { useMapStore } from '@/store/map-store';
import { ThemeToggle } from '@/components/ThemeToggle';

export function MapControls() {
  const { showOptional, toggleShowOptional } = useMapStore();

  return (
    <div className="absolute top-4 left-4 z-10 flex gap-2">
      <button
        onClick={toggleShowOptional}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
          showOptional
            ? 'bg-primary border-primary text-primary-foreground'
            : 'bg-background border-border text-foreground hover:border-primary'
        }`}
      >
        {showOptional ? 'Ocultar Optativas' : 'Mostrar Optativas'}
      </button>
      <ThemeToggle />
    </div>
  );
}
