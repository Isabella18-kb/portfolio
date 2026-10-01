"use client";

import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, RoundedBox, useTexture } from "@react-three/drei";
import { projects } from "@/lib/data";
import Stage, { useIsInside } from "./Stage";

// Proyectos como portátiles 3D (inspirado en el carrusel de CIRO Energy). Cada portátil tiene la
// carcasa en un color de la web y la captura del proyecto en la pantalla. En el carrusel el elegido
// sube al pedestal y se abre; los demás esperan cerrados a los lados. Al abrir un proyecto (open),
// todo se desplaza a la derecha (en móvil, hacia arriba) para dejar sitio a su información, el
// portátil se gira un poco hacia ella y los demás desaparecen.

type Props = {
  active: number;
  onSelect: (index: number) => void;
  open: boolean;
};

const damp = THREE.MathUtils.damp;
const W = 3.2; // ancho
const D = 2.2; // fondo de la base
const LID = 2.05; // alto de la tapa
const OPEN = -0.3; // tapa abierta, algo echada hacia atrás
const CLOSED = Math.PI / 2; // tapa cerrada sobre la base
const TILT = 0.28; // inclinación hacia la cámara, para que se vea el teclado

// Tamaño según el ancho de la vista: el portátil (y su pedestal) ocupa como mucho el 72%; en móvil
// (vista vertical, menos de 8 unidades de ancho) algo menos, el 60%
const fitTo = (viewportWidth: number) => Math.min(1, (viewportWidth * (viewportWidth < 8 ? 0.6 : 0.72)) / W);

// Teclado y trackpad, dibujados en una textura (más ligero que cientos de teclas en 3D)
function useKeyboard() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 700;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#1c1818";
    ctx.fillRect(0, 0, 1024, 700);
    const key = (x: number, y: number, w: number) => {
      ctx.fillStyle = "#2c2626";
      ctx.beginPath();
      ctx.roundRect(x, y, w, 52, 9);
      ctx.fill();
    };
    for (let row = 0; row < 5; row++) {
      const y = 40 + row * 64;
      for (let col = 0; col < 14; col++) key(40 + col * 68, y, 58);
    }
    key(250, 40 + 5 * 64, 520); // espacio
    // Trackpad
    ctx.fillStyle = "#262121";
    ctx.beginPath();
    ctx.roundRect(362, 470, 300, 190, 18);
    ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }, []);
}

