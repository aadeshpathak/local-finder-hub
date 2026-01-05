import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onClearFilters: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No services found
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        We couldn't find any services matching your criteria. Try adjusting your filters or search terms.
      </p>
      <Button onClick={onClearFilters} variant="outline">
        Clear All Filters
      </Button>
    </div>
  );
}
