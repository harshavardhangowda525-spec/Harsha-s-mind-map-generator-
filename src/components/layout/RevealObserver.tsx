"use client";

import { useEffect } from "react";

/**
 * Adds `.is-in` to every [data-reveal] element once it enters the viewport.
 *
 * Mask-style reveals start fully clipped (clip-path), which some browsers
 * treat as zero-area for IntersectionObserver — so for those we observe the
 * parent element instead. One shared observer keeps this cheap; a
 * MutationObserver picks up elements rendered later (e.g. filtered gallery).
 */
export function RevealObserver() {
  useEffect(() => {
    const targets = new Map<Element, HTMLElement[]>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          targets.get(e.target)?.forEach((t) => t.classList.add("is-in"));
          targets.delete(e.target);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    const watch = (el: HTMLElement) => {
      if (el.classList.contains("is-in")) return;
      const kind = el.dataset.reveal ?? "";
      const observed = kind.startsWith("mask") || kind === "line" ? el.parentElement ?? el : el;
      const list = targets.get(observed);
      if (list) {
        if (!list.includes(el)) list.push(el);
      } else {
        targets.set(observed, [el]);
        io.observe(observed);
      }
    };
    const scan = (root: ParentNode) => root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(watch);
    scan(document);
    const mo = new MutationObserver((muts) => {
      for (const m of muts)
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches("[data-reveal]")) watch(n);
          scan(n);
        });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
