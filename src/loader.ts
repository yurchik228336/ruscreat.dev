import gsap from "gsap";

/** Exact greetings + classes from dennissnellenberg.com */
const GREETINGS = [
  { text: "Привет", cls: "home-active home-active-first" },
  { text: "Hello", cls: "home-active" },
  { text: "Bonjour", cls: "home-active" },
  { text: "स्वागत हे", cls: "home-active" },
  { text: "Ciao", cls: "home-active" },
  { text: "Olá", cls: "home-active" },
  { text: "おい", cls: "home-active jap" },
  { text: "Hallå", cls: "home-active" },
  { text: "Guten tag", cls: "home-active" },
  { text: "Hallo", cls: "home-active-last" },
];

export type LoaderMode = "home" | "curtain";

/**
 * Port of dennissnellenberg.com initLoaderHome / initLoader
 * Source: assets/js/index-new.js
 */
export const runLoader = (
  reduced: boolean,
  mode: LoaderMode = "home",
): Promise<void> =>
  new Promise((resolve) => {
    const container = document.getElementById("loader");
    const screen = document.getElementById("loader-screen");
    const wordsWrap = document.getElementById("loader-greet");
    const curveBot = document.getElementById("loader-curve-bot");
    const onceIn = document.querySelectorAll<HTMLElement>(".once-in");

    const finish = () => {
      document.body.classList.remove("is-loading");
      container?.remove();
      resolve();
    };

    if (!container || !screen || reduced) {
      onceIn.forEach((el) => {
        el.style.transform = "none";
        el.style.opacity = "1";
      });
      finish();
      return;
    }

    const wide = window.innerWidth > 540;
    const curveStart = wide ? "10vh" : "5vh";
    const onceStart = wide ? "50vh" : "10vh";
    const tl = gsap.timeline({ onComplete: finish });

    tl.set(screen, { top: "0" });

    if (onceIn.length) {
      tl.set(onceIn, { y: onceStart });
    }

    if (curveBot) {
      tl.set(curveBot, { height: curveStart });
    }

    tl.set("html", { cursor: "wait" });

    if (mode === "home" && wordsWrap) {
      wordsWrap.replaceChildren(
        ...GREETINGS.map((g) => {
          const h2 = document.createElement("h2");
          h2.className = g.cls;
          h2.append(document.createTextNode(g.text));
          const dot = document.createElement("div");
          dot.className = "loader-dot";
          h2.append(dot);
          return h2;
        }),
      );

      const homeActive = wordsWrap.querySelectorAll<HTMLElement>(".home-active");
      const first = wordsWrap.querySelector<HTMLElement>(".home-active-first");
      const last = wordsWrap.querySelector<HTMLElement>(".home-active-last");

      tl.set(wordsWrap, { opacity: 0, y: -50 });
      tl.set(homeActive, { display: "block", opacity: 0 });
      if (last) tl.set(last, { display: "block", opacity: 0 });
      if (first) tl.set(first, { opacity: 1 });

      tl.to(wordsWrap, {
        duration: 0.8,
        opacity: 1,
        y: -50,
        ease: "power4.out",
        delay: 0.5,
      });

      tl.to(
        homeActive,
        {
          duration: 0.01,
          opacity: 1,
          stagger: 0.15,
          ease: "none",
          onStart: () => {
            gsap.to(homeActive, {
              duration: 0.01,
              opacity: 0,
              stagger: 0.15,
              ease: "none",
              delay: 0.15,
            });
          },
        },
        "-=0.4",
      );

      if (last) {
        tl.to(last, {
          duration: 0.01,
          opacity: 1,
          delay: 0.15,
        });
      }

      tl.to(screen, {
        duration: 0.8,
        top: "-100%",
        ease: "power4.inOut",
        delay: 0.2,
      });

      if (curveBot) {
        tl.to(
          curveBot,
          {
            duration: 1,
            height: "0vh",
            ease: "power4.inOut",
          },
          "-=0.8",
        );
      }

      tl.to(
        wordsWrap,
        {
          duration: 0.3,
          opacity: 0,
          ease: "none",
        },
        "-=0.8",
      );
    } else {
      // Curtain-only (Dennis initLoader)
      wordsWrap?.remove();

      tl.to(screen, {
        duration: 0.8,
        top: "-100%",
        ease: "power4.inOut",
        delay: 0.5,
      });

      if (curveBot) {
        tl.to(
          curveBot,
          {
            duration: 1,
            height: "0vh",
            ease: "power4.inOut",
          },
          "-=0.8",
        );
      }
    }

    tl.set(screen, { top: "calc(-100%)" });
    if (curveBot) tl.set(curveBot, { height: "0vh" });

    if (onceIn.length) {
      tl.to(
        onceIn,
        {
          duration: mode === "home" ? 1.5 : 1,
          y: "0vh",
          stagger: mode === "home" ? 0.07 : 0.05,
          ease: "expo.out",
          clearProps: "y",
        },
        "-=0.8",
      );
    }

    tl.set("html", { cursor: "auto" }, mode === "home" ? "-=1.2" : "-=0.8");
  });
