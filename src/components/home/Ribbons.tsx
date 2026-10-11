function Track({ words, className, reverse }: { words: string[]; className: string; reverse?: boolean }) {
  const row = Array.from({ length: Math.max(words.length * 2, 10) }, (_, i) => words[i % words.length]);
  return (
    <div className={`flex w-max ${reverse ? "animate-marquee-rev" : "animate-marquee"}`}>
      {[0, 1].map((k) => (
        <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
          {row.map((w, i) => (
            <span
              key={i}
              className={`flex items-center gap-8 px-8 font-display text-5xl sm:text-6xl ${className}`}
            >
              {w}
              <span className="text-2xl">✦</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Two crossing marquee bands: gold over forest. */
export function Ribbons({ words }: { words: string[] }) {
  if (!words.length) return null;
  return (
    <section aria-label="Divisions" className="relative h-64 overflow-hidden sm:h-80">
      <div className="absolute left-[-10%] top-1/2 w-[120%] -translate-y-1/2 rotate-[4deg] border-y border-gold/30 bg-forest py-4">
        <Track words={words} className="text-gold-light/80" reverse />
      </div>
      <div className="absolute left-[-10%] top-1/2 w-[120%] -translate-y-1/2 -rotate-[3deg] bg-gold py-4 shadow-[0_20px_60px_rgba(0,0,0,.6)]">
        <Track words={words} className="text-ink" />
      </div>
    </section>
  );
}
