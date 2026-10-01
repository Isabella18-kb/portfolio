"use client";

import { useState } from "react";
import { profile } from "@/lib/data";
import { sendMessage } from "@/lib/sendMessage";

// Formulario de contacto: una tarjeta crema que se levanta sobre el fondo borgoña (sombra dura en
// latte), con una cabecera y las preguntas ordenadas como una tabla: número y enunciado a la
// izquierda, campo a la derecha. Los campos tienen solo una línea debajo, que se dibuja entera al
// escribir en ellos. Al enviarlo, la tarjeta muestra el agradecimiento.

const topics = ["Oferta de empleo", "Proyecto", "Colaboración"];
type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [topic, setTopic] = useState(topics[0]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get("botcheck")) return; // campo trampa: solo lo rellenan los bots
    const sender = String(data.get("nombre")).trim();
    setStatus("sending");
    const failure = await sendMessage({
      name: sender,
      company: String(data.get("empresa")).trim(),
      email: String(data.get("email")).trim(),
      topic,
      message: String(data.get("mensaje")).trim(),
    });
    if (failure) {
      setError(failure);
      setStatus("error");
      return;
    }
    setName(sender.split(" ")[0]);
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <Card title="Mensaje enviado">
      <div role="status" className="flex animate-rise-in flex-col items-start gap-6 px-6 py-12 md:px-10 md:py-16">
                <p className="font-condensed text-6xl font-black uppercase leading-[0.9] md:text-8xl">Gracias, {name}.</p>
        <p className="max-w-md text-lg text-burgundy/70">He recibido tu mensaje y te responderé en un plazo de 24–48 horas.</p>
        <button
          onClick={() => setStatus("idle")}
          className="rounded-full border-2 border-burgundy/25 px-6 py-2.5 font-bold transition hover:border-burgundy"
        >
          Enviar otro mensaje
        </button>
      </div>
      </Card>
    );
  }

  return (
    <Card title="Nuevo mensaje">
    <form onSubmit={onSubmit} aria-busy={status === "sending"}>
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <Row n="01" label="¿Cómo te llamas?">
        <Line name="nombre" placeholder="Nombre y apellidos" autoComplete="name" required />
      </Row>
      <Row n="02" label="¿Cuál es tu email?">
        <Line name="email" type="email" placeholder="nombre@empresa.com" autoComplete="email" required />
      </Row>
      <Row n="03" label="¿De qué empresa?" hint="Opcional">
        <Line name="empresa" placeholder="Empresa u organización" autoComplete="organization" />
      </Row>
      <Row n="04" label="¿Sobre qué quieres hablar?">
        <div role="radiogroup" aria-label="Motivo" className="flex flex-wrap gap-2 pt-1">
          {topics.map((t) => (
            <label
              key={t}
              className={`cursor-pointer rounded-full border px-5 py-2 text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-burgundy/30 ${
                topic === t ? "border-burgundy bg-burgundy text-cream" : "border-burgundy/25 hover:border-burgundy"
              }`}
            >
              <input type="radio" name="motivo" value={t} checked={topic === t} onChange={() => setTopic(t)} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </Row>
      <Row n="05" label="Tu mensaje">
        <Line name="mensaje" placeholder="Cuéntame brevemente el puesto, el proyecto o la propuesta" textarea required />
      </Row>

      <div className="flex flex-col gap-5 bg-[#f6e8d6] px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
        {status === "error" ? (
          <p role="alert" className="text-sm">
            No se pudo enviar ({error}). Escríbeme a{" "}
            <a href={`mailto:${profile.email}`} className="font-bold underline">
              {profile.email}
            </a>
            .
          </p>
        ) : (
          <p className="text-sm text-burgundy/60">Respuesta en un plazo de 24–48 h.</p>
        )}
        <button
          type="submit"
          disabled={status === "sending"}
          className="group flex shrink-0 items-center justify-center gap-4 rounded-full bg-burgundy py-3 pl-8 pr-3 text-lg font-bold text-cream transition hover:scale-[1.03] disabled:opacity-70"
        >
          {status === "sending" ? "Enviando…" : "Enviar mensaje"}
          <span className="grid size-10 place-items-center rounded-full bg-cream text-burgundy transition-transform duration-300 group-hover:rotate-[-45deg]">
            {status === "sending" ? (
              <span className="size-4 animate-spin-slow rounded-full border-2 border-burgundy/25 border-t-burgundy" />
            ) : (
              "→"
            )}
          </span>
        </button>
      </div>
    </form>
    </Card>
  );
}

// La tarjeta: crema, con la sombra dura en latte y una cabecera borgoña
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div id="formulario" className="scroll-mt-24 overflow-hidden rounded-[2rem] bg-cream text-burgundy shadow-[10px_10px_0_var(--latte)] md:shadow-[16px_16px_0_var(--latte)]">
      <div className="flex items-center justify-between gap-4 bg-wine px-6 py-5 text-cream md:px-10">
        <p className="font-condensed text-3xl font-black uppercase leading-none md:text-4xl">Envíame un mensaje</p>
        <p className="hidden font-mono text-[11px] uppercase tracking-[0.3em] text-latte sm:block">{title}</p>
      </div>
      {children}
    </div>
  );
}

// Una pregunta: su número y el enunciado a la izquierda, el campo a la derecha
function Row({ n, label, hint, children }: { n: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 border-b border-burgundy/10 px-6 py-6 transition-colors focus-within:bg-white/50 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8 md:px-10">
      <p className="flex items-baseline gap-4">
        <span className="font-mono text-xs text-cherry">{n}</span>
        <span className="text-lg font-semibold md:text-xl">
          {label}
          {hint && <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.25em] text-burgundy/40">{hint}</span>}
        </span>
      </p>
      <div>{children}</div>
    </div>
  );
}

// Campo con una sola línea debajo, que se completa de izquierda a derecha al escribir en él
function Line({
  name,
  placeholder,
  type = "text",
  autoComplete,
  required,
  textarea,
}: {
  name: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const input =
    "peer block w-full bg-transparent pb-2 text-xl font-medium text-burgundy outline-none placeholder:text-burgundy/30 md:text-2xl";
  return (
    <label className="relative block border-b border-burgundy/20">
      <span className="sr-only">{placeholder}</span>
      {textarea ? (
        <textarea name={name} required={required} rows={3} placeholder={placeholder} className={`${input} resize-none`} />
      ) : (
        <input name={name} type={type} required={required} autoComplete={autoComplete} placeholder={placeholder} className={input} />
      )}
      <span
        aria-hidden
        className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-burgundy transition-transform duration-500 ease-out peer-focus:scale-x-100"
      />
    </label>
  );
}
