import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { CareerArea } from '@/lib/types';
import { useMemo } from 'react';
import { useMapStore } from '@/store/map-store';
import { TrendingUp, Banknote, Briefcase } from 'lucide-react';

const demandLabel = { high: 'Alta', medium: 'Média', low: 'Baixa' };

export function CareerAreaDetail({ careerArea: ca }: { careerArea: CareerArea }) {
  const { connections, disciplines, setSelectedNode } = useMapStore();

  const connectedDisciplines = useMemo(() =>
    connections
      .filter((c) => c.source === ca.id)
      .map((c) => ({
        discipline: disciplines.find((d) => d.id === c.target)!,
        strength: c.strength,
      }))
      .filter((item) => item.discipline !== undefined),
    [connections, ca.id, disciplines]
  );

  const strengthGroups = [
    { label: 'Essenciais',   icon: '⚡', items: connectedDisciplines.filter(x => x.strength === 3).map(x => x.discipline) },
    { label: 'Importantes',  icon: '📌', items: connectedDisciplines.filter(x => x.strength === 2).map(x => x.discipline) },
    { label: 'Complementares', icon: '🔗', items: connectedDisciplines.filter(x => x.strength === 1).map(x => x.discipline) },
  ];

  return (
    <div className="mt-6 space-y-6">
      <div className="flex gap-2 flex-wrap">
        <Badge style={{ backgroundColor: ca.color, borderColor: ca.color }} className="text-white border bg-opacity-90 hover:bg-opacity-100 shadow-sm">
          <Briefcase className="w-3 h-3 mr-1.5" />
          Área de Atuação
        </Badge>
        <Badge variant="secondary" className="bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/50">
          <TrendingUp className="w-3 h-3 mr-1.5" />
          Demanda: {demandLabel[ca.marketDemand]}
        </Badge>
        <Badge variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">
          <Banknote className="w-3 h-3 mr-1.5 text-emerald-400" />
          {ca.salaryRange}
        </Badge>
      </div>

      <Separator className="bg-slate-700/50" />

      <section>
        <h3 className="font-semibold text-slate-200 text-lg mb-3">Sobre esta carreira</h3>
        <p className="text-base text-slate-400/90 leading-relaxed font-medium">{ca.description}</p>
      </section>

      {strengthGroups.map(({ label, icon, items }) =>
        items.length > 0 && (
          <section key={label}>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1">
              {icon} {label}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {items.map((discipline) => (
                <button
                  key={discipline.id}
                  onClick={() => setSelectedNode({ type: 'discipline', data: discipline })}
                  className="px-2 py-0.5 rounded text-xs text-slate-300
                             bg-slate-800 hover:bg-slate-700 border border-slate-700
                             hover:border-slate-500 transition-all"
                >
                  {discipline.name}
                </button>
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}
