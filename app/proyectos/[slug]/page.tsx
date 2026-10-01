import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { profile, projects } from "@/lib/data";
import ProjectPage from "@/app/components/ProjectPage";

// Página de cada proyecto: /proyectos/atenea-partners, /proyectos/kapricho… (se generan al compilar)

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/proyectos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${profile.shortName}`,
    description: project.description,
  };
}

export default async function Page({ params }: PageProps<"/proyectos/[slug]">) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  return <ProjectPage index={index} />;
}
