"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile, skills } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

// Sobre mí: texto y ficha a la izquierda y a la derecha, y debajo las habilidades en tres cintas de
// palabras gigantes que se desplazan de lado al hacer scroll (una sí y otra no, en sentido contrario).

export default function About() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-belt]").forEach((belt, i) => {
        gsap.fromTo(
          belt,
          { xPercent: i % 2 ? -30 : 0 },
          {
            xPercent: i % 2 ? 0 : -30,
            ease: "none",
            scrollTrigger: { trigger: belt, start: "top bottom", end: "bottom top", scrub: 0.6 },
          }
        );
      });
      gsap.from("[data-fact]", {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-facts]", start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      id="sobre-mi"
      className="relative z-10 -mt-[2rem] overflow-hidden rounded-t-[2rem] bg-cream pb-24 pt-20 text-burgundy md:-mt-[3rem] md:rounded-t-[3rem] md:pt-28"
    >
      <div className="px-5 md:px-10">
        <header className="flex items-end justify-between gap-6 border-b border-burgundy/20 pb-6">
          <h2 className="font-condensed text-[18vw] font-black uppercase leading-[0.8] md:text-[12vw]">Sobre mí</h2>
          <p className="shrink-0 pb-2 font-mono text-xs uppercase tracking-[0.3em] text-cherry">(03)</p>
        </header>

        <div className="mt-12 grid gap-12 md:grid-cols-[3fr_2fr] md:gap-20">
          <div className="space-y-6 text-xl font-medium leading-snug md:text-3xl">
            {profile.about.map((p, i) => (
              <p key={i} className={i ? "text-burgundy/70" : ""}>
                {p}
              </p>
            ))}
          </div>

          <dl data-facts className="self-end">
            {profile.facts.map((f) => (
              <div key={f.label} data-fact className="grid grid-cols-[7rem_1fr] gap-4 border-t border-burgundy/20 py-4">
                <dt className="font-mono text-xs uppercase tracking-widest text-cherry">{f.label}</dt>
                <dd className="font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Habilidades */}
      <div className="mt-20 space-y-2 md:mt-28">
        {skills.map((group, i) => (
          <div key={group.group} className={`overflow-hidden py-2 ${i === 1 ? "bg-burgundy text-cream" : ""}`}>
            <p className="sr-only">
              {group.group}: {group.items.join(", ")}
            </p>
            <div data-belt aria-hidden className="flex w-max gap-[4vw] whitespace-nowrap">
              {/* El grupo repetido para que la cinta no se quede nunca vacía */}
              {[0, 1, 2].map((copy) => (
                <span key={copy} className="flex items-center gap-[4vw]">
                  <span className={`font-hand text-[7vw] font-bold leading-none md:text-[4.5vw] ${i === 1 ? "text-latte" : "text-cherry"}`}>
                    {group.group}
                  </span>
                  {group.items.map((item) => (
                    <span key={item} className="font-condensed text-[12vw] font-black uppercase leading-[0.95] md:text-[8vw]">
                      {item}
                      <span className="ml-[4vw] text-latte">✦</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
