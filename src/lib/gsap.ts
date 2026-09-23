"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

/**
 * Hook to automatically animate children elements with smooth GSAP transition.
 * Targets elements with classes like `.gsap-fade-up`, `.gsap-stagger-item`, etc.
 */
export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  options: {
    stagger?: number;
    delay?: number;
    duration?: number;
    y?: number;
  } = {},
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate elements with `.gsap-fade-up`
      const fadeElements =
        containerRef.current?.querySelectorAll(".gsap-fade-up");
      if (fadeElements && fadeElements.length > 0) {
        gsap.fromTo(
          fadeElements,
          {
            opacity: 0,
            y: options.y ?? 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: options.duration ?? 0.6,
            delay: options.delay ?? 0.05,
            stagger: options.stagger ?? 0.08,
            ease: "power2.out",
          },
        );
      }

      // Animate elements with `.gsap-scale-in`
      const scaleElements =
        containerRef.current?.querySelectorAll(".gsap-scale-in");
      if (scaleElements && scaleElements.length > 0) {
        gsap.fromTo(
          scaleElements,
          {
            opacity: 0,
            scale: 0.95,
          },
          {
            opacity: 1,
            scale: 1,
            duration: options.duration ?? 0.65,
            delay: (options.delay ?? 0.05) + 0.1,
            ease: "power2.out",
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [options.stagger, options.delay, options.duration, options.y]);

  return containerRef;
}
