"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/lib/data";
import { lastProject } from "@/lib/lastProject";
import { usePageTransition } from "./PageTransition";

// Página de un proyecto (tipo caso de estudio): nombre gigante, captura dentro de una ventana de
// navegador, descripción, ficha y enlaces; al final, el siguiente proyecto en grande. Arriba, el
// botón para volver a los proyectos de la portada.

export default function ProjectPage({ index }: { index: number }) {
  const { navigate } = usePageTransition();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const number = (i: number) => String(i + 1).padStart(2, "0");
  const status = project.demo ? "En producción" : (project.status ?? "En desarrollo");
  const url = project.demo ? new URL(project.demo).host : `${project.slug}.dev`;

  // Al volver a la portada, el carrusel se queda en este proyecto
  useEffect(() => {
    lastProject.index = index;
  }, [index]);

  const link = (href: string, kicker: string, title: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href, { kicker, title });
  };

  return (
    <div className="min-h-svh bg-cream text-burgundy">
      <article className="mx-auto max-w-6xl px-5 pb-8 pt-24 md:px-10 md:pt-28">
        <Link
          href="/#proyectos"
          onClick={link("/#proyectos", "Volviendo a", "Proyectos")}
          className="group inline-flex items-center gap-3 rounded-full bg-burgundy py-1.5 pl-1.5 pr-5 font-bold text-cream shadow-lg transition hover:scale-[1.03]"
        >
          <span className="grid size-9 place-items-center rounded-full bg-cream text-lg text-burgundy transition-transform group-hover:-translate-x-1">←</span>
          Volver a proyectos
        </Link>

        <header className="mt-10 md:mt-14">
          <p className="animate-rise-in font-mono text-xs uppercase tracking-[0.3em] text-cherry [animation-delay:500ms]">
            Proyecto {number(index)} / {number(projects.length)} · {project.kicker} · {project.year}
          </p>
          <h1 className="mt-2 animate-rise-in font-condensed text-[17vw] font-black uppercase leading-[0.82] [animation-delay:580ms] md:text-[10vw]">
            {project.title}
          </h1>
        </header>

        {/* Captura dentro de una ventana de navegador */}
        <figure className="mt-8 animate-rise-in overflow-hidden rounded-2xl bg-ink shadow-[0_40px_80px_-30px_rgba(60,47,47,0.6)] ring-1 ring-burgundy/10 [animation-delay:680ms] md:mt-12">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-3 rounded-full bg-burgundy" />
              <span className="size-3 rounded-full bg-latte" />
              <span className="size-3 rounded-full bg-cream/30" />
            </span>
            <span className="mx-auto truncate rounded-full bg-cream/10 px-4 py-1 font-mono text-xs text-cream/70">{url}</span>
          </div>
          <div className="relative aspect-video">
            <Image src={project.image} alt={`Captura de ${project.title}`} fill priority sizes="(min-width: 1152px) 1100px, 95vw" className="object-cover" />
          </div>
        </figure>

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-[3fr_2fr] md:gap-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-cherry">Resumen</p>
            <p className="mt-3 text-2xl font-medium leading-snug md:text-3xl">{project.description}</p>
            {project.highlights && (
              <>
                <p className="mt-10 font-mono text-xs uppercase tracking-[0.3em] text-cherry">Funcionalidades clave</p>
                <ul className="mt-3">
                  {project.highlights.map((h, i) => (
                    <li key={h} className="flex gap-5 border-t border-burgundy/15 py-3 text-lg font-medium last:border-b">
                      <span className="pt-1 font-mono text-xs text-cherry">{number(i)}</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <dl className="self-start">
            {[
              ["Tipo", project.kicker],
              ["Año", project.year],
              ["Estado", status],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[6rem_1fr] gap-4 border-t border-burgundy/15 py-3">
                <dt className="font-mono text-xs uppercase tracking-widest text-cherry">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[6rem_1fr] gap-4 border-y border-burgundy/15 py-3">
              <dt className="font-mono text-xs uppercase tracking-widest text-cherry">Stack</dt>
              <dd className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-burgundy px-3 py-0.5 text-sm font-semibold text-cream">
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noreferrer" className="rounded-full bg-burgundy px-7 py-3.5 font-bold text-cream transition hover:scale-105">
              Ver web ↗
            </a>
          )}
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noreferrer" className="rounded-full border-2 border-burgundy px-7 py-3.5 font-bold transition hover:bg-burgundy hover:text-cream">
              Ver código ↗
            </a>
          )}
          {!project.demo && !project.repo && (
            <p className="rounded-full border-2 border-dashed border-burgundy/30 px-7 py-3.5 font-semibold text-burgundy/70">
              En desarrollo · demo disponible próximamente
            </p>
          )}
        </div>
      </article>

      {/* Siguiente proyecto, en grande */}
      <Link
        href={`/proyectos/${next.slug}`}
        onClick={link(`/proyectos/${next.slug}`, "Siguiente proyecto", next.title)}
        className="group mt-16 block rounded-t-[2rem] bg-burgundy px-5 pb-16 pt-10 text-cream md:rounded-t-[3rem] md:px-10 md:pb-24 md:pt-14"
      >
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-latte">
          {index === projects.length - 1 ? "Volver al primero" : "Siguiente proyecto"} →
        </span>
        <span className="mt-3 block font-condensed text-[15vw] font-black uppercase leading-[0.82] transition-transform duration-500 group-hover:translate-x-4 md:text-[9vw]">
          {next.title}
        </span>
      </Link>
    </div>
  );
}
