import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createTerminal } from "./terminal";
import { wireEasterEggs } from "./eggs";
import { runLoader } from "./loader";
import { wireClock, wireCursor, wireMagnetic } from "./ui";

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover)").matches;

wireClock();
wireCursor(canHover);

const startCaseMotion = () => {
  if (reduced) {
    document.querySelectorAll(".reveal").forEach((el) => {
      (el as HTMLElement).style.opacity = "1";
      (el as HTMLElement).style.transform = "none";
    });
    document.querySelectorAll(".once-in").forEach((el) => {
      (el as HTMLElement).style.transform = "none";
    });
    return;
  }

  gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  wireMagnetic(reduced);
  ScrollTrigger.refresh();
};

void runLoader(reduced, "curtain").then(startCaseMotion);

const term = createTerminal();
wireEasterEggs(term);
