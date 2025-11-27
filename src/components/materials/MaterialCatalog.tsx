import { useState } from 'react';
import { Material, MaterialCategory, OrderItem } from '@/types/materials';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Minus, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MaterialCatalogProps {
  materials: Material[];
  selectedItems: OrderItem[];
  onUpdateItem: (material: Material, quantity: number) => void;
}

const categoryLabels: Record<MaterialCategory, string> = {
  paint: 'Intumescent Paint',
  firestopping: 'Fire Stopping',
};

export function MaterialCatalog({ materials, selectedItems, onUpdateItem }: MaterialCatalogProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<MaterialCategory>>(new Set(['paint', 'firestopping']));
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (category: MaterialCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getQuantity = (materialId: string) => {
    return selectedItems.find(item => item.material.id === materialId)?.quantity || 0;
  };

  const materialsByCategory = materials.reduce((acc, material) => {
    if (!acc[material.category]) acc[material.category] = [];
    acc[material.category].push(material);
    return acc;
  }, {} as Record<MaterialCategory, Material[]>);

  const filteredMaterialsByCategory = Object.entries(materialsByCategory).reduce((acc, [category, mats]) => {
    const filtered = mats.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category as MaterialCategory] = filtered;
    }
    return acc;
  }, {} as Record<MaterialCategory, Material[]>);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Material Catalog</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Select materials and quantities to order</p>
        
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {(Object.entries(filteredMaterialsByCategory) as [MaterialCategory, Material[]][]).map(([category, categoryMaterials]) => (
          <div key={category} className="border-b border-border last:border-b-0">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedCategories.has(category) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium text-foreground">{categoryLabels[category]}</span>
                <span className="text-sm text-muted-foreground">({categoryMaterials.length})</span>
              </div>
            </button>
            
            {expandedCategories.has(category) && (
              <div className="pb-2 animate-fade-in">
                {categoryMaterials.map((material) => {
                  const quantity = getQuantity(material.id);
                  const isSelected = quantity > 0;
                  
                  return (
                    <div
                      key={material.id}
                      className={cn(
                        'mx-3 mb-2 p-3 rounded-lg border transition-all duration-150',
                        isSelected 
                          ? 'bg-primary/5 border-primary/30' 
                          : 'bg-card border-border hover:border-primary/20'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">{material.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {material.brand} • {material.unit}{material.unitSize ? ` (${material.unitSize})` : ''}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onUpdateItem(material, Math.max(0, quantity - 1))}
                            disabled={quantity === 0}
                            className={cn(
                              'h-7 w-7 rounded-md flex items-center justify-center transition-colors',
                              quantity === 0 
                                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            )}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          
                          <span className={cn(
                            'w-8 text-center text-sm font-medium',
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          )}>
                            {quantity}
                          </span>
                          
                          <button
                            onClick={() => onUpdateItem(material, quantity + 1)}
                            className="h-7 w-7 rounded-md flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
