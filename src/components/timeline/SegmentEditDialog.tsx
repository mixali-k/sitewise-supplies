import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Segment, WorkScope } from '@/types/materials';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Trash2 } from 'lucide-react';

interface SegmentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segment: Segment | null;
  onSave: (segment: Segment) => void;
  onDelete: (segmentId: string) => void;
}

export function SegmentEditDialog({
  open,
  onOpenChange,
  segment,
  onSave,
  onDelete,
}: SegmentEditDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    segment ? parseISO(segment.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    segment ? parseISO(segment.endDate) : undefined
  );
  const [scope, setScope] = useState<WorkScope>(segment?.scope || 'mixed');

  // Reset form when segment changes
  useState(() => {
    if (segment) {
      setStartDate(parseISO(segment.startDate));
      setEndDate(parseISO(segment.endDate));
      setScope(segment.scope);
    }
  });

  const handleSave = () => {
    if (!segment || !startDate || !endDate) return;
    
    onSave({
      ...segment,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      scope,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!segment) return;
    onDelete(segment.id);
    onOpenChange(false);
  };

  if (!segment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Segment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Work Type</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as WorkScope)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paint">Intumescent (Paint)</SelectItem>
                <SelectItem value="firestopping">Fire Stopping</SelectItem>
                <SelectItem value="mixed">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd MMM yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd MMM yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
