import {
  AmbientLight,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  SpotLight,
  Vector2,
  WebGLRenderer,
} from "three";

export type SceneHandle = {
  dispose: () => void;
  setSignal: (hex: number) => void;
  breach: () => void;
  seal: () => void;
  getAlign: () => number;
};

const HOT = 0xe11d2e;
const HOT_EGG = 0x35d07f;
const STONE = 0x1a1c22;
const CORE = 0xb8b3a6;

type PanelData = { mesh: Mesh; angle: number };

export function createScene(canvas: HTMLCanvasElement): SceneHandle {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 720px)").matches;

  const renderer = new WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x0c0d10, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.3 : 1.7));

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 1.2, isMobile ? 9.2 : 8.2);

  scene.add(new AmbientLight(0xffffff, 0.35));
  const key = new DirectionalLight(0xffffff, 0.9);
  key.position.set(4, 7, 5);
  scene.add(key);

  const root = new Group();
  root.position.set(isMobile ? 0 : 1.1, 0.1, 0);
  scene.add(root);

  const wallMat = new MeshStandardMaterial({
    color: new Color(STONE),
    metalness: 0.25,
    roughness: 0.72,
  });

  const ring = new Group();
  root.add(ring);

  const segments = 16;
  const gapIndex = 3;
  const gapAngle = (gapIndex / segments) * Math.PI * 2;
  const radius = 2.55;
  const panels: PanelData[] = [];

  for (let i = 0; i < segments; i++) {
    if (i === gapIndex) continue;
    const mesh = new Mesh(new BoxGeometry(0.95, 2.4, 0.28), wallMat);
    const angle = (i / segments) * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    mesh.lookAt(0, 0, 0);
    mesh.rotateY(Math.PI);
    ring.add(mesh);
    panels.push({ mesh, angle });
  }

  const coreMat = new MeshStandardMaterial({
    color: new Color(CORE),
    metalness: 0.55,
    roughness: 0.35,
  });
  const core = new Mesh(new BoxGeometry(1.05, 1.05, 1.05), coreMat);
  core.rotation.set(0.4, 0.55, 0.15);
  root.add(core);

  const pedestal = new Mesh(
    new CylinderGeometry(1.5, 1.7, 0.18, 32),
    new MeshStandardMaterial({ color: 0x12141a, metalness: 0.4, roughness: 0.6 }),
  );
  pedestal.position.y = -1.45;
  root.add(pedestal);

  const breachLight = new SpotLight(HOT, 0, 12, Math.PI / 7, 0.45, 1.2);
  breachLight.position.set(Math.cos(gapAngle) * 4.2, 1.2, Math.sin(gapAngle) * 4.2);
  breachLight.target.position.set(0, 0, 0);
  root.add(breachLight);
  root.add(breachLight.target);

  const coreGlow = new PointLight(HOT, 0, 6);
  coreGlow.position.set(0, 0.2, 0);
  root.add(coreGlow);

  const beamMat = new MeshStandardMaterial({
    color: HOT,
    emissive: HOT,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.75,
  });
  const beam = new Mesh(new CylinderGeometry(0.035, 0.01, 5.2, 10), beamMat);
  beam.geometry.translate(0, 2.6, 0);
  root.add(beam);

  const pointer = new Vector2(0.15, 0.1);
  const target = new Vector2(0.15, 0.1);
  let yaw = -0.55;
  let yawT = yaw;
  let align = 0;
  let breached = false;
  let raf = 0;
  let alive = true;
  let time = 0;

  const hud = document.getElementById("hud-align");
  const hint = document.getElementById("hint");
  const legend = document.getElementById("legend");

  const setBreached = (on: boolean) => {
    breached = on;
    document.body.classList.toggle("is-breach", on);
    if (hint) {
      hint.textContent = on
        ? "щель открыта. это и есть PoC"
        : "наведи луч на щель · клик = PoC";
      hint.classList.toggle("is-lock", on);
    }
    if (legend) {
      legend.textContent = on
        ? "нашёл вход. периметр больше не целый"
        : "кольцо = периметр · щель = баг · ядро = то, что за стеной";
    }
  };

  const breach = () => {
    if (align < 0.62 && !breached) return;
    setBreached(true);
  };

  const seal = () => setBreached(false);

  const onMove = (e: PointerEvent) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  const onDown = () => {
    if (align >= 0.62) breach();
    else if (hint) {
      hint.textContent = "мимо. луч не в щели";
      window.setTimeout(() => {
        if (!breached && hint) hint.textContent = "наведи луч на щель · клик = PoC";
      }, 900);
    }
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    yawT += e.deltaY * 0.0018;
  };

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };

  const angleDelta = (a: number, b: number) => {
    let d = Math.abs(a - b) % (Math.PI * 2);
    if (d > Math.PI) d = Math.PI * 2 - d;
    return d;
  };

  const tick = () => {
    if (!alive) return;
    time += 0.016;
    pointer.lerp(target, 0.08);
    yawT += pointer.x * 0.0035;
    yaw += (yawT - yaw) * 0.06;

    if (!reduced) {
      root.rotation.y = yaw;
      root.rotation.x = pointer.y * 0.18;
      core.rotation.y += 0.008;
      core.rotation.x += 0.003;
    } else {
      root.rotation.y = yaw;
    }

    const aimYaw = pointer.x * 1.05;
    beam.rotation.set(0, Math.PI / 2 + aimYaw, -Math.PI / 2 + pointer.y * 0.12);
    beam.position.set(0, 0.15, 0);

    const beamAngle = (aimYaw + Math.PI * 2) % (Math.PI * 2);
    const gapLocal = (gapAngle + Math.PI * 2) % (Math.PI * 2);
    align = Math.max(0, 1 - angleDelta(beamAngle, gapLocal) / 0.5);

    breachLight.intensity = 0.15 + align * 4.8 + (breached ? 2.5 : 0);
    coreGlow.intensity = align * 2.4 + (breached ? 2.2 : 0);
    beamMat.opacity = 0.35 + align * 0.55;
    beamMat.emissiveIntensity = 0.6 + align * 1.8;

    const open = breached ? 0.7 + Math.sin(time * 2) * 0.04 : align * 0.15;
    for (const p of panels) {
      const near = angleDelta(p.angle, gapAngle);
      const push = near < 0.7 ? open * (1 - near / 0.7) : 0;
      const side = Math.sin(p.angle - gapAngle) >= 0 ? 1 : -1;
      const a = p.angle + side * push * 0.18;
      const r = radius + push * 0.25;
      p.mesh.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      p.mesh.lookAt(0, 0, 0);
      p.mesh.rotateY(Math.PI);
    }

    if (hud) hud.textContent = `align ${Math.round(align * 100)}%`;

    camera.position.x = pointer.x * 0.35 + (isMobile ? 0 : 0.4);
    camera.position.y = 1.2 + pointer.y * 0.2;
    camera.lookAt(root.position.x * 0.4, 0.1, 0);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  const onVisibility = () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (alive) raf = requestAnimationFrame(tick);
  };

  canvas.addEventListener("pointermove", onMove, { passive: true });
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisibility);

  resize();
  raf = requestAnimationFrame(tick);

  return {
    dispose: () => {
      alive = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      panels.forEach((p) => p.mesh.geometry.dispose());
      wallMat.dispose();
      core.geometry.dispose();
      coreMat.dispose();
      pedestal.geometry.dispose();
      (pedestal.material as MeshStandardMaterial).dispose();
      beam.geometry.dispose();
      beamMat.dispose();
      renderer.dispose();
    },
    setSignal: (hex: number) => {
      breachLight.color.setHex(hex);
      coreGlow.color.setHex(hex);
      beamMat.color.setHex(hex);
      beamMat.emissive.setHex(hex);
    },
    breach,
    seal,
    getAlign: () => align,
  };
}

export function setEggPalette(active: boolean, scene?: SceneHandle): void {
  document.body.classList.toggle("is-egg", active);
  scene?.setSignal(active ? HOT_EGG : HOT);
}
