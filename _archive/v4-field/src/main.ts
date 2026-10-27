import "./style.css";
import { createScene } from "./scene";
import { createTerminal } from "./terminal";
import { wireEasterEggs } from "./eggs";

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const boot = document.getElementById("boot");
const dismissBoot = () => boot?.classList.add("is-out");
window.setTimeout(dismissBoot, 1600);
window.addEventListener("pointerdown", dismissBoot, { once: true });
window.addEventListener("keydown", dismissBoot, { once: true });

const canvas = document.getElementById("scene");
const scene = canvas instanceof HTMLCanvasElement ? createScene(canvas) : null;

const term = createTerminal();
term.onCommand = (cmd) => {
  if (!scene) return false;
  if (cmd === "pulse" || cmd === "boom") {
    scene.pulse(2.2);
    term.print("shockwave", "ok");
    return true;
  }
  if (cmd === "chaos") {
    scene.setMode("chaos");
    term.print("mode=chaos", "ok");
    return true;
  }
  if (cmd === "magnet") {
    scene.setMode("magnet");
    term.print("mode=magnet", "ok");
    return true;
  }
  if (cmd === "orbit") {
    scene.setMode("orbit");
    term.print("mode=orbit", "ok");
    return true;
  }
  return false;
};

wireEasterEggs(term, scene);
