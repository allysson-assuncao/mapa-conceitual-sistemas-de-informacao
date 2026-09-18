import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Discipline } from '@/lib/types';
import { useMemo } from 'react';
import { useMapStore } from '@/store/map-store';
import { Clock, Star, BookOpen, CheckCircle, Wrench, GitBranch, Briefcase } from 'lucide-react';

const typeLabel: Record<string, string> = {
  theoretical: 'Teórica',
  practical: 'Prática',
  mixed: 'Teórico-Prática',
};

export function DisciplineDetail({ discipline: d }: { discipline: Discipline }) {
  const { connections, careerAreas, setSelectedNode } = useMapStore();

  const connectedCareers = useMemo(() =>
    connections
      .filter((c) => c.target === d.id)
      .map((c) => ({
        career: careerAreas.find((ca) => ca.id === c.source)!,
        strength: c.strength,
      }))
      .filter((item) => item.career !== undefined)
      .sort((a, b) => b.strength - a.strength),
    [connections, d.id, careerAreas]
  );

  return (
    <div className="mt-6 space-y-6">
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-slate-200">
          <BookOpen className="w-3 h-3 mr-1" />
          {typeLabel[d.type]}
        </Badge>
        <Badge variant="secondary" className="bg-indigo-900/50 hover:bg-indigo-900/70 text-indigo-200 border border-indigo-800">
          <Clock className="w-3 h-3 mr-1" />
          {d.total_hours}h totais
        </Badge>
        <Badge variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-slate-200">
          Semestre {d.semester}
        </Badge>
        <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10">
          <Star className="w-3 h-3 mr-1 fill-amber-400" />
          Dificuldade: {d.difficulty}/5
        </Badge>
      </div>

      <Separator className="bg-slate-700/50" />

      <section>
        <h3 className="font-semibold text-slate-200 text-lg mb-2">Descrição</h3>
        <p className="text-sm text-slate-400/90 leading-relaxed font-medium">{d.description}</p>
      </section>

      {d.skills.length > 0 && (
        <section>
          <h3 className="font-semibold text-slate-200 text-md mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Competências Desenvolvidas
          </h3>
          <ul className="text-sm text-slate-400/90 space-y-2">
            {d.skills.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-1.5 shrink-0" />
                <span className="leading-snug">{s}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.tools.length > 0 && (
        <section>
          <h3 className="font-semibold text-slate-200 text-md mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sky-400" />
            Ferramentas & Tecnologias
          </h3>
          <div className="flex flex-wrap gap-2">
            {d.tools.map((t) => (
              <Badge key={t} variant="outline" className="text-xs border-sky-800/60 bg-sky-900/20 text-sky-300">
                {t}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {d.activities.length > 0 && (
        <section>
          <h3 className="font-semibold text-slate-200 text-md mb-2">Atividades Típicas</h3>
          <ul className="text-sm text-slate-400/90 list-disc list-outside ml-4 space-y-1">
            {d.activities.map((a) => <li key={a} className="pl-1">{a}</li>)}
          </ul>
        </section>
      )}

      {d.dependencies.length > 0 && (
        <section>
          <h3 className="font-semibold text-slate-200 text-md mb-3 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-indigo-400" />
            Pré-requisitos
          </h3>
          <div className="flex flex-wrap gap-2">
            {d.dependencies.map((dep) => (
              <Badge key={dep} className="text-xs bg-indigo-900/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/50">
                {dep}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {connectedCareers.length > 0 && (
        <section>
          <h3 className="font-semibold text-slate-200 text-md mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-violet-400" />
            Áreas de Carreira Relacionadas
          </h3>
          <div className="flex flex-wrap gap-2">
            {connectedCareers.map(({ career, strength }) => (
              <button
                key={career.id}
                onClick={() => setSelectedNode({ type: 'career', data: career })}
                className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                           border transition-all hover:scale-105"
                style={{
                  borderColor: career.color + '60',
                  backgroundColor: career.color + '18',
                  color: career.color,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: career.color }}
                  title={`Força ${strength}`}
                />
                {career.name}
                <span className="opacity-50 text-[10px]">
                  {'●'.repeat(strength)}{'○'.repeat(3 - strength)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
