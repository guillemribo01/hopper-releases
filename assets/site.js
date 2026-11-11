// Selector de modes de la portada (com el de l'app) i avís d'idioma.
(() => {
  const stage = document.querySelector("[data-stage]");
  if (stage) {
    const tabs = [...stage.querySelectorAll('[role="tab"]')];
    const imgs = [...stage.querySelectorAll(".shots img")];
    const pill = stage.querySelector(".pill");
    const caption = stage.querySelector(".caption");
    let current = 0;
    let auto = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer = 0;

    const place = (animate) => {
      const b = tabs[current];
      if (!animate) pill.style.transition = "none";
      pill.style.left = b.offsetLeft + "px";
      pill.style.width = b.offsetWidth + "px";
      if (!animate) requestAnimationFrame(() => requestAnimationFrame(() => (pill.style.transition = "")));
      if (animate) {
        pill.classList.remove("hop");
        void pill.offsetWidth;
        pill.classList.add("hop");
      }
    };
    const show = (i, animate = true) => {
      if (i === current && animate) return;
      current = (i + tabs.length) % tabs.length;
      tabs.forEach((t, j) => {
        t.setAttribute("aria-selected", String(j === current));
        t.tabIndex = j === current ? 0 : -1;
      });
      imgs.forEach((im) => im.classList.toggle("on", im.dataset.view === tabs[current].dataset.view));
      caption.textContent = tabs[current].dataset.caption;
      place(animate);
    };
    const stop = () => {
      auto = false;
      clearInterval(timer);
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => {
        stop();
        show(i);
      });
      t.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        stop();
        show(current + (e.key === "ArrowRight" ? 1 : -1));
        tabs[current].focus();
      });
    });
    show(0, false);
    addEventListener("resize", () => place(false));
    document.fonts?.ready.then(() => place(false));
    // Quan arriba la tipografia, els botons canvien d'amplada: la píndola els segueix.
    if ("ResizeObserver" in window) new ResizeObserver(() => place(false)).observe(stage.querySelector(".modes"));

    // Va canviant sol mentre es veu, fins que hi toques.
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting && auto) timer = setInterval(() => show(current + 1), 5200);
    }, { threshold: 0.4 });
    io.observe(stage);
  }

  // A la portada en anglès: si el navegador és en un altre idioma disponible, ho suggereix (sense redirigir).
  const langs = window.HOPPER_LANGS;
  const hint = document.querySelector(".lang-hint");
  if (langs && hint) {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem("hopper.site.langHint") === "1";
    } catch {}
    const pref = (navigator.languages || [navigator.language]).map((x) => x.toLowerCase().split("-")[0]);
    const match = !dismissed && pref[0] !== "en" && langs.find((l) => l.code === pref.find((p) => langs.some((x) => x.code === p)));
    if (match) {
      hint.querySelector("[data-hint]").textContent = match.hint.text;
      const a = hint.querySelector("[data-hint-link]");
      a.textContent = match.hint.open;
      a.href = match.url;
      a.lang = match.code;
      hint.classList.add("on");
      hint.querySelector("[data-hint-close]").addEventListener("click", () => {
        hint.classList.remove("on");
        try {
          localStorage.setItem("hopper.site.langHint", "1");
        } catch {}
      });
    }
  }
})();
