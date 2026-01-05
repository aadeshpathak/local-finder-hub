export function ServiceCardSkeleton() {
  return (
    <div className="card-elevated overflow-hidden">
      {/* Image skeleton */}
      <div className="h-48 skeleton" />

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="h-6 w-3/4 skeleton" />
        <div className="h-4 w-1/2 skeleton" />
        <div className="space-y-2">
          <div className="h-4 w-full skeleton" />
          <div className="h-4 w-2/3 skeleton" />
        </div>
        <div className="pt-4 border-t border-border flex justify-between">
          <div className="h-4 w-24 skeleton" />
          <div className="h-4 w-20 skeleton" />
        </div>
      </div>
    </div>
  );
}
