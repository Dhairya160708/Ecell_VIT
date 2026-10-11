export function Loading() {
  return (
    <div className="animate-pulse space-y-3" aria-label="Loading">
      <div className="mb-8 h-10 w-64 rounded-xl bg-black/[0.07]" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-2xl bg-white/70" />
      ))}
    </div>
  );
}
