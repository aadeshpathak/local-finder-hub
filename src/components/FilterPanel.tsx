import { X, SlidersHorizontal } from 'lucide-react';
import { categories, locations } from '@/data/services';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export interface Filters {
  categories: string[];
  locations: string[];
  availability: ('available' | 'busy' | 'offline')[];
}

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export function FilterPanel({ filters, onChange, onClose, isMobile }: FilterPanelProps) {
  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: newCategories });
  };

  const toggleLocation = (location: string) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter((l) => l !== location)
      : [...filters.locations, location];
    onChange({ ...filters, locations: newLocations });
  };

  const toggleAvailability = (status: 'available' | 'busy' | 'offline') => {
    const newAvailability = filters.availability.includes(status)
      ? filters.availability.filter((a) => a !== status)
      : [...filters.availability, status];
    onChange({ ...filters, availability: newAvailability });
  };

  const clearFilters = () => {
    onChange({ categories: [], locations: [], availability: [] });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.locations.length > 0 ||
    filters.availability.length > 0;

  return (
    <div className={`bg-card rounded-xl border border-border p-5 ${isMobile ? 'h-full' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Filters</h2>
        </div>
        {isMobile && onClose && (
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-foreground mb-3">Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`filter-chip ${filters.categories.includes(category) ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-foreground mb-3">Location</h3>
        <div className="flex flex-wrap gap-2">
          {locations.map((location) => (
            <button
              key={location}
              onClick={() => toggleLocation(location)}
              className={`filter-chip ${filters.locations.includes(location) ? 'active' : ''}`}
            >
              {location}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-foreground mb-3">Availability</h3>
        <div className="space-y-3">
          {[
            { value: 'available' as const, label: 'Available', color: 'bg-status-available' },
            { value: 'busy' as const, label: 'Busy', color: 'bg-status-busy' },
            { value: 'offline' as const, label: 'Offline', color: 'bg-status-offline' },
          ].map((status) => (
            <label
              key={status.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={filters.availability.includes(status.value)}
                onCheckedChange={() => toggleAvailability(status.value)}
              />
              <span className="flex items-center gap-2 text-sm text-foreground">
                <span className={`w-2 h-2 rounded-full ${status.color}`} />
                {status.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
