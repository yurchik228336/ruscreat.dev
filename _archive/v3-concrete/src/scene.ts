import {
  AmbientLight,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

export type SceneHandle = {
  dispose: () => void;
  setSignal: (hex: number) => void;
};

const INK = 0x17181c;
const BLUE = 0x1d4ed8;
const EGG = 0x111111;

function buildCurve(seed = 1): CatmullRomCurve3 {
  const pts: Vector3[] = [];
  const turns = 5;
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    const a = t * Math.PI * 2 * turns;
    const r = 1.15 + Math.sin(a * 0.55 + seed) * 0.55 + Math.cos(a * 1.1) * 0.2;
    pts.push(
      new Vector3(
        Math.cos(a) * r,
        Math.sin(a * 1.35) * 0.95 + Math.cos(a * 0.7) * 0.35,
        Math.sin(a) * r * 0.92,
      ),
    );
  }
  return new CatmullRomCurve3(pts, true, "catmullrom", 0.45);
}

export function createScene(canvas: HTMLCanvasElement): SceneHandle {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 860px)").matches;

  const renderer = new WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.35 : 1.75));

  const scene = new Scene();
  const camera = new PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(isMobile ? 0.2 : 1.6, 0.2, isMobile ? 7.2 : 6.4);

  scene.add(new AmbientLight(0xffffff, 0.65));
  const key = new DirectionalLight(0xffffff, 1.15);
  key.position.set(4, 6, 3);
  scene.add(key);
  const fill = new DirectionalLight(0xb8c4ff, 0.45);
  fill.position.set(-3, -2, -2);
  scene.add(fill);

  const root = new Group();
  root.position.set(isMobile ? 0 : 1.55, isMobile ? 0.85 : 0.15, 0);
  scene.add(root);

  const mat = new MeshStandardMaterial({
    color: new Color(INK),
    metalness: 0.72,
    roughness: 0.28,
    flatShading: false,
  });
  const accentMat = new MeshStandardMaterial({
    color: new Color(BLUE),
    metalness: 0.35,
    roughness: 0.4,
  });

  const tubular = isMobile ? 80 : 140;
  const main = new Mesh(
    new TubeGeometry(buildCurve(1), tubular, isMobile ? 0.14 : 0.16, 12, true),
    mat,
  );
  root.add(main);

  const twin = new Mesh(
    new TubeGeometry(buildCurve(2.4), tubular, isMobile ? 0.06 : 0.07, 10, true),
    accentMat,
  );
  twin.scale.setScalar(0.92);
  twin.rotation.y = 0.4;
  root.add(twin);

  const pointer = new Vector2(0, 0);
  const target = new Vector2(0, 0);
  let scrollFade = 1;
  let raf = 0;
  let alive = true;
  let t = 0;
  let last = performance.now();

  const onPointer = (e: PointerEvent) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  const onScroll = () => {
    scrollFade = Math.max(0.25, 1 - window.scrollY / (window.innerHeight * 0.95));
  };

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };

  const tick = (now: number) => {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    pointer.lerp(target, 0.05);

    if (!reduced) {
      root.rotation.y = t * 0.28 + pointer.x * 0.5;
      root.rotation.x = 0.35 + pointer.y * 0.35;
      root.rotation.z = pointer.x * 0.12;
      root.position.x = (isMobile ? 0 : 1.55) + pointer.x * 0.2;
      root.position.y = (isMobile ? 0.85 : 0.15) - pointer.y * 0.12;
      main.rotation.z = Math.sin(t * 0.7) * 0.08;
      twin.rotation.x = t * 0.18;
      mat.opacity = scrollFade;
      accentMat.opacity = scrollFade;
      mat.transparent = scrollFade < 0.98;
      accentMat.transparent = scrollFade < 0.98;
    }

    camera.position.x = (isMobile ? 0.2 : 1.6) + pointer.x * 0.35;
    camera.position.y = 0.2 - pointer.y * 0.2;
    camera.lookAt(root.position.x * 0.5, root.position.y * 0.35, 0);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  const onVisibility = () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (alive) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("resize", resize);
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);

  resize();
  onScroll();
  raf = requestAnimationFrame(tick);

  return {
    dispose: () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      main.geometry.dispose();
      twin.geometry.dispose();
      mat.dispose();
      accentMat.dispose();
      renderer.dispose();
    },
    setSignal: (hex: number) => {
      accentMat.color.setHex(hex === EGG ? 0xffe500 : hex);
      if (hex === EGG) mat.color.setHex(0x111111);
      else mat.color.setHex(INK);
    },
  };
}

export function setEggPalette(active: boolean, scene?: SceneHandle): void {
  document.body.classList.toggle("is-egg", active);
  scene?.setSignal(active ? EGG : BLUE);
}
