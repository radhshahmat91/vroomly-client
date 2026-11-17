"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";
import type { CarImage } from "@/types";

export function CarGallery({ images, title }: { images: CarImage[]; title: string }) {
  const list = images.length ? images : [{ url: "" }];
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const go = useCallback((d: number) => setIndex((i) => (i + d + list.length) % list.length), [list.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, go]);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} className="group relative block aspect-[16/10] w-full overflow-hidden rounded-3xl bg-base-200" aria-label={`Open photo ${index + 1} of ${list.length} in full screen`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={index} className="absolute inset-0" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <SmartImage src={list[index].url} alt={`${title} — photo ${index + 1}`} priority className="size-full object-cover" />
          </motion.div>
        </AnimatePresence>
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-base-100/90 px-4 py-2 text-sm font-bold backdrop-blur transition-transform group-hover:scale-105">
          <Expand size={16} /> {list.length > 1 ? `${index + 1} / ${list.length}` : "Full screen"}
        </span>
      </button>

      {list.length > 1 && (
        <ul className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1" aria-label="Photo thumbnails">
          {list.map((img, i) => (
            <li key={`${img.url}-${i}`} className="shrink-0">
              <button type="button" onClick={() => setIndex(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === index} className={cn("block h-20 w-28 overflow-hidden rounded-xl ring-offset-2 ring-offset-base-100 transition", i === index ? "ring-2 ring-secondary" : "opacity-70 hover:opacity-100")}>
                <SmartImage src={img.url} alt="" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div className="fixed inset-0 z-[110] flex flex-col bg-black/95" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`${title} photos`}>
                <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
                  <p className="font-display text-xl font-bold">{title}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/70">{index + 1} / {list.length}</span>
                    <button className="btn btn-circle btn-ghost text-white" onClick={() => setOpen(false)} aria-label="Close full screen"><X size={22} /></button>
                  </div>
                </div>
                <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16" onClick={() => setOpen(false)}>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={index} className="flex max-h-full max-w-full items-center justify-center" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()}>
                      <SmartImage src={list[index].url} alt={`${title} — photo ${index + 1}`} className="max-h-[78vh] max-w-full rounded-2xl object-contain" />
                    </motion.div>
                  </AnimatePresence>
                  {list.length > 1 && (
                    <>
                      <button className="btn btn-circle absolute left-3 top-1/2 -translate-y-1/2 border-0 bg-white/15 text-white hover:bg-white/30" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo"><ChevronLeft size={24} /></button>
                      <button className="btn btn-circle absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-white/15 text-white hover:bg-white/30" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo"><ChevronRight size={24} /></button>
                    </>
                  )}
                </div>
                <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto px-4 py-4">
                  {list.map((img, i) => (
                    <button key={`${img.url}-${i}`} onClick={() => setIndex(i)} aria-label={`Show photo ${i + 1}`} className={cn("h-14 w-20 shrink-0 overflow-hidden rounded-lg transition", i === index ? "ring-2 ring-primary" : "opacity-50 hover:opacity-100")}>
                      <SmartImage src={img.url} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
