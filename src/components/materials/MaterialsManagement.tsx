import { useState, useMemo } from 'react';
import { projects, segments as initialSegments, materials, segmentMaterials as initialSegmentMaterials } from '@/data/mockData';
import { Material, OrderItem, Segment, SegmentMaterial } from '@/types/materials';
import { SegmentSelector } from './SegmentSelector';
import { MaterialCatalog } from './MaterialCatalog';
import { OrderSummary } from './OrderSummary';

export function MaterialsManagement() {
  const [segments, setSegments] = useState<Segment[]>(initialSegments);
  const [segmentMaterials, setSegmentMaterials] = useState<SegmentMaterial[]>(initialSegmentMaterials);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const selectedSegment = segments.find(s => s.id === selectedSegmentId) || null;
  const selectedProject = selectedSegment 
    ? projects.find(p => p.id === selectedSegment.projectId) || null 
    : null;

  const getSegmentOrderSummary = (segmentId: string) => {
    const segMats = segmentMaterials.filter(sm => sm.segmentId === segmentId);
    return {
      notOrdered: segMats.filter(sm => sm.status === 'not_ordered').length,
      ordered: segMats.filter(sm => sm.status === 'ordered').length,
      delivered: segMats.filter(sm => sm.status === 'delivered').length,
    };
  };

  const handleSelectSegment = (segmentId: string) => {
    setSelectedSegmentId(segmentId);
    // Load existing materials for this segment into order items
    const existingMaterials = segmentMaterials
      .filter(sm => sm.segmentId === segmentId && sm.status === 'not_ordered')
      .map(sm => {
        const material = materials.find(m => m.id === sm.materialId);
        return material ? { material, quantity: sm.quantity } : null;
      })
      .filter((item): item is OrderItem => item !== null);
    
    setOrderItems(existingMaterials);
  };

  const handleUpdateItem = (material: Material, quantity: number) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.material.id === material.id);
      if (quantity === 0) {
        return prev.filter(item => item.material.id !== material.id);
      }
      if (existing) {
        return prev.map(item => 
          item.material.id === material.id ? { ...item, quantity } : item
        );
      }
      return [...prev, { material, quantity }];
    });
  };

  const handleClearOrder = () => {
    setOrderItems([]);
  };

  const handlePlaceOrder = () => {
    if (!selectedSegmentId) return;

    // Update segment materials status
    const newSegmentMaterials = [...segmentMaterials];
    
    orderItems.forEach(item => {
      const existing = newSegmentMaterials.find(
        sm => sm.segmentId === selectedSegmentId && sm.materialId === item.material.id
      );
      
      if (existing) {
        existing.status = 'ordered';
        existing.quantity = item.quantity;
        existing.orderedAt = new Date().toISOString();
      } else {
        newSegmentMaterials.push({
          id: `sm_${Date.now()}_${item.material.id}`,
          segmentId: selectedSegmentId,
          materialId: item.material.id,
          quantity: item.quantity,
          status: 'ordered',
          orderedAt: new Date().toISOString(),
        });
      }
    });

    setSegmentMaterials(newSegmentMaterials);

    // Update segment order status
    setSegments(prev => prev.map(seg => 
      seg.id === selectedSegmentId ? { ...seg, orderStatus: 'ordered' } : seg
    ));

    // Clear order items
    setOrderItems([]);
  };

  // Sort segments by start date
  const sortedSegments = useMemo(() => {
    return [...segments].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [segments]);

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Left: Segment Selector */}
      <div className="w-80 shrink-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <SegmentSelector
          projects={projects}
          segments={sortedSegments}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={handleSelectSegment}
          getSegmentOrderSummary={getSegmentOrderSummary}
        />
      </div>

      {/* Center: Material Catalog */}
      <div className="flex-1 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <MaterialCatalog
          materials={materials}
          selectedItems={orderItems}
          onUpdateItem={handleUpdateItem}
        />
      </div>

      {/* Right: Order Summary */}
      <div className="w-80 shrink-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <OrderSummary
          project={selectedProject}
          segment={selectedSegment}
          orderItems={orderItems}
          onClearOrder={handleClearOrder}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
    </div>
  );
}
