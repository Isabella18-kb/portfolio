"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useIsInside } from "./Stage";

// Objetos 3D de la portfolio, modelados con código (sin archivos de modelos): un ordenador retro,
// una taza de cappuccino, un "</>" cromado, teclas con mis iniciales y la flecha del ratón.

// --- Materiales compartidos
export const palette = {
  cream: "#f3e6d2",
  latte: "#be9b7b",
  burgundy: "#6d0f1f",
  espresso: "#2a2220",
};

function Plastic({ color = palette.cream }: { color?: string }) {
  return <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.7} clearcoatRoughness={0.25} />;
}

function Gloss({ color = palette.burgundy }: { color?: string }) {
  return <meshPhysicalMaterial color={color} roughness={0.18} clearcoat={1} clearcoatRoughness={0.08} />;
}

function Chrome({ color = "#ffffff" }: { color?: string }) {
  return <meshStandardMaterial color={color} metalness={1} roughness={0.08} />;
}

// Textura dibujada en un canvas 2D (pantallas, espuma del café, letras de las teclas)
function useCanvasTexture(size: [number, number], draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    [canvas.width, canvas.height] = size;
    draw(canvas.getContext("2d")!, size[0], size[1]);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// Al aparecer crece con un rebote; al pasar el ratón por encima se hincha un poco y da una vuelta
function Interactive({ delay = 0, children, ...props }: ThreeElements["group"] & { delay?: number }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const spin = useRef(0);
  const isInside = useIsInside();
  const born = useRef<number | null>(null);

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    born.current ??= state.clock.elapsedTime;
    const t = state.clock.elapsedTime - born.current - delay;
    // Rebote de entrada (easeOutBack) y luego el tamaño normal, algo mayor con el ratón encima
    const enter = t <= 0 ? 0 : t >= 0.9 ? 1 : 1 + 2.2 * Math.pow(t / 0.9 - 1, 3) + 1.2 * Math.pow(t / 0.9 - 1, 2);
    const target = enter * (hovered ? 1.12 : 1);
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, target, t >= 0.9 ? 0.12 : 1));
    // Vuelta al pasar el ratón, que se frena sola
    spin.current = THREE.MathUtils.lerp(spin.current, 0, dt * 2);
    g.rotation.y += spin.current * dt;
  });

  // Fuera, la posición, el giro y el tamaño que se le den; dentro, el rebote y la vuelta (así la
  // animación no pisa el tamaño)
  return (
    <group {...props}>
      <group
        ref={ref}
        scale={0}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!isInside(e)) return;
          setHovered(true);
          spin.current = 9;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
      >
        {children}
      </group>
    </group>
  );
}

// --- Ordenador retro, con "</>" y un cursor en la pantalla
export function RetroComputer(props: ThreeElements["group"] & { delay?: number }) {
  const screen = useCanvasTexture([512, 384], (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
    g.addColorStop(0, "#3a1017");
    g.addColorStop(1, "#140a0b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f3d9b5";
    ctx.font = "bold 150px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("</>", w / 2, h / 2 - 20);
    ctx.font = "34px monospace";
    ctx.fillStyle = "#be9b7b";
    ctx.fillText("hola, soy isabella_", w / 2, h / 2 + 100);
    // Líneas de barrido de pantalla antigua
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);
  });

  const keys = useMemo(() => {
    const list: [number, number][] = [];
    for (let row = 0; row < 3; row++) for (let col = 0; col < 10; col++) list.push([-0.9 + col * 0.2, -0.22 + row * 0.22]);
    return list;
  }, []);

  return (
    <Interactive {...props}>
      {/* Carcasa */}
      <RoundedBox args={[2.2, 2.3, 2]} radius={0.18} smoothness={4} position={[0, 0.3, 0]}>
        <Plastic />
      </RoundedBox>
      {/* Marco y pantalla */}
      <RoundedBox args={[1.72, 1.3, 0.1]} radius={0.06} position={[0, 0.5, 0.98]}>
        <Plastic color={palette.espresso} />
      </RoundedBox>
      <mesh position={[0, 0.5, 1.04]}>
        <planeGeometry args={[1.52, 1.1]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
      {/* Ranura del disquete y logo */}
      <mesh position={[0.4, -0.5, 1.01]}>
        <boxGeometry args={[0.75, 0.06, 0.04]} />
        <meshStandardMaterial color={palette.espresso} />
      </mesh>
      <mesh position={[-0.7, -0.5, 1.01]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <Gloss />
      </mesh>
      {/* Pie */}
      <RoundedBox args={[1.9, 0.3, 1.7]} radius={0.1} position={[0, -0.95, -0.05]}>
        <Plastic color="#e6d5bc" />
      </RoundedBox>
      {/* Teclado */}
      <group position={[0, -1.02, 1.75]} rotation-x={0.12}>
        <RoundedBox args={[2.3, 0.16, 0.85]} radius={0.06}>
          <Plastic />
        </RoundedBox>
        {keys.map(([x, z], i) => (
          <RoundedBox key={i} args={[0.16, 0.08, 0.16]} radius={0.03} position={[x, 0.1, z]}>
            <Plastic color={i === 14 ? palette.burgundy : "#e9dac3"} />
          </RoundedBox>
        ))}
      </group>
    </Interactive>
  );
}

// --- Taza de cappuccino con arte latte (un corazón) sobre su plato
export function CoffeeCup(props: ThreeElements["group"] & { delay?: number }) {
  const cup = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0, 0],
          [0.5, 0],
          [0.6, 0.06],
          [0.76, 0.9],
          [0.8, 1.05],
          [0.74, 1.05],
          [0.7, 0.92],
          [0.52, 0.12],
          [0, 0.12],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        48
      ),
    []
  );
  const saucer = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0, 0],
          [1.05, 0],
          [1.25, 0.12],
          [1.2, 0.15],
          [1.0, 0.07],
          [0, 0.07],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        48
      ),
    []
  );
  const foam = useCanvasTexture([256, 256], (ctx, w) => {
    ctx.fillStyle = "#7a4a33";
    ctx.fillRect(0, 0, w, w);
    const g = ctx.createRadialGradient(w / 2, w / 2, 10, w / 2, w / 2, w / 2);
    g.addColorStop(0, "#c8966b");
    g.addColorStop(1, "#6b3e2a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
    // Corazón de espuma
    ctx.fillStyle = "#fbeedd";
    ctx.beginPath();
    ctx.moveTo(w / 2, w * 0.78);
    ctx.bezierCurveTo(w * 0.1, w * 0.5, w * 0.22, w * 0.18, w / 2, w * 0.36);
    ctx.bezierCurveTo(w * 0.78, w * 0.18, w * 0.9, w * 0.5, w / 2, w * 0.78);
    ctx.fill();
  });

  return (
    <Interactive {...props}>
      <mesh geometry={saucer}>
        <Plastic />
      </mesh>
      <group position={[0, 0.07, 0]}>
        <mesh geometry={cup}>
          <meshPhysicalMaterial
            color={palette.burgundy}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Café con espuma */}
        <mesh position={[0, 0.9, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.73, 48]} />
          <meshStandardMaterial map={foam} roughness={0.6} />
        </mesh>
        {/* Asa */}
        <mesh position={[0.78, 0.52, 0]} rotation-z={-Math.PI / 2 - 0.15}>
          <torusGeometry args={[0.28, 0.07, 16, 32, Math.PI]} />
          <Gloss />
        </mesh>
      </group>
    </Interactive>
  );
}

