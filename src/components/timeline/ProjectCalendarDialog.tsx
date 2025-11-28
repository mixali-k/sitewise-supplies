import { useState, useRef, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Project, Segment, WorkScope } from '@/types/materials';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  addWeeks, 
  subWeeks, 
  isSameDay, 
  isWithinInterval, 
  parseISO,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter
} from 'date-fns';

interface ProjectCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  segments: Segment[];
  allSegments: Segment[];
  projects: Project[];
  onCreateSegment: (projectId: string, startDate: string, endDate: string, scope: WorkScope) => void;
  onEditSegment: (segment: Segment) => void;
}

const scopeColors = {
  paint: { bg: 'bg-paint/20', border: 'border-paint', text: 'text-paint' },
  firestopping: { bg: 'bg-firestopping/20', border: 'border-firestopping', text: 'text-firestopping' },
  mixed: { bg: 'bg-mixed/20', border: 'border-mixed', text: 'text-mixed' },
};

const scopeColorsFaded = {
  paint: { bg: 'bg-paint/5', border: 'border-paint/30', text: 'text-paint/50' },
  firestopping: { bg: 'bg-firestopping/5', border: 'border-firestopping/30', text: 'text-firestopping/50' },
  mixed: { bg: 'bg-mixed/5', border: 'border-mixed/30', text: 'text-mixed/50' },
};

