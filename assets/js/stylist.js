/* VELOUR AI Stylist — hybrid engine.
   A local reasoning engine (occasion/intent/budget/colour-tone extraction +
   weighted catalogue ranking + dialogue slots) runs entirely offline. When the
   network is available it optionally asks a key-less LLM endpoint only to phrase
   the intro line; the recommended products are always retrieved locally so the
   advice is grounded and never hallucinated. Falls back silently offline. */
(function () {
  const V = (window.VELOUR = window.VELOUR || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const money = n => (V.money ? V.money(n) : "Rs " + Number(n).toLocaleString());
  const toast = (...a) => (V.toast ? V.toast(...a) : console.log.apply(console, a));
  const products = () => (V.products || []);
  const LM_ENDPOINT = "https://text.pollinations.ai/openai";

  /* ----------------------------------------------------------- knowledge base */
  const TONE_OF = {
    Black: "neutral", Ivory: "neutral", Charcoal: "cool", Navy: "cool",
    Blush: "warm", Chocolate: "warm", Olive: "warm", Sage: "warm", Sand: "warm", Wine: "warm"
  };
  const TONE_PALETTE = {
    warm: ["Blush", "Chocolate", "Olive", "Sage", "Sand", "Wine"],
    cool: ["Navy", "Charcoal"],
    neutral: ["Black", "Ivory", "Charcoal"],
    jewel: ["Navy", "Wine", "Chocolate"],
    pastel: ["Blush", "Sage", "Ivory", "Sand"]
  };
  const COLOR_ALIASES = {
    black: "Black", charcoal: "Charcoal", grey: "Charcoal", gray: "Charcoal",
    navy: "Navy", blue: "Navy", olive: "Olive", green: "Sage", sage: "Sage",
    wine: "Wine", maroon: "Wine", burgundy: "Wine", red: "Wine",
    blush: "Blush", pink: "Blush", chocolate: "Chocolate", brown: "Chocolate",
    ivory: "Ivory", white: "Ivory", cream: "Ivory", beige: "Sand", sand: "Sand", nude: "Sand"
  };
  const FORM = {
    Sherwani: 5, Blazer: 4, Waistcoat: 4, Shirts: 3, Trousers: 3,
    "Kameez Shalwar": 4, "Kurti / Kurta": 3, Kurta: 2, "Ready to Wear": 2,
    Apparel: 3, Unstitched: 3, Bags: 2, Accessories: 2, Perfume: 3, "Home Textiles": 1
  };
  const OCCASIONS = {
    wedding: { label: "a wedding", cats: ["Sherwani", "Kameez Shalwar", "Kurti / Kurta", "Blazer", "Waistcoat", "Apparel"], depts: ["women", "men"], tone: "jewel", formality: 5, verb: "celebrate in" },
    eid: { label: "Eid", cats: ["Kameez Shalwar", "Kurti / Kurta", "Sherwani", "Ready to Wear", "Apparel"], depts: ["women", "men", "kids"], tone: "warm", formality: 4, verb: "dress for" },
    formal: { label: "work", cats: ["Shirts", "Trousers", "Blazer", "Waistcoat"], depts: ["men", "women"], tone: "cool", formality: 4, verb: "wear to the office" },
    casual: { label: "everyday", cats: ["Ready to Wear", "Kurti / Kurta", "Shirts", "Trousers", "Apparel"], depts: ["women", "men", "kids"], tone: "warm", formality: 2, verb: "live in" },
    party: { label: "an evening out", cats: ["Apparel", "Ready to Wear", "Blazer", "Kurti / Kurta"], depts: ["women", "men"], tone: "jewel", formality: 4, verb: "step out in" },
    home: { label: "your home", cats: ["Home Textiles"], depts: ["home"], tone: "neutral", formality: 1, verb: "style" },
    fragrance: { label: "a signature scent", cats: ["Perfume"], depts: ["fragrance"], tone: "warm", formality: 3, verb: "gift" },
    gift: { label: "a gift", cats: ["Accessories", "Bags", "Perfume", "Home Textiles"], depts: ["accessories", "fragrance", "home"], tone: "neutral", formality: 3, verb: "gift" }
  };

  /* ----------------------------------------------------------- entity parsing */
  function parse(text) {
    const t = " " + text.toLowerCase() + " ";
    const out = { occasion: null, dept: null, budget: null, tone: null, color: null, gender: null, refine: null };
    if (/\b(wedding|mehndi|mehendi|baraat|barat|valima|walima|nikkah|shaadi|shadi|marriage|bridal)\b/.test(t)) out.occasion = "wedding";
    else if (/\b(eid|eidain|festive|festival)\b/.test(t)) out.occasion = "eid";
    else if (/\b(office|work|formal|interview|business|meeting|corporate)\b/.test(t)) out.occasion = "formal";
    else if (/\b(party|dinner|evening|night out|celebration|birthday|function|dawat)\b/.test(t)) out.occasion = "party";
    else if (/\b(casual|everyday|every day|daily|uni|university|college|lounge|weekend)\b/.test(t)) out.occasion = "casual";
    else if (/\b(home|decor|bedding|bedroom|towel|curtain|cushion)\b/.test(t)) out.occasion = "home";
    else if (/\b(perfume|fragrance|scent|attar|oud)\b/.test(t)) out.occasion = "fragrance";
    else if (/\b(gift|present|birthday present)\b/.test(t)) out.occasion = "gift";

    if (/\b(women|woman|womens|ladies|lady|female|her|hers|wife|mom|mum|mother|sister|aunt)\b/.test(t)) { out.dept = "women"; out.gender = "women"; }
    else if (/\b(men|man|mens|gents|male|him|his|husband|dad|father|brother|uncle)\b/.test(t)) { out.dept = "men"; out.gender = "men"; }
    else if (/\b(kids|kid|child|children|boy|girl|baby|toddler)\b/.test(t)) { out.dept = "kids"; }
    else if (/\b(home|decor)\b/.test(t)) out.dept = "home";

    const bud = t.match(/(?:under|below|less than|up to|upto|max|budget of|around|about|within|rs\.?|pkr)?\s*rs?\s*([\d,]+)\s*(k|thousand)?/);
    if (bud) { let n = parseInt(bud[1].replace(/,/g, ""), 10); if (bud[2]) n *= 1000; if (n >= 500) out.budget = n; }

    if (/\b(cheaper|budget|affordable|less expensive|save|economical)\b/.test(t) && !out.budget) out.refine = "cheaper";
    if (/\b(more formal|dressy|smarter|formal)\b/.test(t) && !/office|work/.test(t)) out.refine = "formal";
    if (/\b(more casual|relaxed|chill|easy)\b/.test(t)) out.refine = "casual";
    if (/\b(show more|more options|others|more|next|different)\b/.test(t)) out.refine = "more";

    for (const k in COLOR_ALIASES) if (new RegExp("\\b" + k + "\\b").test(t)) { out.color = COLOR_ALIASES[k]; break; }
    if (out.color && TONE_OF[out.color]) out.tone = TONE_OF[out.color];
    if (/\b(warm|earthy|golden|cozy|cosy|autumnal)\b/.test(t)) out.tone = "warm";
    else if (/\b(cool|crisp|icy)\b/.test(t)) out.tone = "cool";
    else if (/\b(neutral|classic|monochrome|minimal)\b/.test(t)) out.tone = "neutral";
    else if (/\b(jewel|rich|deep|regal)\b/.test(t)) out.tone = "jewel";
    else if (/\b(pastel|soft|muted)\b/.test(t)) out.tone = "pastel";
    return out;
  }

  /* ----------------------------------------------------------- ranking */
  function scoreProduct(p, s, plan) {
    let sc = 0, why = [];
    const cats = plan.cats || [], depts = plan.depts || [];
    if (s.dept && p.dept === s.dept) { sc += 3; why.push("for " + p.dept); }
    else if (depts.includes(p.dept)) sc += 1.4;
    if (cats.includes(p.cat)) { sc += 3; why.push("in " + p.cat); }
    if (plan.formality != null) { const f = FORM[p.cat] || 3; sc += 1.5 - Math.abs(f - plan.formality) * 0.55; }
    if (s.budget) {
      if (p.price <= s.budget) { sc += 2; if (p.price >= s.budget * 0.4) sc += 0.4; why.push("within budget"); }
      else sc -= 3;
    }
    const cwNames = (p.colorways || []).map(c => c.name);
    if (s.color && cwNames.includes(s.color)) { sc += 3.2; why.push("in " + s.color); }
    if (plan.tone && cwNames.some(n => TONE_OF[n] === plan.tone)) sc += 1.6;
    if (!s.color && s.tone && cwNames.some(n => TONE_OF[n] === s.tone)) { sc += 1.8; why.push("in the right palette"); }
    if (p.tag === "new") sc += 0.5;
    if (p.tag === "sale") { sc += 0.4; if (s.budget) why.push("on sale"); }
    sc += ((p.id * 37) % 7) / 10; // deterministic variety
    return { sc, why };
  }
  function recommend(s, plan, offset) {
    const list = products().map(p => ({ p, ...scoreProduct(p, s, plan) })).sort((a, b) => b.sc - a.sc);
    const seen = new Set(), picked = [];
    for (const r of list) {
      if (picked.length >= 4) break;
      if (seen.has(r.p.cat) && picked.length < 3) continue;
      seen.add(r.p.cat); picked.push(r);
    }
    const start = (offset || 0) * 4;
    return list.slice(start, start + 4).map(r => ({ ...r.p, _why: (r.why[0] || "a considered choice") }));
  }

  /* ----------------------------------------------------------- NLG */
  function reasonFor(p, s, plan) {
    const cw = (p.colorways && p.colorways[0]) ? p.colorways[0].name : "";
    const bits = [];
    if (p._why && p._why !== "a considered choice") bits.push(p._why);
    if (s.budget) bits.push("under " + money(s.budget));
    if (!bits.length) bits.push(p.brand + " " + p.cat.toLowerCase());
    return bits.join(" · ");
  }
  function localIntro(s, plan, count, offset) {
    const occ = plan ? plan.label : (s.dept || "you");
    if (offset) return "Here are a few more options — ";
    const bits = [];
    bits.push("For " + occ);
    if (s.budget) bits.push("around " + money(s.budget));
    if (s.color) bits.push("in " + s.color.toLowerCase());
    else if (s.tone) bits.push("with a " + s.tone + " palette");
    return bits.join(", ") + " — here" + (count === 1 ? "'s a piece" : " are a few pieces") + " I'd reach for:";
  }
  async function llmIntro(userText, s, plan, recs) {
    if (!LM_ENABLED) return null;
    const facts = recs.map(p => `${p.name} (${p.brand}, ${p.cat}, ${money(p.price)})`).join("; ");
    const sys = "You are VELOUR's personal stylist, warm and concise, British English, no emojis, no bullet lists. " +
      "Reply with ONE short sentence (max 30 words) introducing the recommendations. " +
      "Only reference these real products: " + facts + ". Never invent products or prices.";
    const ctx = `Occasion: ${plan ? plan.label : "unspecified"}. Budget: ${s.budget ? money(s.budget) : "open"}. ` +
      `Colour: ${s.color || s.tone || "open"}. Customer said: "${userText.slice(0, 160)}"`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    try {
      const res = await fetch(LM_ENDPOINT, {
        method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "openai", temperature: 0.6, max_tokens: 80, messages: [{ role: "system", content: sys }, { role: "user", content: ctx }] })
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = await res.json();
      let txt = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "").trim();
      txt = txt.replace(/^["']|["']$/g, "").replace(/\s+/g, " ");
      if (txt.length < 8 || txt.length > 240) return null;
      return txt;
    } catch (e) { clearTimeout(timer); return null; }
  }

  /* ----------------------------------------------------------- state + turn */
  const state = { occasion: null, dept: null, gender: null, budget: null, tone: null, color: null, formality: null, offset: 0, askedBudget: false, greeted: false };
  let LM_ENABLED = store.get("velour_lm", true);
  let busy = false;

  function applyParse(p) {
    if (p.occasion) { state.occasion = p.occasion; state.offset = 0; state.askedBudget = false; }
    if (p.dept) { state.dept = p.dept; state.gender = p.gender || state.gender; state.offset = 0; }
    if (p.budget) { state.budget = p.budget; state.offset = 0; }
    if (p.color) { state.color = p.color; state.tone = p.tone || state.tone; state.offset = 0; }
    else if (p.tone) { state.tone = p.tone; state.offset = 0; }
    if (p.refine === "cheaper") { state.budget = state.budget ? Math.round(state.budget * 0.7) : 4000; state.offset = 0; }
    if (p.refine === "formal") { state.formality = (state.formality || (state.occasion && OCCASIONS[state.occasion].formality) || 3) + 1; state.offset = 0; }
    if (p.refine === "casual") { state.formality = ((state.formality || 3) - 1); state.offset = 0; }
    if (p.refine === "more") state.offset += 1;
  }
  function currentPlan() {
    let plan = state.occasion ? { ...OCCASIONS[state.occasion] } : { cats: [], depts: state.dept ? [state.dept] : [], tone: state.tone, formality: 3, label: state.dept || "you" };
    if (state.dept) plan.depts = [state.dept];
    if (state.tone) plan.tone = state.tone;
    if (state.formality != null) plan.formality = state.formality;
    return plan;
  }
  function isGreeting(t) { return /^\s*(hi|hey|hello|salam|assalam|aoa|yo|good (morning|evening|afternoon))\b/i.test(t); }
  function isThanks(t) { return /\b(thanks|thank you|shukriya|jazak)\b/i.test(t); }

  function turn(text) {
    const s = parse(text);
    applyParse(s);
    const plan = currentPlan();
    const occKnown = !!state.occasion;

    // pure greeting / smalltalk
    if ((isGreeting(text) || /^\s*$/.test(text)) && !occKnown && !s.dept) {
      return { text: "Hello — I'm your VELOUR stylist. Tell me where you're headed (a wedding, the office, everyday) and I'll pull pieces from the collection. What's the occasion?", chips: ["A wedding", "Office / work", "Everyday", "A party", "Eid", "A gift"] };
    }
    if (isThanks(text) && !s.occasion) {
      return { text: "A pleasure. Want me to build a complete look around any of these, or find something else?", chips: ["Build a full look", "Shop bags", "Under Rs 5,000"] };
    }
    if (!occKnown && !state.dept && !state.budget && !state.tone) {
      return { text: "Lovely. Tell me the occasion and I'll style it — a wedding, work, or everyday?", chips: ["A wedding", "Office / work", "Everyday", "A party", "Eid"] };
    }

    // recommend
    const recs = recommend(s, plan, state.offset);
    if (!recs.length) return { text: "I couldn't find a match for that — try a different budget or occasion?", chips: ["Under Rs 5,000", "A wedding", "Everyday"] };

    const intro = localIntro(state, plan, recs.length, state.offset);
    const chips = [];
    if (!state.budget) { chips.push("Under Rs 5,000"); chips.push("Under Rs 12,000"); }
    if (!state.tone && !state.color) { chips.push("Warm tones"); chips.push("Cool tones"); }
    chips.push("Show more"); chips.push("Build a full look");
    return { intro, recs, text: intro, chips, _canLM: true, _ctx: { text, s, plan, recs } };
  }

  /* ----------------------------------------------------------- widget */
  let panel, listEl, inputEl, chipsEl, open = false;
  const log = []; // {role, text} | {role:'assistant', intro, recs, chips}

  function ensure() {
    if (panel) return;
    const fab = document.createElement("button");
    fab.id = "stylistFab";
    fab.className = "stylist-fab";
    fab.setAttribute("aria-label", "Open AI stylist");
    fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z"/><circle cx="18.5" cy="17.5" r="2.2"/></svg><span>Stylist</span>';
    fab.onclick = () => (open ? close() : openPanel());
    document.body.appendChild(fab);

    panel = document.createElement("div");
    panel.className = "stylist-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "VELOUR AI stylist");
    panel.innerHTML = `
      <div class="sty-head">
        <div class="sty-id"><span class="sty-dot"></span><div><b>VELOUR Stylist</b><small>AI personal shopping · <span id="styMode">thinking locally</span></small></div></div>
        <div class="sty-acts">
          <button class="sty-lm" id="styLm" title="Toggle AI phrasing">LM</button>
          <button class="sty-x" id="styClose" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        </div>
      </div>
      <div class="sty-body" id="styBody"></div>
      <div class="sty-chips" id="styChips"></div>
      <form class="sty-input" id="styForm">
        <button type="button" class="sty-mic" id="styMic" aria-label="Speak"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>
        <input id="styText" type="text" placeholder="Tell me the occasion, budget, colours…" autocomplete="off" aria-label="Message the stylist">
        <button type="submit" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M4 12l16-8-6 8 6 8z"/></svg></button>
      </form>`;
    document.body.appendChild(panel);
    listEl = $("#styBody"); inputEl = $("#styText"); chipsEl = $("#styChips");
    $("#styClose").onclick = close;
    $("#styForm").addEventListener("submit", e => { e.preventDefault(); const v = inputEl.value.trim(); if (v) { inputEl.value = ""; ask(v); } });
    $("#styLm").onclick = () => { LM_ENABLED = !LM_ENABLED; store.set("velour_lm", LM_ENABLED); paintMode(); toast("AI phrasing " + (LM_ENABLED ? "on" : "off")); };
    paintMode();
    $("#styMic").onclick = () => voice(el => { inputEl.value = el; ask(el); });
    seed();
    render();
  }
  function paintMode() { const m = $("#styMode"); if (m) m.textContent = LM_ENABLED ? "AI grounded · hybrid" : "offline engine"; const b = $("#styLm"); if (b) b.classList.toggle("on", LM_ENABLED); }

  function openPanel() { ensure(); open = true; panel.classList.add("on"); document.body.classList.add("no-scroll"); setTimeout(() => inputEl && inputEl.focus(), 30); }
  function close() { open = false; if (panel) panel.classList.remove("on"); document.body.classList.remove("no-scroll"); }
  function seed() { log.push({ role: "assistant", text: "Hello — I'm your VELOUR stylist. Tell me the occasion and I'll style it from the collection. What are we dressing for?", chips: ["A wedding", "Office / work", "Everyday", "A party", "Eid", "A gift"] }); }

  function render() {
    if (!listEl) return;
    listEl.innerHTML = log.map((m, i) => {
      if (m.role === "user") return `<div class="sty-msg me">${esc(m.text)}</div>`;
      let html = `<div class="sty-msg bot">${esc(m.intro || m.text || "")}`;
      if (m.recs && m.recs.length) {
        html += `<div class="sty-cards">${m.recs.map(p => `
          <div class="sty-card" data-id="${p.id}">
            <a href="product.html?id=${p.id}"><img src="${p.img}" alt="${p.name}"></a>
            <div class="sc-info">
              <a href="product.html?id=${p.id}"><b>${p.name}</b></a>
              <small>${p.brand} · ${p.cat}</small>
              <small class="sc-why">${esc(p._why || "")}</small>
              <div class="sc-row"><span class="pr">${money(p.price)}</span><button data-add="${p.id}">Add</button></div>
            </div>
          </div>`).join("")}</div>`;
      }
      return html + `</div>`;
    }).join("");
    listEl.scrollTop = listEl.scrollHeight;
    const last = log[log.length - 1];
    chipsEl.innerHTML = (last && last.chips ? last.chips : []).map(c => `<button class="sty-chip">${esc(c)}</button>`).join("");
    $$(".sty-chip", chipsEl).forEach(b => b.onclick = () => ask(b.textContent));
    $$("[data-add]", listEl).forEach(b => b.onclick = () => { if (V.addToCart) V.addToCart(b.dataset.add); if (V.openDrawer) V.openDrawer(); });
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  async function ask(text) {
    ensure();
    log.push({ role: "user", text });
    let reply;
    try { reply = turn(text); } catch (e) { reply = { text: "Apologies — something glitched there. Could you rephrase?", chips: ["A wedding", "Everyday", "Under Rs 5,000"] }; }
    const idx = log.length;
    log.push({ role: "assistant", ...reply });
    render();
    if (reply._canLM && LM_ENABLED) {
      try {
        const intro = await llmIntro(reply._ctx.text, reply._ctx.s, reply._ctx.plan, reply._ctx.recs);
        if (intro) { const m = log[idx]; m.intro = intro; m.text = intro; render(); }
      } catch (e) {}
    }
  }

  /* ----------------------------------------------------------- voice (shared) */
  let recog = null;
  function voice(cb) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast("Voice input isn't supported in this browser"); return; }
    if (!recog) {
      recog = new SR(); recog.lang = "en-PK"; recog.interimResults = false; recog.maxAlternatives = 1;
    }
    recog.onresult = e => { const txt = e.results[0][0].transcript; cb(txt); };
    recog.onerror = () => toast("Couldn't catch that — try again");
    try { recog.start(); toast("Listening…"); } catch (e) {}
  }
  V.voice = voice;

  V.stylist = { open: openPanel, close, ask };

  // mount the launcher on every page; deep link ?stylist=1 opens it
  addEventListener("load", () => {
    try { ensure(); } catch (e) {}
    if (/[?&]stylist=1/.test(location.search)) setTimeout(openPanel, 400);
  });
})();
