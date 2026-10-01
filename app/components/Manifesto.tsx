"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

// La frase gigante (el "Buttermax is a digital studio…" del vídeo). Sube tapando la portada y, mientras
// se hace scroll, sus palabras se van encendiendo una a una. La sección es más alta que la pantalla y
// el texto se queda fijo en el centro hasta que se ha leído entero.

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const words = profile.manifesto.split(" ");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top 20%", end: "bottom bottom", scrub: 0.5 },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative z-10 h-[260vh] rounded-t-[2rem] bg-cream text-burgundy md:rounded-t-[3rem]">
      <div className="sticky top-0 flex h-svh flex-col justify-center px-5 md:px-10">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-cherry md:mb-10">(01) — Perfil profesional</p>
        <p className="font-condensed text-[11.5vw] font-black uppercase leading-[0.88] tracking-[-0.01em] md:text-[6.4vw]">
          {words.map((word, i) => (
            <span key={i}>
              <span data-word className="inline-block">
                {word}
              </span>{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
