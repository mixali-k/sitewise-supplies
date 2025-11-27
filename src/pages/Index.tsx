import { useState } from 'react';
import { MaterialsManagement } from '@/components/materials/MaterialsManagement';
import { Calendar, Package, Users, Building2, Truck, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'timeline' | 'projects' | 'materials' | 'subcontractors' | 'clients' | 'suppliers';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'timeline', label: 'Timeline Overview', icon: Calendar },
  { id: 'projects', label: 'Projects', icon: LayoutGrid },
  { id: 'materials', label: 'Materials', icon: Package },
  { id: 'subcontractors', label: 'Subcontractors', icon: Users },
  { id: 'clients', label: 'Clients', icon: Building2 },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('materials');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-foreground">Atlas Fire Track</h1>
          <p className="text-sm text-muted-foreground">Project Management & Scheduling</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="max-w-[1600px] mx-auto px-6">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {activeTab === 'materials' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">Materials Planning</h2>
              <p className="text-sm text-muted-foreground">Manage materials for upcoming work segments</p>
            </div>
            <MaterialsManagement />
          </div>
        )}
        
        {activeTab !== 'materials' && (
          <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">
                {tabs.find(t => t.id === activeTab)?.label}
              </p>
              <p className="text-sm mt-1">This view is available in your full app</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
