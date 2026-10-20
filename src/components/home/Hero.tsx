"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { Crest } from "../layout/Logo";

const clamp = (v: number) => Math.min(Math.max(v, 0), 1);

/**
 * Entrance corridor: scrolling pushes the camera down a dark hall, the doors slide open
 * onto a burst of light, and the page proper takes over. All motion is driven by CSS
 * variables written on the section (see `.entrance-*` in globals.css) so React never re-renders.
 */
export function Hero({ tagline }: { tagline: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let target = 0;
    let p = 0;
    let raf = 0;

    const frame = () => {
      p += (target - p) * 0.14;
      if (Math.abs(target - p) < 5e-4) p = target;

      const door = clamp((p - 0.65) / 0.2);
      const reveal = clamp((p - 0.62) / 0.23);
      const corridor = 1 - clamp((p - 0.85) / 0.15);
      const bloom = Math.max(1 - Math.abs(p - 0.78) / 0.12, 0);
      const pulse = Math.max(1 - Math.abs(p - 0.53) / 0.13, 0);
      const bob = Math.sin(p * Math.PI * 24) * 1.5 * (1 - door);

      const set = (k: string, v: number | string) => el.style.setProperty(k, String(v));
      set("--intro-progress", p);
      set("--intro-travel", clamp(p / 0.65));
      set("--intro-door", door);
      set("--intro-reveal", reveal);
      set("--intro-corridor-opacity", corridor);
      set("--intro-bloom", bloom);
      set("--intro-pulse", pulse);
      set("--intro-bob", `${bob}px`);

      raf = p === target ? 0 : requestAnimationFrame(frame);
    };

    const onScroll = () => {
      const travel = Math.max(el.offsetHeight - innerHeight, 1);
      target = clamp(-el.getBoundingClientRect().top / travel);
      raf ||= requestAnimationFrame(frame);
    };

    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} className="entrance">
      <div className="entrance-sticky">
        <div className="entrance-reveal" aria-hidden>
          <Crest className="entrance-reveal-crest" />
        </div>

        <div className="entrance-corridor">
          <div className="entrance-haze" aria-hidden />
          <div className="entrance-dots" aria-hidden>
            {Array.from({ length: 18 }, (_, i) => (
              <span
                key={i}
                style={
                  {
                    "--dot-x": `${(i * 37 + 11) % 96}%`,
                    "--dot-y": `${(i * 61 + 9) % 82}%`,
                    "--dot-size": `${3 + (i % 4)}px`,
                    "--dot-delay": `${(i % 7) * -0.8}s`,
                    "--dot-drift": `${12 + (i % 5) * 7}px`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
          <div className="entrance-ceiling" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} style={{ "--strip-index": i } as React.CSSProperties} />
            ))}
          </div>
          {(["left", "right"] as const).map((side) => (
            <div key={side} className={`entrance-wall entrance-wall-${side}`} aria-hidden>
              {Array.from({ length: 4 }, (_, i) => (
                <span key={i} style={{ "--panel-index": i } as React.CSSProperties} />
              ))}
            </div>
          ))}
          <div className="entrance-floor" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} style={{ "--floor-index": i } as React.CSSProperties} />
            ))}
          </div>

          <div className="entrance-door-frame" aria-hidden />
          <div className="entrance-door entrance-door-left" aria-hidden>
            <span />
          </div>
          <div className="entrance-door entrance-door-right" aria-hidden>
            <span />
          </div>
          <div className="entrance-seam" aria-hidden />
          <div className="entrance-plaque" aria-hidden>
            <Image src="/brand/poster.jpg" alt="" width={512} height={768} priority />
          </div>

          <div className="entrance-mainline">
            <span className="sr-only">Create. Entrepreneur. Innovate.</span>
            <span aria-hidden>Create.</span>
            <span aria-hidden>Entrepreneur.</span>
            <span aria-hidden>Innovate.</span>
          </div>

          <div className="entrance-identity">
            <h1>E-CELL</h1>
            <p className="entrance-campus">VIT WADALA</p>
            <p className="entrance-tagline">{tagline}</p>
            <div className="entrance-scroll-hint">
              Scroll to enter
              <ArrowDown className="size-4" aria-hidden />
            </div>
          </div>
        </div>

        <div className="entrance-bloom" aria-hidden />
      </div>
    </section>
  );
}
