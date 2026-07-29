type TermApi = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  print: (line: string, cls?: string) => void;
};

const HELP = [
  "commands: help · whoami · stack · hunt · java · idor · clear · sudo · eggs",
  "hint: logo×7 · Ctrl+` · ↑↑↓↓←→←→BA · #root",
];

export function createTerminal(): TermApi {
  const panel = document.getElementById("term");
  const out = document.getElementById("term-out");
  const input = document.getElementById("term-input") as HTMLInputElement | null;
  const closeBtn = document.getElementById("term-close");
  const openBtn = document.getElementById("open-term");

  if (!panel || !out || !input) {
    return {
      open: () => undefined,
      close: () => undefined,
      toggle: () => undefined,
      print: () => undefined,
    };
  }

  const print = (line: string, cls = "") => {
    const row = document.createElement("div");
    if (cls) row.className = cls;
    row.textContent = line;
    out.appendChild(row);
    out.scrollTop = out.scrollHeight;
  };

  const open = () => {
    panel.hidden = false;
    input.focus();
  };

  const close = () => {
    panel.hidden = true;
  };

  const toggle = () => {
    if (panel.hidden) open();
    else close();
  };

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    print(`$ ${raw}`, "muted");

    switch (cmd) {
      case "help":
      case "?":
        HELP.forEach((l) => print(l, "muted"));
        break;
      case "whoami":
        print("RusCreat — Java mid · external security researcher", "ok");
        break;
      case "stack":
        print("java=mid; spring; python=scripts; csharp=.net-as-needed;");
        break;
      case "hunt":
        print("recon → product map → collision hyp → evidence → report");
        print("platforms: BI.ZONE · Standoff · H1 · Bugcrowd", "muted");
        break;
      case "java":
        print("System.out.println(\"still shipping\");");
        print("// mid, но с сеньорским упрямством", "muted");
        break;
      case "sudo":
        print("permission denied: you are already root on this desk", "ok");
        break;
      case "konami":
      case "eggs":
        print("logo×7 · Ctrl+` · konami · #root|#jvm|#0day", "muted");
        break;
      case "idor":
        print("if (userId != session.userId) throw new AccessDenied();");
        print("// проверь horizontal + vertical · не только UUID", "muted");
        break;
      case "ssrf":
        print("fetch(userUrl) // ← don't. allowlist hosts, block link-local.");
        break;
      case "clear":
        out.innerHTML = "";
        print("session cleared", "muted");
        break;
      case "exit":
      case "q":
        close();
        break;
      default:
        print(`command not found: ${cmd}`, "muted");
        print("try: help", "muted");
    }
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const v = input.value;
      input.value = "";
      run(v);
    }
    if (e.key === "Escape") close();
  });

  closeBtn?.addEventListener("click", close);
  openBtn?.addEventListener("click", open);

  print("ruscreat.dev shell — type help", "muted");

  return { open, close, toggle, print };
}
