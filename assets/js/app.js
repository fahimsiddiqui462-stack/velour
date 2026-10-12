/* VELOUR storefront app — header/footer, cart, wishlist, accounts, checkout,
   quick view, colourway gallery, reviews, filters, rendering */
(function () {
  const V = window.VELOUR || { products: [], categories: [] };
  const money = n => (V.currency || "Rs") + " " + Number(n).toLocaleString();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const byId = id => V.products.find(p => p.id === +id);
  const imgLarge = url => url.replace(/w=\d+/, "w=900").replace(/h=\d+/, "h=900").replace(/width=\d+/, "width=900");
  const FREE_SHIP = 5000, SHIP_FEE = 250;

  /* ---------------------------------------------------------- storage */
  const S = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  let wish = S.get("velour_wish", []).map(Number);
  let user = S.get("velour_user", null);
  let orders = S.get("velour_orders", []);
  let reviewsMap = S.get("velour_reviews", {});
  const isWished = id => wish.includes(+id);
  const saveWish = () => S.set("velour_wish", wish);
  const saveUser = () => user ? S.set("velour_user", user) : localStorage.removeItem("velour_user");
  const saveOrders = () => S.set("velour_orders", orders);
  const saveReviews = () => S.set("velour_reviews", reviewsMap);

  /* ---------------------------------------------------------------- header */
  const NAV = [
    ["index.html", "New In", "new"],
    ["shop.html?dept=women", "Women", "women"],
    ["shop.html?dept=men", "Men", "men"],
    ["shop.html?dept=kids", "Kids", "kids"],
    ["shop.html?dept=accessories", "Accessories", "accessories"],
    ["shop.html?dept=home", "Home & Living", "home"],
    ["shop.html?dept=fragrance", "Fragrance", "fragrance"],
    ["journal.html", "Journal", "journal"],
    ["shop.html?sale=1", "Sale", "sale"],
  ];
  function renderHeader() {
    const page = document.body.dataset.page || "";
    const nav = NAV.map(([href, label, key]) => {
      const active = page === key ? " class=\"active\"" : (key === "sale" ? " class=\"sale\"" : "");
      return `<a href="${href}"${active}>${label}</a>`;
    }).join("");
    const acctLabel = user ? (user.name || "Account").split(" ")[0] : "Account";
    $("#site-header").innerHTML = `
      <div class="announce">Free delivery on orders over Rs 5,000 &nbsp;·&nbsp; <b>New Season Edit</b> — now live</div>
      <header>
        <div class="wrap nav">
          <a href="index.html" class="brand" aria-label="Velour home">VELOUR<small>CURATED IN KARACHI</small></a>
          <nav class="menu">${nav}</nav>
          <div class="tools">
            <button id="searchOpen" aria-label="Search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></button>
            <a href="wishlist.html" aria-label="Wishlist"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.6-9.3-8.4C1 8.3 3 5 6.3 5c2 0 3.3 1.1 4.2 2.3.2.3.9.3 1.1 0C12.5 6.1 13.8 5 15.8 5 19 5 21 8.3 19.3 11.6 17 15.4 12 20 12 20z"/></svg><span class="cart-count" id="wishCount">0</span></a>
            <a href="account.html" aria-label="Account"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg><span class="lbl">${acctLabel}</span></a>
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
              <li><a href="shipping.html">Shipping &amp; Returns</a></li>
              <li><a href="size-guide.html">Size Guide</a></li>
              <li><a href="repairs.html">Repairs &amp; Care</a></li>
              <li><a href="cart.html">Your Bag</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul></div>
            <div><h4>House</h4><ul>
              <li><a href="about.html">Our Story</a></li>
              <li><a href="journal.html">Journal</a></li>
              <li><a href="about.html">Sustainability</a></li>
              <li><a href="careers.html">Careers</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul></div>
          </div>
          <div class="foot-bottom">
            <span>© 2026 VELOUR. All rights reserved.</span>
            <span><a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a> · <a href="cookies.html">Cookies</a></span>
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
        <a class="card-link" href="product.html?id=${p.id}" aria-label="${p.name}"></a>
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        ${tag}
        <button class="wish${isWished(p.id) ? " on" : ""}" data-wish="${p.id}" aria-label="Add to wishlist"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.6-9.3-8.4C1 8.3 3 5 6.3 5c2 0 3.3 1.1 4.2 2.3.2.3.9.3 1.1 0C12.5 6.1 13.8 5 15.8 5 19 5 21 8.3 19.3 11.6 17 15.4 12 20 12 20z"/></svg></button>
        <button class="quick" data-quick="${p.id}">Quick view</button>
      </div>
      <div class="card-info">
        <div><h3><a href="product.html?id=${p.id}">${p.name}</a></h3><div class="cat-name">${p.brand} · ${p.cat}</div></div>
        <div>${price}</div>
      </div>
    </article>`;
  }

  /* ---------------------------------------------------------------- wishlist */
  function updateWishBadge() {
    const b = $("#wishCount");
    if (b) { b.textContent = wish.length; b.classList.toggle("on", wish.length > 0); }
  }
  function toggleWish(id) {
    id = +id;
    const i = wish.indexOf(id);
    if (i === -1) { wish.push(id); showToast((byId(id) ? byId(id).name : "Item") + " saved to wishlist"); }
    else { wish.splice(i, 1); showToast("Removed from wishlist"); }
    saveWish(); updateWishBadge();
    $$(`[data-wish="${id}"]`).forEach(el => el.classList.toggle("on", isWished(id)));
    if (document.body.dataset.page === "wishlist") renderWishlist();
  }
  function renderWishlist() {
    const root = $("#wishRoot"); if (!root) return;
    if (!wish.length) {
      root.outerHTML = `<div class="empty-page" id="wishRoot"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.6-9.3-8.4C1 8.3 3 5 6.3 5c2 0 3.3 1.1 4.2 2.3.2.3.9.3 1.1 0C12.5 6.1 13.8 5 15.8 5 19 5 21 8.3 19.3 11.6 17 15.4 12 20 12 20z"/></svg><h3 class="serif" style="font-size:26px;margin-bottom:10px">Your wishlist is empty</h3><p>Tap the heart on any piece to save it here.</p><a href="shop.html" class="btn" style="margin-top:22px">Discover the collection</a></div>`;
      return;
    }
    root.innerHTML = wish.map(id => byId(id)).filter(Boolean).map(cardHTML).join("");
    observeReveals();
  }

  /* ---------------------------------------------------------------- cart */
  let cart = S.get("velour_cart", []);
  const save = () => S.set("velour_cart", cart);
  const cartCount = () => cart.reduce((n, i) => n + i.qty, 0);
  const subtotal = () => cart.reduce((s, i) => s + (byId(i.id) ? byId(i.id).price * i.qty : 0), 0);
  const shipFee = () => (subtotal() >= FREE_SHIP || subtotal() === 0) ? 0 : SHIP_FEE;

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
        if (foot) { foot.style.display = "block"; $("#subtotal").textContent = money(subtotal()); $("#total").textContent = money(subtotal() + shipFee()); }
      }
      const bl = $("#bagLine"); if (bl) bl.textContent = cartCount() + (cartCount() === 1 ? " item" : " items");
    }
    const page = document.body.dataset.page;
    if (page === "cart") renderCartPage();
    if (page === "checkout") renderCheckout();
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

  /* ---------------------------------------------------------------- drawer / modal / lightbox */
  function openDrawer() { $("#drawer").classList.add("on"); $("#overlay").classList.add("on"); document.body.classList.add("no-scroll"); }
  function closeAll() {
    $("#drawer").classList.remove("on"); $("#overlay").classList.remove("on");
    $("#modal").classList.remove("on"); $("#searchBox").classList.remove("on");
    $("#lightbox").classList.remove("on"); document.body.classList.remove("no-scroll");
  }
  function openLightbox(src, alt) {
    const lb = $("#lightbox"); if (!lb) return;
    const im = $("#lightboxImg"); im.src = src; im.alt = alt || "";
    lb.classList.add("on"); document.body.classList.add("no-scroll");
  }

  function quickView(id) {
    const p = byId(id); if (!p) return;
    const cw = p.colorways && p.colorways[0] ? p.colorways[0] : { img: p.img, name: "", hex: "#ccc" };
    $("#modalCard").dataset.pid = id;
    $("#modalCard").innerHTML = `
      <img src="${imgLarge(cw.img)}" alt="${p.name}">
      <div class="modal-copy">
        <button class="x" data-close aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <div class="eyebrow">${p.brand} · ${p.cat}</div>
        <h3 class="serif">${p.name}</h3>
        <div class="price">${money(p.price)}</div>
        <p>${p.desc}</p>
        <div class="eyebrow" style="margin-bottom:10px">Colour — <span id="mColorPick" style="text-transform:none;letter-spacing:.02em">${cw.name}</span></div>
        <div class="swatches" id="mSwatches">${p.colorways.map((c, i) => `<span class="sw${i === 0 ? " on" : ""}" style="background:${c.hex}" title="${c.name}" data-cw="${i}"></span>`).join("")}</div>
        <div class="eyebrow" style="margin-bottom:10px">Size — <span id="mSizePick" style="text-transform:none;letter-spacing:.02em">${p.sizes[0]}</span></div>
        <div class="sizes">${p.sizes.map((s, i) => `<span class="size${i === 0 ? " on" : ""}">${s}</span>`).join("")}</div>
        <button class="btn block" data-add="${p.id}">Add to bag — ${money(p.price)}</button>
        <a href="product.html?id=${p.id}" class="link-arrow" style="margin-top:16px;display:inline-block">View full details <span>→</span></a>
      </div>`;
    $("#modal").classList.add("on"); $("#overlay").classList.add("on"); document.body.classList.add("no-scroll");
  }

  /* ---------------------------------------------------------------- reviews */
  const REVIEWERS = ["Ayesha K.", "Bilal R.", "Hina S.", "Omar F.", "Sana M.", "Usman T.", "Zara A.", "Danish H.", "Mariam N.", "Faisal Q.", "Nida I.", "Hamza Y."];
  const SNIPPETS = [
    "Exceptional quality — the fabric feels premium and the fit is spot on.",
    "Exactly as pictured. Delivery was quick and the packaging was lovely.",
    "Beautiful piece, though it runs slightly large. Order your usual size.",
    "My new favourite. The colour is even richer in person.",
    "Great value for the stitching and finishing. Would buy again.",
    "Lovely drape and very comfortable — already received compliments.",
    "Good quality overall; I do wish it came with a lining.",
    "Perfect for everyday wear and it holds up well after washing.",
    "The detailing is beautiful and it arrived earlier than expected.",
    "Fit true to size and the material is soft against the skin."
  ];
  function rng(seed) { let s = (seed % 2147483647); if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647, (s - 1) / 2147483646); }
  function seedReviews(p) {
    const rand = rng(p.id * 97 + 13), n = 3 + Math.floor(rand() * 3), out = [];
    const months = ["Aug", "Sep", "Oct", "Nov"];
    for (let i = 0; i < n; i++) out.push({
      name: REVIEWERS[Math.floor(rand() * REVIEWERS.length)],
      rating: 3 + Math.floor(rand() * 3),
      date: (1 + Math.floor(rand() * 27)) + " " + months[Math.floor(rand() * months.length)] + " 2026",
      text: SNIPPETS[Math.floor(rand() * SNIPPETS.length)], verified: rand() > .4
    });
    return out;
  }
  const starHTML = r => { let h = ""; for (let i = 1; i <= 5; i++) h += `<span class="${i <= r ? "" : "off"}">★</span>`; return h; };
  function allReviews(p) { return (reviewsMap[p.id] || []).concat(seedReviews(p)); }
  function reviewsHTML(p) {
    const list = allReviews(p);
    const avg = list.length ? (list.reduce((s, r) => s + r.rating, 0) / list.length) : 0;
    const dist = [5, 4, 3, 2, 1].map(s => list.filter(r => r.rating === s).length);
    return `<div class="reviews">
      <div class="rating-summary">
        <div class="rating-big">${avg.toFixed(1)}</div>
        <div><div class="stars">${starHTML(Math.round(avg))}</div>
          <div class="rs-meta">Based on ${list.length} review${list.length === 1 ? "" : "s"}</div></div>
        <div class="rs-meta" style="margin-left:auto">${dist.map((c, i) => `${5 - i}★ &nbsp;${c}`).join(" &nbsp;·&nbsp; ")}</div>
      </div>
      ${list.map(r => `<div class="review">
        <div class="review-head"><b>${r.name}${r.verified ? '<span class="verified">Verified buyer</span>' : ""}</b><span>${r.date}</span></div>
        <div class="stars" style="margin-bottom:8px">${starHTML(r.rating)}</div>
        <p>${r.text}</p></div>`).join("")}
      <div class="review-form" id="reviewForm">
        <h3 class="serif">Write a review</h3>
        <div class="eyebrow" style="margin-bottom:8px">Your rating</div>
        <div class="star-input" id="starInput">${[1, 2, 3, 4, 5].map(i => `<span data-star="${i}">★</span>`).join("")}</div>
        <div class="field"><label for="rvName">Name</label><input id="rvName" value="${user ? user.name : ""}" placeholder="Your name"></div>
        <div class="field"><label for="rvText">Review</label><textarea id="rvText" style="min-height:100px" placeholder="Share your thoughts on this piece…"></textarea></div>
        <button class="btn" id="rvSubmit">Submit review</button>
      </div></div>`;
  }
  function wireReviews(p) {
    let rating = 5;
    const si = $("#starInput");
    if (si) {
      const paint = () => $$("#starInput span").forEach(s => s.classList.toggle("on", +s.dataset.star <= rating));
      paint();
      $$("#starInput span").forEach(s => s.onclick = () => { rating = +s.dataset.star; paint(); });
    }
    const btn = $("#rvSubmit");
    if (btn) btn.onclick = () => {
      const name = ($("#rvName").value || "").trim() || "Anonymous";
      const text = ($("#rvText").value || "").trim();
      if (!text) { showToast("Please write a short review"); return; }
      (reviewsMap[p.id] = reviewsMap[p.id] || []).unshift({ name, rating, date: "Just now", text, verified: !!user });
      saveReviews();
      $("#reviewsRoot").innerHTML = reviewsHTML(p); wireReviews(p);
      showToast("Thanks — your review is live");
    };
  }

  /* ---------------------------------------------------------------- product page */
  let pdpProduct = null;
  function renderProduct() {
    const id = new URLSearchParams(location.search).get("id") || "1";
    const p = byId(id) || V.products[0];
    pdpProduct = p;
    const gallery = [...new Set(p.colorways.map(c => c.img).concat([p.img]))];
    const price = p.tag === "sale"
      ? `<span class="price"><s>${money(p.price)}</s> ${money(Math.round(p.price * 0.7))}</span>`
      : `<span class="price">${money(p.price)}</span>`;
    $("#productRoot").innerHTML = `
      <div class="crumbs"><a href="index.html">Home</a> / <a href="shop.html?dept=${p.dept}">${p.dept[0].toUpperCase() + p.dept.slice(1)}</a> / <span>${p.name}</span></div>
      <div class="pdp">
        <div class="gallery">
          <div class="thumbs">${gallery.map((g, i) => `<img src="${g}" class="${i === 0 ? "on" : ""}" data-g="${i}" alt="${p.name} view ${i + 1}">`).join("")}</div>
          <div class="gallery-main"><img id="mainImg" src="${gallery[0]}" alt="${p.name}">${p.tag ? `<span class="tag ${p.tag}">${p.tag}</span>` : ""}<span class="zoom-hint"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg> Click to zoom</span></div>
        </div>
        <div class="pdp-info">
          <div class="eyebrow">${p.brand} · ${p.cat}</div>
          <h1>${p.name}</h1>
          ${price}
          <div class="stars" style="margin-bottom:14px;font-size:14px">${starHTML(Math.round(allReviews(p).reduce((s, r) => s + r.rating, 0) / allReviews(p).length))}<a href="#reviews" style="color:var(--muted);font-size:12px;letter-spacing:.04em;margin-left:10px">${allReviews(p).length} reviews</a></div>
          <p class="desc">${p.desc}</p>
          <div class="opt"><div class="eyebrow">Colour — <span id="colorPick" style="text-transform:none;letter-spacing:.02em">${p.colorways[0] ? p.colorways[0].name : ""}</span></div>
            <div class="swatches" id="pSwatches">${p.colorways.map((c, i) => `<span class="sw${i === 0 ? " on" : ""}" style="background:${c.hex}" title="${c.name}" data-cw="${i}"></span>`).join("")}</div></div>
          <div class="opt"><div class="eyebrow">Size — <span id="sizePick" style="text-transform:none;letter-spacing:.02em">${p.sizes[0]}</span></div>
            <div class="sizes">${p.sizes.map((s, i) => `<span class="size${i === 0 ? " on" : ""}">${s}</span>`).join("")}</div></div>
          <div class="qty-row">
            <div class="qty"><button id="qDec">−</button><span id="qVal">1</span><button id="qInc">+</button></div>
            <button class="btn" id="pdpAdd" style="flex:1;justify-content:center">Add to bag — ${money(p.price)}</button>
          </div>
          <p class="link-arrow" id="pdpWish" style="cursor:pointer;border:none;margin-top:4px">${isWished(p.id) ? "♥ Saved to wishlist" : "♡ Save to wishlist"}</p>
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
          <button data-tab="reviews">Reviews</button>
        </div>
        <div class="tab-body" data-panel="details">
          <p><strong>Material:</strong> ${p.material}. Finished by hand by our partner ateliers. Designed to be worn for years, not seasons.</p>
          <p style="margin-top:12px">Every purchase supports our repair programme and responsible sourcing commitments.</p>
        </div>
        <div class="tab-body" data-panel="shipping" hidden>
          <p>Free delivery on orders over Rs 5,000. Standard delivery 3–5 working days; express 1–2 days. Returns are free within 30 days. See our <a href="shipping.html" style="color:var(--accent)">Shipping &amp; Returns</a> page.</p>
        </div>
        <div class="tab-body" data-panel="care" hidden>
          <p>${p.care}. Store folded in the dust bag provided. Follow the care label for best results.</p>
        </div>
        <div class="tab-body" data-panel="reviews" id="reviews" hidden>
          <div id="reviewsRoot">${reviewsHTML(p)}</div>
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
    $("#pdpWish").onclick = () => {
      toggleWish(p.id);
      $("#pdpWish").textContent = isWished(p.id) ? "♥ Saved to wishlist" : "♡ Save to wishlist";
    };
    $("#mainImg").onclick = () => openLightbox($("#mainImg").src, p.name);
    $$(".thumbs img").forEach(t => t.onclick = () => {
      $$(".thumbs img").forEach(x => x.classList.remove("on"));
      t.classList.add("on"); $("#mainImg").src = gallery[+t.dataset.g];
    });
    $$(".tab-head button").forEach(b => b.onclick = () => {
      $$(".tab-head button").forEach(x => x.classList.remove("on")); b.classList.add("on");
      $$(".tab-body").forEach(pan => pan.hidden = pan.dataset.panel !== b.dataset.tab);
    });
    wireReviews(p);
  }

  /* ---------------------------------------------------------------- shop page */
  function renderShop() {
    const params = new URLSearchParams(location.search);
    let dept = params.get("dept") || "all";
    const saleOnly = params.get("sale") === "1";
    let q = (params.get("q") || "").trim();
    const sIn = $("#shopSearch"); if (sIn) sIn.value = q;
    const state = { cat: "all", brand: "all", color: "all", size: "all", sort: "featured", max: 999999 };

    const cats = [...new Set(V.products.map(p => p.cat))].sort();
    const brands = [...new Set(V.products.map(p => p.brand))].sort();
    const colorMap = new Map();
    V.products.forEach(p => p.colorways.forEach(c => { if (c.name && !colorMap.has(c.name)) colorMap.set(c.name, c.hex); }));
    const colors = [...colorMap.keys()].sort();
    const sizes = [...new Set(V.products.flatMap(p => p.sizes))];

    $("#shopFilters").innerHTML = `
      <div class="filter-group"><h4>Department</h4>
        ${[["all", "All"], ["women", "Women"], ["men", "Men"], ["kids", "Kids"], ["accessories", "Accessories"], ["home", "Home & Living"], ["fragrance", "Fragrance"]]
          .map(([k, l]) => `<label><input type="radio" name="dept" value="${k}" ${k === dept ? "checked" : ""}> ${l}</label>`).join("")}
      </div>
      <div class="filter-group"><h4>Brand</h4>
        <label><input type="radio" name="brand" value="all" checked> All brands</label>
        ${brands.map(b => `<label><input type="radio" name="brand" value="${b}"> ${b}</label>`).join("")}
      </div>
      <div class="filter-group"><h4>Category</h4>
        <label><input type="radio" name="cat" value="all" checked> All</label>
        ${cats.map(c => `<label><input type="radio" name="cat" value="${c}"> ${c}</label>`).join("")}
      </div>
      <div class="filter-group"><h4>Colour</h4>
        <div class="chips" id="colorChips">
          <button type="button" class="chip on" data-color="all">All</button>
          ${colors.map(c => `<button type="button" class="chip" data-color="${c}"><i style="background:${colorMap.get(c)}"></i>${c}</button>`).join("")}
        </div>
      </div>
      <div class="filter-group"><h4>Size</h4>
        <div class="chips" id="sizeChips">
          <button type="button" class="chip on" data-size="all">Any</button>
          ${sizes.map(s => `<button type="button" class="chip" data-size="${s}">${s}</button>`).join("")}
        </div>
      </div>
      <div class="filter-group"><h4>Price</h4>
        <label><input type="radio" name="price" value="999999" checked> All prices</label>
        <label><input type="radio" name="price" value="3000"> Under Rs 3,000</label>
        <label><input type="radio" name="price" value="6000"> Under Rs 6,000</label>
        <label><input type="radio" name="price" value="12000"> Under Rs 12,000</label>
      </div>
      <div class="filter-group"><button class="btn ghost sm block" id="clearFilters">Clear all</button></div>`;

    function apply() {
      let list = V.products.slice();
      if (dept !== "all") list = list.filter(p => p.dept === dept);
      if (state.brand !== "all") list = list.filter(p => p.brand === state.brand);
      if (state.cat !== "all") list = list.filter(p => p.cat === state.cat);
      if (state.color !== "all") list = list.filter(p => p.colorways.some(c => c.name === state.color));
      if (state.size !== "all") list = list.filter(p => p.sizes.includes(state.size));
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
      if (e.target.name === "brand") state.brand = e.target.value;
      if (e.target.name === "cat") state.cat = e.target.value;
      if (e.target.name === "price") state.max = +e.target.value;
      apply();
    });
    $("#shopFilters").addEventListener("click", e => {
      const c = e.target.closest("[data-color]");
      if (c) { state.color = c.dataset.color; $$("#colorChips .chip").forEach(x => x.classList.toggle("on", x === c)); apply(); return; }
      const s = e.target.closest("[data-size]");
      if (s) { state.size = s.dataset.size; $$("#sizeChips .chip").forEach(x => x.classList.toggle("on", x === s)); apply(); return; }
    });
    $("#shopSort").addEventListener("change", e => { state.sort = e.target.value; apply(); });
    const ss = $("#shopSearch"); if (ss) ss.addEventListener("input", e => { q = e.target.value.trim(); apply(); });
    $("#clearFilters").addEventListener("click", () => {
      dept = "all"; state.brand = "all"; state.cat = "all"; state.color = "all"; state.size = "all"; state.max = 999999;
      $$("#shopFilters input").forEach(i => { if (i.type === "radio") i.checked = i.value === "all" || i.value === "999999"; });
      $$("#colorChips .chip").forEach(x => x.classList.toggle("on", x.dataset.color === "all"));
      $$("#sizeChips .chip").forEach(x => x.classList.toggle("on", x.dataset.size === "all"));
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
    const ship = shipFee();
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

  /* ---------------------------------------------------------------- checkout */
  const PAY = [
    ["cod", "Cash on Delivery", "Pay when it arrives", '<path d="M3 7h13v8H3z"/><path d="M16 10h3l2 3v2h-5"/><circle cx="7.5" cy="17.5" r="1.6"/><circle cx="17.5" cy="17.5" r="1.6"/>'],
    ["card", "Credit / Debit Card", "Visa · Mastercard", '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>'],
    ["jazzcash", "JazzCash", "Mobile wallet", '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>'],
    ["easypaisa", "Easypaisa", "Mobile wallet", '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>'],
    ["googlepay", "Google Pay", "Fast &amp; secure", '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>']
  ];
  function renderCheckout() {
    const root = $("#checkoutRoot"); if (!root) return;
    if (!cart.length) {
      root.innerHTML = `<div class="empty-page"><svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><h3 class="serif" style="font-size:26px;margin-bottom:10px">Your bag is empty</h3><p>Add a few pieces before checking out.</p><a href="shop.html" class="btn" style="margin-top:22px">Continue shopping</a></div>`;
      return;
    }
    const ship = shipFee();
    root.innerHTML = `
      <div class="checkout-layout">
        <div>
          <form id="coForm">
            <div class="co-step">
              <h2><span class="step-num">1</span> Contact</h2>
              <div class="form-grid">
                <div class="field"><label for="coName">Full name</label><input id="coName" required value="${user ? user.name : ""}"></div>
                <div class="field"><label for="coPhone">Phone</label><input id="coPhone" required placeholder="03xx xxxxxxx"></div>
              </div>
              <div class="field"><label for="coEmail">Email</label><input id="coEmail" type="email" required value="${user ? user.email : ""}"></div>
            </div>
            <div class="co-step">
              <h2><span class="step-num">2</span> Shipping address</h2>
              <div class="field"><label for="coAddr">Address</label><input id="coAddr" required placeholder="House / street / area"></div>
              <div class="form-grid">
                <div class="field"><label for="coCity">City</label><input id="coCity" required value="Karachi"></div>
                <div class="field"><label for="coPost">Postal code</label><input id="coPost" placeholder="75xxx"></div>
              </div>
              <div class="field"><label for="coCountry">Country</label><input id="coCountry" value="Pakistan" required></div>
            </div>
            <div class="co-step">
              <h2><span class="step-num">3</span> Payment method</h2>
              <div class="pay-methods">
                ${PAY.map((m, i) => `<label class="pay-opt${i === 0 ? " on" : ""}" data-pay="${m[0]}">
                  <svg viewBox="0 0 24 24">${m[3]}</svg>
                  <span class="po-t">${m[1]}<small>${m[2]}</small></span>
                  <input type="radio" name="pay" value="${m[0]}" ${i === 0 ? "checked" : ""}></label>`).join("")}
              </div>
              <div class="field" id="cardFields" hidden style="margin-top:18px">
                <label for="coCard">Card number</label><input id="coCard" placeholder="4242 4242 4242 4242" inputmode="numeric">
                <div class="form-grid" style="margin-top:14px">
                  <input placeholder="MM / YY" inputmode="numeric">
                  <input placeholder="CVC" inputmode="numeric">
                </div>
              </div>
              <p class="note" style="margin-top:18px;font-size:13px;color:var(--muted)">This is a demonstration store — no real payment is taken and no card details are stored.</p>
            </div>
            <button class="btn block" type="submit" id="coPlace">Place order — ${money(subtotal() + ship)}</button>
          </form>
        </div>
        <aside class="summary">
          <h3 class="serif">Order summary</h3>
          ${cart.map(i => { const p = byId(i.id); return `<div class="mini-item"><img src="${p.img}" alt="${p.name}"><div class="mi-name">${p.name}<div class="cat-name">${p.brand}</div></div><span>×${i.qty}</span></div>`; }).join("")}
          <div class="row" style="margin-top:16px"><span>Subtotal</span><span>${money(subtotal())}</span></div>
          <div class="row"><span>Shipping</span><span>${ship === 0 ? "Free" : money(ship)}</span></div>
          <div class="row total"><span>Total</span><span>${money(subtotal() + ship)}</span></div>
          <p style="font-size:12px;color:var(--muted);margin-top:14px">Free delivery on orders over Rs 5,000.</p>
        </aside>
      </div>`;
    $$("#checkoutRoot .pay-opt").forEach(opt => opt.onclick = () => {
      $$("#checkoutRoot .pay-opt").forEach(o => o.classList.remove("on")); opt.classList.add("on");
      $("#cardFields").hidden = opt.dataset.pay !== "card";
    });
    $("#coForm").addEventListener("submit", e => {
      e.preventDefault();
      const pay = ($('input[name="pay"]:checked') || {}).value || "cod";
      const ref = "VL-" + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10);
      const order = {
        ref, date: new Date().toISOString(), method: pay,
        customer: { name: $("#coName").value, email: $("#coEmail").value, phone: $("#coPhone").value, address: $("#coAddress") ? $("#coAddress").value : $("#coAddr").value },
        items: cart.map(i => { const p = byId(i.id); return { id: p.id, name: p.name, brand: p.brand, price: p.price, qty: i.qty, img: p.img }; }),
        subtotal: subtotal(), shipping: ship, total: subtotal() + ship, status: "Processing"
      };
      orders.unshift(order); saveOrders();
      cart = []; save(); renderCart();
      location.href = "order.html?ref=" + ref;
    });
  }

  /* ---------------------------------------------------------------- order confirmation */
  function renderOrder() {
    const root = $("#orderRoot"); if (!root) return;
    const ref = new URLSearchParams(location.search).get("ref");
    const order = orders.find(o => o.ref === ref) || orders[0];
    if (!order) {
      root.innerHTML = `<div class="empty-page"><h3 class="serif" style="font-size:26px;margin-bottom:10px">Order not found</h3><p>We couldn't locate that order.</p><a href="shop.html" class="btn" style="margin-top:22px">Continue shopping</a></div>`;
      return;
    }
    const payLabel = (PAY.find(p => p[0] === order.method) || [null, "Cash on Delivery"])[1];
    root.innerHTML = `
      <div class="order-done">
        <div class="tick"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></div>
        <h1>Thank you, ${order.customer.name.split(" ")[0]}.</h1>
        <p>Your order is confirmed and being prepared with care.</p>
        <div class="ref-box">Order reference &nbsp;<b>${order.ref}</b></div>
        <div class="summary" style="text-align:left;position:static">
          ${order.items.map(it => `<div class="oc-item" style="display:flex;gap:14px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)"><img src="${it.img}" alt="${it.name}" style="width:56px;height:70px;object-fit:cover"><div style="flex:1"><h4 style="font-family:var(--sans);font-size:14px">${it.name}</h4><div class="cat-name">${it.brand} · Qty ${it.qty}</div></div><span>${money(it.price * it.qty)}</span></div>`).join("")}
          <div class="row" style="margin-top:16px"><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
          <div class="row"><span>Shipping</span><span>${order.shipping === 0 ? "Free" : money(order.shipping)}</span></div>
          <div class="row total"><span>Total</span><span>${money(order.total)}</span></div>
          <div class="row"><span>Payment</span><span>${payLabel}</span></div>
          <div class="row"><span>Status</span><span class="status-pill">${order.status}</span></div>
        </div>
        <p style="margin-top:22px;font-size:13.5px">A confirmation has been sent to <b>${order.customer.email}</b>.</p>
        <div class="cta-row" style="justify-content:center;margin-top:26px">
          <a href="account.html" class="btn ghost">View my orders</a>
          <a href="shop.html" class="btn">Continue shopping <span>→</span></a>
        </div>
      </div>`;
  }

  /* ---------------------------------------------------------------- account */
  function renderAccount() {
    const root = $("#accountRoot"); if (!root) return;
    if (!user) {
      root.innerHTML = `<div class="empty-page"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg><h3 class="serif" style="font-size:26px;margin-bottom:10px">You're not signed in</h3><p>Sign in to view your orders, wishlist and details.</p><div class="cta-row" style="justify-content:center;margin-top:24px"><a href="login.html" class="btn">Sign in</a><a href="register.html" class="btn ghost">Create account</a></div></div>`;
      return;
    }
    const since = user.since || new Date().toISOString();
    root.innerHTML = `
      <div class="acct-head"><div><div class="eyebrow">My account</div><h2>Hello, ${user.name}</h2></div><button class="btn ghost sm" id="logoutBtn">Sign out</button></div>
      <div class="acct-stats">
        <div class="acct-stat"><strong>${orders.length}</strong><span>Orders</span></div>
        <div class="acct-stat"><strong>${wish.length}</strong><span>Wishlist items</span></div>
        <div class="acct-stat"><strong>${new Date(since).getFullYear()}</strong><span>Member since</span></div>
      </div>
      <div class="co-step">
        <h2 style="font-size:20px">Order history</h2>
        ${orders.length ? orders.map(o => `
          <div class="order-card">
            <div class="oc-head"><span>Order <b>${o.ref}</b></span><span>${new Date(o.date).toLocaleDateString()}</span><span class="status-pill">${o.status}</span><span><b>${money(o.total)}</b></span></div>
            <div class="oc-body">${o.items.map(it => `<div class="oc-item"><img src="${it.img}" alt="${it.name}"><div><h4>${it.name}</h4><div class="cat-name">${it.brand} · Qty ${it.qty}</div></div></div>`).join("")}
            <a href="order.html?ref=${o.ref}" class="link-arrow" style="margin-top:12px;display:inline-block">View order <span>→</span></a></div>
          </div>`).join("") : `<p style="color:var(--muted)">No orders yet. <a href="shop.html" style="color:var(--accent)">Start shopping →</a></p>`}
      </div>
      <div class="co-step">
        <h2 style="font-size:20px">Profile</h2>
        <div class="form-grid">
          <div class="field"><label>Name</label><input value="${user.name}" disabled></div>
          <div class="field"><label>Email</label><input value="${user.email}" disabled></div>
        </div>
        <a href="wishlist.html" class="link-arrow">Go to wishlist <span>→</span></a>
      </div>`;
    $("#logoutBtn").onclick = () => { user = null; saveUser(); showToast("Signed out"); renderHeader(); renderAccount(); };
  }

  /* ---------------------------------------------------------------- auth pages */
  function wireAuth() {
    const login = $("#loginForm");
    if (login) login.addEventListener("submit", e => {
      e.preventDefault();
      const email = $("#lgEmail").value.trim();
      user = { name: email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Guest", email, since: new Date().toISOString() };
      saveUser(); showToast("Welcome back"); location.href = new URLSearchParams(location.search).get("next") || "account.html";
    });
    const reg = $("#registerForm");
    if (reg) reg.addEventListener("submit", e => {
      e.preventDefault();
      const name = $("#rgName").value.trim() || "Guest";
      user = { name, email: $("#rgEmail").value.trim(), since: new Date().toISOString() };
      saveUser(); showToast("Account created — welcome to VELOUR"); location.href = "account.html";
    });
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
    const w = t.closest(".wish"); if (w) { toggleWish(w.dataset.wish); return; }
    const add = t.closest("[data-add]"); if (add) { addToCart(add.dataset.add); closeAll(); openDrawer(); return; }
    const inc = t.closest("[data-inc]"); if (inc) { changeQty(inc.dataset.inc, 1); return; }
    const dec = t.closest("[data-dec]"); if (dec) { changeQty(dec.dataset.dec, -1); return; }
    const rm = t.closest("[data-rm]"); if (rm) { removeItem(rm.dataset.rm); return; }
    const ck = t.closest("[data-checkout]"); if (ck) { location.href = "checkout.html"; return; }
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
      <div class="lightbox" id="lightbox"><button class="x" data-close aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button><img id="lightboxImg" alt=""></div>
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
    } else if (page === "checkout") {
      renderCheckout();
    } else if (page === "order") {
      renderOrder();
    } else if (page === "account") {
      renderAccount();
    } else if (page === "wishlist") {
      renderWishlist();
    }
    wireAuth();
    renderCart();
    updateWishBadge();
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
