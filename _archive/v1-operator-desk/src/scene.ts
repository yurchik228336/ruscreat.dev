import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";

type SceneHandle = {
  dispose: () => void;
  setSignal: (hex: number) => void;
};

const SIGNAL = 0xe4572e;
const SIGNAL_EGG = 0x7dffb3;
const INK = 0xe8e4d9;
const MUTE = 0x4a4e56;

function buildLattice(size = 5, spacing = 0.55): BufferGeometry {
  const positions: number[] = [];
  const half = (size - 1) / 2;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        const px = (x - half) * spacing;
        const py = (y - half) * spacing;
        const pz = (z - half) * spacing;

        if (x < size - 1) {
          positions.push(px, py, pz, px + spacing, py, pz);
        }
        if (y < size - 1) {
          positions.push(px, py, pz, px, py + spacing, pz);
        }
        if (z < size - 1) {
          positions.push(px, py, pz, px, py, pz + spacing);
        }
      }
    }
  }

  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return geo;
}

function buildNodes(size = 5, spacing = 0.55): BufferGeometry {
  const positions: number[] = [];
  const half = (size - 1) / 2;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        positions.push((x - half) * spacing, (y - half) * spacing, (z - half) * spacing);
      }
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return geo;
}

export function createScene(canvas: HTMLCanvasElement): SceneHandle {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 820px)").matches;
  const grid = isMobile ? 4 : 5;

  const renderer = new WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 100);
  const camBaseY = isMobile ? 0.1 : 0.35;
  camera.position.set(0, camBaseY, isMobile ? 8.4 : 7.2);

  const root = new Group();
  scene.add(root);

  const latticeMat = new LineBasicMaterial({
    color: new Color(SIGNAL),
    transparent: true,
    opacity: 0.62,
  });
  const lattice = new LineSegments(buildLattice(grid, 0.58), latticeMat);
  root.add(lattice);

  const nodeMat = new PointsMaterial({
    color: new Color(SIGNAL),
    size: isMobile ? 0.045 : 0.055,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const nodes = new Points(buildNodes(grid, 0.58), nodeMat);
  root.add(nodes);

  const shellMat = new LineBasicMaterial({
    color: new Color(INK),
    transparent: true,
    opacity: 0.16,
  });
  const shell = new LineSegments(buildLattice(isMobile ? 3 : 4, 0.95), shellMat);
  shell.rotation.set(0.4, 0.2, 0.1);
  root.add(shell);

  const accentMat = new LineBasicMaterial({
    color: new Color(MUTE),
    transparent: true,
    opacity: 0.32,
  });
  const accent = new LineSegments(buildLattice(2, 1.35), accentMat);
  accent.rotation.set(-0.3, 0.8, 0.2);
  root.add(accent);

  root.position.set(isMobile ? 0.2 : 1.85, isMobile ? 1.35 : 0.2, isMobile ? -0.6 : 0);
  if (isMobile) root.scale.setScalar(0.72);
  root.rotation.set(0.35, -0.45, 0.1);

  const pointer = new Vector2(0, 0);
  const target = new Vector2(0, 0);

  const onPointer = (e: PointerEvent) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };

  let raf = 0;
  let alive = true;
  let last = performance.now();
  let scrollFade = 1;

  const onScroll = () => {
    const y = window.scrollY;
    scrollFade = Math.max(0.22, 1 - y / (window.innerHeight * 0.85));
  };

  const tick = (now: number) => {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    pointer.x += (target.x - pointer.x) * 0.045;
    pointer.y += (target.y - pointer.y) * 0.045;

    if (!reduced) {
      root.rotation.y += dt * 0.2;
      root.rotation.x = 0.28 + pointer.y * 0.18;
      root.rotation.z = pointer.x * 0.08;
      lattice.rotation.y -= dt * 0.1;
      nodes.rotation.y = lattice.rotation.y;
      shell.rotation.x += dt * 0.07;
      accent.rotation.z -= dt * 0.09;
      const pulse = 0.75 + Math.sin(now * 0.0022) * 0.2;
      nodeMat.opacity = pulse * scrollFade;
      latticeMat.opacity = (0.45 + Math.sin(now * 0.0016) * 0.12) * scrollFade;
      shellMat.opacity = 0.16 * scrollFade;
      accentMat.opacity = 0.32 * scrollFade;
    }

    camera.position.x = pointer.x * 0.35;
    camera.position.y = camBaseY - pointer.y * 0.2;
    camera.lookAt(root.position.x * 0.4, root.position.y, 0);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else if (alive) {
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
      lattice.geometry.dispose();
      nodes.geometry.dispose();
      shell.geometry.dispose();
      accent.geometry.dispose();
      latticeMat.dispose();
      nodeMat.dispose();
      shellMat.dispose();
      accentMat.dispose();
      renderer.dispose();
    },
    setSignal: (hex: number) => {
      latticeMat.color.setHex(hex);
      nodeMat.color.setHex(hex);
    },
  };
}

export function setEggPalette(active: boolean, scene?: SceneHandle): void {
  document.body.classList.toggle("is-egg", active);
  scene?.setSignal(active ? SIGNAL_EGG : SIGNAL);
}
