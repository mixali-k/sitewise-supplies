import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Project, Segment, WorkScope } from '@/types/materials';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays, 
  addMonths,
  subMonths,
  isSameDay, 
  isSameMonth,
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

type ViewMode = 'day' | 'week' | 'month';

const scopeColors: Record<WorkScope, { bg: string; border: string; text: string }> = {
  paint: { bg: 'bg-paint/20', border: 'border-paint', text: 'text-paint' },
  firestopping: { bg: 'bg-firestopping/20', border: 'border-firestopping', text: 'text-firestopping' },
  mixed: { bg: 'bg-mixed/20', border: 'border-mixed', text: 'text-mixed' },
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Get all days to display in the month grid
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  // Group days into weeks
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      result.push(monthDays.slice(i, i + 7));
    }
    return result;
  }, [monthDays]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
    }
  };

  // Get all segments that overlap with a specific day
  const getSegmentsForDay = (day: Date) => {
    return allSegments.filter(segment => {
      const start = parseISO(segment.startDate);
      const end = parseISO(segment.endDate);
      return isWithinInterval(day, { start: startOfDay(start), end: endOfDay(end) }) ||
             isSameDay(day, start) || isSameDay(day, end);
    });
  };

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

  // Get unique projects with segments for the legend
  const projectsWithSegments = useMemo(() => {
    const projectIds = new Set(allSegments.map(s => s.projectId));
    return projects.filter(p => projectIds.has(p.id));
  }, [allSegments, projects]);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] w-[95vw] h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">{project.siteName}</DialogTitle>
              <p className="text-sm text-muted-foreground">{project.clientName} • {project.projectCode}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex border border-border rounded-md overflow-hidden">
                <Button 
                  variant={viewMode === 'day' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode('day')}
                >
                  Day
                </Button>
                <Button 
                  variant={viewMode === 'week' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="rounded-none border-x border-border"
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={viewMode === 'month' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode('month')}
                >
                  Month
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Mini Calendar + Project Legend */}
          <div className="w-[260px] border-r border-border p-4 flex flex-col gap-4 overflow-y-auto">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={handleDateSelect}
              month={currentDate}
              onMonthChange={setCurrentDate}
              className="rounded-md border pointer-events-auto"
            />
            
            {/* Project Legend */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Projects</p>
              <div className="flex flex-col gap-1.5">
                {projectsWithSegments.map((p) => {
                  const isCurrentProject = p.id === project.id;
                  const projectSegments = allSegments.filter(s => s.projectId === p.id);
                  const primaryScope = projectSegments[0]?.scope || 'mixed';
                  const colors = scopeColors[primaryScope];
                  
                  return (
                    <div key={p.id} className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-4 rounded-sm",
                        colors.bg,
                        `border-l-2 ${colors.border}`
                      )} />
                      <span className={cn(
                        "text-sm truncate",
                        isCurrentProject ? "font-medium text-foreground" : "text-muted-foreground"
                      )}>
                        {p.siteName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Work Type Legend */}
            <div className="space-y-2">
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

            <div className="mt-auto">
              <p className="text-xs text-muted-foreground">
                Drag to create • Double-click to edit
              </p>
            </div>
          </div>

          {/* Right Panel - Month Grid */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Month Navigation Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {format(currentDate, 'MMMM yyyy')}
              </h3>
              <div className="w-[120px]" />
            </div>

            {/* Month Grid */}
            <div 
              className="flex-1 overflow-auto"
              onMouseLeave={() => {
                if (isDragging) handleMouseUp();
              }}
              onMouseUp={handleMouseUp}
            >
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-border sticky top-0 bg-card z-10">
                {dayNames.map((day, i) => (
                  <div 
                    key={i} 
                    className="px-2 py-2 text-center border-r border-border last:border-r-0"
                  >
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      {day}
                    </p>
                  </div>
                ))}
              </div>

              {/* Week Rows */}
              <div className="flex-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 border-b border-border" style={{ minHeight: '100px' }}>
                    {week.map((day, dayIndex) => {
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      const isToday = isSameDay(day, new Date());
                      const isInDragRange = isDayInDragRange(day);
                      const daySegments = getSegmentsForDay(day);

                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            "border-r border-border last:border-r-0 p-1 transition-colors cursor-pointer relative",
                            !isCurrentMonth && "bg-muted/30",
                            isToday && "bg-primary/5",
                            isInDragRange && "bg-primary/10"
                          )}
                          onMouseDown={() => handleMouseDown(day)}
                          onMouseEnter={() => handleMouseEnter(day)}
                        >
                          {/* Day Number */}
                          <div className={cn(
                            "text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                            isToday && "bg-primary text-primary-foreground",
                            !isCurrentMonth && "text-muted-foreground",
                            isCurrentMonth && !isToday && "text-foreground"
                          )}>
                            {format(day, 'd')}
                          </div>

                          {/* Segments */}
                          <div className="space-y-0.5 overflow-hidden">
                            {daySegments.slice(0, 3).map((segment) => {
                              const segmentProject = projects.find(p => p.id === segment.projectId);
                              const isCurrentProject = segment.projectId === project.id;
                              const colors = scopeColors[segment.scope];
                              
                              return (
                                <div
                                  key={segment.id}
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] border-l-2 truncate cursor-pointer hover:shadow-sm transition-shadow",
                                    colors.bg, colors.border,
                                    isCurrentProject ? colors.text : "opacity-50"
                                  )}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    onEditSegment(segment);
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  <span className="font-medium">{segmentProject?.siteName}</span>
                                </div>
                              );
                            })}
                            {daySegments.length > 3 && (
                              <div className="text-[10px] text-muted-foreground px-1">
                                +{daySegments.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
