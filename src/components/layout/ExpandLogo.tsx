"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

/*
  A7 — logo header testuale "| T | L | L |" espandibile.
  Su mouseenter ogni iniziale rivela il resto della parola
  (T→RA, L→E, L→INEE): width 0→misurata + opacity 0→1, 0.8s power2.out;
  su mouseleave inverso in 0.6s power2.in.
*/
const PARTS: Array<[initial: string, rest: string]> = [
  ["T", "RA"],
  ["L", "E"],
  ["L", "INEE"],
];

export function ExpandLogo() {
  const rootRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reveals = Array.from(
      root.querySelectorAll<HTMLElement>(".logo-reveal")
    );
    const widths = reveals.map((el) => {
      el.style.width = "auto";
      const w = el.scrollWidth;
      el.style.width = "0px";
      return w;
    });

    const onEnter = () => {
      reveals.forEach((el, i) => {
        gsap.to(el, {
          width: widths[i],
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
        });
      });
    };
    const onLeave = () => {
      reveals.forEach((el) => {
        gsap.to(el, {
          width: 0,
          opacity: 0,
          x: -10,
          duration: 0.6,
          ease: "power2.in",
        });
      });
    };

    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    return () => {
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <Link
      href="/"
      ref={rootRef}
      className="hoverable flex items-baseline text-2xl font-medium tracking-tight"
      aria-label="Tra le linee — home"
    >
      {PARTS.map(([initial, rest], i) => (
        <span key={i} className="flex items-baseline">
          <span className="px-1">|</span>
          <span>{initial}</span>
          <span
            className="logo-reveal inline-block overflow-hidden whitespace-nowrap"
            style={{ width: 0, opacity: 0, transform: "translateX(-10px)" }}
            aria-hidden="true"
          >
            {rest}
          </span>
        </span>
      ))}
      <span className="px-1">|</span>
    </Link>
  );
}
