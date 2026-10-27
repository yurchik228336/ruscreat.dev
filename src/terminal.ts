type TermApi = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  print: (line: string, cls?: string) => void;
};

const HELP = ["cmds: help whoami hunt java clear eggs", "this is a quiet shell under the portfolio"];

export function createTerminal(): TermApi {
  const panel = document.getElementById("term");
  const out = document.getElementById("term-out");
  const input = document.getElementById("term-input") as HTMLInputElement | null;
  const closeBtn = document.getElementById("term-close");
  const openBtn = document.getElementById("open-term");

  const api: TermApi = {
    open: () => undefined,
    close: () => undefined,
    toggle: () => undefined,
    print: () => undefined,
  };

  if (!panel || !out || !input) return api;

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
        print("RusCreat | java mid | perimeter hunter", "ok");
        break;
      case "hunt":
        print("map > collision > evidence > report");
        break;
      case "java":
        print("spring · jvm · no magic");
        break;
      case "eggs":
        print("logo x7 · ctrl+` · konami · #root", "muted");
        break;
      case "clear":
        out.innerHTML = "";
        print("cleared", "muted");
        break;
      case "exit":
      case "q":
        close();
        break;
      default:
        print(`not found: ${cmd}`, "muted");
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
  print("quiet shell. type help", "muted");

  api.open = open;
  api.close = close;
  api.toggle = toggle;
  api.print = print;
  return api;
}
