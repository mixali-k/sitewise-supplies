export type WorkScope = 'paint' | 'firestopping' | 'mixed';
export type OrderStatus = 'not_ordered' | 'ordered' | 'delivered';
export type MaterialCategory = 'paint' | 'firestopping';

export interface Project {
  id: string;
  clientName: string;
  siteName: string;
  projectCode: string;
}

export interface Segment {
  id: string;
  projectId: string;
  startDate: string;
  endDate: string;
  scope: WorkScope;
  orderStatus: OrderStatus;
}

export interface Material {
  id: string;
  name: string;
  brand: string;
  category: MaterialCategory;
  unit: string;
  unitSize?: string;
}

export interface SegmentMaterial {
  id: string;
  segmentId: string;
  materialId: string;
  quantity: number;
  status: OrderStatus;
  orderedAt?: string;
  deliveredAt?: string;
}

export interface OrderItem {
  material: Material;
  quantity: number;
}
