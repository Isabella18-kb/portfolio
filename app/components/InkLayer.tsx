"use client";

import { useEffect, useRef } from "react";

// Tinta líquida que sigue al ratón o al dedo (como en la portada de Buttermax). Va dentro de una sección, encima
// de sus textos: el ratón deja gotas que se funden entre sí (metaballs, en un shader de WebGL) y se
// secan poco a poco. Dentro de la mancha se ven los textos de la sección marcados con data-ink, pero
// con los colores al revés (texto "text" sobre fondo "ink"), así que parece que la tinta los tiñe.
//
// Los textos con data-ink deben ser inline-block y de una sola línea: se copian a la textura midiendo
// su caja en pantalla.

const MAX = 32; // gotas a la vez
const LIFE_S = 1.6; // lo que tarda una gota en secarse

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform vec3 uP[${MAX}];
uniform sampler2D uTex;
varying vec2 vUv;
void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 p = uv * uRes;
  float f = 0.0;
  for (int i = 0; i < ${MAX}; i++) {
    vec3 q = uP[i];
    if (q.z > 0.5) {
      vec2 d = p - q.xy;
      // Caída rápida (al cuadrado): las gotas se funden en los bordes pero no se hinchan al juntarse muchas
      float v = q.z * q.z / (dot(d, d) + 1.0);
      f += v * v;
    }
  }
  float a = smoothstep(0.92, 1.08, f);
  if (a <= 0.0) discard;
  gl_FragColor = vec4(texture2D(uTex, uv).rgb, a);
}`;

type Drop = { x: number; y: number; r: number; life: number };

export default function InkLayer({
  ink,
  text,
  intro = false,
  className = "",
}: {
  ink: string; // color de la tinta
  text: string; // color de los textos dentro de la tinta
  intro?: boolean; // al aparecer, un trazo automático cruza la sección
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const section = canvas?.parentElement;
    if (!canvas || !section) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
    if (!gl) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Programa de WebGL: un rectángulo que ocupa todo el lienzo
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uP = gl.getUniformLocation(program, "uP");
    gl.uniform1i(gl.getUniformLocation(program, "uTex"), 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // --- Textura: fondo de tinta con los textos de la sección copiados encima
    const paper = document.createElement("canvas");
    const pctx = paper.getContext("2d")!;
    let w = 0;
    let h = 0;
    let dpr = 1;

    function paintText() {
      pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pctx.fillStyle = ink;
      pctx.fillRect(0, 0, w, h);
      pctx.fillStyle = text;
      pctx.textBaseline = "alphabetic";
      const box = section!.getBoundingClientRect();
      section!.querySelectorAll<HTMLElement>("[data-ink]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const raw = el.textContent ?? "";
        const content =
          cs.textTransform === "uppercase" ? raw.toUpperCase() : cs.textTransform === "lowercase" ? raw.toLowerCase() : raw;
        pctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        pctx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
        const m = pctx.measureText(content);
        // Misma línea base que en la página: el texto va centrado en su línea según las métricas de la fuente
        const lineHeight = parseFloat(cs.lineHeight) || r.height;
        const glyphs = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
        const baseline = r.top - box.top + (lineHeight - glyphs) / 2 + m.fontBoundingBoxAscent;
        pctx.fillText(content, r.left - box.left, baseline);
      });
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGB, gl!.RGB, gl!.UNSIGNED_BYTE, paper);
    }

    function resize() {
      w = section!.clientWidth;
      h = section!.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = paper.width = Math.round(w * dpr);
      canvas!.height = paper.height = Math.round(h * dpr);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform2f(uRes, w, h);
      paintText();
    }

    // Mientras los textos terminan de animarse o de cargar la fuente, se vuelven a copiar cada fotograma
    let repaintUntil = performance.now() + 2500;
    document.fonts.ready.then(() => (repaintUntil = Math.max(repaintUntil, performance.now() + 500)));
    const resizer = new ResizeObserver(resize);
    resizer.observe(section);

    // --- Gotas
    const drops: Drop[] = [];
    const uniforms = new Float32Array(MAX * 3);
    let last: { x: number; y: number } | null = null;

    function drop(x: number, y: number, speed: number) {
      const base = Math.max(30, Math.min(w, h) * 0.05);
      drops.push({ x, y, r: base + Math.min(speed, 50) * 0.5, life: 1 });
      if (drops.length > MAX) drops.shift();
    }

    // El ratón deja gotas cada pocos píxeles, para que el trazo sea continuo
    function trail(x: number, y: number) {
      if (!last) {
        drop(x, y, 0);
      } else {
        const dist = Math.hypot(x - last.x, y - last.y);
        const steps = Math.min(Math.floor(dist / 22), 6);
        for (let i = 1; i <= steps; i++) {
          drop(last.x + ((x - last.x) * i) / steps, last.y + ((y - last.y) * i) / steps, dist / Math.max(steps, 1));
        }
        if (steps === 0) return;
      }
      last = { x, y };
    }

    function paint(clientX: number, clientY: number) {
      if (!visible) return;
      const box = section!.getBoundingClientRect();
      const x = clientX - box.left;
      const y = clientY - box.top;
      if (x < 0 || y < 0 || x > w || y > h) return (last = null);
      trail(x, y);
    }
    function onMove(e: PointerEvent) {
      if (e.pointerType !== "touch") paint(e.clientX, e.clientY);
    }
    // Con el dedo: en cuanto se desliza, el navegador lo toma como scroll y deja de mandar pointermove,
    // pero touchmove sigue llegando. Así la tinta sigue al dedo mientras la página se desplaza.
    function onTouch(e: TouchEvent) {
      const t = e.touches[0];
      if (t) paint(t.clientX, t.clientY);
    }
    function onTouchEnd() {
      last = null;
    }
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("touchstart", onTouch, { passive: true });
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
    }

    // Trazo de entrada: una ola que cruza la sección de izquierda a derecha
    let introStart = intro && !reduce ? performance.now() + 400 : -1;

    // --- Bucle (solo mientras la sección se ve)
    let visible = false;
    let raf = 0;
    let prev = performance.now();
    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      if (introStart > 0 && now >= introStart) {
        const t = (now - introStart) / 1300;
        if (t > 1) introStart = -1;
        else trail(w * (0.05 + 0.9 * t), h * (0.45 + Math.sin(t * Math.PI * 2.2) * 0.12));
        if (t > 1) last = null;
      }

      if (now < repaintUntil) paintText();

      for (const d of drops) d.life -= dt / LIFE_S;
      while (drops.length && drops[0].life <= 0) drops.shift();

      uniforms.fill(0);
      drops.forEach((d, i) => {
        if (d.life <= 0) return;
        // Crece rápido al caer y luego se seca encogiendo
        const grow = Math.min(1, (1 - d.life) * 8 + 0.5);
        uniforms[i * 3] = d.x;
        uniforms[i * 3 + 1] = d.y;
        uniforms[i * 3 + 2] = d.r * grow * Math.sqrt(d.life);
      });

      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      if (drops.length) {
        gl!.uniform3fv(uP, uniforms);
        gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      }
    }

    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    watcher.observe(section);

    return () => {
      cancelAnimationFrame(raf);
      watcher.disconnect();
      resizer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
      // Sin perder el contexto: el lienzo puede volver a montarse (React lo hace en desarrollo) y
      // recibiría el mismo contexto ya muerto
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [ink, text, intro]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 size-full ${className}`} />;
}
