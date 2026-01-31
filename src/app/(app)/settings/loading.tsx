export default function SettingsLoading() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="h-8 w-32 bg-base-300 animate-pulse rounded" />

      {/* Profile section skeleton */}
      <div className="card bg-base-200">
        <div className="card-body space-y-4">
          <div className="h-5 w-24 bg-base-300 animate-pulse rounded" />
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-base-300 animate-pulse rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-base-300 animate-pulse rounded" />
              <div className="h-3 w-48 bg-base-300 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription section skeleton */}
      <div className="card bg-base-200">
        <div className="card-body space-y-4">
          <div className="h-5 w-28 bg-base-300 animate-pulse rounded" />
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-base-300 animate-pulse rounded" />
              <div className="h-3 w-40 bg-base-300 animate-pulse rounded" />
            </div>
            <div className="h-10 w-28 bg-base-300 animate-pulse rounded-btn" />
          </div>
        </div>
      </div>

      {/* Danger zone skeleton */}
      <div className="card bg-base-200 border border-error/20">
        <div className="card-body space-y-4">
          <div className="h-5 w-24 bg-base-300 animate-pulse rounded" />
          <div className="h-10 w-32 bg-base-300 animate-pulse rounded-btn" />
        </div>
      </div>
    </div>
  );
}
