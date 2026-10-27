import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const MODEL_URL = `${import.meta.env.BASE_URL}models/laptop.glb`;
const SCREEN_SIZE: [number, number] = [29.4, 20];

const LOG_LINES = [
  "$ scope",
  "roles · objects · trust",
  "account A / account B",
  "broken access control",
  "effect repeats, then report",
  "accepted · informative · duplicate",
  "severity follows impact",
  "kingdom invite needs confirm",
  "collector shares hall rules",
  "chunks follow the kingdom",
  "$ gradle compileJava",
  "purpur · three plugins, one model",
];

/** Starts the instant this chunk evaluates — overlaps with loader greetings */
const modelPromise: Promise<THREE.Group> = (async () => {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(MODEL_URL);
  return gltf.scene;
})();

export function preloadLaptop(): Promise<THREE.Group> {
  return modelPromise;
}

function makeScreenTexture(): { texture: THREE.CanvasTexture; tick: (t: number) => void } {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 480;
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.anisotropy = 4;

  const tick = (t: number) => {
    const offset = (t * 32) % (LOG_LINES.length * 26);
    ctx.fillStyle = "#020503";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#07140a";
    ctx.fillRect(0, 0, canvas.width, 36);
    for (const [x, color] of [
      [18, "#ff5f57"],
      [36, "#febc2e"],
      [54, "#28c840"],
    ] as const) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, 18, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#3dff7a";
    ctx.font = "600 15px ui-monospace, Consolas, monospace";
    ctx.fillText("ruscreat@brick - zsh", 72, 23);
    ctx.font = "14px ui-monospace, Consolas, monospace";
    const lineH = 26;
    const start = Math.floor(offset / lineH);
    const yShift = -(offset % lineH);
    for (let i = 0; i < 16; i++) {
      const line = LOG_LINES[(start + i) % LOG_LINES.length];
      ctx.fillStyle = i % 4 === 0 ? "#9dffc4" : "#2fdc78";
      ctx.globalAlpha = 0.55 + (i % 6) * 0.06;
      ctx.fillText(`› ${line}`, 16, 58 + i * lineH + yShift);
    }
    ctx.globalAlpha = 1;
    texture.needsUpdate = true;
  };

  tick(0);
  return { texture, tick };
}

function fitObject(object: THREE.Object3D, targetSize: number) {
  object.scale.setScalar(1);
  object.position.set(0, 0, 0);
  object.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const max = Math.max(size.x, size.y, size.z) || 1;
  object.scale.setScalar(targetSize / max);
  object.updateMatrixWorld(true);

  box.setFromObject(object);
  object.position.sub(box.getCenter(new THREE.Vector3()));
}

function makeKeyboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 860;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#12151a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cols = 14;
  const rows = 5;
  const padX = 48;
  const padY = 40;
  const gap = 14;
  const usableH = canvas.height - padY * 2 - 20;
  const keyW = (canvas.width - padX * 2 - gap * (cols - 1)) / cols;
  const keyH = (usableH - gap * (rows - 1)) / rows;

  const labels = [
    ["esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "del"],
    ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
    ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "ret", ""],
    ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "up", "", ""],
    ["ctrl", "alt", "cmd", "", "", "", "", "", "", "", "lt", "dn", "rt", ""],
  ];

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 4 && c >= 3 && c <= 9) continue;
      const x = padX + c * (keyW + gap);
      const y = padY + r * (keyH + gap);
      ctx.fillStyle = "#07080a";
      ctx.beginPath();
      ctx.roundRect(x - 2, y - 2, keyW + 4, keyH + 4, 8);
      ctx.fill();
      ctx.fillStyle = "#2a3038";
      ctx.beginPath();
      ctx.roundRect(x, y, keyW, keyH, 7);
      ctx.fill();
      ctx.fillStyle = "#3d4652";
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, keyW - 6, Math.max(6, keyH * 0.32), 5);
      ctx.fill();
      const label = labels[r]?.[c];
      if (label) {
        ctx.fillStyle = "#ffffff";
        ctx.font =
          label.length > 2
            ? "800 26px ui-monospace, Consolas, monospace"
            : "800 40px ui-monospace, Consolas, monospace";
        ctx.fillText(label, x + keyW / 2, y + keyH / 2 + 2);
      }
    }
  }

  const spaceX = padX + 3 * (keyW + gap);
  const spaceY = padY + 4 * (keyH + gap);
  const spaceW = 7 * keyW + 6 * gap;
  ctx.fillStyle = "#07080a";
  ctx.beginPath();
  ctx.roundRect(spaceX - 2, spaceY - 2, spaceW + 4, keyH + 4, 8);
  ctx.fill();
  ctx.fillStyle = "#2a3038";
  ctx.beginPath();
  ctx.roundRect(spaceX, spaceY, spaceW, keyH, 7);
  ctx.fill();
  ctx.fillStyle = "#3d4652";
  ctx.beginPath();
  ctx.roundRect(spaceX + 3, spaceY + 3, spaceW - 6, Math.max(6, keyH * 0.32), 5);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function assembleLaptop(source: THREE.Group, screenMap: THREE.Texture): THREE.Group {
  const pivot = new THREE.Group();
  const lidGroup = new THREE.Group();
  const bottomGroup = new THREE.Group();
  pivot.add(lidGroup, bottomGroup);

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x14161a,
    metalness: 0.92,
    roughness: 0.32,
    clearcoat: 0.35,
    clearcoatRoughness: 0.45,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    metalness: 0.45,
    roughness: 0.7,
  });
  const logoMat = new THREE.MeshStandardMaterial({
    color: 0x3a3f46,
    metalness: 0.95,
    roughness: 0.25,
  });
  const camMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const screenMat = new THREE.MeshStandardMaterial({
    map: screenMap,
    emissiveMap: screenMap,
    emissive: new THREE.Color(0x14ff66),
    emissiveIntensity: 0.9,
    roughness: 0.4,
    metalness: 0,
    side: THREE.BackSide,
  });
  const keyTex = makeKeyboardTexture();
  const keysMat = new THREE.MeshBasicMaterial({
    map: keyTex,
  });

  const root = source.clone(true);
  for (const child of [...root.children]) {
    if (child.name === "_top") {
      lidGroup.add(child);
      for (const mesh of child.children) {
        if (!(mesh instanceof THREE.Mesh)) continue;
        if (mesh.name === "lid") mesh.material = bodyMat;
        else if (mesh.name === "logo") mesh.material = logoMat;
        else if (mesh.name === "screen-frame") mesh.material = darkMat;
        else if (mesh.name === "camera") mesh.material = camMat;
      }
    } else if (child.name === "_bottom") {
      bottomGroup.add(child);
      for (const mesh of child.children) {
        if (!(mesh instanceof THREE.Mesh)) continue;
        if (mesh.name === "base") mesh.material = bodyMat;
        else if (mesh.name === "keyboard") {
          mesh.visible = false;
        } else mesh.material = darkMat;
      }
    }
  }

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(...SCREEN_SIZE), screenMat);
  screen.position.set(0, 10.5, -0.11);
  screen.rotation.set(Math.PI, 0, 0);
  lidGroup.add(screen);

  const keys = new THREE.Mesh(new THREE.PlaneGeometry(27.7, 11.6), keysMat);
  keys.rotation.set(-0.5 * Math.PI, 0, 0);
  keys.position.set(0, 0.05, 7.21);
  bottomGroup.add(keys);

  lidGroup.rotation.x = -0.2 * Math.PI;
  pivot.rotation.x = 0.1;
  pivot.rotation.y = -0.34;
  // Empirically framed for FOV 30 / cam z 7.6 with sway margin
  fitObject(pivot, 3.5);
  return pivot;
}

export function mountLaptop(canvas: HTMLCanvasElement, reduced: boolean): () => void {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0.05, 1.85, 7.6);
  camera.lookAt(0, 0.1, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.28));
  const key = new THREE.DirectionalLight(0xfff2e0, 1.05);
  key.position.set(4.5, 7, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9aa6b5, 0.5);
  fill.position.set(-5, 2.5, 2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x8a9aaa, 0.18);
  rim.position.set(-2, 3.5, -5);
  scene.add(rim);

  const { texture: screenMap, tick: tickScreen } = makeScreenTexture();

  let disposed = false;
  let raf = 0;
  let visible = true;
  let pivot: THREE.Group | null = null;
  let baseY = 0;
  let baseRotY = -0.34;
  let baseRotX = 0.1;

  void modelPromise
    .then((source) => {
      if (disposed) return;
      pivot = assembleLaptop(source, screenMap);
      baseY = pivot.position.y;
      baseRotY = pivot.rotation.y;
      baseRotX = pivot.rotation.x;
      scene.add(pivot);
      canvas.classList.add("is-ready");
    })
    .catch((err) => console.error("Laptop model failed to load", err));

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const t0 = performance.now();
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!pivot || !visible || disposed) return;

    const t = (now - t0) / 1000;
    tickScreen(t);
    if (!reduced) {
      pivot.rotation.y = baseRotY + Math.sin(t * 0.18) * 0.05;
      pivot.rotation.x = baseRotX + Math.sin(t * 0.14) * 0.015;
      pivot.position.y = baseY + Math.sin(t * 0.35) * 0.025;
    }
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);

  const onVis = () => {
    visible = document.visibilityState === "visible";
  };
  document.addEventListener("visibilitychange", onVis);

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    screenMap.dispose();
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => m.dispose());
      }
    });
    renderer.dispose();
  };
}
