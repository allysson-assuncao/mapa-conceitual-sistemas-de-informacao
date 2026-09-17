import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { CareerArea } from '@/lib/types';

const demandLabel = { high: 'Alta', medium: 'Média', low: 'Baixa' };

export function CareerAreaDetail({ careerArea: ca }: { careerArea: CareerArea }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Badge style={{ backgroundColor: ca.color }}>Demanda: {demandLabel[ca.marketDemand]}</Badge>
        <Badge variant="secondary">{ca.salaryRange}</Badge>
      </div>

      <Separator className="bg-slate-700" />

      <section>
        <h3 className="font-semibold text-slate-300 mb-2">Sobre esta carreira</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{ca.description}</p>
      </section>
    </div>
  );
}
