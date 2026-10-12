/* VELOUR — futuristic, no-API-key features (all client-side):
   visual search (photo → palette → matches), AI outfit builder, event planner,
   gift finder, size recommender, personalised "For You" + recently viewed,
   compare, 360° viewer, price-drop watch, back-in-stock alerts, newsletter. */
(function () {
  const V = (window.VELOUR = window.VELOUR || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const S = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const money = n => (V.money ? V.money(n) : "Rs " + Number(n).toLocaleString());
  const toast = (...a) => (V.toast ? V.toast(...a) : console.log.apply(console, a));
  const products = () => (V.products || []);
  const byId = id => products().find(p => p.id === +id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ------------------------------------------------------------- modal helper */
  let ov, card;
  function modal(html, cls) {
    if (!ov) {
      ov = document.createElement("div"); ov.className = "fx-overlay"; ov.innerHTML = `<div class="fx-modal" id="fxModal"></div>`;
      document.body.appendChild(ov);
      ov.addEventListener("click", e => { if (e.target === ov) closeModal(); });
    }
    card = $("#fxModal", ov); card.className = "fx-modal " + (cls || "");
    card.innerHTML = `<button class="fx-x" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>` + html;
    $(".fx-x", card).onclick = closeModal;
    ov.classList.add("on"); document.body.classList.add("no-scroll");
    return card;
  }
  function closeModal() { if (ov) { ov.classList.remove("on"); document.body.classList.remove("no-scroll"); } }
  addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  V.modal = modal; V.closeModal = closeModal;

  /* ------------------------------------------------------------- colour utils */
  const rgb = hex => { const h = hex.replace("#", ""); const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h; return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]; };
  const dist = (a, b) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
  function colorMap() {
    const m = new Map();
    products().forEach(p => (p.colorways || []).forEach(c => { if (c.name && !m.has(c.name)) m.set(c.name, c.hex); }));
    return m;
  }
  function nearestName(rgbv) {
    const m = colorMap(); let best = null, bd = 1e9;
    m.forEach((hex, name) => { const d = dist(rgbv, rgb(hex)); if (d < bd) { bd = d; best = name; } });
    return best;
  }

  /* ============================================================ VISUAL SEARCH */
  async function visualSearch() {
    const c = modal(`
      <div class="fx-head"><div class="eyebrow">Visual search</div><h3 class="serif">Find pieces from any photo</h3>
      <p class="fx-sub">Upload an image or take a shot. We read its colour palette in your browser — nothing is uploaded to a server — and match it to the collection.</p></div>
      <label class="fx-drop" id="vsDrop"><input type="file" accept="image/*" id="vsFile" hidden>
        <svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3h16v-3"/></svg>
        <b>Choose a photo</b><span>or drag &amp; drop — JPG / PNG</span></label>
      <div class="fx-palette" id="vsPalette"></div>
      <div class="fx-results" id="vsResults"></div>`, "fx-wide");
    const drop = $("#vsDrop", c), file = $("#vsFile", c), pal = $("#vsPalette", c), res = $("#vsResults", c);
    ["dragover", "dragenter"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
    drop.addEventListener("drop", e => { const f = e.dataTransfer.files[0]; if (f) handle(f); });
    file.addEventListener("change", () => { if (file.files[0]) handle(file.files[0]); });

    function handle(f) {
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        const N = 72, cv = document.createElement("canvas"); cv.width = N; cv.height = N;
        const cx = cv.getContext("2d"); cx.drawImage(img, 0, 0, N, N);
        const { data } = cx.getImageData(0, 0, N, N);
        const buckets = new Map();
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 125) continue;
          const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
          if (mx > 246 && mn > 236) continue; // near-white bg
          const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
          const cur = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
          cur.r += r; cur.g += g; cur.b += b; cur.n++; buckets.set(key, cur);
        }
        const tops = [...buckets.values()].sort((a, b) => b.n - a.n).slice(0, 5)
          .map(o => [Math.round(o.r / o.n), Math.round(o.g / o.n), Math.round(o.b / o.n)]);
        const names = [...new Set(tops.map(nearestName))].filter(Boolean);
        pal.innerHTML = `<div class="fx-preview"><img src="${url}" alt="your photo"></div><div class="fx-swatches">
          ${tops.map(t => `<span style="background:rgb(${t.join(",")})" title="rgb(${t.join(",")})"></span>`).join("")}</div>
          <div class="fx-tags">${names.map(n => `<em>${n}</em>`).join("")}</div>`;
        const list = products().filter(p => (p.colorways || []).some(cw => names.includes(cw.name)));
        const scored = list.map(p => ({ p, hits: (p.colorways || []).filter(cw => names.includes(cw.name)).length }))
          .sort((a, b) => b.hits - a.hits).slice(0, 8).map(o => o.p);
        res.innerHTML = `<div class="eyebrow" style="margin:6px 0 14px">${scored.length ? scored.length + " matching pieces" : "No close matches — try another photo"}</div>
          <div class="fx-grid">${scored.map(miniCard).join("")}</div>`;
        $$("[data-add]", res).forEach(b => b.onclick = () => { V.addToCart && V.addToCart(b.dataset.add); V.openDrawer && V.openDrawer(); });
      };
      img.onerror = () => toast("Couldn't read that image");
      img.src = url;
    }
  }

  function miniCard(p) {
    return `<div class="fx-card" data-id="${p.id}">
      <a href="product.html?id=${p.id}"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"></a>
      <div class="fx-ci"><b>${esc(p.name)}</b><small>${p.brand} · ${p.cat}</small>
      <div class="fx-row"><span>${money(p.price)}</span><button data-add="${p.id}">Add</button></div></div></div>`;
  }

  /* ============================================================ OUTFIT BUILDER */
  const OCC = {
    wedding: { label: "Wedding", tone: "jewel", cats: { top: ["Sherwani", "Kameez Shalwar", "Kurti / Kurta", "Apparel"], bottom: ["Trousers", "Kameez Shalwar"], outer: ["Blazer", "Waistcoat"], acc: ["Bags", "Accessories"], scent: ["Perfume"] } },
    formal: { label: "Work", tone: "cool", cats: { top: ["Shirts", "Kurti / Kurta", "Ready to Wear"], bottom: ["Trousers"], outer: ["Blazer", "Waistcoat"], acc: ["Bags", "Accessories"], scent: ["Perfume"] } },
    casual: { label: "Everyday", tone: "warm", cats: { top: ["Ready to Wear", "Kurti / Kurta", "Shirts"], bottom: ["Trousers"], outer: ["Blazer"], acc: ["Bags", "Accessories"], scent: ["Perfume"] } },
    eid: { label: "Eid", tone: "warm", cats: { top: ["Kameez Shalwar", "Kurti / Kurta", "Sherwani"], bottom: ["Trousers"], outer: ["Waistcoat"], acc: ["Bags", "Accessories"], scent: ["Perfume"] } },
    party: { label: "Party", tone: "jewel", cats: { top: ["Apparel", "Ready to Wear", "Kurti / Kurta"], bottom: ["Trousers"], outer: ["Blazer"], acc: ["Bags", "Accessories"], scent: ["Perfume"] } }
  };
  function pick(cats, dept, budget) {
    let list = products().filter(p => cats.includes(p.cat));
    if (dept && dept !== "all") { const d = list.filter(p => p.dept === dept); if (d.length) list = d; }
    if (budget) { const inb = list.filter(p => p.price <= budget); if (inb.length) list = inb; }
    return list.sort((a, b) => (b.tag === "new") - (a.tag === "new") || a.price - b.price)[Math.floor(Math.random() * Math.min(list.length, 5))] || null;
  }
  function buildLook(occ, dept, budget) {
    const o = OCC[occ] || OCC.casual;
    const split = { top: 0.42, bottom: 0.18, outer: 0.22, acc: 0.1, scent: 0.08 };
    const look = [];
    ["top", "bottom", "outer", "acc", "scent"].forEach(slot => {
      const p = pick(o.cats[slot], slot === "bottom" || slot === "top" ? dept : dept, budget ? budget * split[slot] : 0) || pick(o.cats[slot], dept, 0);
      if (p && !look.find(x => x.id === p.id)) look.push({ slot, p });
    });
    return look;
  }
  function lookTotal(look) { return look.reduce((s, x) => s + x.p.price, 0); }
  function builder() {
    const c = modal(`
      <div class="fx-head"><div class="eyebrow">AI outfit builder</div><h3 class="serif">A complete look, in one tap</h3>
      <p class="fx-sub">Tell me the occasion and budget — I'll assemble a head-to-toe look from the collection.</p></div>
      <div class="fx-form">
        <div class="field"><label>Occasion</label><select id="obOcc">${Object.keys(OCC).map(k => `<option value="${k}">${OCC[k].label}</option>`).join("")}</select></div>
        <div class="field"><label>For</label><select id="obDept"><option value="all">Anyone</option><option value="women">Women</option><option value="men">Men</option><option value="kids">Kids</option></select></div>
        <div class="field"><label>Budget (Rs)</label><input id="obBudget" type="number" placeholder="e.g. 25000" min="1000"></div>
      </div>
      <button class="btn block" id="obGo">Build my look</button>
      <div id="obOut" class="fx-look"></div>`, "fx-wide");
    $("#obGo", c).onclick = () => {
      const occ = $("#obOcc").value, dept = $("#obDept").value, budget = +$("#obBudget").value || 0;
      const look = buildLook(occ, dept, budget);
      if (!look.length) { $("#obOut", c).innerHTML = "<p>No look found — try widening the budget.</p>"; return; }
      $("#obOut", c).innerHTML = `
        <div class="fx-look-head"><b>${OCC[occ].label} look</b><span>Total ${money(lookTotal(look))}${budget ? " · budget " + money(budget) : ""}</span></div>
        ${look.map(x => `<div class="fx-look-row"><span class="slot">${x.slot}</span><img src="${x.p.img}" alt="${esc(x.p.name)}"><div class="li"><a href="product.html?id=${x.p.id}"><b>${esc(x.p.name)}</b></a><small>${x.p.brand} · ${x.p.cat}</small></div><span class="pr">${money(x.p.price)}</span></div>`).join("")}
        <button class="btn block" id="obAdd">Add the whole look to bag · ${money(lookTotal(look))}</button>`;
      $("#obAdd", c).onclick = () => { look.forEach(x => V.addToCart && V.addToCart(x.p.id)); closeModal(); V.openDrawer && V.openDrawer(); toast(look.length + " pieces added"); };
    };
  }

  /* ============================================================ EVENT PLANNER */
  function planner() {
    const events = ["Mehndi", "Baraat", "Valima"];
    const c = modal(`
      <div class="fx-head"><div class="eyebrow">AI event planner</div><h3 class="serif">Plan every event to a budget</h3>
      <p class="fx-sub">Wedding season, sorted. Set one budget and I'll allocate it across your events and style each look.</p></div>
      <div class="fx-form">
        <div class="field"><label>Total budget (Rs)</label><input id="evBudget" type="number" value="90000" min="5000"></div>
        <div class="field"><label>For</label><select id="evDept"><option value="women">Women</option><option value="men">Men</option></select></div>
        <div class="field"><label>Events</label><div class="fx-checks">${events.map((e, i) => `<label><input type="checkbox" value="${e}" data-ev="${e}" ${i < 3 ? "checked" : ""}> ${e}</label>`).join("")}</div></div>
      </div>
      <button class="btn block" id="evGo">Plan my season</button>
      <div id="evOut" class="fx-look"></div>`, "fx-wide");
    $("#evGo", c).onclick = () => {
      const budget = +$("#evBudget").value || 0, dept = $("#evDept").value;
      const chosen = $$("#evOut", c).length; // noop
      const sel = $$(".fx-checks input:checked", c).map(i => i.value);
      if (!sel.length) { $("#evOut", c).innerHTML = "<p>Pick at least one event.</p>"; return; }
      const per = Math.round(budget / sel.length);
      $("#evOut", c).innerHTML = sel.map(ev => {
        const look = buildLook("wedding", dept, per);
        return `<div class="fx-look-head"><b>${ev}</b><span>allowance ${money(per)} · look ${money(lookTotal(look))}</span></div>
          <div class="fx-grid">${look.map(x => miniCard(x.p)).join("")}</div>`;
      }).join("");
      $$("[data-add]", $("#evOut", c)).forEach(b => b.onclick = () => { V.addToCart && V.addToCart(b.dataset.add); toast("Added to bag"); });
    };
  }

  /* ============================================================ GIFT FINDER */
  function gift() {
    const c = modal(`
      <div class="fx-head"><div class="eyebrow">Gift finder</div><h3 class="serif">Find the perfect gift</h3>
      <p class="fx-sub">Three quick questions and I'll shortlist something lovely.</p></div>
      <div class="fx-form">
        <div class="field"><label>Who is it for?</label><select id="gfWho"><option value="women">For her</option><option value="men">For him</option><option value="kids">For a child</option><option value="home">For the home</option><option value="fragrance">A scent lover</option></select></div>
        <div class="field"><label>Occasion</label><select id="gfOcc"><option value="birthday">Birthday</option><option value="wedding">Wedding</option><option value="eid">Eid</option><option value="thankyou">Thank you</option><option value="anniversary">Anniversary</option></select></div>
        <div class="field"><label>Budget (Rs)</label><select id="gfBudget"><option value="3000">Under 3,000</option><option value="6000" selected>Under 6,000</option><option value="12000">Under 12,000</option><option value="999999">No limit</option></select></div>
      </div>
      <button class="btn block" id="gfGo">Show gifts</button>
      <div id="gfOut" class="fx-look"></div>`, "fx-wide");
    $("#gfGo", c).onclick = () => {
      const who = $("#gfWho").value, budget = +$("#gfBudget").value;
      let list = products().filter(p => (who === "fragrance" ? p.dept === "fragrance" : p.dept === who) && p.price <= budget);
      if (list.length < 4) list = products().filter(p => p.dept === who && p.price <= budget);
      list.sort((a, b) => (b.tag === "new") - (a.tag === "new")).slice(0, 8);
      const picks = list.slice(0, 8);
      $("#gfOut", c).innerHTML = picks.length
        ? `<div class="eyebrow" style="margin:14px 0 12px">${picks.length} lovely options</div><div class="fx-grid">${picks.map(miniCard).join("")}</div>`
        : `<p style="margin-top:14px">Nothing under that budget — try a higher one.</p>`;
      $$("[data-add]", $("#gfOut", c)).forEach(b => b.onclick = () => { V.addToCart && V.addToCart(b.dataset.add); toast("Added to bag"); });
    };
  }

  /* ============================================================ SIZE RECOMMENDER */
  function sizeRec() {
    const c = modal(`
      <div class="fx-head"><div class="eyebrow">Smart size</div><h3 class="serif">Find your size in seconds</h3>
      <p class="fx-sub">Answer a few questions — we'll suggest a size and open the guide for the finer details.</p></div>
      <div class="fx-form">
        <div class="field"><label>Fit preference</label><select id="szFit"><option value="slim">Slim</option><option value="regular" selected>Regular</option><option value="relaxed">Relaxed</option></select></div>
        <div class="field"><label>Height (cm)</label><input id="szH" type="number" placeholder="e.g. 175" min="120" max="215"></div>
        <div class="field"><label>Usual size</label><select id="szUsual"><option>XS</option><option>S</option><option selected>M</option><option>L</option><option>XL</option><option>XXL</option></select></div>
        <div class="field"><label>Build</label><select id="szBuild"><option value="-1">Slighter</option><option value="0" selected>Average</option><option value="1">Broad</option></select></div>
      </div>
      <button class="btn block" id="szGo">Recommend my size</button>
      <div id="szOut" class="fx-look"></div>`);
    $("#szGo", c).onclick = () => {
      const order = ["XS", "S", "M", "L", "XL", "XXL"];
      let i = order.indexOf($("#szUsual").value);
      i += +$("#szBuild").value;
      if ($("#szFit").value === "relaxed") i += 1; if ($("#szFit").value === "slim") i -= 1;
      i = Math.max(0, Math.min(order.length - 1, i));
      const rec = order[i];
      $("#szOut", c).innerHTML = `<div class="fx-size-out"><div class="fx-size-badge">${rec}</div>
        <div><b>We recommend size ${rec}</b><p>Based on your usual size, build and preferred fit. Between sizes? Size up for a softer drape, down for a sharper line.</p>
        <a href="size-guide.html" class="btn ghost sm">Open the size guide →</a></div></div>`;
    };
  }

  /* ============================================================ COMPARE */
  let compare = S.get("velour_compare", []);
  function saveCompare() { S.set("velour_compare", compare); paintCompare(); }
  function toggleCompare(id) {
    id = +id;
    const i = compare.indexOf(id);
    if (i === -1) { if (compare.length >= 4) { toast("Compare holds up to 4 pieces"); return; } compare.push(id); toast("Added to compare"); }
    else { compare.splice(i, 1); toast("Removed from compare"); }
    saveCompare();
    $$(`[data-compare="${id}"]`).forEach(b => b.classList.toggle("on", compare.includes(id)));
  }
  function paintCompare() {
    let bar = $(".compare-bar");
    if (!compare.length) { if (bar) bar.remove(); return; }
    if (!bar) { bar = document.createElement("div"); bar.className = "compare-bar"; document.body.appendChild(bar); }
    const items = compare.map(byId).filter(Boolean);
    bar.innerHTML = `<div class="cb-inner"><span class="cb-label">Compare (${items.length})</span>
      <div class="cb-items">${items.map(p => `<span class="cb-chip"><img src="${p.img}" alt="">${esc(p.name.split(" ").slice(0, 2).join(" "))}<i data-cbx="${p.id}">×</i></span>`).join("")}</div>
      <div class="cb-acts"><button class="btn sm" id="cbOpen">Compare</button><button class="link-arrow" id="cbClear">Clear</button></div></div>`;
    $("#cbOpen", bar).onclick = openCompare;
    $("#cbClear", bar).onclick = () => { compare = []; saveCompare(); };
    $$("[data-cbx]", bar).forEach(x => x.onclick = () => { compare = compare.filter(c => c !== +x.dataset.cbx); saveCompare(); });
  }
  function openCompare() {
    const items = compare.map(byId).filter(Boolean);
    if (items.length < 2) { toast("Add at least 2 pieces to compare"); return; }
    const rows = [
      ["Price", p => money(p.price)], ["Brand", p => p.brand], ["Category", p => p.cat], ["Department", p => p.dept],
      ["Colours", p => (p.colorways || []).map(c => c.name).join(", ")], ["Sizes", p => (p.sizes || []).join(", ")],
      ["Material", p => p.material || "—"], ["Care", p => p.care || "—"]
    ];
    modal(`<div class="fx-head"><div class="eyebrow">Compare</div><h3 class="serif">Side by side</h3></div>
      <div class="fx-compare"><table><thead><tr><th></th>${items.map(p => `<th><a href="product.html?id=${p.id}"><img src="${p.img}" alt=""><span>${esc(p.name)}</span></a></th>`).join("")}</tr></thead>
      <tbody>${rows.map(([k, f]) => `<tr><th>${k}</th>${items.map(p => `<td>${esc(f(p))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`, "fx-wide");
  }

  /* ============================================================ 360 / spin */
  function spin360(id) {
    const p = byId(id); if (!p) return;
    const frames = [...new Set((p.colorways || []).map(c => c.img).concat([p.img]))];
    const c = modal(`<div class="fx-head"><div class="eyebrow">360° view</div><h3 class="serif">${esc(p.name)}</h3><p class="fx-sub">Drag left / right to spin through the colourways and angles.</p></div>
      <div class="fx-spin" id="fxSpin"><img src="${frames[0]}" alt="${esc(p.name)}" id="fxSpinImg"><span class="fx-spin-hint">↔ drag to spin</span></div>
      <div class="fx-swatches" style="justify-content:center;margin-top:14px">${(p.colorways || []).map(cw => `<span style="background:${cw.hex}" title="${cw.name}"></span>`).join("")}</div>
      <div style="text-align:center;margin-top:18px"><button class="btn" data-add="${p.id}">Add to bag · ${money(p.price)}</button></div>`, "fx-wide");
    const img = $("#fxSpinImg", c), box = $("#fxSpin", c);
    let dragging = false, x0 = 0, f = 0;
    const setF = i => { f = (i + frames.length) % frames.length; img.src = frames[f]; };
    const down = e => { dragging = true; x0 = (e.touches ? e.touches[0].clientX : e.clientX); box.classList.add("grab"); };
    const move = e => {
      if (!dragging) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX), dx = x - x0;
      const step = Math.trunc(dx / 60);
      if (step) { setF(f - step); x0 = x; img.style.transform = "rotateY(" + Math.max(-24, Math.min(24, dx)) + "deg)"; }
    };
    const up = () => { dragging = false; box.classList.remove("grab"); img.style.transform = ""; };
    box.addEventListener("mousedown", down); addEventListener("mousemove", move); addEventListener("mouseup", up);
    box.addEventListener("touchstart", down); box.addEventListener("touchmove", move); box.addEventListener("touchend", up);
    $("[data-add]", c).onclick = () => { V.addToCart && V.addToCart(p.id); closeModal(); V.openDrawer && V.openDrawer(); };
  }

  /* ============================================================ rails */
  function rail(title, ids, eyebrow) {
    const items = [...new Set(ids)].map(byId).filter(Boolean).slice(0, 6);
    if (!items.length) return "";
    return `<section class="sec tight fx-rail"><div class="wrap"><div class="sec-head"><div><div class="eyebrow">${eyebrow || "Picked for you"}</div><h2>${title}</h2></div></div>
      <div class="grid">${items.map(miniCard).join("")}</div></div></section>`;
  }
  function seen() { return S.get("velour_seen", []); }
  function trackSeen() {
    if (document.body.dataset.page !== "product") return;
    const id = +new URLSearchParams(location.search).get("id"); if (!id) return;
    const s = seen().filter(x => x !== id); s.unshift(id); S.set("velour_seen", s.slice(0, 24));
  }
  function forYou() {
    const wish = S.get("velour_wish", []), s = seen();
    const deptCount = {};
    [...s, ...wish].map(byId).filter(Boolean).forEach(p => { deptCount[p.dept] = (deptCount[p.dept] || 0) + 1; });
    const topDept = Object.keys(deptCount).sort((a, b) => deptCount[b] - deptCount[a])[0];
    let ids = [];
    if (topDept) ids = products().filter(p => p.dept === topDept && !s.slice(0, 3).includes(p.id)).map(p => p.id);
    if (ids.length < 4) ids = ids.concat(products().filter(p => p.tag === "new").map(p => p.id));
    return { ids, topDept };
  }
  function injectRails() {
    const page = document.body.dataset.page;
    const main = $("main"); if (!main) return;
    const s = seen();
    if (page === "home") {
      // For You right after hero/categories: append near end before newsletter
      const news = $(".news"); const host = news ? news.parentElement : main;
      const fy = forYou();
      if (fy.ids.length) {
        const sec = document.createElement("div"); sec.innerHTML = rail("For you", fy.ids, fy.topDept ? "Based on your browsing" : "A place to start");
        if (news) news.parentElement.insertBefore(sec.firstChild, news); else main.appendChild(sec.firstChild);
      }
      if (s.length) { const sec = document.createElement("div"); sec.innerHTML = rail("Recently viewed", s, "Pick up where you left off"); if (news) news.parentElement.insertBefore(sec.firstChild, news); else main.appendChild(sec.firstChild); }
    }
    if (page === "product" && s.length > 1) {
      const sec = document.createElement("div"); sec.innerHTML = rail("Recently viewed", s.slice(1), "Continue browsing");
      main.appendChild(sec.firstChild);
    }
    $$(".fx-rail [data-add]").forEach(b => b.onclick = () => { V.addToCart && V.addToCart(b.dataset.add); V.openDrawer && V.openDrawer(); });
  }

  /* ============================================================ wishlist extras */
  function wishlistExtras() {
    if (document.body.dataset.page !== "wishlist") return;
    const wish = S.get("velour_wish", []);
    const root = $("#wishRoot"); if (!root) return;
    const sales = wish.map(byId).filter(p => p && p.tag === "sale");
    if (sales.length) {
      const box = document.createElement("div");
      box.className = "alerts-bar";
      box.innerHTML = `<b>◎ Price watch</b><span>${sales.length} saved piece${sales.length > 1 ? "s" : ""} now reduced — ${money(sales.reduce((s, p) => s + Math.round(p.price * 0.3), 0))} off in total.</span>`;
      root.parentElement.insertBefore(box, root);
    }
    const notify = S.get("velour_notify", {});
    const btn = document.createElement("button");
    btn.className = "btn ghost sm";
    btn.style.margin = "18px 0";
    btn.textContent = "Notify me about restocks & price drops";
    btn.onclick = () => { S.set("velour_notify", Object.fromEntries(wish.map(id => [id, true]))); toast("We'll alert you on price drops"); };
    root.parentElement.appendChild(btn);
  }

  /* ============================================================ newsletter */
  function wireNews() {
    const f = $("#newsForm"); if (!f) return;
    const clone = f.cloneNode(true); f.parentNode.replaceChild(clone, f);
    clone.addEventListener("submit", e => {
      e.preventDefault();
      const email = (clone.querySelector('input[type="email"]') || {}).value || "";
      const subs = S.get("velour_subs", []); subs.unshift({ email, at: Date.now() }); S.set("velour_subs", subs.slice(0, 50));
      clone.reset(); toast("Welcome to The List ✦");
    });
  }

  /* ============================================================ launcher panel */
  function launcher() {
    const fab = document.createElement("button");
    fab.className = "fx-fab";
    fab.setAttribute("aria-label", "Open styling tools");
    fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h7"/><circle cx="18" cy="16" r="3"/></svg><span>Tools</span>';
    document.body.appendChild(fab);
    const tools = [
      ["Visual search", "Match a photo to pieces", visualSearch, "◉"],
      ["Outfit builder", "A full look in one tap", builder, "✚"],
      ["Event planner", "Style every event to budget", planner, "❖"],
      ["Gift finder", "Three questions to the perfect gift", gift, "❏"],
      ["Smart size", "Your size in seconds", sizeRec, "↔"],
      ["AI stylist", "Chat with the stylist", () => V.stylist && V.stylist.open(), "✧"]
    ];
    const panel = document.createElement("div");
    panel.className = "fx-tools";
    panel.innerHTML = `<div class="fx-tools-head"><b>Smart tools</b><button class="fx-x2" aria-label="Close">✕</button></div>
      <div class="fx-tools-grid">${tools.map((t, i) => `<button data-tool="${i}"><span class="ti">${t[3]}</span><b>${t[0]}</b><small>${t[1]}</small></button>`).join("")}</div>`;
    document.body.appendChild(panel);
    fab.onclick = () => panel.classList.toggle("on");
    $(".fx-x2", panel).onclick = () => panel.classList.remove("on");
    $$("[data-tool]", panel).forEach(b => b.onclick = () => { panel.classList.remove("on"); tools[+b.dataset.tool][2](); });
  }

  /* ============================================================ init */
  function init() {
    trackSeen();
    injectRails();
    wishlistExtras();
    wireNews();
    paintCompare();
    launcher();
    // compare buttons + 360 handled by delegation
    document.addEventListener("click", e => {
      const cb = e.target.closest("[data-compare]"); if (cb) { e.preventDefault(); toggleCompare(cb.dataset.compare); return; }
      const sp = e.target.closest("[data-spin]"); if (sp) { e.preventDefault(); spin360(sp.dataset.spin); return; }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  V.features = { visualSearch, builder, planner, gift, sizeRec, compare: toggleCompare, openCompare, spin360 };
})();
