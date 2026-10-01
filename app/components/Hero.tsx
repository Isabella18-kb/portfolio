"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { profile } from "@/lib/data";
import InkLayer from "./InkLayer";

// La escena 3D solo existe en el navegador
const HeroScene = dynamic(() => import("./three/HeroScene"), { ssr: false });

// Portada: el nombre enorme ("ISABELLA" en negrita y "León Estrada" a rotulador, como el
// Butter + max del vídeo), la tinta crema que sigue al ratón y los objetos 3D flotando encima.
// Se queda fija mientras la siguiente sección sube y la tapa.
// Capas: textos → tinta (que los copia con los colores al revés) → objetos 3D.

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  // Entrada: cada línea sube desde debajo de su máscara
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-rise]", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 0.15 });
      gsap.from("[data-fade]", { opacity: 0, duration: 1, delay: 0.9 });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      id="top"
      className="sticky top-0 h-svh min-h-[560px] overflow-hidden bg-burgundy text-cream"
    >
      <div className="relative flex h-full flex-col items-center justify-center px-4">
        <p className="overflow-hidden">
          <span data-rise data-ink className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-latte sm:text-sm">
            Portfolio · {new Date().getFullYear()}
          </span>
        </p>

        <h1 className="mt-4 flex flex-col items-center leading-none">
          <span className="overflow-hidden px-[2vw] pb-[0.5vw]">
            <span
              data-rise
              data-ink
              className="inline-block text-[16.5vw] font-black uppercase leading-[0.82] tracking-[-0.05em]"
            >
              {profile.firstName}
            </span>
          </span>
          <span className="-mt-[3.5vw] self-end overflow-hidden pr-[4vw] md:pr-[8vw]">
            <span data-rise data-ink className="inline-block font-hand text-[9vw] font-bold leading-[1.1] text-latte">
              {profile.lastName}
            </span>
          </span>
        </h1>

        <p className="mt-6 overflow-hidden text-center md:mt-8">
          <span data-rise data-ink className="inline-block text-base font-medium sm:text-xl">
            {profile.role}
          </span>
        </p>

        {/* Pie de la portada */}
        <div data-fade className="absolute inset-x-4 bottom-5 flex items-end justify-between font-mono text-[11px] uppercase tracking-widest sm:inset-x-6 sm:text-xs">
          <span data-ink className="inline-block text-cream/70">
            Next.js · React · 3D
          </span>
          <span data-ink className="inline-block text-cream/70">
            Desliza ↓
          </span>
        </div>

        <InkLayer ink="#fff4e6" text="#6d0f1f" intro className="z-10" />
        <HeroScene className="pointer-events-none absolute inset-0 z-20" />
      </div>
    </section>
  );
}