function Laptop({ index, active, open, onSelect, keyboard }: Props & { index: number; keyboard: THREE.Texture }) {
  const project = projects[index];
  const screen = useTexture(project.image, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });

  const group = useRef<THREE.Group>(null);
  const isInside = useIsInside();
  const lid = useRef<THREE.Group>(null);
  const { width } = useThree((s) => s.viewport);
  const fit = fitTo(width);
  // En pantallas estrechas los de los lados se apartan más, para que solo asome su borde
  const gap = width < 8 ? width * 0.66 : Math.min(3.7, width * 0.27);

  useFrame((state, dt) => {
    const g = group.current;
    const l = lid.current;
    if (!g || !l) return;
    const o = index - active;
    const isActive = o === 0;
    const t = state.clock.elapsedTime;

    const x = o * gap;
    const y = isActive ? -0.4 : Math.sin(t * 1.3 + index * 1.7) * 0.08;
    const z = -Math.abs(o) * 1.6;
    const ry = isActive ? (open ? -0.4 + Math.sin(t * 0.6) * 0.06 : Math.sin(t * 0.6) * 0.18) : -o * 0.45;
    const rz = isActive ? 0 : o * 0.06;
    const scale = (isActive ? 1 : open ? 0.001 : 0.78) * fit;

    g.position.set(damp(g.position.x, x, 5, dt), damp(g.position.y, y, 5, dt), damp(g.position.z, z, 5, dt));
    g.rotation.y = damp(g.rotation.y, ry, 5, dt);
    g.rotation.z = damp(g.rotation.z, rz, 5, dt);
    g.scale.setScalar(damp(g.scale.x, scale, 5, dt));
    // El elegido se abre; los demás se cierran
    l.rotation.x = damp(l.rotation.x, isActive ? OPEN : CLOSED, isActive ? 3 : 5, dt);
  });

  const shell = (
    <meshPhysicalMaterial color={project.color} roughness={0.32} metalness={0.45} clearcoat={0.6} clearcoatRoughness={0.2} />
  );

  return (
    <group
      ref={group}
      rotation-x={TILT}
      onClick={(e) => {
        e.stopPropagation();
        if (isInside(e)) onSelect(index);
      }}
      onPointerOver={(e) => {
        if (isInside(e)) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      {/* Base con el teclado */}
      <RoundedBox args={[W, 0.14, D]} radius={0.06} smoothness={4}>
        {shell}
      </RoundedBox>
      <mesh position={[0, 0.071, 0.02]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[W - 0.3, D - 0.25]} />
        <meshStandardMaterial map={keyboard} roughness={0.7} />
      </mesh>

      {/* Tapa: gira sobre el borde de atrás de la base */}
      <group ref={lid} position={[0, 0.07, -D / 2 + 0.04]} rotation-x={CLOSED}>
        <RoundedBox args={[W, LID, 0.08]} radius={0.05} smoothness={4} position={[0, LID / 2, 0]}>
          {shell}
        </RoundedBox>
        {/* Marco y pantalla, en la cara de dentro */}
        <mesh position={[0, LID / 2, 0.041]}>
          <planeGeometry args={[W - 0.1, LID - 0.1]} />
          <meshStandardMaterial color="#0f0c0c" roughness={0.3} />
        </mesh>
        <mesh position={[0, LID / 2 + 0.04, 0.043]}>
          <planeGeometry args={[W - 0.28, (W - 0.28) * (9 / 16)]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
        {/* Logo en la cara de fuera */}
        <mesh position={[0, LID / 2, -0.041]} rotation-y={Math.PI}>
          <circleGeometry args={[0.22, 48]} />
          <meshStandardMaterial color={project.ink} metalness={0.6} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

// Pedestal bajo el portátil elegido: disco borgoña brillante con un aro cromado
function Pedestal() {
  const fit = fitTo(useThree((s) => s.viewport.width));
  return (
    <group position={[0, -0.9, 0]} rotation-x={0.12} scale={fit}>
      <mesh>
        <cylinderGeometry args={[2.1, 2.3, 0.34, 64]} />
        <meshPhysicalMaterial color="#6d0f1f" roughness={0.2} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[1.98, 0.045, 16, 128]} />
        <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.08} />
      </mesh>
    </group>
  );
}

// Mueve todo el conjunto (portátiles, pedestal y sombra) cuando se abre un proyecto
function Rig({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const { width, height } = useThree((s) => s.viewport);
  const narrow = width < 8;
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const x = open && !narrow ? width * 0.21 : 0;
    const y = open && narrow ? height * 0.24 : 0;
    const s = open ? (narrow ? 0.72 : 1.08) : 1;
    g.position.x = damp(g.position.x, x, 4, dt);
    g.position.y = damp(g.position.y, y, 4, dt);
    g.scale.setScalar(damp(g.scale.x, s, 4, dt));
  });
  return <group ref={ref}>{children}</group>;
}

function Laptops(props: Props) {
  const keyboard = useKeyboard();
  return (
    <>
      {projects.map((p, i) => (
        <Laptop key={p.title} index={i} keyboard={keyboard} {...props} />
      ))}
    </>
  );
}

export default function LaptopScene({ className, ...props }: Props & { className?: string }) {
  return (
    <Stage className={className} strength={0.3}>
      <ambientLight intensity={0.6} />
      <spotLight position={[0, 8, 6]} angle={0.5} penumbra={1} intensity={80} color="#fff4e6" />
      <Rig open={props.open}>
        <Suspense fallback={null}>
          <Laptops {...props} />
        </Suspense>
        <Pedestal />
        <ContactShadows position={[0, -1.2, 0]} scale={20} blur={2.6} opacity={0.35} far={4} color="#3c2f2f" />
      </Rig>
    </Stage>
  );
}
