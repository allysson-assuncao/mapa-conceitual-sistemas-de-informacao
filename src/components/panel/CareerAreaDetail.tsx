import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { CareerArea } from '@/lib/types';
import { TrendingUp, Banknote, Briefcase } from 'lucide-react';

const demandLabel = { high: 'Alta', medium: 'Média', low: 'Baixa' };

export function CareerAreaDetail({ careerArea: ca }: { careerArea: CareerArea }) {
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
    </div>
  );
}
