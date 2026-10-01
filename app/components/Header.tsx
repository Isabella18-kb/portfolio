"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { scrollToTarget } from "./SmoothScroll";
import { usePageTransition } from "./PageTransition";

// Barra fija arriba, mínima: iniciales a la izquierda y las secciones como pastillas a la derecha.
// En la portada baja hasta la sección; desde otra página (la de un proyecto) vuelve a la portada.
// En móvil y tableta, "Contacto" baja directamente al formulario: ahí va debajo de "Hablemos" y del
// contacto directo, y quien pulsa Contacto busca el formulario.
const links = [
  { href: "#proyectos", label: "Proyectos" },
  { href: "#sobre-mi", label: "Sobre mí" },
  { href: "#contacto", label: "Contacto" },
];

export default function Header() {
  const { navigate } = usePageTransition();
  const home = usePathname() === "/";

  function go(e: React.MouseEvent<HTMLAnchorElement>, href: string, label: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const toForm = href === "#contacto" && window.matchMedia("(max-width: 1023px)").matches;
    if (home && (toForm ? scrollToTarget("#formulario", false, -88) : scrollToTarget(href))) return;
    navigate(href === "#top" ? "/" : `/${toForm ? "#formulario" : href}`, { kicker: "Volviendo a", title: label });
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-4 sm:px-6">
      <Link
        href="/"
        onClick={(e) => go(e, "#top", "Inicio")}
        aria-label="Volver al inicio"
        className="pointer-events-auto grid size-11 place-items-center rounded-full bg-cream font-hand text-2xl font-bold leading-none text-burgundy shadow-lg ring-1 ring-burgundy/15 transition hover:rotate-[-8deg] hover:scale-110"
      >
        IL
      </Link>

      <nav className="pointer-events-auto">
        <ul className="flex gap-0.5 rounded-full bg-cream/90 p-1.5 shadow-lg ring-1 ring-burgundy/15 backdrop-blur sm:gap-1.5">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={`/${l.href}`}
                onClick={(e) => go(e, l.href, l.label)}
                className="block whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-burgundy transition hover:bg-burgundy hover:text-cream sm:px-4 sm:text-sm"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
