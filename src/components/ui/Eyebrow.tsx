export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`mb-5 flex items-center gap-3 font-grotesk text-xs font-bold uppercase tracking-[0.26em] text-gold ${className}`}
    >
      <span className="h-px w-10 bg-gold" />
      {children}
    </p>
  );
}
