import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Discipline } from '@/lib/types';
import { Clock, Star, BookOpen, CheckCircle, Wrench, GitBranch } from 'lucide-react';

const typeLabel: Record<string, string> = {
  theoretical: 'Teórica',
  practical: 'Prática',
  mixed: 'Teórico-Prática',
};

export function DisciplineDetail({ discipline: d }: { discipline: Discipline }) {
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
    </div>
  );
}
