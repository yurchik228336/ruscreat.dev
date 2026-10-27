import "./style.css";
import { createScene } from "./scene";
import { createTerminal } from "./terminal";
import { wireEasterEggs } from "./eggs";

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const canvas = document.getElementById("scene");
const scene = canvas instanceof HTMLCanvasElement ? createScene(canvas) : null;

const term = createTerminal();
term.onCommand = (cmd) => {
  if (!scene) return false;
  if (cmd === "breach" || cmd === "poc") {
    if (scene.getAlign() >= 0.62) {
      scene.breach();
      term.print("breach ok. gap open", "ok");
    } else {
      term.print("align the beam first", "muted");
    }
    return true;
  }
  if (cmd === "seal") {
    scene.seal();
    term.print("perimeter sealed", "ok");
    return true;
  }
  if (cmd === "align") {
    term.print(`align=${Math.round(scene.getAlign() * 100)}%`, "ok");
    return true;
  }
  return false;
};

wireEasterEggs(term, scene);
