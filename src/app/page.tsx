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
