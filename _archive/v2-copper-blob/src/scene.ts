import {
  AdditiveBlending,
  BufferGeometry,
  Clock,
  Color,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  Mesh,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
} from "three";

export type SceneHandle = {
  dispose: () => void;
  setSignal: (hex: number) => void;
};

const ACID = 0xff6a3d;
const ACID_EGG = 0x7dffb3;

const vertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vPulse;

// compact hash noise
float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

void main() {
  vNormal = normalize(normalMatrix * normal);
  float n = noise(position * 1.35 + uTime * 0.35);
  float n2 = noise(position * 2.8 - uTime * 0.2);
  float displace = (n * 0.85 + n2 * 0.42) * (1.0 + length(uMouse) * 0.55);
  vec3 pos = position + normal * displace;
  vPulse = displace;
  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uInk;
uniform float uTime;
uniform vec2 uMouse;
uniform float uFade;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vPulse;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 2.6);
  float bands = sin((vWorld.y + vWorld.x * 0.4) * 9.0 - uTime * 2.2) * 0.5 + 0.5;
  bands = smoothstep(0.35, 0.85, bands);
  float core = smoothstep(0.05, 0.55, vPulse);
  vec3 col = mix(uInk * 0.35, uColor, core * 0.55 + bands * 0.35);
  col += uColor * fresnel * (1.15 + abs(uMouse.x) * 0.4);
  float alpha = (0.22 + fresnel * 0.75 + core * 0.2) * uFade;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.95));
}
`;

function buildSparks(count: number): BufferGeometry {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.2 + Math.random() * 3.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return geo;
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.35 : 1.85));

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 100);
  const camZ = isMobile ? 7.4 : 6.2;
  camera.position.set(isMobile ? 0 : 1.1, 0.15, camZ);

  const root = new Group();
  root.position.set(isMobile ? 0 : 1.35, isMobile ? 0.9 : 0.1, 0);
  scene.add(root);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new Vector2(0, 0) },
    uColor: { value: new Color(ACID) },
    uInk: { value: new Color(0x0a0a0a) },
    uFade: { value: 1 },
  };

  const mat = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  });

  const core = new Mesh(new IcosahedronGeometry(isMobile ? 1.7 : 2.05, isMobile ? 4 : 6), mat);
  root.add(core);

  const wireMat = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uFade;
      varying float vPulse;
      void main() {
        float a = (0.18 + vPulse * 0.65) * uFade;
        gl_FragColor = vec4(uColor, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    wireframe: true,
  });
  const shell = new Mesh(new IcosahedronGeometry(isMobile ? 2.05 : 2.45, 1), wireMat);
  root.add(shell);

  const ringMat = new ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying float vA;
      void main() {
        vA = 0.35 + 0.65 * abs(sin(position.x * 3.0 + uTime));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uFade;
      varying float vA;
      void main() {
        gl_FragColor = vec4(uColor, vA * 0.55 * uFade);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const ringA = new Mesh(new TorusGeometry(2.9, 0.014, 8, isMobile ? 96 : 180), ringMat);
  ringA.rotation.x = Math.PI / 2.4;
  root.add(ringA);
  const ringB = new Mesh(new TorusGeometry(3.35, 0.01, 8, isMobile ? 80 : 160), ringMat);
  ringB.rotation.x = Math.PI / 1.7;
  ringB.rotation.y = 0.6;
  root.add(ringB);

  const sparks = new Points(
    buildSparks(isMobile ? 180 : 420),
    new PointsMaterial({
      color: ACID,
      size: isMobile ? 0.025 : 0.03,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: AdditiveBlending,
      sizeAttenuation: true,
    }),
  );
  root.add(sparks);

  const pointer = new Vector2(0, 0);
  const target = new Vector2(0, 0);
  const clock = new Clock();
  let scrollFade = 1;
  let raf = 0;
  let alive = true;

  const onPointer = (e: PointerEvent) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  const onScroll = () => {
    scrollFade = Math.max(0.2, 1 - window.scrollY / (window.innerHeight * 0.9));
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
    const t = clock.getElapsedTime();
    pointer.lerp(target, 0.045);
    uniforms.uTime.value = t;
    uniforms.uMouse.value.copy(pointer);

    if (!reduced) {
      root.rotation.y = t * 0.22 + pointer.x * 0.55;
      root.rotation.x = 0.22 + pointer.y * 0.4;
      root.position.x = (isMobile ? 0 : 1.35) + pointer.x * 0.25;
      root.position.y = (isMobile ? 0.9 : 0.1) - pointer.y * 0.15;
      shell.rotation.y = -t * 0.16;
      shell.rotation.z = t * 0.1;
      ringA.rotation.z = t * 0.45;
      ringB.rotation.z = -t * 0.28;
      sparks.rotation.y = t * 0.07;
      core.scale.setScalar(1 + Math.sin(t * 1.6) * 0.045);
      uniforms.uFade.value = scrollFade;
      (sparks.material as PointsMaterial).opacity = 0.25 + scrollFade * 0.5;
    }

    camera.position.x = (isMobile ? 0 : 1.1) + pointer.x * 0.45;
    camera.position.y = 0.15 - pointer.y * 0.25;
    camera.lookAt(root.position.x * 0.55, root.position.y * 0.4, 0);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  const onVisibility = () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (alive) {
      clock.start();
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
      core.geometry.dispose();
      shell.geometry.dispose();
      ringA.geometry.dispose();
      ringB.geometry.dispose();
      sparks.geometry.dispose();
      mat.dispose();
      wireMat.dispose();
      ringMat.dispose();
      (sparks.material as PointsMaterial).dispose();
      renderer.dispose();
    },
    setSignal: (hex: number) => {
      uniforms.uColor.value.setHex(hex);
      (sparks.material as PointsMaterial).color.setHex(hex);
    },
  };
}

export function setEggPalette(active: boolean, scene?: SceneHandle): void {
  document.body.classList.toggle("is-egg", active);
  scene?.setSignal(active ? ACID_EGG : ACID);
}
