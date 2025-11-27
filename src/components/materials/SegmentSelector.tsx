import { Project, Segment, OrderStatus } from '@/types/materials';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, Package } from 'lucide-react';

interface SegmentSelectorProps {
  projects: Project[];
  segments: Segment[];
  selectedSegmentId: string | null;
  onSelectSegment: (segmentId: string) => void;
  getSegmentOrderSummary: (segmentId: string) => { notOrdered: number; ordered: number; delivered: number };
}

const scopeStyles = {
  paint: 'bg-paint-muted text-paint border-paint/30',
  firestopping: 'bg-firestopping-muted text-firestopping border-firestopping/30',
  mixed: 'bg-mixed-muted text-mixed border-mixed/30',
};

const scopeLabels = {
  paint: 'Paint',
  firestopping: 'Fire Stopping',
  mixed: 'Mixed',
};

function StatusIndicator({ status, count }: { status: OrderStatus; count: number }) {
  if (count === 0) return null;
  
  const config = {
    not_ordered: { icon: AlertCircle, className: 'text-warning', label: 'pending' },
    ordered: { icon: Clock, className: 'text-info', label: 'ordered' },
    delivered: { icon: CheckCircle2, className: 'text-success', label: 'delivered' },
  };
  
  const { icon: Icon, className, label } = config[status];
  
  return (
    <span className={cn('flex items-center gap-1 text-xs', className)}>
      <Icon className="h-3 w-3" />
      {count} {label}
    </span>
  );
}

export function SegmentSelector({ 
  projects, 
  segments, 
  selectedSegmentId, 
  onSelectSegment,
  getSegmentOrderSummary 
}: SegmentSelectorProps) {
  // Group segments by project
  const segmentsByProject = segments.reduce((acc, segment) => {
    if (!acc[segment.projectId]) acc[segment.projectId] = [];
    acc[segment.projectId].push(segment);
    return acc;
  }, {} as Record<string, Segment[]>);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Upcoming Segments</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Select a segment to manage materials</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.entries(segmentsByProject).map(([projectId, projectSegments]) => {
          const project = projects.find(p => p.id === projectId);
          if (!project) return null;
          
          return (
            <div key={projectId} className="space-y-2">
              <div className="px-2">
                <p className="font-medium text-sm text-foreground">{project.clientName}</p>
                <p className="text-xs text-muted-foreground">{project.siteName}</p>
              </div>
              
              {projectSegments.map((segment) => {
                const summary = getSegmentOrderSummary(segment.id);
                const isSelected = selectedSegmentId === segment.id;
                const hasUnordered = summary.notOrdered > 0;
                
                return (
                  <button
                    key={segment.id}
                    onClick={() => onSelectSegment(segment.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all duration-150',
                      isSelected 
                        ? 'bg-primary/5 border-primary shadow-sm' 
                        : 'bg-card border-border hover:border-primary/50 hover:shadow-sm',
                      hasUnordered && !isSelected && 'border-l-2 border-l-warning'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full border font-medium',
                        scopeStyles[segment.scope]
                      )}>
                        {scopeLabels[segment.scope]}
                      </span>
                      {hasUnordered && (
                        <Package className="h-4 w-4 text-warning" />
                      )}
                    </div>
                    
                    <p className="text-sm font-medium text-foreground">
                      {format(parseISO(segment.startDate), 'dd MMM')} – {format(parseISO(segment.endDate), 'dd MMM yyyy')}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mt-2">
                      <StatusIndicator status="not_ordered" count={summary.notOrdered} />
                      <StatusIndicator status="ordered" count={summary.ordered} />
                      <StatusIndicator status="delivered" count={summary.delivered} />
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
