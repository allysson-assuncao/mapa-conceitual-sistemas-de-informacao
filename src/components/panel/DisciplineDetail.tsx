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
