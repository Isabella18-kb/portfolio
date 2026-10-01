import type { Metadata } from "next";
import { Archivo, Caveat, JetBrains_Mono } from "next/font/google";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import Header from "./components/Header";
import PageTransition from "./components/PageTransition";

// Evita que FontAwesome inyecte su CSS (ya lo importamos arriba)
config.autoAddCss = false;

// Titulares gigantes y texto: variable en peso y en anchura (la anchura da la versión condensada)
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Manuscrita, tipo rotulador (el "León Estrada" de la portada)
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

// Etiquetas pequeñas
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Isabella León",
  description: "Portfolio de Isabella León Estrada, desarrolladora web en Zaragoza.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${archivo.variable} ${caveat.variable} ${jetbrains.variable} antialiased`}>
      <body className="font-sans">
        <SmoothScroll />
        <PageTransition>
          <Header />
          <main>{children}</main>
        </PageTransition>
      </body>
    </html>
  );
}
