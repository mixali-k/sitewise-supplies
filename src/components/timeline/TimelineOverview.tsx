import { useState, useMemo } from 'react';
import { Project, Segment, WorkScope } from '@/types/materials';
import { projects as mockProjects, segments as mockSegments } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format, parseISO, addDays, startOfWeek, isWithinInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCalendarDialog } from './ProjectCalendarDialog';
import { SegmentEditDialog } from './SegmentEditDialog';

const scopeColors = {
  paint: 'bg-paint/80 border-paint text-white',
  firestopping: 'bg-firestopping/80 border-firestopping text-white',
  mixed: 'bg-mixed/80 border-mixed text-white',
};

export function TimelineOverview() {
  const [projects] = useState<Project[]>(mockProjects);
  const [segments, setSegments] = useState<Segment[]>(mockSegments);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  // Generate 14 days for the timeline (2 weeks)
  const timelineDays = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => 
      direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const openProjectCalendar = (project: Project) => {
    setSelectedProject(project);
    setCalendarDialogOpen(true);
  };

  const getProjectSegments = (projectId: string) => {
    return segments.filter(s => s.projectId === projectId);
  };

  const getSegmentPosition = (segment: Segment) => {
    const start = parseISO(segment.startDate);
    const end = parseISO(segment.endDate);
    
    let startIndex = -1;
    let endIndex = -1;

    timelineDays.forEach((day, i) => {
      if (isSameDay(day, start)) startIndex = i;
      if (isSameDay(day, end)) endIndex = i;
      if (isWithinInterval(day, { start, end })) {
        if (startIndex === -1) startIndex = i;
        endIndex = i;
      }
    });

    if (startIndex === -1 && endIndex === -1) return null;
    if (startIndex === -1) startIndex = 0;
    if (endIndex === -1) endIndex = timelineDays.length - 1;

    return { startIndex, endIndex };
  };

  const handleCreateSegment = (projectId: string, startDate: string, endDate: string, scope: WorkScope) => {
    const newSegment: Segment = {
      id: `s${Date.now()}`,
      projectId,
      startDate,
      endDate,
      scope,
      orderStatus: 'not_ordered',
    };
    setSegments(prev => [...prev, newSegment]);
  };

  const handleEditSegment = (segment: Segment) => {
    setSelectedSegment(segment);
    setEditDialogOpen(true);
  };

  const handleSaveSegment = (updatedSegment: Segment) => {
    setSegments(prev => prev.map(s => s.id === updatedSegment.id ? updatedSegment : s));
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
  };

  const currentMonthYear = format(currentWeekStart, 'MMMM yyyy');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule
          </h2>
          <Button variant="default" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{currentMonthYear}</span>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateWeek('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card">
        {/* Column Headers */}
        <div className="grid" style={{ gridTemplateColumns: '240px repeat(14, 1fr)' }}>
          <div className="px-4 py-3 border-r border-b border-border bg-muted/50 font-medium text-sm text-foreground">
            Project / Site
          </div>
          {timelineDays.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const isSunday = day.getDay() === 0;
            return (
              <div
                key={i}
                className={cn(
                  "px-2 py-2 border-r border-b border-border text-center last:border-r-0",
                  isToday && "bg-primary/10",
                  isSunday && "bg-muted/30"
                )}
              >
                <p className="text-xs text-muted-foreground uppercase">{format(day, 'EEE')}</p>
                <p className={cn(
                  "text-sm font-medium",
                  isToday ? "text-primary" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </p>
                {day.getDate() === 1 && (
                  <p className="text-[10px] text-primary font-medium uppercase">{format(day, 'MMM')}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Project Rows */}
        <div className="overflow-y-auto">
          {projects.map((project) => {
            const projectSegments = getProjectSegments(project.id);
            
            return (
              <div
                key={project.id}
                className="grid border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                style={{ gridTemplateColumns: '240px repeat(14, 1fr)' }}
              >
                {/* Project Info Cell */}
                <div className="px-4 py-3 border-r border-border flex items-center gap-3">
                  <button
                    onClick={() => openProjectCalendar(project)}
                    className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                    title="Open calendar view"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground truncate">{project.clientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{project.siteName}</p>
                  </div>
                </div>

                {/* Timeline Cells */}
                <div className="col-span-14 relative" style={{ gridColumn: 'span 14' }}>
                  <div className="grid" style={{ gridTemplateColumns: 'repeat(14, 1fr)' }}>
                    {timelineDays.map((day, i) => {
                      const isToday = isSameDay(day, new Date());
                      const isSunday = day.getDay() === 0;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "h-16 border-r border-border last:border-r-0",
                            isToday && "bg-primary/5",
                            isSunday && "bg-muted/20"
                          )}
                        />
                      );
                    })}
                  </div>

                  {/* Segment Bars */}
                  <div className="absolute inset-0 px-1 py-2 pointer-events-none">
                    {projectSegments.map((segment, idx) => {
                      const position = getSegmentPosition(segment);
                      if (!position) return null;

                      const width = ((position.endIndex - position.startIndex + 1) / 14) * 100;
                      const left = (position.startIndex / 14) * 100;

                      return (
                        <div
                          key={segment.id}
                          className={cn(
                            "absolute h-8 rounded-md border-l-2 shadow-sm cursor-pointer pointer-events-auto hover:shadow-md transition-shadow flex items-center px-2",
                            scopeColors[segment.scope]
                          )}
                          style={{
                            width: `${width}%`,
                            left: `${left}%`,
                            top: `${idx * 36 + 8}px`,
                          }}
                          onDoubleClick={() => handleEditSegment(segment)}
                          title={`${format(parseISO(segment.startDate), 'dd MMM')} - ${format(parseISO(segment.endDate), 'dd MMM')}`}
                        >
                          <span className="text-xs font-medium truncate">
                            {segment.scope === 'paint' ? 'Paint' : segment.scope === 'firestopping' ? 'Fire Stop' : 'Mixed'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Calendar Dialog */}
      {selectedProject && (
        <ProjectCalendarDialog
          open={calendarDialogOpen}
          onOpenChange={setCalendarDialogOpen}
          project={selectedProject}
          segments={segments.filter(s => s.projectId === selectedProject.id)}
          allSegments={segments}
          projects={projects}
          onCreateSegment={handleCreateSegment}
          onEditSegment={handleEditSegment}
        />
      )}

      {/* Segment Edit Dialog */}
      <SegmentEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        segment={selectedSegment}
        onSave={handleSaveSegment}
        onDelete={handleDeleteSegment}
      />
    </div>
  );
}
