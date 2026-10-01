"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faClock, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { profile, socials } from "@/lib/data";
import InkLayer from "./InkLayer";
import { scrollToTarget } from "./SmoothScroll";
import ContactForm from "./ContactForm";

const ContactScene = dynamic(() => import("./three/ContactScene"), { ssr: false });


// Contacto (el "REACH OUT" del vídeo): "HABLEMOS" gigante con la tinta que sigue al ratón y objetos
// 3D alrededor. Debajo, el contacto directo y el formulario (ver ContactForm).

const github = socials.find((s) => s.label === "GitHub");

export default function Contact() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  }

  return (
    <section
      id="contacto"
      className="relative z-10 -mt-[2rem] overflow-hidden rounded-t-[2rem] bg-burgundy text-cream md:-mt-[3rem] md:rounded-t-[3rem]"
    >
      {/* Titular con tinta y objetos 3D */}
      <div className="relative flex min-h-[62svh] flex-col items-center justify-center px-4 pt-24 text-center md:min-h-[80svh]">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">
          <span data-ink className="inline-block text-latte">
            (04) — Contacto
          </span>
        </p>
        <h2 className="mt-4">
          <span data-ink className="inline-block text-[16vw] font-black uppercase leading-[0.85] tracking-[-0.05em]">
            Hablemos
          </span>
        </h2>
        <p className="mt-6">
          <span data-ink className="inline-block font-hand text-3xl font-bold text-latte md:text-5xl">
            Construyamos algo juntos
          </span>
        </p>
        <InkLayer ink="#fff4e6" text="#6d0f1f" className="z-10" />
        <ContactScene className="pointer-events-none absolute inset-0 z-20" />
      </div>

      <div className="relative z-30 mx-auto grid max-w-7xl gap-12 px-5 pb-20 md:px-10 md:pb-28 lg:grid-cols-[1fr_2fr] lg:gap-14">
        {/* --- Contacto directo */}
        <aside className="flex flex-col gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-latte">Contacto directo</p>

          <div className="rounded-3xl border-2 border-cream/15 p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cream/60">Email</p>
            <p className="mt-2 break-all text-lg font-bold md:text-xl">{profile.email}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={copyEmail}
                className="rounded-full bg-cream px-5 py-2 text-sm font-bold text-burgundy transition hover:scale-105"
              >
                {copied ? "Copiado ✓" : "Copiar email"}
              </button>
              <a
                href={`mailto:${profile.email}`}
                className="rounded-full border-2 border-cream/30 px-5 py-2 text-sm font-bold transition hover:border-cream"
              >
                Abrir correo ↗
              </a>
            </div>
          </div>

          <ul className="space-y-4 text-base">
            <li className="flex items-center gap-3">
              <span className="grid size-5 place-items-center">
                <span className="size-2.5 animate-pulse rounded-full bg-latte ring-4 ring-latte/25" />
              </span>
              Disponible para nuevas oportunidades
            </li>
            <li className="flex items-center gap-3">
              <FontAwesomeIcon icon={faClock} className="w-5 text-latte" />
              Respuesta en un plazo de 24–48 h
            </li>
            <li className="flex items-center gap-3">
              <FontAwesomeIcon icon={faLocationDot} className="w-5 text-latte" />
              {profile.location} · presencial o en remoto
            </li>
            {github && (
              <li>
                <a href={github.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 transition hover:text-latte">
                  <FontAwesomeIcon icon={faGithub} className="w-5 text-latte" />
                  <span className="underline decoration-cream/30 underline-offset-4">{github.href.replace("https://", "")}</span>
                </a>
              </li>
            )}
          </ul>
        </aside>

        {/* --- Formulario */}
        <ContactForm />
      </div>

      {/* Pie */}
      <footer className="relative z-30 flex flex-col gap-4 border-t border-cream/20 px-5 py-6 font-mono text-xs uppercase tracking-widest text-cream/70 md:flex-row md:items-center md:justify-between md:px-10">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span className="flex gap-6">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
              className="flex items-center gap-2 transition hover:text-cream"
            >
              <FontAwesomeIcon icon={s.icon} className="w-3.5" />
              {s.label}
            </a>
          ))}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("#top");
            }}
            className="transition hover:text-cream"
          >
            Arriba ↑
          </a>
        </span>
      </footer>
    </section>
  );
}
