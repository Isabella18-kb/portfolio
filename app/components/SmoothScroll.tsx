"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Scroll suave de toda la página (Lenis), sincronizado con las animaciones de scroll de GSAP.
// Con "reducir movimiento" activado se deja el scroll normal del navegador.

let lenis: Lenis | null = null;

// Ir a una sección (o arriba del todo con "#top") con el scroll suave, o de golpe con "immediate".
// "offset" deja ese margen por encima (p. ej. para que no la tape el menú). Devuelve false si la
// sección no está en esta página.
export function scrollToTarget(target: string, immediate = false, offset = 0) {
  const el = target === "#top" ? 0 : document.querySelector<HTMLElement>(target);
  if (el === null) return false;
  // Tras cambiar de página el alto guardado es el de la anterior: se vuelve a medir antes de saltar
  if (immediate) lenis?.resize();
  if (lenis) lenis.scrollTo(el, immediate ? { immediate: true, force: true, offset } : { duration: 1.6, offset });
  else window.scrollTo({ top: el === 0 ? 0 : el.getBoundingClientRect().top + window.scrollY + offset });
  return true;
}

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    lenis = new Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