// Figura plana a partir de una lista de puntos, extruida con los bordes redondeados y centrada
function useExtruded(points: [number, number][], depth = 0.3) {
  return useMemo(() => {
    const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.06,
      bevelSegments: 5,
      curveSegments: 8,
    });
    geometry.center();
    return geometry;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// --- "</>" cromado
export function CodeBrackets(props: ThreeElements["group"] & { delay?: number }) {
  const left = useExtruded([
    [0.45, 0.75],
    [-0.3, 0],
    [0.45, -0.75],
    [0.75, -0.75],
    [0, 0],
    [0.75, 0.75],
  ]);
  const right = useExtruded([
    [-0.45, 0.75],
    [0.3, 0],
    [-0.45, -0.75],
    [-0.75, -0.75],
    [0, 0],
    [-0.75, 0.75],
  ]);
  const slash = useExtruded([
    [0.22, 0.85],
    [0.5, 0.85],
    [-0.22, -0.85],
    [-0.5, -0.85],
  ]);

  return (
    <Interactive {...props}>
      <mesh geometry={left} position={[-1.05, 0, 0]}>
        <Chrome />
      </mesh>
      <mesh geometry={slash}>
        <Gloss />
      </mesh>
      <mesh geometry={right} position={[1.05, 0, 0]}>
        <Chrome />
      </mesh>
    </Interactive>
  );
}

// --- Tecla con una letra
export function Keycap({ letter, color = palette.cream, ink = palette.burgundy, ...props }: ThreeElements["group"] & {
  letter: string;
  color?: string;
  ink?: string;
  delay?: number;
}) {
  const label = useCanvasTexture([256, 256], (ctx, w) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, w);
    ctx.fillStyle = ink;
    ctx.font = "bold 150px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, w / 2, w / 2 + 8);
  });

  return (
    <Interactive {...props}>
      <RoundedBox args={[1, 0.55, 1]} radius={0.14} smoothness={4}>
        <Plastic color={color} />
      </RoundedBox>
      {/* Cara de arriba, un poco hundida como en las teclas de verdad */}
      <mesh position={[0, 0.281, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.72, 0.72]} />
        <meshPhysicalMaterial map={label} roughness={0.35} clearcoat={0.7} />
      </mesh>
    </Interactive>
  );
}

// --- Flecha del ratón
export function CursorArrow({ color = palette.cream, ...props }: ThreeElements["group"] & { color?: string; delay?: number }) {
  const arrow = useExtruded(
    [
      [0, 0],
      [0, -1.6],
      [0.38, -1.22],
      [0.66, -1.85],
      [0.92, -1.73],
      [0.64, -1.1],
      [1.15, -1.1],
    ],
    0.25
  );
  return (
    <Interactive {...props}>
      <mesh geometry={arrow}>
        <Gloss color={color} />
      </mesh>
    </Interactive>
  );
}
