import { Project, Segment, Material, SegmentMaterial } from '@/types/materials';

export const projects: Project[] = [
  { id: 'p1', clientName: 'Knowles Construction', siteName: 'Sheldon Avenue', projectCode: 'AFSA001' },
  { id: 'p2', clientName: 'Lima Construction', siteName: 'Cabul Road', projectCode: 'AFCR001' },
  { id: 'p3', clientName: 'Knowles Construction', siteName: 'Hampstead Lane', projectCode: 'AFHL001' },
  { id: 'p4', clientName: 'Box Clever LDN', siteName: 'Kensington High St', projectCode: 'AFKH001' },
];

export const segments: Segment[] = [
  { id: 's1', projectId: 'p1', startDate: '2025-11-17', endDate: '2025-11-21', scope: 'paint', orderStatus: 'not_ordered' },
  { id: 's2', projectId: 'p2', startDate: '2025-11-25', endDate: '2025-11-28', scope: 'paint', orderStatus: 'not_ordered' },
  { id: 's3', projectId: 'p2', startDate: '2025-12-01', endDate: '2025-12-03', scope: 'mixed', orderStatus: 'not_ordered' },
  { id: 's4', projectId: 'p3', startDate: '2025-12-08', endDate: '2025-12-12', scope: 'firestopping', orderStatus: 'ordered' },
  { id: 's5', projectId: 'p4', startDate: '2025-12-15', endDate: '2025-12-19', scope: 'mixed', orderStatus: 'not_ordered' },
];

export const materials: Material[] = [
  // Paint products
  { id: 'm1', name: 'SC802 Water-Based Intumescent Basecoat', brand: 'Nullifire', category: 'paint', unit: 'drums', unitSize: '25kg' },
  { id: 'm2', name: 'TS815 Solvent-Based Acrylic Topseal', brand: 'Nullifire', category: 'paint', unit: 'cans', unitSize: '5L' },
  { id: 'm3', name: 'Firetex FX6002 Intumescent', brand: 'Sherwin-Williams', category: 'paint', unit: 'drums', unitSize: '20kg' },
  { id: 'm4', name: 'Primer HB', brand: 'Tremco CPG', category: 'paint', unit: 'cans', unitSize: '5L' },
  { id: 'm5', name: 'Interchar 1260 Basecoat', brand: 'International', category: 'paint', unit: 'drums', unitSize: '20kg' },
  
  // Fire stopping products  
  { id: 'm6', name: 'FS702 Intumastic', brand: 'Nullifire', category: 'firestopping', unit: 'tubes', unitSize: '310ml' },
  { id: 'm7', name: 'FS709 Intumastic HP Graphite Sealant', brand: 'Nullifire', category: 'firestopping', unit: 'tubes', unitSize: '310ml' },
  { id: 'm8', name: 'CarboMastic 18FC (Parts A & B)', brand: 'CarboMastic', category: 'firestopping', unit: 'kits' },
  { id: 'm9', name: 'FC101 Repair Kit', brand: 'Nullifire', category: 'firestopping', unit: 'kits' },
  { id: 'm10', name: 'FIREFLY FR Intumescent Acrylic Sealant', brand: 'Firefly', category: 'firestopping', unit: 'tubes', unitSize: '310ml' },
  { id: 'm11', name: 'Rockwool Fire Barrier', brand: 'Rockwool', category: 'firestopping', unit: 'packs' },
  { id: 'm12', name: 'Firestop Compound', brand: 'Hilti', category: 'firestopping', unit: 'buckets', unitSize: '5kg' },
];

export const segmentMaterials: SegmentMaterial[] = [
  { id: 'sm1', segmentId: 's1', materialId: 'm1', quantity: 2, status: 'not_ordered' },
  { id: 'sm2', segmentId: 's1', materialId: 'm2', quantity: 3, status: 'not_ordered' },
  { id: 'sm3', segmentId: 's4', materialId: 'm6', quantity: 24, status: 'ordered', orderedAt: '2025-11-20' },
  { id: 'sm4', segmentId: 's4', materialId: 'm11', quantity: 5, status: 'ordered', orderedAt: '2025-11-20' },
];
