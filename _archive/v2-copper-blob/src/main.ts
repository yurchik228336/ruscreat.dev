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

const slabs = document.querySelectorAll<HTMLElement>(".slab");
if (slabs.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
  );
  slabs.forEach((el) => io.observe(el));
} else {
  slabs.forEach((el) => el.classList.add("is-in"));
}
