'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMapStore } from '@/store/map-store';
import { DisciplineDetail } from './DisciplineDetail';
import { CareerAreaDetail } from './CareerAreaDetail';

export function DetailPanel() {
  const { selectedNode, clearSelection } = useMapStore();

  return (
    <Sheet open={selectedNode !== null} onOpenChange={() => clearSelection()}>
      <SheetContent
        side="right"
        className="w-full max-w-lg overflow-y-auto bg-slate-900 border-slate-700 text-slate-100"
      >
        <SheetHeader>
          <SheetTitle className="text-slate-100">
            {selectedNode?.type === 'discipline'
              ? selectedNode.data.name
              : selectedNode?.data.name ?? ''}
          </SheetTitle>
        </SheetHeader>

        {selectedNode?.type === 'discipline' && (
          <DisciplineDetail discipline={selectedNode.data} />
        )}
        {selectedNode?.type === 'career' && (
          <CareerAreaDetail careerArea={selectedNode.data} />
        )}
      </SheetContent>
    </Sheet>
  );
}
