/* VELOUR — PWA layer: service worker, dark mode, command palette (Ctrl/⌘ K),
   install prompt. Runs on every page; degrades gracefully. */
(function () {
  const V = (window.VELOUR = window.VELOUR || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const toast = (...a) => (V.toast ? V.toast(...a) : console.log.apply(console, a));

  /* ------------------------------------------------------------- dark mode */
  const applyTheme = t => {
    document.documentElement.setAttribute("data-theme", t);
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t === "dark" ? "#0F0D0A" : "#17140F");
    $$("[data-theme-toggle]").forEach(b => b.setAttribute("aria-pressed", t === "dark" ? "true" : "false"));
  };
  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = cur === "dark" ? "light" : "dark";
    store.set("velour_theme", next); applyTheme(next);
    toast(next === "dark" ? "Dark mode on" : "Light mode on");
  }
  applyTheme(store.get("velour_theme", (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light"));

  /* ------------------------------------------------------------- service worker */
  if ("serviceWorker" in navigator) {
    addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  /* ------------------------------------------------------------- install */
  let deferred = null;
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; showInstall(); });
  window.addEventListener("appinstalled", () => { toast("VELOUR installed"); hideInstall(); });
  function showInstall() { const b = $("#installBtn"); if (b) b.hidden = false; }
  function hideInstall() { const b = $("#installBtn"); if (b) b.hidden = true; }
  function promptInstall() {
    if (!deferred) { toast("Use your browser menu → “Install app”"); return; }
    deferred.prompt(); deferred.userChoice.then(() => { deferred = null; hideInstall(); });
  }
  V.install = promptInstall;

  /* ------------------------------------------------------------- command palette */
  const COMMANDS = [
    { t: "New In", s: "Page", u: "index.html", i: "✦" },
    { t: "Shop all", s: "Page", u: "shop.html", i: "▦" },
    { t: "Women", s: "Page", u: "shop.html?dept=women", i: "▦" },
    { t: "Men", s: "Page", u: "shop.html?dept=men", i: "▦" },
    { t: "Kids", s: "Page", u: "shop.html?dept=kids", i: "▦" },
    { t: "Accessories", s: "Page", u: "shop.html?dept=accessories", i: "▦" },
    { t: "Home & Living", s: "Page", u: "shop.html?dept=home", i: "▦" },
    { t: "Fragrance", s: "Page", u: "shop.html?dept=fragrance", i: "▦" },
    { t: "Sale", s: "Page", u: "shop.html?sale=1", i: "%" },
    { t: "Journal", s: "Page", u: "journal.html", i: "❡" },
    { t: "Wishlist", s: "Page", u: "wishlist.html", i: "♡" },
    { t: "Cart", s: "Page", u: "cart.html", i: "▤" },
    { t: "My account", s: "Page", u: "account.html", i: "☺" },
    { t: "Size guide", s: "Page", u: "size-guide.html", i: "↔" },
    { t: "AI Stylist", s: "Action", a: () => V.stylist && V.stylist.open(), i: "✧" },
    { t: "Visual search", s: "Action", a: () => V.features && V.features.visualSearch(), i: "◉" },
    { t: "Gift finder", s: "Action", a: () => V.features && V.features.gift(), i: "❏" },
    { t: "Size recommender", s: "Action", a: () => V.features && V.features.sizeRec(), i: "↔" },
    { t: "Toggle dark mode", s: "Action", a: toggleTheme, i: "◐" },
    { t: "Install app", s: "Action", a: promptInstall, i: "⤓" }
  ];
  let pal, input, listEl, items = [], sel = 0;
  function buildPalette() {
    if (pal) return;
    pal = document.createElement("div");
    pal.className = "cmdk";
    pal.innerHTML = `
      <div class="cmdk-panel" role="dialog" aria-label="Command palette">
        <div class="cmdk-input">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input id="cmdkInput" type="text" placeholder="Search pages, products or actions…" autocomplete="off" aria-label="Command input">
          <kbd>esc</kbd>
        </div>
        <div class="cmdk-list" id="cmdkList"></div>
        <div class="cmdk-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> select</span><span>VELOUR command</span></div>
      </div>`;
    document.body.appendChild(pal);
    input = $("#cmdkInput", pal); listEl = $("#cmdkList", pal);
    pal.addEventListener("click", e => { if (e.target === pal) closePalette(); });
    input.addEventListener("input", run);
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { sel = Math.min(sel + 1, items.length - 1); paintList(); e.preventDefault(); }
      else if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); paintList(); e.preventDefault(); }
      else if (e.key === "Enter") { run(); pick(items[sel]); }
      else if (e.key === "Escape") closePalette();
    });
  }
  function run() {
    const q = input.value.trim().toLowerCase();
    let rows = COMMANDS.filter(c => !q || (c.t + " " + c.s).toLowerCase().includes(q));
    if (q && V.products && V.products.length) {
      const hits = V.products.filter(p => (p.name + " " + p.brand + " " + p.cat + " " + p.dept).toLowerCase().includes(q)).slice(0, 6);
      rows = rows.concat(hits.map(p => ({ t: p.name, s: p.brand + " · " + p.cat, u: "product.html?id=" + p.id, i: "▦", price: p.price, img: p.img })));
    } else if (!q && V.products) {
      rows = rows.concat(V.products.slice(0, 3).map(p => ({ t: p.name, s: "Popular · " + p.cat, u: "product.html?id=" + p.id, i: "▦", price: p.price, img: p.img })));
    }
    items = rows.slice(0, 12); sel = 0; paintList();
  }
  function paintList() {
    if (!listEl) return;
    listEl.innerHTML = items.length ? items.map((c, i) => `
      <button class="cmdk-item${i === sel ? " on" : ""}" data-i="${i}">
        ${c.img ? `<img src="${c.img}" alt="">` : `<span class="ci">${c.i || "•"}</span>`}
        <span class="lbl"><b>${c.t}</b><small>${c.s}</small></span>
        ${c.price ? `<span class="pr">${V.money ? V.money(c.price) : c.price}</span>` : `<span class="go">↵</span>`}
      </button>`).join("") : `<div class="cmdk-empty">No matches</div>`;
    $$(".cmdk-item", listEl).forEach(b => b.onclick = () => pick(items[+b.dataset.i]));
  }
  function pick(c) { if (!c) return; closePalette(); if (c.a) c.a(); else if (c.u) location.href = c.u; }
  function openPalette() { buildPalette(); pal.classList.add("on"); input.value = ""; sel = 0; run(); setTimeout(() => input.focus(), 20); }
  function closePalette() { if (pal) pal.classList.remove("on"); }
  V.palette = openPalette;

  addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); }
  });

  /* ------------------------------------------------------------- header tools */
  function injectTools() {
    const tools = $("header .tools");
    if (!tools || tools.dataset.pwa) return;
    tools.dataset.pwa = "1";
    const themeBtn = document.createElement("button");
    themeBtn.setAttribute("data-theme-toggle", "");
    themeBtn.setAttribute("aria-label", "Toggle dark mode");
    themeBtn.title = "Toggle theme (dark / light)";
    themeBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';
    themeBtn.onclick = toggleTheme;
    const cmdBtn = document.createElement("button");
    cmdBtn.setAttribute("aria-label", "Open command palette");
    cmdBtn.title = "Command palette (Ctrl K)";
    cmdBtn.className = "cmd-btn";
    cmdBtn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h10M7 13h6"/></svg>';
    cmdBtn.onclick = openPalette;
    tools.insertBefore(themeBtn, tools.firstChild);
    tools.insertBefore(cmdBtn, tools.firstChild);
    const install = document.createElement("button");
    install.id = "installBtn"; install.hidden = true; install.className = "install-btn";
    install.setAttribute("aria-label", "Install VELOUR app");
    install.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg><span>Install</span>';
    install.onclick = promptInstall;
    const wrap = $("header .wrap.nav") || $("header .wrap");
    if (wrap) wrap.appendChild(install);
    applyTheme(document.documentElement.getAttribute("data-theme") || "light");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(injectTools, 40));
  else setTimeout(injectTools, 40);
  // header is injected by app.js after DOMContentLoaded; retry once
  addEventListener("load", () => setTimeout(injectTools, 80));
})();
