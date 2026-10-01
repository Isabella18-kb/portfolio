import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

// Todo el contenido del portfolio se edita desde aquí.

export const profile = {
  name: "Isabella León Estrada",
  shortName: "Isabella León", // título de la pestaña del navegador
  firstName: "Isabella",
  lastName: "León Estrada",
  role: "Desarrolladora Web",
  location: "Zaragoza",
  tagline: "Transformo ideas en aplicaciones web funcionales y visualmente cuidadas.",
  // Frase gigante que se revela palabra a palabra al hacer scroll
  manifesto:
    "Transformo las necesidades de cada negocio en soluciones digitales que impulsan sus ventas y simplifican su día a día, creando webs y herramientas a medida.",
  about: [
    "Soy Técnico Superior en Desarrollo de Aplicaciones Multiplataforma y trabajo principalmente con Next.js, TypeScript y Supabase. Me ocupo del ciclo completo de una aplicación web: modelado de datos, lógica de negocio, autenticación e interfaces responsivas.",
    "He desarrollado proyectos para negocios reales —un CRM con asistente de IA, una plataforma de captación de clientes y tiendas online—, trabajando con requisitos concretos y usuarios finales. Busco incorporarme a un equipo donde aportar desde el primer día y seguir creciendo profesionalmente.",
  ],
  email: "isabellaleon2207@gmail.com",
  facts: [
    { label: "Rol", value: "Desarrolladora web" },
    { label: "Stack", value: "Next.js, TypeScript, Supabase" },
    { label: "Formación", value: "Técnico Superior en DAM" },
    { label: "Ubicación", value: "Zaragoza · presencial o remoto" },
  ],
};

export type Project = {
  title: string;
  slug: string; // su dirección: /proyectos/slug
  kicker: string; // tipo de proyecto
  description: string;
  highlights?: string[]; // funcionalidades clave, en la página del proyecto
  tags: string[];
  year: string;
  image: string; // captura 16:9 dentro de /public
  color: string; // color de la carcasa de su portátil 3D
  ink: string; // color del logo de la tapa
  status?: string; // p. ej. "En proceso": sale en vez del enlace
  repo?: string;
  demo?: string;
};

export const projects: Project[] = [
  {
    title: "Atenea Partners",
    slug: "atenea-partners",
    kicker: "CRM · Consultoría",
    description:
      "CRM a medida para una consultora B2B que centraliza la gestión comercial en una sola herramienta: empresas, contactos, oportunidades de venta, agenda y tareas, con informes para seguir el estado del negocio en tiempo real.",
    highlights: [
      "Pipeline de oportunidades y cuadro de mando con métricas comerciales",
      "Asistente con IA que resume fichas de clientes y recomienda la siguiente acción",
      "Detección de registros duplicados y exportación de datos",
      "Autenticación y panel de administración sobre Supabase",
    ],
    tags: ["Next.js", "TypeScript", "Supabase", "Tailwind"],
    year: "2026",
    image: "/proyectos/atenea-partners.jpg",
    color: "#6d0f1f",
    ink: "#fff4e6",
    demo: "https://crmatenea.vercel.app",
  },
  {
    title: "Nelubsi",
    slug: "nelubsi",
    kicker: "Captación de clientes",
    description:
      "Plataforma de generación de leads que organiza un directorio de personas y empresas por sector, para que los profesionales identifiquen clientes potenciales que ya están buscando sus servicios.",
    highlights: [
      "Búsqueda y exploración del directorio por sectores",
      "Registro, inicio de sesión y panel de usuario",
      "Planes de suscripción",
    ],
    tags: ["Next.js", "TypeScript", "Supabase", "Tailwind"],
    year: "2026",
    image: "/proyectos/nelubsi.jpg",
    color: "#fff4e6",
    ink: "#6d0f1f",
    status: "En proceso",
  },
  {
    title: "Patricia Estrada",
    slug: "patricia-estrada",
    kicker: "Tienda online",
    description:
      "Tienda online para una marca de bolsos, joyería y accesorios. El diseño da protagonismo a la fotografía de producto y simplifica la navegación por el catálogo para que la compra requiera el menor número de pasos posible.",
    highlights: [
      "Catálogo organizado en categorías y subcategorías",
      "Fichas de producto con URLs legibles",
      "Carrito de compra",
    ],
    tags: ["Next.js", "TypeScript", "Tailwind"],
    year: "2026",
    image: "/proyectos/patricia-estrada.jpg",
    color: "#be9b7b",
    ink: "#3c2f2f",
    status: "En proceso",
  },
  {
    title: "Kapricho",
    slug: "kapricho",
    kicker: "Personal shopper",
    description:
      "Web para un servicio de personal shopper que conecta a clientes en Colombia con marcas españolas de moda, cosmética y cuidado personal. Proyecto publicado y en producción.",
    tags: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
    year: "2026",
    image: "/proyectos/kapricho.jpg",
    color: "#3c2f2f",
    ink: "#be9b7b",
    demo: "https://kapricho.vercel.app",
  },
  {
    title: "SpotiFake",
    slug: "spotifake",
    kicker: "Streaming de música",
    description:
      "Aplicación de streaming musical inspirada en Spotify, desarrollada en equipo con un flujo de trabajo colaborativo en GitHub. Permite reproducir, organizar y descubrir música desde el navegador, con Supabase como backend.",
    tags: ["Next.js", "TypeScript", "Supabase", "Tailwind"],
    year: "2026",
    image: "/proyectos/spotifake.jpg",
    color: "#854442",
    ink: "#fff4e6",
    repo: "https://github.com/CeciliaFerraz14/Spotifake",
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Frontend", items: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind"] },
  { group: "Backend y datos", items: ["Java", "C#", "Dart", "Node.js", "SQL", "MySQL", "Supabase"] },
  { group: "Móvil y herramientas", items: ["Flutter", "Android", "Git", "GitHub", "VS Code", "Vercel", "Figma"] },
];

export const socials: { label: string; href: string; icon: IconDefinition }[] = [
  { label: "GitHub", href: "https://github.com/Isabella18-kb", icon: faGithub },
  { label: "Email", href: `mailto:${profile.email}`, icon: faEnvelope },
];
