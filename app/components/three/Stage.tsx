"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";

// Lienzo 3D común: luces de estudio (hechas con Lightformers, sin descargar mapas de entorno) para
// que el cromo y el plástico brillen, y un "rig" que inclina toda la escena hacia el ratón.
// Solo se dibuja mientras se ve en pantalla.

// Los lienzos escuchan el ratón en toda la página, así que un clic en cualquier sitio (p. ej. en el
// formulario, con el carrusel fuera de la pantalla) podría "tocar" un objeto. Un evento solo cuenta si
// ha ocurrido dentro del propio lienzo, medido en el momento (la posición que guarda la escena puede
// estar desfasada por el scroll suave).
export function useIsInside() {
  const canvas = useThree((s) => s.gl.domElement);
  return (e: ThreeEvent<MouseEvent | PointerEvent>) => {
    const r = canvas.getBoundingClientRect();
    const { clientX: x, clientY: y } = e.nativeEvent;
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };
}

function Rig({ strength, children }: { strength: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, state.pointer.x * 0.25 * strength, 0.05);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -state.pointer.y * 0.15 * strength, 0.05);
    g.position.x = THREE.MathUtils.lerp(g.position.x, state.pointer.x * 0.3 * strength, 0.05);
  });
  return <group ref={ref}>{children}</group>;
}

export default function Stage({
  children,
  strength = 1,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number; // cuánto sigue la escena al ratón
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 12], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        frameloop={visible ? "always" : "never"}
        // Los eventos del ratón se escuchan en toda la página, así la escena reacciona aunque haya
        // textos o la tinta por encima
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 6]} intensity={2.2} />
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={5} position={[0, 6, -4]} scale={[12, 2, 1]} />
          <Lightformer form="rect" intensity={2.5} color="#fff4e6" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} />
          <Lightformer form="ring" intensity={4} color="#be9b7b" position={[5, 3, 5]} scale={3} />
          <Lightformer form="rect" intensity={2} color="#6d0f1f" position={[6, -2, -2]} rotation-y={-Math.PI / 2} scale={[10, 6, 1]} />
          <Lightformer form="rect" intensity={1.5} position={[0, -6, 2]} rotation-x={-Math.PI / 2} scale={[12, 4, 1]} />
        </Environment>
        <Rig strength={strength}>{children}</Rig>
      </Canvas>
    </div>
  );
}
