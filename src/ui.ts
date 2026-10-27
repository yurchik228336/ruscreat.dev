import gsap from "gsap";

export const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

export const wireCursor = (canHover: boolean) => {
  const cursor = document.getElementById("cursor");
  if (!cursor || !canHover) return cursor;

  const cursorPos = { x: pointer.x, y: pointer.y };

  window.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    cursor.classList.add("is-on");
  });

  const loop = () => {
    cursorPos.x += (pointer.x - cursorPos.x) * 0.18;
    cursorPos.y += (pointer.y - cursorPos.y) * 0.18;
    cursor.style.transform = `translate(${cursorPos.x}px, ${cursorPos.y}px)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  document.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("pointerenter", () => {
      cursor.classList.add("is-grow");
      if (el.classList.contains("work-link") || el.classList.contains("case-next")) {
        cursor.classList.add("is-view");
      }
    });
    el.addEventListener("pointerleave", () => {
      cursor.classList.remove("is-grow", "is-view");
    });
  });

  return cursor;
};

export const wireMagnetic = (reduced: boolean) => {
  if (reduced) return;
  document.querySelectorAll<HTMLElement>(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * 0.28, y: y * 0.28, duration: 0.35, ease: "power3.out" });
    });
    el.addEventListener("pointerleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "power3.out" });
    });
  });
};

export const wireClock = () => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const clock = document.getElementById("clock");
  const tickClock = () => {
    if (!clock) return;
    clock.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  tickClock();
  window.setInterval(tickClock, 30000);
};
