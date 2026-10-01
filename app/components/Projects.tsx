"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { projects } from "@/lib/data";
import { lastProject } from "@/lib/lastProject";

const LaptopScene = dynamic(() => import("./three/LaptopScene"), { ssr: false });

// Proyectos, al estilo del carrusel de CIRO Energy, en un estudio luminoso color crema.
// - Carrusel: cada proyecto es un portátil 3D; el elegido sube al pedestal y se abre. Se cambia con
//   las flechas, arrastrando, con el teclado o pulsando otro portátil.
// - "Ver proyecto" (o pulsar el portátil elegido) no cambia de página: el portátil se desplaza a la
//   derecha (en móvil, hacia arriba) y al lado aparece la información del proyecto. El mismo botón
//   pasa a ser "Cerrar" y devuelve el carrusel. Escape también lo cierra.

export default function Projects() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(() => lastProject.index);
  const [open, setOpen] = useState(false);
  const project = projects[active];
  const number = (i: number) => String(i + 1).padStart(2, "0");

  const go = (i: number) => setActive(Math.max(0, Math.min(projects.length - 1, i)));

  useEffect(() => {
    lastProject.index = active;
  }, [active]);

  // La escena 3D escucha los clics de toda la página, así que un clic en un botón también le llegaría
  // al portátil que haya detrás. Al pulsar un botón o enlace, la escena no hace caso durante un momento.
  const uiPressed = useRef(0);
  useEffect(() => {
    // En fase de captura, antes de que el clic llegue a la escena (que escucha en el body)
    const mark = (e: Event) => {
      if ((e.target as HTMLElement).closest?.("button, a, [data-panel]")) uiPressed.current = performance.now();
    };
    window.addEventListener("pointerdown", mark, true);
    window.addEventListener("click", mark, true);
    return () => {
      window.removeEventListener("pointerdown", mark, true);
      window.removeEventListener("click", mark, true);
    };
  }, []);
  const selectFromScene = (i: number) => {
    if (performance.now() - uiPressed.current < 500) return;
    if (i === active) setOpen((o) => !o);
    else if (!open) go(i);
  };

  // Teclado, mientras la sección ocupa el centro de la pantalla: flechas para cambiar de proyecto
  // (también con la información abierta) y Escape para cerrarla
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box || box.top > window.innerHeight / 2 || box.bottom < window.innerHeight / 2) return;
      if (e.key === "ArrowRight") setActive((a) => Math.min(projects.length - 1, a + 1));
      if (e.key === "ArrowLeft") setActive((a) => Math.max(0, a - 1));
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Arrastrar a los lados (solo con el carrusel cerrado)
  const dragFrom = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (!open) dragFrom.current = e.clientX;
  };
  const onPointerCancel = () => (dragFrom.current = null);
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragFrom.current === null) return;
    const dx = e.clientX - dragFrom.current;
    dragFrom.current = null;
    if (Math.abs(dx) > 60) {
      uiPressed.current = performance.now(); // que soltar al arrastrar no cuente como clic en un portátil
      setActive((a) => Math.max(0, Math.min(projects.length - 1, a + (dx < 0 ? 1 : -1))));
    }
  };

  const status = project.demo ? "En producción" : (project.status ?? "En desarrollo");
  const arrow =
    "grid size-11 place-items-center rounded-full border-2 border-burgundy/25 bg-cream/60 text-xl text-burgundy backdrop-blur transition hover:border-burgundy hover:bg-burgundy hover:text-cream disabled:opacity-25 md:size-14";
  const hidden = "pointer-events-none invisible";

  return (
    <section
      ref={ref}
      id="proyectos"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className="relative z-10 -mt-[2rem] h-svh min-h-[680px] touch-pan-y select-none overflow-hidden rounded-t-[2rem] bg-[#f3e4cf] text-burgundy md:-mt-[3rem] md:rounded-t-[3rem]"
    >
      {/* Estudio: foco de luz en el centro y un suelo algo más oscuro */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_42%,#fffaf2,transparent)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-b from-transparent to-latte/35" />

      {/* Palabra gigante al fondo */}
      <p
        aria-hidden
        className={`absolute inset-x-0 top-[15%] text-center font-condensed text-[20vw] font-black uppercase leading-none text-burgundy/[0.07] transition-opacity duration-700 md:top-[8%] md:text-[19vw] ${open ? "opacity-0" : ""}`}
      >
        Proyectos
      </p>

      <LaptopScene className="pointer-events-none absolute inset-0" active={active} open={open} onSelect={selectFromScene} />

      <header className="absolute inset-x-5 top-20 flex items-start justify-between font-mono text-xs uppercase tracking-[0.3em] text-cherry md:inset-x-10 md:top-24">
        <span>(02) — Proyectos</span>
        <span>
          {number(active)} / {number(projects.length)}
        </span>
      </header>

      {/* Flechas: solo con el carrusel cerrado */}
      <button
        onClick={() => go(active - 1)}
        disabled={active === 0}
        aria-label="Proyecto anterior"
        className={`${arrow} absolute bottom-[calc(2.6rem+2vh)] left-4 md:bottom-auto md:left-10 md:top-[45%] ${open ? hidden : ""}`}
      >
        ←
      </button>
      <button
        onClick={() => go(active + 1)}
        disabled={active === projects.length - 1}
        aria-label="Proyecto siguiente"
        className={`${arrow} absolute bottom-[calc(2.6rem+2vh)] right-4 md:bottom-auto md:right-10 md:top-[45%] ${open ? hidden : ""}`}
      >
        →
      </button>

      {/* Información del proyecto: a la izquierda en ordenador, debajo del portátil en móvil */}
      {open && (
        <div
          key={active}
          data-panel
          data-lenis-prevent
          className="absolute inset-x-4 bottom-[8.5rem] top-[38%] overflow-y-auto overscroll-contain rounded-3xl bg-cream/85 p-5 shadow-[0_30px_60px_-30px_rgba(60,47,47,0.5)] backdrop-blur md:inset-x-auto md:bottom-auto md:left-10 md:top-1/2 md:max-h-[70%] md:w-[44%] md:max-w-2xl md:-translate-y-1/2 md:overflow-visible md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none lg:left-16"
        >
          <p className="animate-rise-in font-mono text-xs uppercase tracking-[0.3em] text-cherry">
            {project.kicker} · {project.year}
          </p>
          <h2 className="mt-1 animate-rise-in font-condensed text-[13vw] font-black uppercase leading-[0.85] [animation-delay:60ms] md:text-[6vw] lg:text-[5vw]">
            {project.title}
          </h2>
          <p className="mt-4 animate-rise-in text-base font-medium leading-snug [animation-delay:120ms] md:mt-6 md:text-xl">
            {project.description}
          </p>

          {project.highlights && (
            <ul className="mt-5 animate-rise-in [animation-delay:180ms]">
              {project.highlights.map((h, i) => (
                <li key={h} className="flex gap-4 border-t border-burgundy/15 py-2 text-sm font-medium md:text-base">
                  <span className="pt-0.5 font-mono text-xs text-cherry">{number(i)}</span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex animate-rise-in flex-wrap items-center gap-1.5 [animation-delay:240ms]">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-burgundy px-3 py-0.5 text-sm font-semibold text-cream">
                {tag}
              </span>
            ))}
            <span className="ml-2 font-mono text-xs uppercase tracking-widest text-cherry">{status}</span>
          </div>

          {(project.demo || project.repo) && (
            <div className="mt-5 flex animate-rise-in flex-wrap gap-3 [animation-delay:300ms]">
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border-2 border-burgundy px-5 py-2 text-sm font-bold transition hover:bg-burgundy hover:text-cream"
                >
                  Ver web ↗
                </a>
              )}
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border-2 border-burgundy px-5 py-2 text-sm font-bold transition hover:bg-burgundy hover:text-cream"
                >
                  Ver código ↗
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Abajo: nombre del proyecto (solo cerrado), el botón que abre y cierra, y los puntos */}
      {/* La franja ocupa todo el ancho: que no tape las flechas (en móvil están a su altura) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[calc(1.5rem+2vh)] flex flex-col items-center px-4 text-center md:bottom-[calc(3rem+2vh)] [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        {!open && (
          <>
            <p key={`k${active}`} className="animate-rise-in font-mono text-xs uppercase tracking-[0.3em] text-cherry">
              {project.kicker}
            </p>
            <h2 key={`t${active}`} className="mt-1 animate-rise-in font-condensed text-[11vw] font-black uppercase leading-[0.85] md:text-[7vw] lg:text-[4.6vw]">
              {project.title}
            </h2>
          </>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="group mt-4 flex items-center gap-3 rounded-full bg-burgundy py-2 pl-6 pr-2 font-bold text-cream shadow-lg transition hover:scale-105"
        >
          {open ? "Cerrar" : "Ver proyecto"}
          <span
            className={`grid size-9 place-items-center rounded-full bg-cream text-burgundy transition-transform duration-300 ${
              open ? "rotate-0 group-hover:rotate-90" : "group-hover:rotate-[-45deg]"
            }`}
          >
            {open ? "✕" : "→"}
          </span>
        </button>
        <div className={`mt-4 flex gap-1.5 transition-opacity ${open ? "opacity-0" : ""}`} aria-hidden={open}>
          {projects.map((p, i) => (
            <button
              key={p.title}
              onClick={() => go(i)}
              tabIndex={open ? -1 : undefined}
              aria-label={`Ver ${p.title}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-12 bg-burgundy" : "w-5 bg-burgundy/20 hover:bg-burgundy/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
