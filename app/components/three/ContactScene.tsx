"use client";

import { Float } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import Stage from "./Stage";
import { CursorArrow, Keycap, palette } from "./Objects";

// Junto al "HABLEMOS": la flecha del ratón a punto de pulsar y dos teclas. En pantallas estrechas se
// encogen y se van arriba y abajo del titular, para no taparlo.
function Objects() {
  const { width, height } = useThree((s) => s.viewport);
  const narrow = width < 8;
  const k = Math.min(1, width / 14);
  const s = narrow ? Math.min(0.7, (width / 3.5) * 0.42) : 1;

  return (
    <>
      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={narrow ? 0.6 : 1.2}>
        <CursorArrow
          position={narrow ? [width * 0.3, -height * 0.37, 1] : [4.2 * k, 0.6, 1]}
          rotation={[0.2, -0.5, 0.5]}
          scale={narrow ? 0.85 * s : 1.3}
        />
      </Float>
      <Float speed={2.2} rotationIntensity={1.2} floatIntensity={narrow ? 0.6 : 1.4}>
        <Keycap
          letter="@"
          position={narrow ? [-width * 0.28, -height * 0.35, 0] : [-4.6 * k, -1.2, 0]}
          rotation={[0.9, 0.4, -0.3]}
          scale={1.1 * s}
          delay={0.2}
        />
      </Float>
      <Float speed={2} rotationIntensity={1} floatIntensity={narrow ? 0.6 : 1}>
        <Keycap
          letter="↵"
          color={palette.espresso}
          ink={palette.cream}
          position={narrow ? [width * 0.25, height * 0.3, -1] : [-2.4 * k, 2.2, -1.5]}
          rotation={[0.7, -0.3, 0.3]}
          scale={0.8 * s}
          delay={0.35}
        />
      </Float>
    </>
  );
}

export default function ContactScene({ className }: { className?: string }) {
  return (
    <Stage className={className} strength={0.7}>
      <Objects />
    </Stage>
  );
}
