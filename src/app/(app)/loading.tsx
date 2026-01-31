export default function AppLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/60 text-sm">Loading...</p>
      </div>
    </div>
  );
}
