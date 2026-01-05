import { Star, MapPin, Zap, Wrench, BookOpen, Car, Sparkles, PaintBucket, Hammer, TreePine } from 'lucide-react';
import type { Service } from '@/data/services';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Electrician: Zap,
  Plumber: Wrench,
  Tutor: BookOpen,
  Mechanic: Car,
  Cleaner: Sparkles,
  Painter: PaintBucket,
  Carpenter: Hammer,
  Landscaper: TreePine,
};

interface ServiceCardProps {
  service: Service;
  index: number;
  onViewDetails: (service: Service) => void;
}

export function ServiceCard({ service, index, onViewDetails }: ServiceCardProps) {
  const IconComponent = categoryIcons[service.category] || Wrench;

  const statusConfig = {
    available: { label: 'Available', className: 'status-available' },
    busy: { label: 'Busy', className: 'status-busy' },
    offline: { label: 'Offline', className: 'status-offline' },
  };

  const status = statusConfig[service.availability];
  const staggerClass = `stagger-${Math.min(index % 6 + 1, 6)}`;

  return (
    <article 
      className={`card-elevated overflow-hidden group opacity-0 animate-fade-in-up ${staggerClass}`}
    >
      {/* Image */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm text-sm font-medium text-foreground">
            <IconComponent className="w-4 h-4 text-primary" />
            {service.category}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`status-badge ${status.className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">
          {service.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span>{service.location}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {service.description}
        </p>

        {/* Rating */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-semibold text-foreground">{service.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({service.reviewCount} reviews)
            </span>
          </div>
          <button 
            onClick={() => onViewDetails(service)}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}
