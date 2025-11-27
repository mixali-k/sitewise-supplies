import { useState } from 'react';
import { Project, Segment, OrderItem } from '@/types/materials';
import { format, parseISO } from 'date-fns';
import { Check, ClipboardCopy, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface OrderSummaryProps {
  project: Project | null;
  segment: Segment | null;
  orderItems: OrderItem[];
  onClearOrder: () => void;
  onPlaceOrder: () => void;
}

export function OrderSummary({ project, segment, orderItems, onClearOrder, onPlaceOrder }: OrderSummaryProps) {
  const [showGeneratedOrder, setShowGeneratedOrder] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const generateOrderText = () => {
    if (!project || !segment) return '';
    
    const lines = [
      `MATERIAL ORDER REQUEST`,
      ``,
      `Project: ${project.clientName} - ${project.siteName}`,
      `Project Code: ${project.projectCode}`,
      `Work Dates: ${format(parseISO(segment.startDate), 'dd/MM/yyyy')} - ${format(parseISO(segment.endDate), 'dd/MM/yyyy')}`,
      ``,
      `MATERIALS REQUIRED:`,
      ``,
    ];

    // Group by brand
    const byBrand = orderItems.reduce((acc, item) => {
      if (!acc[item.material.brand]) acc[item.material.brand] = [];
      acc[item.material.brand].push(item);
      return acc;
    }, {} as Record<string, OrderItem[]>);

    Object.entries(byBrand).forEach(([brand, items]) => {
      lines.push(`${brand}:`);
      items.forEach(item => {
        const size = item.material.unitSize ? ` (${item.material.unitSize})` : '';
        lines.push(`  • ${item.quantity}x ${item.material.name}${size}`);
      });
      lines.push('');
    });

    lines.push(`Total Items: ${totalItems}`);
    lines.push('');
    lines.push(`Please confirm delivery date and availability.`);
    lines.push(`Thank you.`);

    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = generateOrderText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Order details ready to paste into your email",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please select and copy the text manually",
        variant: "destructive",
      });
    }
  };

  const handlePlaceOrder = () => {
    onPlaceOrder();
    setShowGeneratedOrder(false);
    toast({
      title: "Order marked as placed",
      description: "Materials have been marked as ordered for this segment",
    });
  };

  if (!segment) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Order Summary</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select a segment to start adding materials</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Order Summary</h2>
        {project && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {project.siteName} • {format(parseISO(segment.startDate), 'dd MMM')}
          </p>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {orderItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">No materials selected yet</p>
            <p className="text-xs mt-1">Add materials from the catalog</p>
          </div>
        ) : showGeneratedOrder ? (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Generated Order</span>
              <button 
                onClick={() => setShowGeneratedOrder(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Textarea
              value={generateOrderText()}
              readOnly
              className="h-64 font-mono text-xs resize-none"
            />
            <Button 
              onClick={handleCopy} 
              variant="outline" 
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardCopy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {orderItems.map((item) => (
              <div 
                key={item.material.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{item.material.name}</p>
                  <p className="text-xs text-muted-foreground">{item.material.brand}</p>
                </div>
                <span className="text-sm font-medium text-primary ml-3">
                  ×{item.quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {orderItems.length > 0 && !showGeneratedOrder && (
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total items</span>
            <span className="font-semibold text-foreground">{totalItems}</span>
          </div>
          
          <Button 
            onClick={() => setShowGeneratedOrder(true)}
            className="w-full"
          >
            <ClipboardCopy className="h-4 w-4 mr-2" />
            Generate Order
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClearOrder}
              className="flex-1"
            >
              Clear
            </Button>
            <Button 
              variant="default"
              onClick={handlePlaceOrder}
              className="flex-1 bg-success hover:bg-success/90"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark Ordered
            </Button>
          </div>
        </div>
      )}
      
      {showGeneratedOrder && (
        <div className="p-4 border-t border-border">
          <Button 
            onClick={handlePlaceOrder}
            className="w-full bg-success hover:bg-success/90"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark as Ordered
          </Button>
        </div>
      )}
    </div>
  );
}
