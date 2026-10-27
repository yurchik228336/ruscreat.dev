import {
  AdditiveBlending,
  BoxGeometry,
  FogExp2,
  Group,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

export type SceneMode = "orbit" | "magnet" | "chaos";

export type SceneHandle = {
  dispose: () => void;
  setSignal: (hex: number) => void;
  pulse: (power?: number) => void;
  setMode: (mode: SceneMode) => void;
  getMode: () => SceneMode;
};

const HOT = 0xff2a1f;
const HOT_EGG = 0x39ff14;
const INK = 0xe7e2d7;

type Shock = { x: number; y: number; z: number; t: number; power: number };

export function createScene(canvas: HTMLCanvasElement): SceneHandle {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 720px)").matches;

  const renderer = new WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x090a0c, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.65));

  const scene = new Scene();
  scene.fog = new FogExp2(0x090a0c, 0.05);

  const camera = new PerspectiveCamera(58, 1, 0.1, 200);
  camera.position.set(0, 0, 13);

  const world = new Group();
  scene.add(world);

  const count = isMobile ? 360 : 780;
  const geo = new BoxGeometry(0.07, 0.07, 0.5);
  const mat = new MeshBasicMaterial({ color: INK });
  const mesh = new InstancedMesh(geo, mat, count);
  world.add(mesh);

  const hotMat = new MeshBasicMaterial({
    color: HOT,
    transparent: true,
    opacity: 0.95,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const hotCount = Math.floor(count * 0.14);
  const hot = new InstancedMesh(geo, hotMat, hotCount);
  world.add(hot);

  const base = new Float32Array(count * 3);
  const offset = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const hotIndex: number[] = [];

  const dummy = new Object3D();
  const radius = 3.1;

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const a = t * Math.PI * 18;
    const y = (t - 0.5) * 26;
    const r = radius + Math.sin(a * 2.1) * 0.4;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    base[i * 3] = x;
    base[i * 3 + 1] = y;
    base[i * 3 + 2] = z;
    if (i % 7 === 0 && hotIndex.length < hotCount) hotIndex.push(i);
  }

  let mode: SceneMode = "magnet";
  let dive = 0;
  let diveTarget = 0;
  let yaw = 0.35;
  let pitch = 0.12;
  let yawT = yaw;
  let pitchT = pitch;
  let holding = false;
  let moved = false;
  const last = new Vector2();
  const downAt = new Vector2();
  const pointerNdc = new Vector2(0, 0);
  const magnet = new Vector3(0, 0, 0);
  const shocks: Shock[] = [];
  const keys = new Set<string>();
  let raf = 0;
  let alive = true;
  let time = 0;

  const hudY = document.getElementById("hud-y");
  const hudMode = document.getElementById("hud-mode");

  const syncHud = () => {
    if (hudMode) hudMode.textContent = mode;
    if (hudY) hudY.textContent = `y ${dive.toFixed(2)}`;
  };

  const projectMagnet = () => {
    magnet.set(pointerNdc.x * 5.5, pointerNdc.y * 4.2 + dive * 0.35, 0);
  };

  const writeInstances = () => {
    for (let i = 0; i < count; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const bz = base[i * 3 + 2];
      const ox = offset[i * 3];
      const oy = offset[i * 3 + 1];
      const oz = offset[i * 3 + 2];
      const x = bx + ox;
      const y = by + oy;
      const z = bz + oz;
      dummy.position.set(x, y, z);
      dummy.lookAt(ox * 0.15, y, oz * 0.15);
      dummy.rotateX(Math.PI / 2);
      const stretch = 0.75 + Math.min(1.8, Math.hypot(ox, oy, oz) * 0.45);
      dummy.scale.set(1, 1, stretch);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    for (let i = 0; i < hotIndex.length; i++) {
      const id = hotIndex[i];
      const x = base[id * 3] + offset[id * 3];
      const y = base[id * 3 + 1] + offset[id * 3 + 1];
      const z = base[id * 3 + 2] + offset[id * 3 + 2];
      dummy.position.set(x, y, z);
      dummy.lookAt(0, y, 0);
      dummy.rotateX(Math.PI / 2);
      dummy.scale.set(
        1.2,
        1.2,
        1.1 + Math.min(2, Math.hypot(offset[id * 3], offset[id * 3 + 1], offset[id * 3 + 2])),
      );
      dummy.updateMatrix();
      hot.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    hot.instanceMatrix.needsUpdate = true;
  };

  const pulse = (power = 1.6) => {
    shocks.push({ x: magnet.x, y: magnet.y, z: magnet.z, t: 0, power });
    if (shocks.length > 5) shocks.shift();
    const ring = document.getElementById("cursor-ring");
    ring?.classList.add("is-bang");
    window.setTimeout(() => ring?.classList.remove("is-bang"), 180);
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    diveTarget = Math.max(-9, Math.min(9, diveTarget + e.deltaY * 0.0045));
  };

  const onDown = (e: PointerEvent) => {
    holding = true;
    moved = false;
    last.set(e.clientX, e.clientY);
    downAt.set(e.clientX, e.clientY);
    pointerNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;
    projectMagnet();
    canvas.setPointerCapture(e.pointerId);
  };

  const onMove = (e: PointerEvent) => {
    pointerNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;
    projectMagnet();

    const ring = document.getElementById("cursor-ring");
    if (ring) {
      ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      ring.classList.add("is-on");
    }

    if (!holding) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    const total = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    last.set(e.clientX, e.clientY);
    if (total > 10) {
      moved = true;
      canvas.classList.add("is-drag");
      yawT += dx * 0.005;
      pitchT = Math.max(-0.75, Math.min(0.75, pitchT + dy * 0.004));
    }
  };

  const onUp = (e: PointerEvent) => {
    if (holding && !moved) pulse(e.detail > 1 ? 2.4 : 1.55);
    holding = false;
    moved = false;
    canvas.classList.remove("is-drag");
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    keys.add(e.key.toLowerCase());
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      pulse(2.1);
    }
    if (e.key.toLowerCase() === "m") {
      mode = mode === "magnet" ? "orbit" : mode === "orbit" ? "chaos" : "magnet";
      syncHud();
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    keys.delete(e.key.toLowerCase());
  };

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };

  const tick = () => {
    if (!alive) return;
    const dt = 0.016;
    time += dt;
    dive += (diveTarget - dive) * 0.06;
    yaw += (yawT - yaw) * 0.08;
    pitch += (pitchT - pitch) * 0.08;

    // fly
    if (keys.has("w") || keys.has("arrowup")) diveTarget = Math.min(9, diveTarget + 0.08);
    if (keys.has("s") || keys.has("arrowdown")) diveTarget = Math.max(-9, diveTarget - 0.08);
    if (keys.has("a") || keys.has("arrowleft")) yawT -= 0.03;
    if (keys.has("d") || keys.has("arrowright")) yawT += 0.03;

    if (!reduced) {
      world.rotation.y = yaw + (mode === "orbit" ? time * 0.12 : time * 0.035);
      world.rotation.x = pitch;

      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const bx = base[ix];
        const by = base[ix + 1];
        const bz = base[ix + 2];
        let fx = 0;
        let fy = 0;
        let fz = 0;

        if (mode === "magnet" || holding) {
          const dx = magnet.x - (bx + offset[ix]);
          const dy = magnet.y - (by + offset[ix + 1]);
          const dz = magnet.z - (bz + offset[ix + 2]);
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001;
          const pull = (holding ? 2.4 : 1.15) / (dist * dist);
          const capped = Math.min(pull, 3.2);
          fx += dx * capped * 0.08;
          fy += dy * capped * 0.08;
          fz += dz * capped * 0.08;
        }

        if (mode === "chaos") {
          fx += Math.sin(time * 3.1 + i * 0.17) * 0.35;
          fy += Math.cos(time * 2.4 + i * 0.11) * 0.28;
          fz += Math.sin(time * 1.7 + i * 0.23) * 0.3;
        }

        for (const s of shocks) {
          const dx = bx + offset[ix] - s.x;
          const dy = by + offset[ix + 1] - s.y;
          const dz = bz + offset[ix + 2] - s.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001;
          const wave = Math.exp(-Math.abs(dist - s.t * 8) * 1.4) * s.power;
          fx += (dx / dist) * wave * 0.55;
          fy += (dy / dist) * wave * 0.55;
          fz += (dz / dist) * wave * 0.55;
        }

        // spring home
        fx += -offset[ix] * 1.8;
        fy += -offset[ix + 1] * 1.8;
        fz += -offset[ix + 2] * 1.8;

        vel[ix] = vel[ix] * 0.86 + fx * dt;
        vel[ix + 1] = vel[ix + 1] * 0.86 + fy * dt;
        vel[ix + 2] = vel[ix + 2] * 0.86 + fz * dt;

        offset[ix] += vel[ix];
        offset[ix + 1] += vel[ix + 1];
        offset[ix + 2] += vel[ix + 2];
      }

      for (const s of shocks) s.t += dt;
      while (shocks.length && shocks[0].t > 1.4) shocks.shift();

      writeInstances();
    }

    camera.position.set(
      Math.sin(yaw * 0.15) * 0.4,
      dive,
      13 - Math.abs(dive) * 0.12,
    );
    camera.lookAt(0, dive * 0.4, 0);

    if (hudY) hudY.textContent = `y ${dive.toFixed(2)}`;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  const onVisibility = () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (alive) raf = requestAnimationFrame(tick);
  };

  const onContext = (e: Event) => e.preventDefault();

  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("contextmenu", onContext);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisibility);

  resize();
  projectMagnet();
  writeInstances();
  syncHud();
  raf = requestAnimationFrame(tick);

  return {
    dispose: () => {
      alive = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("contextmenu", onContext);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      geo.dispose();
      mat.dispose();
      hotMat.dispose();
      renderer.dispose();
    },
    setSignal: (hex: number) => {
      hotMat.color.setHex(hex);
    },
    pulse,
    setMode: (m: SceneMode) => {
      mode = m;
      syncHud();
    },
    getMode: () => mode,
  };
}

export function setEggPalette(active: boolean, scene?: SceneHandle): void {
  document.body.classList.toggle("is-egg", active);
  scene?.setSignal(active ? HOT_EGG : HOT);
}