export function ProjectCalendarDialog({
  open,
  onOpenChange,
  project,
  segments,
  allSegments,
  projects,
  onCreateSegment,
  onEditSegment,
}: ProjectCalendarDialogProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Mon-Sat (6 days for construction)
  const weekDays = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => 
      direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
    setSelectedDate(new Date());
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
    }
  };

  // Get segments for this project that overlap with this week
  const getSegmentsForDay = useCallback((day: Date, projectId?: string) => {
    const targetSegments = projectId 
      ? allSegments.filter(s => s.projectId === projectId)
      : segments;

    return targetSegments.filter(segment => {
      const start = parseISO(segment.startDate);
      const end = parseISO(segment.endDate);
      return isWithinInterval(day, { start: startOfDay(start), end: endOfDay(end) }) ||
             isSameDay(day, start) || isSameDay(day, end);
    });
  }, [segments, allSegments]);

  // Get other projects' segments for this day (faded display)
  const getOtherProjectsSegmentsForDay = useCallback((day: Date) => {
    return allSegments
      .filter(s => s.projectId !== project.id)
      .filter(segment => {
        const start = parseISO(segment.startDate);
        const end = parseISO(segment.endDate);
        return isWithinInterval(day, { start: startOfDay(start), end: endOfDay(end) }) ||
               isSameDay(day, start) || isSameDay(day, end);
      });
  }, [allSegments, project.id]);

  const handleMouseDown = (day: Date) => {
    setIsDragging(true);
    setDragStart(day);
    setDragEnd(day);
  };

  const handleMouseEnter = (day: Date) => {
    if (isDragging && dragStart) {
      setDragEnd(day);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      const start = isBefore(dragStart, dragEnd) ? dragStart : dragEnd;
      const end = isAfter(dragStart, dragEnd) ? dragStart : dragEnd;
      
      // Create segment with default scope
      onCreateSegment(
        project.id,
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd'),
        'mixed'
      );
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const isDayInDragRange = (day: Date) => {
    if (!isDragging || !dragStart || !dragEnd) return false;
    const start = isBefore(dragStart, dragEnd) ? dragStart : dragEnd;
    const end = isAfter(dragStart, dragEnd) ? dragStart : dragEnd;
    return isWithinInterval(day, { start, end }) || isSameDay(day, start) || isSameDay(day, end);
  };

  const handleSegmentDoubleClick = (segment: Segment, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditSegment(segment);
  };

  // Format week range for header
  const weekRangeText = useMemo(() => {
    const weekEnd = addDays(currentWeekStart, 5);
    const startMonth = format(currentWeekStart, 'MMMM');
    const endMonth = format(weekEnd, 'MMMM');
    const year = format(currentWeekStart, 'yyyy');
    
    if (startMonth === endMonth) {
      return `${format(currentWeekStart, 'd')} - ${format(weekEnd, 'd')} ${startMonth} ${year}`;
    }
    return `${format(currentWeekStart, 'd MMM')} - ${format(weekEnd, 'd MMM')} ${year}`;
  }, [currentWeekStart]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1100px] w-[95vw] h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-xl font-semibold">{project.siteName}</DialogTitle>
          <p className="text-sm text-muted-foreground">{project.clientName} • {project.projectCode}</p>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Mini Calendar */}
          <div className="w-[280px] border-r border-border p-4 flex flex-col gap-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
            />
            
            {/* Legend */}
            <div className="space-y-2 px-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Work Type</p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-paint/60 border border-paint" />
                  <span className="text-sm text-foreground">Intumescent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-firestopping/60 border border-firestopping" />
                  <span className="text-sm text-foreground">Fire Stopping</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-mixed/60 border border-mixed" />
                  <span className="text-sm text-foreground">Both</span>
                </div>
              </div>
            </div>

            <div className="mt-auto px-2">
              <p className="text-xs text-muted-foreground">
                Drag to create segment • Double-click to edit
              </p>
            </div>
          </div>

          {/* Right Panel - Week View */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Week Navigation Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateWeek('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateWeek('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{weekRangeText}</h3>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Work Week</span>
              </div>
            </div>

            {/* Week Grid */}
            <div 
              ref={gridRef}
              className="flex-1 overflow-auto"
              onMouseLeave={() => {
                if (isDragging) {
                  handleMouseUp();
                }
              }}
              onMouseUp={handleMouseUp}
            >
              {/* Day Headers */}
              <div className="grid grid-cols-6 border-b border-border sticky top-0 bg-card z-10">
                {weekDays.map((day, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "px-3 py-3 text-center border-r border-border last:border-r-0",
                      isSameDay(day, new Date()) && "bg-primary/5"
                    )}
                  >
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      {format(day, 'EEE')}
                    </p>
                    <p className={cn(
                      "text-lg font-semibold mt-0.5",
                      isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
                    )}>
                      {format(day, 'd')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-6 flex-1" style={{ minHeight: '400px' }}>
                {weekDays.map((day, i) => {
                  const projectSegments = getSegmentsForDay(day);
                  const otherSegments = getOtherProjectsSegmentsForDay(day);
                  const isInDragRange = isDayInDragRange(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={i}
                      className={cn(
                        "border-r border-b border-border last:border-r-0 p-2 min-h-[120px] transition-colors cursor-pointer",
                        isToday && "bg-primary/5",
                        isInDragRange && "bg-primary/10"
                      )}
                      onMouseDown={() => handleMouseDown(day)}
                      onMouseEnter={() => handleMouseEnter(day)}
                    >
                      <div className="space-y-1.5">
                        {/* Other projects' segments (faded) */}
                        {otherSegments.map((segment) => {
                          const segmentProject = projects.find(p => p.id === segment.projectId);
                          const colors = scopeColorsFaded[segment.scope];
                          return (
                            <div
                              key={segment.id}
                              className={cn(
                                "px-2 py-1.5 rounded text-xs border cursor-default",
                                colors.bg, colors.border, colors.text
                              )}
                            >
                              <p className="font-medium truncate opacity-60">
                                {segmentProject?.siteName}
                              </p>
                            </div>
                          );
                        })}

                        {/* This project's segments */}
                        {projectSegments.map((segment) => {
                          const colors = scopeColors[segment.scope];
                          return (
                            <div
                              key={segment.id}
                              className={cn(
                                "px-2 py-1.5 rounded text-xs border-l-2 cursor-pointer hover:shadow-sm transition-shadow",
                                colors.bg, colors.border, colors.text
                              )}
                              onDoubleClick={(e) => handleSegmentDoubleClick(segment, e)}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <p className="font-medium truncate">{project.siteName}</p>
                              <p className="text-[10px] opacity-70 capitalize">{segment.scope}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
