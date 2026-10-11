import Image from "next/image";

// Crest cropped from the official E-Cell poster (public/brand/poster.jpg). Don't recolor or stretch it.
export function Crest({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/crest.webp"
      alt=""
      width={500}
      height={560}
      priority={priority}
      className={className}
    />
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span className="relative grid h-11 w-11 place-items-center border border-gold/50 bg-black shadow-[0_0_22px_rgba(199,165,79,0.18)]">
        <Crest className="h-8 w-auto" priority />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-serif text-lg font-semibold tracking-[0.22em] text-ivory">E-CELL</span>
          <span className="mt-1 block text-[9px] font-semibold tracking-[0.3em] text-gold">
            THE SCOUTS OF VIT
          </span>
        </span>
      )}
    </span>
  );
}
