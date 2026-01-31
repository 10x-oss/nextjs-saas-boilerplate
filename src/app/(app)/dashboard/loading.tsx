export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-base-300 animate-pulse rounded" />
        <div className="h-10 w-32 bg-base-300 animate-pulse rounded-btn" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card bg-base-200">
            <div className="card-body">
              <div className="h-4 w-24 bg-base-300 animate-pulse rounded" />
              <div className="h-8 w-16 bg-base-300 animate-pulse rounded mt-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="card bg-base-200">
        <div className="card-body space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 bg-base-300 animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-base-300 animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-base-300 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
