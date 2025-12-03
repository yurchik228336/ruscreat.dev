const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear().toString();
}

const consoleSection = document.getElementById("console-section");
const consoleOutput = document.getElementById("console-output");
const consoleInput = document.getElementById("console-input");
const openConsoleBtn = document.getElementById("open-console");
const toggleThemeBtn = document.getElementById("toggle-theme");
const logWindow = document.getElementById("log-window");
const starsCanvas = document.getElementById("stars-canvas");

function appendConsole(line, options = {}) {
  if (!consoleOutput) return;
  const div = document.createElement("div");
  if (options.asCommand) {
    div.textContent = `> ${line}`;
  } else {
    div.textContent = line;
  }
  if (options.muted) {
    div.style.color = "#6b7280";
  }
  consoleOutput.appendChild(div);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function handleCommand(cmdRaw) {
  const cmd = cmdRaw.trim().toLowerCase();
  if (!cmd) return;

  appendConsole(cmdRaw, { asCommand: true });

  switch (cmd) {
    case "help":
      appendConsole("// stack, vibe, now, clear", { muted: true });
      break;
    case "stack":
      appendConsole("stack.java = mid;");
      appendConsole("stack.python = jun;");
      appendConsole("stack.dotnet = jun;");
      appendConsole("stack.vibeCode = senior;");
      break;
    case "vibe":
      appendConsole("Вайба полные штаны.");
      break;
    case "now":
      appendConsole(`now() => ${new Date().toLocaleString()};`);
      appendConsole("// свободен для новых идей и задач.");
      break;
    case "clear":
      if (consoleOutput) {
        consoleOutput.innerHTML = "";
      }
      appendConsole("> help");
      appendConsole("// команды: stack, vibe, now, clear", { muted: true });
      break;
    default:
      appendConsole(`Unknown command: ${cmd}`, { muted: true });
      appendConsole("Попробуй: help", { muted: true });
      break;
  }
}

if (consoleInput && consoleOutput) {
  consoleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = consoleInput.value;
      consoleInput.value = "";
      handleCommand(value);
    }
  });
}

if (openConsoleBtn && consoleSection) {
  openConsoleBtn.addEventListener("click", () => {
    consoleSection.scrollIntoView({ behavior: "smooth", block: "center" });
    if (consoleInput) {
      setTimeout(() => consoleInput.focus(), 400);
    }
  });
}

if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener("click", () => {
    const isAlt = document.body.classList.toggle("alt-universe");

    if (toggleThemeBtn) {
      toggleThemeBtn.textContent = isAlt
        ? "Вернуть вселенную"
        : "Сменить вселенную";
    }

    if (consoleOutput) {
      const phrases = [
        "universe.switch(): alt;",
        "physics.rebuild();",
        "loader: неоновый режим активирован.",
      ];
      const msg = phrases[Math.floor(Math.random() * phrases.length)];
      appendConsole(msg, { muted: true });
    }
  });
}

// small ambient log animation
if (logWindow) {
  const lines = [
    "watching GitHub activity...",
    "spinning up side projects...",
    "optimizing vibe latency...",
    "rendering cosmic UI...",
  ];
  let index = 0;
  setInterval(() => {
    const node = document.createElement("div");
    node.className = "log-line";
    node.textContent = lines[index % lines.length];
    index += 1;
    logWindow.appendChild(node);
    if (logWindow.children.length > 6) {
      logWindow.removeChild(logWindow.firstChild);
    }
  }, 3500);
}

// simple starfield / parallax background
if (starsCanvas && starsCanvas.getContext) {
  const ctx = starsCanvas.getContext("2d");
  let stars = [];
  let width = window.innerWidth;
  let height = window.innerHeight;
  let pointerX = width / 2;
  let pointerY = height / 2;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    starsCanvas.width = width * window.devicePixelRatio;
    starsCanvas.height = height * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    createStars();
  }

  function createStars() {
    const count = Math.min(260, Math.floor((width * height) / 8000));
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.2 + Math.random() * 0.8, // depth
        radius: 0.4 + Math.random() * 1.6,
        speed: 0.15 + Math.random() * 0.35,
        alpha: 0.25 + Math.random() * 0.75,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const isAlt = document.body.classList.contains("alt-universe");
    const baseColor = isAlt ? "rgba(244, 114, 182," : "rgba(148, 163, 184,";

    for (const star of stars) {
      const parallaxFactor = (star.z - 0.2) * 0.6;
      const offsetX = (pointerX - width / 2) * parallaxFactor;
      const offsetY = (pointerY - height / 2) * parallaxFactor;

      const x = star.x + offsetX;
      const y = star.y + offsetY;

      ctx.beginPath();
      ctx.fillStyle = `${baseColor} ${star.alpha.toFixed(2)})`;
      ctx.arc(x, y, star.radius * star.z, 0, Math.PI * 2);
      ctx.fill();

      star.y += star.speed * star.z;
      if (star.y - 4 > height) {
        star.y = -4;
        star.x = Math.random() * width;
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (e) => {
    pointerX = e.clientX;
    pointerY = e.clientY;
  });

  resize();
  requestAnimationFrame(draw);
}


