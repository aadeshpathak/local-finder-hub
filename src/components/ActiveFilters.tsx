import { X } from 'lucide-react';
import type { Filters } from './FilterPanel';

interface ActiveFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function ActiveFilters({ filters, onChange }: ActiveFiltersProps) {
  const hasFilters =
    filters.categories.length > 0 ||
    filters.locations.length > 0 ||
    filters.availability.length > 0;

  if (!hasFilters) return null;

  const removeCategory = (category: string) => {
    onChange({
      ...filters,
      categories: filters.categories.filter((c) => c !== category),
    });
  };

  const removeLocation = (location: string) => {
    onChange({
      ...filters,
      locations: filters.locations.filter((l) => l !== location),
    });
  };

  const removeAvailability = (status: string) => {
    onChange({
      ...filters,
      availability: filters.availability.filter((a) => a !== status),
    });
  };

  const clearAll = () => {
    onChange({ categories: [], locations: [], availability: [] });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 animate-fade-in">
      <span className="text-sm text-muted-foreground">Active filters:</span>

      {filters.categories.map((category) => (
        <span
          key={category}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-sm rounded-full"
        >
          {category}
          <button
            onClick={() => removeCategory(category)}
            className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {filters.locations.map((location) => (
        <span
          key={location}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
        >
          {location}
          <button
            onClick={() => removeLocation(location)}
            className="p-0.5 hover:bg-primary/10 rounded-full transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {filters.availability.map((status) => (
        <span
          key={status}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted text-muted-foreground text-sm rounded-full capitalize"
        >
          {status}
          <button
            onClick={() => removeAvailability(status)}
            className="p-0.5 hover:bg-foreground/10 rounded-full transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        onClick={clearAll}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
      >
        Clear all
      </button>
    </div>
  );
}
