import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-svh flex-col items-center justify-center bg-burgundy px-6 text-center text-cream">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-latte">Error 404</p>
      <h1 className="mt-2 text-[22vw] font-black leading-none tracking-[-0.05em] md:text-[14vw]">Ups</h1>
      <p className="font-hand text-3xl font-bold text-latte md:text-4xl">Esta página no existe o se ha movido</p>
      <Link
        href="/"
        className="mt-10 rounded-full bg-cream px-8 py-3 font-bold text-burgundy transition hover:scale-105"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
