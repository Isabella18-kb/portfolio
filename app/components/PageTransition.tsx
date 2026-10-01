"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { scrollToTarget } from "./SmoothScroll";

// Transición entre páginas (portada ⇄ página de un proyecto): una cortina en dos capas (latte y
// borgoña) sube y tapa la pantalla mostrando a dónde se va; con la pantalla tapada se cambia de página
// y la cortina sigue subiendo hasta descubrir la nueva.

type Label = { kicker: string; title: string };

const COVER_MS = 750;
const REVEAL_MS = 700;

const Ctx = createContext<{ navigate: (href: string, label?: Label) => void }>({ navigate: () => {} });

export const usePageTransition = () => useContext(Ctx);

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">("idle");
  const [label, setLabel] = useState<Label | undefined>();
  const pending = useRef<string | null>(null);

  const navigate = useCallback(
    (href: string, next?: Label) => {
      if (pending.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
      pending.current = href;
      setLabel(next);
      setPhase("cover");
      // Con un # la página nueva no sube arriba: se va a esa sección al llegar
      setTimeout(() => router.push(href, { scroll: !href.includes("#") }), COVER_MS);
    },
    [router]
  );

  // Al llegar a la página nueva: ir a su sección (si la hay) y descubrirla
  useEffect(() => {
    const href = pending.current;
    if (!href) return;
    pending.current = null;
    const hash = href.split("#")[1];
    // El scroll suave recuerda la posición de la página anterior: hay que colocarlo a mano, y otra vez
    // un momento después por si el navegador o el router lo han movido al terminar de pintar
    const place = () => scrollToTarget(hash ? `#${hash}` : "#top", true, hash === "formulario" ? -88 : 0);
    const timers = [
      setTimeout(place, 0),
      setTimeout(() => {
        place();
        setPhase("reveal");
      }, 150),
      setTimeout(() => setPhase("idle"), 150 + REVEAL_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [pathname]);

  return (
    <Ctx.Provider value={{ navigate }}>
      {children}
      {phase !== "idle" && (
        <div aria-hidden className="fixed inset-0 z-[70]">
          <div className={`absolute inset-0 bg-latte ${phase === "cover" ? "animate-curtain-in" : "animate-curtain-out [animation-delay:90ms]"}`} />
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center bg-burgundy px-6 text-center text-cream ${
              phase === "cover" ? "animate-curtain-in [animation-delay:90ms]" : "animate-curtain-out"
            }`}
          >
            {label && (
              <>
                <p className="animate-rise-in font-mono text-xs uppercase tracking-[0.3em] text-latte [animation-delay:300ms]">{label.kicker}</p>
                <p className="mt-3 animate-rise-in font-condensed text-[16vw] font-black uppercase leading-[0.85] [animation-delay:380ms] md:text-[9vw]">
                  {label.title}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
