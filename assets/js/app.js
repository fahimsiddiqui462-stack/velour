/* VELOUR storefront app — header/footer, cart, quick view, rendering */
(function () {
  const V = window.VELOUR || { products: [], categories: [] };
  const money = n => (V.currency || "Rs") + " " + Number(n).toLocaleString();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const byId = id => V.products.find(p => p.id === +id);
  const imgLarge = url => url.replace(/w=\d+/, "w=900").replace(/h=\d+/, "h=900").replace(/width=\d+/, "width=900");

  /* ---------------------------------------------------------------- header */
  const NAV = [
    ["index.html", "New In", "new"],
    ["shop.html?dept=women", "Women", "women"],
    ["shop.html?dept=men", "Men", "men"],
    ["shop.html?dept=kids", "Kids", "kids"],
    ["shop.html?dept=accessories", "Accessories", "accessories"],
    ["shop.html?dept=home", "Home & Living", "home"],
    ["shop.html?dept=fragrance", "Fragrance", "fragrance"],
    ["about.html", "Journal", "journal"],
    ["shop.html?sale=1", "Sale", "sale"],
  ];
  function renderHeader() {
    const page = document.body.dataset.page || "";
    const nav = NAV.map(([href, label, key]) => {
      const active = page === key ? " class=\"active\"" : (key === "sale" ? " class=\"sale\"" : "");
      return `<a href="${href}"${active}>${label}</a>`;
    }).join("");
    $("#site-header").innerHTML = `
      <div class="announce">Free delivery on orders over Rs 5,000 &nbsp;·&nbsp; <b>New Season Edit</b> — now live</div>
      <header>
        <div class="wrap nav">
          <a href="index.html" class="brand" aria-label="Velour home">VELOUR<small>EST. LONDON</small></a>
          <nav class="menu">${nav}</nav>
          <div class="tools">
            <button id="searchOpen" aria-label="Search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></button>
            <a href="cart.html" aria-label="Account"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg><span class="lbl">Account</span></a>
            <button id="cartOpen" aria-label="Cart">
              <svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
              <span class="cart-count" id="cartCount">0</span>
            </button>
          </div>
        </div>
      </header>`;
  }
  function renderFooter() {
    $("#site-footer").innerHTML = `
      <footer>
        <div class="wrap">
          <div class="foot-grid">
            <div class="foot-brand">
              <a href="index.html" class="brand">VELOUR</a>
              <p>Considered essentials for your wardrobe and home — curated from Pakistan's finest labels.</p>
              <div class="socials">
                <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg></a>
                <a href="#" aria-label="Pinterest"><svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0-3.3 17.4c-.1-.8-.2-2 0-2.8l1-4.3s-.3-.5-.3-1.3c0-1.2.7-2.1 1.6-2.1.7 0 1.1.6 1.1 1.2 0 .8-.5 1.9-.7 2.9-.2.9.4 1.6 1.3 1.6 1.6 0 2.7-2 2.7-4.4 0-1.8-1.2-3.2-3.5-3.2-2.6 0-4.2 1.9-4.2 4 0 .7.3 1.5.6 1.9.1.1.1.2 0 .3l-.2 1c0 .2-.2.2-.3.1-1.1-.5-1.7-1.9-1.7-3.1 0-2.6 1.9-5 5.6-5 3 0 5.1 2.1 5.1 4.9 0 3-1.9 5.4-4.5 5.4-1 0-1.9-.5-2.2-1.1l-.6 2.3c-.2.8-.7 1.7-1 2.3A9 9 0 1 0 12 3z"/></svg></a>
                <a href="contact.html" aria-label="Contact"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></a>
              </div>
            </div>
            <div><h4>Shop</h4><ul>
              <li><a href="index.html">New Arrivals</a></li>
              <li><a href="shop.html?dept=women">Women</a></li>
              <li><a href="shop.html?dept=men">Men</a></li>
              <li><a href="shop.html?dept=kids">Kids</a></li>
              <li><a href="shop.html?dept=accessories">Accessories</a></li>
              <li><a href="shop.html?dept=home">Home &amp; Living</a></li>
              <li><a href="shop.html?dept=fragrance">Fragrance</a></li>
              <li><a href="shop.html?sale=1">Sale</a></li>
            </ul></div>
            <div><h4>Help</h4><ul>
              <li><a href="contact.html">Shipping &amp; Returns</a></li>
              <li><a href="contact.html">Size Guide</a></li>
              <li><a href="cart.html">Your Bag</a></li>
              <li><a href="contact.html">Repairs</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul></div>
            <div><h4>House</h4><ul>
              <li><a href="about.html">Our Story</a></li>
              <li><a href="about.html">Sustainability</a></li>
              <li><a href="about.html">Ateliers</a></li>
              <li><a href="about.html">Journal</a></li>
              <li><a href="contact.html">Careers</a></li>
            </ul></div>
          </div>
          <div class="foot-bottom">
            <span>© 2026 VELOUR. All rights reserved.</span>
            <span>Privacy · Terms · Cookies</span>
          </div>
        </div>
      </footer>`;
  }

  /* ---------------------------------------------------------------- cards */
  function cardHTML(p) {
    const tag = p.tag
      ? `<span class="tag ${p.tag}">${p.tag === "new" ? "New" : p.tag === "sale" ? "Sale" : p.tag}</span>` : "";
    const price = p.tag === "sale"
      ? `<span class="price"><s>${money(p.price)}</s>${money(Math.round(p.price * 0.7))}</span>`
      : `<span class="price">${money(p.price)}</span>`;
    return `<article class="card reveal" data-id="${p.id}">
      <div class="card-media">
        <a href="product.html?id=${p.id}"><img src="${p.img}" alt="${p.name}" loading="lazy"></a>
        ${tag}
        <button class="wish" aria-label="Wishlist"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.6-9.3-8.4C1 8.3 3 5 6.3 5c2 0 3.3 1.1 4.2 2.3.2.3.9.3 1.1 0C12.5 6.1 13.8 5 15.8 5 19 5 21 8.3 19.3 11.6 17 15.4 12 20 12 20z"/></svg></button>
        <button class="quick" data-quick="${p.id}">Quick view</button>
      </div>
      <div class="card-info">
        <div><h3><a href="product.html?id=${p.id}">${p.name}</a></h3><div class="cat-name">${p.brand} · ${p.cat}</div></div>
        <div>${price}</div>
      </div>
    </article>`;
  }

  /* ---------------------------------------------------------------- cart */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("velour_cart") || "[]"); } catch (e) { cart = []; }
  const save = () => localStorage.setItem("velour_cart", JSON.stringify(cart));
  const cartCount = () => cart.reduce((n, i) => n + i.qty, 0);
  const subtotal = () => cart.reduce((s, i) => s + (byId(i.id) ? byId(i.id).price * i.qty : 0), 0);

  function renderCart() {
    const badge = $("#cartCount");
    if (badge) { badge.textContent = cartCount(); badge.classList.toggle("on", cartCount() > 0); }
    const body = $("#drawerBody"), foot = $("#drawerFoot");
    if (body) {
      if (!cart.length) {
        body.innerHTML = `<div class="empty"><svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><p>Your bag is empty.</p><a href="shop.html" class="btn sm" style="margin-top:16px">Shop now</a></div>`;
        if (foot) foot.style.display = "none";
      } else {
        body.innerHTML = cart.map(i => {
          const p = byId(i.id); if (!p) return "";
          return `<div class="ci">
            <img src="${p.img}" alt="${p.name}">
            <div class="ci-info">
              <h4>${p.name}</h4><div class="cat-name">${p.brand} · ${p.cat}</div>
              <div class="qty"><button data-dec="${p.id}">−</button><span>${i.qty}</span><button data-inc="${p.id}">+</button></div>
            </div>
            <div class="ci-right"><span class="pr">${money(p.price * i.qty)}</span>
              <button class="rm" data-rm="${p.id}">Remove</button></div>
          </div>`;
        }).join("");
        if (foot) { foot.style.display = "block"; $("#subtotal").textContent = money(subtotal()); $("#total").textContent = money(subtotal()); }
      }
      const bl = $("#bagLine"); if (bl) bl.textContent = cartCount() + (cartCount() === 1 ? " item" : " items");
    }
    if (document.body.dataset.page === "cart") renderCartPage();
  }
  function addToCart(id, qty = 1) {
    const it = cart.find(i => i.id === +id);
    if (it) it.qty += qty; else cart.push({ id: +id, qty });
    save(); renderCart(); showToast((byId(id) ? byId(id).name : "Item") + " added to bag");
  }
  function changeQty(id, d) {
    const it = cart.find(i => i.id === +id); if (!it) return;
    it.qty += d; if (it.qty <= 0) cart = cart.filter(i => i.id !== it.id);
    save(); renderCart();
  }
  function removeItem(id) { cart = cart.filter(i => i.id !== +id); save(); renderCart(); }

  /* ---------------------------------------------------------------- search */
  let sTimer;
  function openSearch() {
    const b = $("#searchBox"); if (!b) return;
    b.classList.add("on"); $("#qInput").value = ""; $("#searchResults").innerHTML = "";
    document.body.classList.add("no-scroll"); $("#qInput").focus();
  }
  function runSearch() {
    const q = $("#qInput").value.trim().toLowerCase();
    const box = $("#searchResults"); box.innerHTML = "";
    if (!q) { $("#searchAll").setAttribute("href", "shop.html"); return; }
    const hits = V.products.filter(p => (p.name + " " + p.brand + " " + p.cat + " " + p.dept + " " + p.desc).toLowerCase().includes(q)).slice(0, 6);
    box.innerHTML = hits.length
      ? hits.map(cardHTML).join("")
      : `<div class="empty-page"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><p>No pieces match “${$("#qInput").value}”.</p></div>`;
    $("#searchAll").setAttribute("href", "shop.html?q=" + encodeURIComponent($("#qInput").value.trim()));
  }

  /* ---------------------------------------------------------------- drawer / modal */
  function openDrawer() { $("#drawer").classList.add("on"); $("#overlay").classList.add("on"); document.body.classList.add("no-scroll"); }
  function closeAll() { $("#drawer").classList.remove("on"); $("#overlay").classList.remove("on"); $("#modal").classList.remove("on"); $("#searchBox").classList.remove("on"); document.body.classList.remove("no-scroll"); }

  function quickView(id) {
    const p = byId(id); if (!p) return;
    $("#modalCard").dataset.pid = id;
    $("#modalCard").innerHTML = `
      <img src="${imgLarge(p.colorways[0].img)}" alt="${p.name}">
      <div class="modal-copy">
        <button class="x" data-close aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <div class="eyebrow">${p.brand} · ${p.cat}</div>
        <h3 class="serif">${p.name}</h3>
        <div class="price">${money(p.price)}</div>
        <p>${p.desc}</p>
        <div class="eyebrow" style="margin-bottom:10px">Colour — <span id="mColorPick" style="text-transform:none;letter-spacing:.02em">${p.colorways[0].name}</span></div>
        <div class="swatches" id="mSwatches">${p.colorways.map((c, i) => `<span class="sw${i === 0 ? " on" : ""}" style="background:${c.hex}" title="${c.name}" data-cw="${i}"></span>`).join("")}</div>
        <div class="eyebrow" style="margin-bottom:10px">Size — <span id="mSizePick" style="text-transform:none;letter-spacing:.02em">${p.sizes[0]}</span></div>
        <div class="sizes">${p.sizes.map((s, i) => `<span class="size${i === 0 ? " on" : ""}">${s}</span>`).join("")}</div>
        <button class="btn block" data-add="${p.id}">Add to bag — ${money(p.price)}</button>
      </div>`;
    $("#modal").classList.add("on"); $("#overlay").classList.add("on"); document.body.classList.add("no-scroll");
  }

  /* ---------------------------------------------------------------- product page */
  let pdpProduct = null;
  function renderProduct() {
    const id = new URLSearchParams(location.search).get("id") || "1";
    const p = byId(id) || V.products[0];
    pdpProduct = p;
    const gallery = [p.img, ...V.products.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 3).map(x => x.img)];
    while (gallery.length < 4) gallery.push(p.img);
    const price = p.tag === "sale"
      ? `<span class="price"><s>${money(p.price)}</s> ${money(Math.round(p.price * 0.7))}</span>`
      : `<span class="price">${money(p.price)}</span>`;
    $("#productRoot").innerHTML = `
      <div class="crumbs"><a href="index.html">Home</a> / <a href="shop.html?dept=${p.dept}">${p.dept[0].toUpperCase() + p.dept.slice(1)}</a> / <span>${p.name}</span></div>
      <div class="pdp">
        <div class="gallery">
          <div class="thumbs">${gallery.map((g, i) => `<img src="${g}" class="${i === 0 ? "on" : ""}" data-g="${i}" alt="${p.name} view ${i + 1}">`).join("")}</div>
          <div class="gallery-main"><img id="mainImg" src="${gallery[0]}" alt="${p.name}">${p.tag ? `<span class="tag ${p.tag}">${p.tag}</span>` : ""}</div>
        </div>
        <div class="pdp-info">
          <div class="eyebrow">${p.brand} · ${p.cat}</div>
          <h1>${p.name}</h1>
          ${price}
          <p class="desc">${p.desc}</p>
          <div class="opt"><div class="eyebrow">Colour — <span id="colorPick" style="text-transform:none;letter-spacing:.02em">${p.colorways[0] ? p.colorways[0].name : ""}</span></div>
            <div class="swatches" id="pSwatches">${p.colorways.map((c, i) => `<span class="sw${i === 0 ? " on" : ""}" style="background:${c.hex}" title="${c.name}" data-cw="${i}"></span>`).join("")}</div></div>
          <div class="opt"><div class="eyebrow">Size — <span id="sizePick" style="text-transform:none;letter-spacing:.02em">${p.sizes[0]}</span></div>
            <div class="sizes">${p.sizes.map((s, i) => `<span class="size${i === 0 ? " on" : ""}">${s}</span>`).join("")}</div></div>
          <div class="qty-row">
            <div class="qty"><button id="qDec">−</button><span id="qVal">1</span><button id="qInc">+</button></div>
            <button class="btn" id="pdpAdd" style="flex:1;justify-content:center">Add to bag — ${money(p.price)}</button>
          </div>
          <div class="pdp-meta">
            <p><svg viewBox="0 0 24 24"><path d="M3 7h13v8H3z"/><path d="M16 10h3l2 3v2h-5"/><circle cx="7.5" cy="17.5" r="1.6"/><circle cx="17.5" cy="17.5" r="1.6"/></svg> Free delivery on orders over Rs 5,000</p>
            <p><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg> Free 30-day returns</p>
            <p><svg viewBox="0 0 24 24"><path d="M12 3l7 4v5c0 4.4-3 8.2-7 9-4-.8-7-4.6-7-9V7z"/></svg> 10-year repair promise</p>
          </div>
        </div>
      </div>
      <div class="tabs">
        <div class="tab-head">
          <button class="on" data-tab="details">Details</button>
          <button data-tab="shipping">Shipping &amp; Returns</button>
          <button data-tab="care">Care</button>
        </div>
        <div class="tab-body" data-panel="details">
          <p><strong>Material:</strong> ${p.material}. Finished by hand in our European ateliers. Designed to be worn for years, not seasons.</p>
          <p style="margin-top:12px">Every purchase supports our repair programme and responsible sourcing commitments.</p>
        </div>
        <div class="tab-body" data-panel="shipping" hidden>
          <p>Free delivery on orders over Rs 5,000. Standard delivery 3–5 working days; express 1–2 days. Returns are free within 30 days.</p>
        </div>
        <div class="tab-body" data-panel="care" hidden>
          <p>${p.care}. Store folded in the dust bag provided. Follow the care label for best results.</p>
        </div>
      </div>
      <section class="sec">
        <div class="sec-head"><div><div class="eyebrow">Complete the look</div><h2>You may also like</h2></div>
          <a href="shop.html?dept=${p.dept}" class="link-arrow">Shop ${p.dept} <span>→</span></a></div>
        <div class="grid" id="relatedGrid">${V.products.filter(x => x.id !== p.id && x.cat === p.cat).slice(0, 4).map(cardHTML).join("") || V.products.filter(x => x.id !== p.id).slice(0, 4).map(cardHTML).join("")}</div>
      </section>`;

    document.title = p.name + " — VELOUR";
    let q = 1;
    $("#qInc").onclick = () => { q++; $("#qVal").textContent = q; };
    $("#qDec").onclick = () => { q = Math.max(1, q - 1); $("#qVal").textContent = q; };
    $("#pdpAdd").onclick = () => { addToCart(p.id, q); openDrawer(); };
    $$(".thumbs img").forEach(t => t.onclick = () => {
      $$(".thumbs img").forEach(x => x.classList.remove("on"));
      t.classList.add("on"); $("#mainImg").src = gallery[+t.dataset.g];
    });
    $$(".tab-head button").forEach(b => b.onclick = () => {
      $$(".tab-head button").forEach(x => x.classList.remove("on")); b.classList.add("on");
      $$(".tab-body").forEach(pan => pan.hidden = pan.dataset.panel !== b.dataset.tab);
    });
  }

  /* ---------------------------------------------------------------- shop page */
  function renderShop() {
    const params = new URLSearchParams(location.search);
    let dept = params.get("dept") || "all";
    const saleOnly = params.get("sale") === "1";
    let q = (params.get("q") || "").trim();
    const sIn = $("#shopSearch"); if (sIn) sIn.value = q;
    const state = { cat: "all", sort: "featured", max: 999999 };

    const cats = [...new Set(V.products.map(p => p.cat))].sort();
    $("#shopFilters").innerHTML = `
      <div class="filter-group"><h4>Department</h4>
        ${[["all", "All"], ["women", "Women"], ["men", "Men"], ["kids", "Kids"], ["accessories", "Accessories"], ["home", "Home & Living"], ["fragrance", "Fragrance"]]
          .map(([k, l]) => `<label><input type="radio" name="dept" value="${k}" ${k === dept ? "checked" : ""}> ${l}</label>`).join("")}
      </div>
      <div class="filter-group"><h4>Category</h4>
        <label><input type="radio" name="cat" value="all" checked> All</label>
        ${cats.map(c => `<label><input type="radio" name="cat" value="${c}"> ${c}</label>`).join("")}
      </div>
      <div class="filter-group"><h4>Price</h4>
        <label><input type="radio" name="price" value="999999" checked> All prices</label>
        <label><input type="radio" name="price" value="5000"> Under Rs 5,000</label>
        <label><input type="radio" name="price" value="10000"> Under Rs 10,000</label>
        <label><input type="radio" name="price" value="15000"> Under Rs 15,000</label>
      </div>
      <div class="filter-group"><button class="btn ghost sm block" id="clearFilters">Clear all</button></div>`;

    function apply() {
      let list = V.products.slice();
      if (dept !== "all") list = list.filter(p => p.dept === dept);
      if (state.cat !== "all") list = list.filter(p => p.cat === state.cat);
      if (saleOnly) list = list.filter(p => p.tag === "sale");
      if (q) { const nq = q.toLowerCase(); list = list.filter(p => (p.name + " " + p.brand + " " + p.cat + " " + p.dept + " " + p.desc).toLowerCase().includes(nq)); }
      list = list.filter(p => p.price <= state.max);
      if (state.sort === "low") list.sort((a, b) => a.price - b.price);
      else if (state.sort === "high") list.sort((a, b) => b.price - a.price);
      else if (state.sort === "new") list.sort((a, b) => (b.tag === "new") - (a.tag === "new"));
      else if (state.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
      $("#resultCount").textContent = list.length + (list.length === 1 ? " item" : " items");
      $("#shopGrid").innerHTML = list.length ? list.map(cardHTML).join("")
        : `<div class="empty-page" style="grid-column:1/-1"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><p>No pieces match your filters.</p></div>`;
      observeReveals();
    }
    $("#shopFilters").addEventListener("change", e => {
      if (e.target.name === "dept") dept = e.target.value;
      if (e.target.name === "cat") state.cat = e.target.value;
      if (e.target.name === "price") state.max = +e.target.value;
      apply();
    });
    $("#shopSort").addEventListener("change", e => { state.sort = e.target.value; apply(); });
    const ss = $("#shopSearch"); if (ss) ss.addEventListener("input", e => { q = e.target.value.trim(); apply(); });
    $("#clearFilters").addEventListener("click", () => {
      dept = "all"; state.cat = "all"; state.max = 999999;
      $$("#shopFilters input").forEach(i => { if (i.name === "dept") i.checked = i.value === "all"; if (i.name === "cat") i.checked = i.value === "all"; if (i.name === "price") i.checked = i.value === "999999"; });
      apply();
    });
    apply();
  }

  /* ---------------------------------------------------------------- cart page */
  function renderCartPage() {
    const root = $("#cartPageRoot"); if (!root) return;
    if (!cart.length) {
      root.innerHTML = `<div class="empty-page"><svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><h3 class="serif" style="font-size:26px;margin-bottom:10px">Your bag is empty</h3><p>Add a few pieces to begin.</p><a href="shop.html" class="btn" style="margin-top:22px">Continue shopping</a></div>`;
      return;
    }
    const ship = subtotal() >= 5000 ? 0 : 250;
    root.innerHTML = `
      <div class="cart-layout">
        <div>${cart.map(i => { const p = byId(i.id); return `
          <div class="cart-row">
            <img src="${p.img}" alt="${p.name}">
            <div>
              <h4><a href="product.html?id=${p.id}">${p.name}</a></h4>
              <div class="cat-name">${p.brand} · ${p.cat}</div>
              <div class="qty"><button data-dec="${p.id}">−</button><span>${i.qty}</span><button data-inc="${p.id}">+</button></div>
            </div>
            <div style="text-align:right"><div class="price">${money(p.price * i.qty)}</div>
              <button class="rm" data-rm="${p.id}" style="margin-top:10px">Remove</button></div>
          </div>`; }).join("")}
        </div>
        <aside class="summary">
          <h3 class="serif">Order summary</h3>
          <div class="row"><span>Subtotal</span><span>${money(subtotal())}</span></div>
          <div class="row"><span>Shipping</span><span>${ship === 0 ? "Free" : money(ship)}</span></div>
          <div class="row total"><span>Total</span><span>${money(subtotal() + ship)}</span></div>
          <button class="btn block" data-checkout>Proceed to checkout <span>→</span></button>
          <a href="shop.html" class="link-arrow" style="display:inline-block;margin-top:18px">Continue shopping <span>→</span></a>
        </aside>
      </div>`;
  }

  /* ---------------------------------------------------------------- toast + reveal */
  let tTimer;
  function showToast(msg) {
    const t = $("#toast"); if (!t) return;
    $("#toastMsg").textContent = msg; t.classList.add("on"); clearTimeout(tTimer);
    tTimer = setTimeout(() => t.classList.remove("on"), 2600);
  }
  let io;
  function observeReveals() {
    if (!io) io = new IntersectionObserver(en => en.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
    $$(".reveal:not(.in)").forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------------- events */
  document.addEventListener("click", e => {
    const t = e.target;
    const so = t.closest("#searchOpen"); if (so) { openSearch(); return; }
    if (t.id === "searchBox") { closeAll(); return; }
    const q = t.closest("[data-quick]"); if (q) { quickView(q.dataset.quick); return; }
    const w = t.closest(".wish"); if (w) { w.classList.toggle("on"); return; }
    const add = t.closest("[data-add]"); if (add) { addToCart(add.dataset.add); closeAll(); openDrawer(); return; }
    const inc = t.closest("[data-inc]"); if (inc) { changeQty(inc.dataset.inc, 1); return; }
    const dec = t.closest("[data-dec]"); if (dec) { changeQty(dec.dataset.dec, -1); return; }
    const rm = t.closest("[data-rm]"); if (rm) { removeItem(rm.dataset.rm); return; }
    const ck = t.closest("[data-checkout]"); if (ck) { showToast("Checkout — demo storefront"); return; }
    const cl = t.closest("[data-close]"); if (cl) { closeAll(); return; }
    const sz = t.closest(".size");
    if (sz) {
      $$(".size", sz.parentElement).forEach(s => s.classList.remove("on")); sz.classList.add("on");
      const pk = sz.closest("#modalCard") ? $("#mSizePick") : $("#sizePick");
      if (pk) pk.textContent = sz.textContent;
      return;
    }
    const sw = t.closest(".sw");
    if (sw) {
      $$(".sw", sw.parentElement).forEach(s => s.classList.remove("on")); sw.classList.add("on");
      const i = parseInt(sw.dataset.cw, 10) || 0;
      const card = sw.closest("#modalCard");
      const pp = card ? byId(+card.dataset.pid) : pdpProduct;
      if (pp && pp.colorways && pp.colorways[i]) {
        const cw = pp.colorways[i];
        if (card) {
          const im = $("#modalCard img"); if (im) im.src = imgLarge(cw.img);
          const pk = $("#mColorPick"); if (pk) pk.textContent = cw.name;
        } else {
          const im = $("#mainImg"); if (im) im.src = cw.img;
          const tn = $$(".thumbs img")[0]; if (tn) { $$(".thumbs img").forEach(x => x.classList.remove("on")); tn.classList.add("on"); }
          const pk = $("#colorPick"); if (pk) pk.textContent = cw.name;
        }
      }
      return;
    }
  });

  /* ---------------------------------------------------------------- init */
  function init() {
    renderHeader(); renderFooter();
    // inject drawer/modal/toast globals
    const holder = document.createElement("div");
    holder.innerHTML = `
      <div class="overlay" id="overlay"></div>
      <aside class="drawer" id="drawer" aria-label="Shopping bag">
        <div class="drawer-head"><div><h3 class="serif">Your Bag</h3><span id="bagLine">0 items</span></div>
          <button class="x" id="cartClose" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
        <div class="drawer-body" id="drawerBody"></div>
        <div class="drawer-foot" id="drawerFoot" style="display:none">
          <div class="row"><span>Subtotal</span><span id="subtotal">${money(0)}</span></div>
          <div class="row total"><span>Total</span><span id="total">${money(0)}</span></div>
          <a href="cart.html" class="btn block">View bag &amp; checkout <span>→</span></a>
        </div>
      </aside>
      <div class="modal" id="modal"><div class="modal-card" id="modalCard" data-pid="0"></div></div>
      <div class="search-box" id="searchBox" aria-label="Search">
        <div class="search-panel">
          <div class="search-head">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            <input id="qInput" type="search" placeholder="Search pieces, brands, styles…" autocomplete="off" aria-label="Search pieces">
            <button class="x" data-close aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          </div>
          <div class="search-results" id="searchResults"></div>
          <a class="search-all" id="searchAll" href="shop.html">View all matching pieces <span>→</span></a>
        </div>
      </div>
      <div class="toast" id="toast"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg><span id="toastMsg">Done</span></div>`;
    document.body.appendChild(holder);

    $("#overlay").onclick = closeAll;
    $("#cartClose").onclick = closeAll;
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });
    const co = $("#cartOpen"); if (co) co.onclick = openDrawer;
    const so = $("#searchOpen"); if (so) so.onclick = openSearch;
    $("#searchBox").addEventListener("click", e => { if (e.target.id === "searchBox") closeAll(); });
    $("#qInput").addEventListener("input", () => { clearTimeout(sTimer); sTimer = setTimeout(runSearch, 120); });
    $("#qInput").addEventListener("keydown", e => { if (e.key === "Enter") location.href = $("#searchAll").getAttribute("href"); });

    const page = document.body.dataset.page;
    if (page === "home") {
      const g = $("#newGrid"), b = $("#bestGrid");
      if (g) g.innerHTML = V.products.slice(0, 8).map(cardHTML).join("");
      if (b) b.innerHTML = V.products.slice(8, 16).map(cardHTML).join("");
      const cc = $("#catGrid");
      if (cc) cc.innerHTML = V.categories.map(c => `
        <a class="cat reveal" href="shop.html?dept=${c.key}">
          <img src="${c.img}" alt="${c.label}">
          <div class="cat-txt"><div class="eyebrow">${c.count} pieces</div><h3>${c.label}</h3><div class="shop">Shop now →</div></div>
        </a>`).join("");
    } else if (page === "shop") {
      renderShop();
    } else if (page === "product") {
      renderProduct();
    } else if (page === "cart") {
      renderCartPage();
    }
    renderCart();
    observeReveals();

    let last = 0;
    addEventListener("scroll", () => {
      const h = $("header"); if (!h) return;
      const y = scrollY;
      h.style.transform = (y > last && y > 320) ? "translateY(-100%)" : "translateY(0)";
      last = y;
    }, { passive: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
