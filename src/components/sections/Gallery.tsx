"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { gallery, galleryCategories, type GalleryItem } from "@/config/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useDialogKeys, useScrollLock } from "@/lib/hooks";
import { cn, pad2 } from "@/lib/utils";

const filters = ["All", ...galleryCategories] as const;
type Filter = (typeof filters)[number];

const spans: Record<GalleryItem["size"], string> = {
  large: "col-span-2 row-span-2",
  wide: "col-span-2",
  tall: "row-span-2",
  square: "",
};

export function Gallery() {
  const [filter, setFilter] = useState<Filter>("All");
  const [index, setIndex] = useState<number | null>(null);
  const items = useMemo(() => (filter === "All" ? gallery : gallery.filter((g) => g.category === filter)), [filter]);

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="relative bg-ink py-24 sm:py-32 lg:py-40">
      <div className="container-x">
        <SectionHeading
          id="gallery-title"
          index="06"
          eyebrow="Gallery"
          lines={["Inside the", "experience."]}
          intro="Step onto the floor before you visit. Filter by space or training style, and open any image to view it full screen."
        />

        <div role="tablist" aria-label="Gallery categories" className="no-scrollbar -mx-4 mt-12 flex gap-1 overflow-x-auto px-4 lg:mt-16">
          {filters.map((f) => (
            <button
              key={f}
              role="tab"
              type="button"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "relative min-h-11 shrink-0 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] transition-colors",
                filter === f ? "text-chrome" : "text-mute hover:text-chrome",
              )}
            >
              {f}
              {filter === f && <motion.span layoutId="gallery-tab" className="absolute inset-x-3 bottom-0 h-[2px] bg-ember" />}
            </button>
          ))}
        </div>

        <motion.ul layout className="mt-8 grid grid-flow-dense auto-rows-[150px] grid-cols-2 gap-3 xs:auto-rows-[180px] md:auto-rows-[200px] md:grid-cols-4 lg:auto-rows-[230px] lg:gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.li
                layout
                key={item.src}
                className={spans[item.size]}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  className="group relative h-full w-full overflow-hidden bg-steel"
                >
                  <span className="absolute inset-0 block" data-reveal="mask">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes={item.size === "large" || item.size === "wide" ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                      className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110"
                    />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3 sm:p-4">
                    <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-silver sm:text-[0.65rem]">{item.category}</span>
                    <span className="flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-ember text-ink opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
                      <Expand className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>

      <AnimatePresence>
        {index !== null && <Lightbox items={items} index={index} setIndex={setIndex} />}
      </AnimatePresence>
    </section>
  );
}

function Lightbox({ items, index, setIndex }: { items: GalleryItem[]; index: number; setIndex: (i: number | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dir, setDir] = useState(1);
  const close = useCallback(() => setIndex(null), [setIndex]);
  const go = useCallback(
    (d: 1 | -1) => {
      setDir(d);
      setIndex((index + d + items.length) % items.length);
    },
    [index, items.length, setIndex],
  );
  useScrollLock(true);
  useDialogKeys(true, ref, close);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const item = items[index];

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-[90] flex flex-col bg-[#050505]/97 backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="container-x flex h-16 shrink-0 items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute">
          <span className="text-chrome tabular-nums">{pad2(index + 1)}</span> / {pad2(items.length)} · {item.category}
        </p>
        <button type="button" onClick={close} aria-label="Close image viewer" className="flex h-11 w-11 items-center justify-center border border-white/20 text-chrome hover:border-ember hover:text-ember">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={item.src}
            custom={dir}
            className="absolute inset-0 touch-pan-y px-4 sm:px-20"
            initial={{ x: `${dir * 8}%`, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: `${dir * -8}%`, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
          >
            <div className="relative h-full w-full">
              <Image src={item.src} alt={item.alt} fill sizes="100vw" className="pointer-events-none object-contain" draggable={false} />
            </div>
          </motion.div>
        </AnimatePresence>

        <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="absolute left-2 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/40 text-chrome hover:border-ember hover:text-ember sm:left-6 sm:flex">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next image" className="absolute right-2 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/40 text-chrome hover:border-ember hover:text-ember sm:right-6 sm:flex">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="container-x flex shrink-0 items-center justify-between gap-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="text-sm text-silver">{item.alt}</p>
        <div className="flex gap-2 sm:hidden">
          <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="flex h-11 w-11 items-center justify-center border border-white/20 text-chrome">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next image" className="flex h-11 w-11 items-center justify-center border border-white/20 text-chrome">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
