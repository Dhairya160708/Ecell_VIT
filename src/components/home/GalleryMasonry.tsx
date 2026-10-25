"use client";
import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { GalleryPhoto } from "@/types/content";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { Eyebrow } from "../ui/Eyebrow";

/** Responsive masonry using CSS columns, so every photo keeps its natural aspect ratio. */
export function GalleryMasonry({ photos }: { photos: GalleryPhoto[] }) {
  const [active, setActive] = useState<GalleryPhoto | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setActive(null), []);
  useFocusTrap(!!active, dialog, close);

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      inert={active ? true : undefined}
      className="py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Eyebrow>From the floor</Eyebrow>
            <h2 id="gallery-heading" className="font-display text-[clamp(3rem,6vw,5.5rem)] text-ivory">
              Moments at E-Cell
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted">
            Workshops, pitch nights, demos, and the people who make them happen.
          </p>
        </div>

        {photos.length === 0 ? (
          <p className="mt-10 border border-line bg-surface p-10 text-center text-muted">
            Photos from our events and initiatives will appear here soon.
          </p>
        ) : (
          <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {photos.map((p) => (
              <button
                key={p.uid}
                type="button"
                onClick={() => setActive(p)}
                aria-label={`View photo: ${p.alt}`}
                className="group mb-4 block w-full break-inside-avoid overflow-hidden border border-line bg-surface text-left transition hover:border-gold/50"
              >
                <span
                  className="relative block overflow-hidden bg-elev"
                  style={p.width && p.height ? { aspectRatio: `${p.width} / ${p.height}` } : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.src}
                    alt={p.alt}
                    loading="lazy"
                    decoding="async"
                    className={
                      p.width && p.height
                        ? "absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        : "block h-auto w-full transition duration-700 group-hover:scale-[1.03]"
                    }
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                </span>
                {p.caption && (
                  <span className="block border-t border-line px-4 py-3 text-sm text-muted">{p.caption}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              ref={dialog}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={active.alt}
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90svh] w-full max-w-5xl overflow-auto border border-line-strong bg-elev"
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close photo"
                className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-ink/80 text-ivory hover:bg-gold hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.src} alt={active.alt} className="mx-auto max-h-[80svh] w-auto max-w-full" />
              {active.caption && (
                <p className="border-t border-line px-5 py-4 text-muted">{active.caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
