import type { createTerminal } from "./terminal";

type Term = ReturnType<typeof createTerminal>;

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function wireEasterEggs(term: Term): void {
  const brand = document.getElementById("brand");
  const hint = document.getElementById("hint");
  let clicks = 0;
  let clickTimer = 0;
  let egg = false;
  let seq: string[] = [];

  const unlock = (reason: string) => {
    egg = !egg;
    document.body.classList.toggle("is-egg", egg);
    term.open();
    term.print(egg ? `signal on via ${reason}` : "signal off", "ok");
    if (hint) hint.textContent = egg ? "signal mode" : "logo x7 · ctrl+`";
  };

  brand?.addEventListener("click", () => {
    clicks += 1;
    window.clearTimeout(clickTimer);
    clickTimer = window.setTimeout(() => {
      clicks = 0;
    }, 1600);
    if (clicks >= 7) {
      clicks = 0;
      unlock("logo x7");
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if ((e.ctrlKey || e.metaKey) && e.key === "`") {
      e.preventDefault();
      term.toggle();
      return;
    }
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    seq.push(key);
    if (seq.length > KONAMI.length) seq = seq.slice(-KONAMI.length);
    if (seq.length === KONAMI.length && seq.every((k, i) => k === KONAMI[i])) {
      seq = [];
      unlock("konami");
    }
  });

  const applyHash = () => {
    const h = location.hash.toLowerCase();
    if (h === "#root" || h === "#jvm" || h === "#brick") {
      if (!egg) unlock(`hash ${h}`);
      history.replaceState(null, "", `${location.pathname}${location.search}`);
    }
  };
  applyHash();
  window.addEventListener("hashchange", applyHash);

  console.log(
    "%cRusCreat%c · logo x7 · ctrl+`",
    "color:#ececec;font-weight:700",
    "color:#8a8a8a",
  );
}
