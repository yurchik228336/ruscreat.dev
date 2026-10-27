import "./style.css";
import { createScene } from "./scene";
import { createTerminal } from "./terminal";
import { wireEasterEggs } from "./eggs";

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const canvas = document.getElementById("scene");
const scene = canvas instanceof HTMLCanvasElement ? createScene(canvas) : null;

const term = createTerminal();
wireEasterEggs(term, scene);

const panels = document.querySelectorAll<HTMLElement>(".panel");
if (panels.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  panels.forEach((el) => io.observe(el));
} else {
  panels.forEach((el) => el.classList.add("is-in"));
}
