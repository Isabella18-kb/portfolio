import Hero from "./components/Hero";
import Manifesto from "./components/Manifesto";
import Projects from "./components/Projects";
import About from "./components/About";
import Contact from "./components/Contact";

// Todo el portfolio en una página. La portada se queda fija y la frase gigante sube tapándola; a
// partir de ahí cada sección sube, con las esquinas redondeadas, por encima del final de la anterior.
export default function Home() {
  return (
    <>
      <div className="relative">
        <Hero />
        <Manifesto />
      </div>
      <Projects />
      <About />
      <Contact />
    </>
  );
}
