import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createTerminal } from "./terminal";
import { wireEasterEggs } from "./eggs";
import { runLoader } from "./loader";
import { pointer, wireClock, wireCursor, wireMagnetic } from "./ui";

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover)").matches;
const laptopMq = window.matchMedia("(min-width: 861px)");

type LaptopMod = typeof import("./laptop");
let laptopReady: Promise<LaptopMod> | null = null;

const getLaptop = () => {
  if (!laptopReady) {
    laptopReady = import("./laptop").then(async (mod) => {
      await mod.preloadLaptop();
      return mod;
    });
  }
  return laptopReady;
};

wireClock();
const cursor = wireCursor(canHover);

let disposeLaptop: (() => void) | undefined;

const mountHeroLaptop = () => {
  const canvas = document.getElementById("laptop");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const sync = () => {
    if (!laptopMq.matches) {
      disposeLaptop?.();
      disposeLaptop = undefined;
      canvas.classList.remove("is-ready");
      return;
    }
    void getLaptop().then(({ mountLaptop }) => {
      if (!laptopMq.matches) return;
      disposeLaptop?.();
      disposeLaptop = mountLaptop(canvas, reduced);
    });
  };

  sync();
  laptopMq.addEventListener("change", sync);
};

// Mount during loader so model is ready when curtain lifts (desktop only)
mountHeroLaptop();

const startMarquee = () => {
  const marquee = document.getElementById("marquee");
  if (!marquee || reduced) return;
  const total = marquee.scrollWidth / 2;
  gsap.to(marquee, {
    x: -total,
    duration: 22,
    ease: "none",
    repeat: -1,
  });
};

const wireWorkHover = () => {
  const list = document.getElementById("work-list");
  const floatEl = document.getElementById("work-float");
  const floatInner = document.getElementById("work-float-inner");
  if (!list || !floatEl || !floatInner || !canHover || reduced) return;

  const links = [...list.querySelectorAll<HTMLElement>(".work-link")];
  const floatPos = { x: 0, y: 0 };
  const floatTarget = { x: 0, y: 0 };
  let active = false;
  const previewH = 280;

  gsap.set(floatEl, { opacity: 0, scale: 0.85, xPercent: -50, yPercent: -50 });

  const tick = () => {
    floatPos.x += (floatTarget.x - floatPos.x) * 0.14;
    floatPos.y += (floatTarget.y - floatPos.y) * 0.14;
    gsap.set(floatEl, { x: floatPos.x, y: floatPos.y });
    if (active) requestAnimationFrame(tick);
  };

  links.forEach((link) => {
    const hasPreview = link.dataset.index !== undefined;
    const index = Number(link.dataset.index ?? 0);

    link.addEventListener("pointerenter", () => {
      list.classList.add("is-hovering");
      link.parentElement?.classList.add("is-active");
      cursor?.classList.add("is-view", "is-grow");
      if (!hasPreview) return;
      gsap.to(floatInner, {
        y: -index * previewH,
        duration: 0.55,
        ease: "power3.out",
      });
      gsap.to(floatEl, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
      if (!active) {
        active = true;
        floatPos.x = pointer.x;
        floatPos.y = pointer.y;
        floatTarget.x = pointer.x;
        floatTarget.y = pointer.y;
        requestAnimationFrame(tick);
      }
    });

    link.addEventListener("pointermove", (e) => {
      floatTarget.x = e.clientX;
      floatTarget.y = e.clientY;
    });

    link.addEventListener("pointerleave", () => {
      link.parentElement?.classList.remove("is-active");
      list.classList.remove("is-hovering");
      cursor?.classList.remove("is-view");
      gsap.to(floatEl, {
        opacity: 0,
        scale: 0.85,
        duration: 0.3,
        ease: "power3.inOut",
        overwrite: "auto",
        onComplete: () => {
          active = false;
        },
      });
    });
  });
};

const startPageMotion = () => {
  if (reduced) {
    document.querySelectorAll(".reveal").forEach((el) => {
      (el as HTMLElement).style.opacity = "1";
      (el as HTMLElement).style.transform = "none";
    });
    const contactSpan = document.querySelector(".contact-title span") as HTMLElement | null;
    if (contactSpan) contactSpan.style.transform = "none";
    wireWorkHover();
    startMarquee();
    return;
  }

  gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 86%",
      },
    });
  });

  wireMagnetic(reduced);

  gsap.to(".contact-title span", {
    y: 0,
    duration: 1.1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".contact-title", start: "top 80%" },
  });

  wireWorkHover();
  startMarquee();

  ScrollTrigger.refresh();
};

void runLoader(reduced, "home").then(startPageMotion);

const term = createTerminal();
wireEasterEggs(term);
