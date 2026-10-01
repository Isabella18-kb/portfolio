"use client";

import { Float } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import Stage from "./Stage";
import { CodeBrackets, CoffeeCup, CursorArrow, Keycap, RetroComputer, palette } from "./Objects";

// Objetos flotando alrededor del nombre de la portada. En pantallas estrechas (móvil, tablet en
// vertical) se encogen y se reparten en una franja encima del nombre y otra debajo, sin taparlo.
function Objects() {
  const { width, height } = useThree((s) => s.viewport);

  if (width < 8) {
    const s = Math.min(0.6, (width / 3.5) * 0.38); // tamaño según el ancho (0.38 en un móvil)
    const x = width * 0.3;
    const top = height * 0.36;
    const bottom = -height * 0.34;
    return (
      <>
        <Float speed={2.4} rotationIntensity={1.2} floatIntensity={0.8}>
          <Keycap letter="I" position={[-x, top, -0.5]} rotation={[0.9, 0.3, -0.25]} scale={s * 1.3} delay={0.6} />
        </Float>
        <Float speed={2} rotationIntensity={1} floatIntensity={0.8}>
          <CodeBrackets position={[x * 0.9, top - 0.2, -1]} rotation={[0.2, -0.5, -0.15]} scale={s} delay={0.5} />
        </Float>
        <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.6}>
          <RetroComputer position={[-x * 0.95, bottom, 0]} rotation={[0.1, 0.5, 0]} scale={s * 1.05} delay={0.2} />
        </Float>
        <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.6}>
          <CoffeeCup position={[x * 0.85, bottom - 0.3, 0.5]} rotation={[0.35, -0.4, 0.1]} scale={s * 1.5} delay={0.35} />
        </Float>
        <Float speed={1.6} rotationIntensity={0.8} floatIntensity={0.6}>
          <CursorArrow position={[-x * 0.05, bottom + 0.75, 1]} rotation={[0.3, 0.4, 0.35]} scale={s * 1.1} delay={0.8} />
        </Float>
      </>
    );
  }

  const k = Math.min(1, width / 14); // separación horizontal según el ancho
  const s = Math.min(1, width / 13); // tamaño
  return (
    <>
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.8}>
        <RetroComputer position={[-4.6 * k, -1.7, 0]} rotation={[0.1, 0.5, 0]} scale={s} delay={0.2} />
      </Float>
      {/* La taza va baja y a la derecha, por debajo del apellido: si sube, lo tapa */}
      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.5} floatingRange={[-0.15, 0.1]}>
        <CoffeeCup position={[5 * k, -3.2, 0.5]} rotation={[0.35, -0.4, 0.1]} scale={s * 0.95} delay={0.35} />
      </Float>
      <Float speed={2} rotationIntensity={1} floatIntensity={1.2}>
        <CodeBrackets position={[3.9 * k, 2.2, -1]} rotation={[0.2, -0.5, -0.15]} scale={s * 0.8} delay={0.5} />
      </Float>
      <Float speed={2.4} rotationIntensity={1.2} floatIntensity={1.4}>
        <Keycap letter="I" position={[-4.9 * k, 2.3, -0.5]} rotation={[0.9, 0.3, -0.25]} scale={s * 0.9} delay={0.6} />
      </Float>
      <Float speed={2.2} rotationIntensity={1.2} floatIntensity={1.4}>
        <Keycap
          letter="L"
          color={palette.burgundy}
          ink={palette.cream}
          position={[-2.2 * k, 2.9, -2]}
          rotation={[0.8, -0.4, 0.3]}
          scale={s * 0.75}
          delay={0.7}
        />
      </Float>
      <Float speed={1.6} rotationIntensity={0.8} floatIntensity={1}>
        <CursorArrow position={[1.6 * k, -2.5, 1]} rotation={[0.3, 0.4, 0.35]} scale={s * 0.8} delay={0.8} />
      </Float>
    </>
  );
}

export default function HeroScene({ className }: { className?: string }) {
  return (
    <Stage className={className}>
      <Objects />
    </Stage>
  );
}
