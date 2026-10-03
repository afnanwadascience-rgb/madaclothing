/* ============================================================================
   MADA — MAIN APPLICATION
   ----------------------------------------------------------------------------
   Builds the header behaviour, product cards, featured sections, category
   highlights, and the Shop page (search / filter / sort) from the data in
   js/products.js and js/config.js.

   Nothing here needs to be edited to add a new product.
   ============================================================================ */

(function () {
  "use strict";

  /* ==========================================================================
     1. SMALL UTILITIES
     ======================================================================== */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* Product images are stored as "/assets/products/…". Stripping the leading
     slash keeps links working whether the site is served from a domain root
     or a sub-folder. */
  function normalizeAsset(path) {
    return String(path || "").replace(/^\/+/, "");
  }

  function formatPrice(amount) {
    const n = Number(amount);
    const safe = Number.isFinite(n) ? n : 0;
    return SITE_CONFIG.currencySymbol + safe.toLocaleString("en-US");
  }

  function messengerUrl() {
    return SITE_CONFIG.messengerUrl;
  }

  function isAvailable(product) {
    return !!product && product.available !== false;
  }

  /* Colour dots — unknown colour names fall back to a neutral swatch. */
  function colorHex(name) {
    const key = String(name || "").trim().toLowerCase();
    const map = SITE_CONFIG.swatchColors || {};
    return map[key] || "#c9c9c9";
  }

  function colorNameList(product) {
    return (product.colors || []).join(" • ");
  }

  function sizeNameList(product) {
    return (product.sizes || []).join(" • ");
  }

  /* Image N of a product shows colour N — keep this rule in sync with
     scripts/generate-placeholders.js so image alt text matches the picture. */
  function colorForImage(product, index) {
    const colors = product.colors || [];
    if (!colors.length) return "";
    return colors[index % colors.length];
  }

  function imageAlt(product, index) {
    const color = colorForImage(product, index);
    return product.name + (color ? " in " + color : "") + " — image " + (index + 1);
  }

  function productUrl(product) {
    const key = product.slug || product.id;
    return "product.html?id=" + encodeURIComponent(key);
  }

  function findProduct(key) {
    if (!key) return null;
    const id = String(key);
    return (
      PRODUCTS.find((p) => p.id === id || p.slug === id || (p.slug || p.id) === id) || null
    );
  }

  /* Categories that actually contain at least one product, in display order. */
  function getCategories() {
    const withProducts = CATEGORY_ORDER.filter((cat) =>
      PRODUCTS.some((p) => p.category === cat)
    );
    PRODUCTS.forEach((p) => {
      if (p.category && withProducts.indexOf(p.category) === -1) withProducts.push(p.category);
    });
    return withProducts;
  }

  function categoryCount(category) {
    return PRODUCTS.filter(
      (p) => p.category === category && (SITE_CONFIG.showSoldOutProducts || isAvailable(p))
    ).length;
  }

  /* Products shown in listings (respects the showSoldOutProducts setting). */
  function listingProducts() {
    return PRODUCTS.filter((p) => SITE_CONFIG.showSoldOutProducts || isAvailable(p));
  }

  /* ==========================================================================
     2. PRODUCT CARD RENDERING (used by Home, Shop and related products)
     ======================================================================== */

  function badgeHtml(product) {
    if (!product.badge) return "";
    return '<span class="badge">' + escapeHtml(product.badge) + "</span>";
  }

  function swatchHtml(color) {
    return (
      '<span class="swatch" style="background:' +
      escapeHtml(colorHex(color)) +
      '" title="' +
      escapeHtml(color) +
      '"><span class="visually-hidden">' +
      escapeHtml(color) +
      "</span></span>"
    );
  }

  function cardHtml(product) {
    const available = isAvailable(product);
    const image = normalizeAsset((product.images || [])[0] || "");
    const colors = product.colors || [];
    const sizes = product.sizes || [];

    const media = image
      ? '<img class="card__img" src="' +
        escapeHtml(image) +
        '" alt="' +
        escapeHtml(imageAlt(product, 0)) +
        '" width="1200" height="1500" loading="lazy" decoding="async">'
      : "";

    const actions = available
      ? '<a class="btn btn--ghost btn--sm" href="' +
        escapeHtml(productUrl(product)) +
        '">VIEW PRODUCT</a>' +
        '<a class="btn btn--dark btn--sm" data-messenger href="' +
        escapeHtml(messengerUrl()) +
        '" target="_blank" rel="noopener noreferrer">ORDER</a>'
      : '<a class="btn btn--ghost btn--sm" href="' +
        escapeHtml(productUrl(product)) +
        '">VIEW PRODUCT</a>' +
        '<button class="btn btn--muted btn--sm" type="button" disabled>SOLD OUT</button>';

    return (
      '<article class="card' +
      (available ? "" : " card--sold") +
      '">' +
      '<a class="card__media" href="' +
      escapeHtml(productUrl(product)) +
      '" aria-label="View ' +
      escapeHtml(product.name) +
      '">' +
      media +
      badgeHtml(product) +
      (available ? "" : '<span class="tag tag--sold">SOLD OUT</span>') +
      "</a>" +
      '<div class="card__body">' +
      '<p class="card__cat">' +
      escapeHtml(product.category) +
      "</p>" +
      '<h3 class="card__title"><a href="' +
      escapeHtml(productUrl(product)) +
      '">' +
      escapeHtml(product.name) +
      "</a></h3>" +
      '<p class="card__price">' +
      escapeHtml(formatPrice(product.price)) +
      "</p>" +
      (colors.length
        ? '<div class="card__colors">' +
          colors.map(swatchHtml).join("") +
          '<span class="card__colors-text">' +
          escapeHtml(colors.join(" • ")) +
          "</span></div>"
        : "") +
      (sizes.length ? '<p class="card__sizes">' + escapeHtml(sizes.join(" • ")) + "</p>" : "") +
      '<div class="card__actions">' +
      actions +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function renderProducts(container, list) {
    if (!container) return;
    container.innerHTML = list.map(cardHtml).join("");
    initMessengerLinks(container);
  }

  /* ==========================================================================
     3. CONFIG-DRIVEN ELEMENTS, LINKS AND NAVIGATION
     ======================================================================== */

  /* Any element carrying data-config="key" is filled from SITE_CONFIG. */
  function applyConfig(root) {
    $$("[data-config]", root).forEach((el) => {
      const value = SITE_CONFIG[el.getAttribute("data-config")];
      if (typeof value === "string") el.textContent = value;
    });
    $$("[data-year]", root).forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
    const title = $("[data-site-title]");
    if (title) title.textContent = SITE_CONFIG.siteTitle;
  }

  /* Every order button points at the single Messenger URL in the config. */
  function initMessengerLinks(root) {
    $$("a[data-messenger]", root).forEach((a) => {
      a.href = SITE_CONFIG.messengerUrl;
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
  }

  /* Facebook links are shown only once the owner adds their page URL. */
  function initSocialLinks(root) {
    const hasFacebook = !!SITE_CONFIG.facebookUrl;
    $$("[data-facebook]", root).forEach((a) => {
      if (hasFacebook) {
        a.href = SITE_CONFIG.facebookUrl;
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
        a.hidden = false;
      } else {
        a.hidden = true;
      }
    });
    $$("[data-facebook-block]", root).forEach((el) => {
      el.hidden = !hasFacebook;
    });
  }

  /* Footer category links are generated from the catalogue. */
  function initFooterCategories() {
    const list = document.getElementById("footer-categories");
    if (!list) return;
    const categories = getCategories();
    const links = [
      '<li><a href="shop.html">All products</a></li>'
    ].concat(
      categories.map(
        (cat) =>
          '<li><a href="shop.html?category=' +
          encodeURIComponent(cat) +
          '">' +
          escapeHtml(cat) +
          "</a></li>"
      )
    );
    list.innerHTML = links.join("");
  }

  function initNav() {
    const page = document.body.getAttribute("data-page");
    $$("[data-nav]").forEach((link) => {
      if (link.getAttribute("data-nav") === page) link.setAttribute("aria-current", "page");
    });

    const toggle = $("#nav-toggle");
    const menu = $("#mobile-menu");
    if (!toggle || !menu) return;

    function setMenu(open) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      document.body.classList.toggle("nav-open", open);
      const label = open ? "Close menu" : "Open menu";
      toggle.setAttribute("aria-label", label);
    }

    toggle.addEventListener("click", () => {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });

    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 960) setMenu(false);
    });
  }

  /* ==========================================================================
     4. HOME PAGE
     ======================================================================== */

  function initHome() {
    const featured = $("#featured-grid");
    if (featured) {
      const list = listingProducts().filter((p) => p.featured).slice(0, 8);
      const section = featured.closest("[data-section]");
      if (section && !list.length) section.hidden = true;
      renderProducts(featured, list);
    }

    const arrivals = $("#arrivals-grid");
    if (arrivals) {
      const list = listingProducts()
        .filter((p) => p.badge === "NEW")
        .slice(0, 4);
      const section = arrivals.closest("[data-section]");
      if (section && !list.length) section.hidden = true;
      renderProducts(arrivals, list);
    }

    const cats = $("#category-grid");
    if (cats) {
      const list = getCategories();
      cats.innerHTML = list
        .map((cat) => {
          const count = categoryCount(cat);
          return (
            '<a class="cat-card" href="shop.html?category=' +
            encodeURIComponent(cat) +
            '">' +
            '<span class="cat-card__name">' +
            escapeHtml(cat) +
            "</span>" +
            '<span class="cat-card__count">' +
            count +
            (count === 1 ? " product" : " products") +
            "</span>" +
            '<span class="cat-card__arrow" aria-hidden="true">→</span>' +
            "</a>"
          );
        })
        .join("");
    }
  }

  /* ==========================================================================
     5. SHOP PAGE — search, category filter, sort
     ======================================================================== */

  function initShop() {
    const grid = $("#shop-grid");
    if (!grid) return;

    const searchInput = $("#shop-search");
    const sortSelect = $("#shop-sort");
    const chipsWrap = $("#shop-categories");
    const countEl = $("#shop-count");
    const emptyEl = $("#shop-empty");

    const params = new URLSearchParams(window.location.search);
    const state = {
      q: params.get("q") || "",
      category: params.get("category") || "",
      sort: params.get("sort") || "featured"
    };

    /* --- category chips (only categories that contain products) --- */
    const categories = getCategories();
    if (chipsWrap) {
      const all = [{ label: "All", value: "" }].concat(
        categories.map((c) => ({ label: c, value: c }))
      );
      chipsWrap.innerHTML = all
        .map(
          (c) =>
            '<button class="chip" type="button" data-category="' +
            escapeHtml(c.value) +
            '">' +
            escapeHtml(c.label) +
            "</button>"
        )
        .join("");
      chipsWrap.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-category]");
        if (!btn) return;
        state.category = btn.getAttribute("data-category");
        update();
      });
    }

    if (searchInput) {
      searchInput.value = state.q;
      searchInput.addEventListener("input", () => {
        state.q = searchInput.value;
        update();
      });
    }

    if (sortSelect) {
      sortSelect.value = state.sort;
      sortSelect.addEventListener("change", () => {
        state.sort = sortSelect.value;
        update();
      });
    }

    function matches(product, query) {
      if (!query) return true;
      const haystack = [
        product.name,
        product.category,
        product.shortDescription,
        product.description,
        (product.colors || []).join(" "),
        (product.sizes || []).join(" "),
        product.badge || ""
      ]
        .join(" ")
        .toLowerCase();
      return query
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((word) => haystack.indexOf(word) !== -1);
    }

    function applySort(list, sort) {
      const copy = list.slice();
      if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
      else if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
      else if (sort === "name-asc") copy.sort((a, b) => a.name.localeCompare(b.name));
      else copy.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
      return copy;
    }

    function syncUrl() {
      const next = new URLSearchParams();
      if (state.q) next.set("q", state.q);
      if (state.category) next.set("category", state.category);
      if (state.sort && state.sort !== "featured") next.set("sort", state.sort);
      const query = next.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (query ? "?" + query : "")
      );
    }

    function update() {
      let list = listingProducts();
      if (state.category) list = list.filter((p) => p.category === state.category);
      list = list.filter((p) => matches(p, state.q));
      list = applySort(list, state.sort);

      if (chipsWrap) {
        $$("[data-category]", chipsWrap).forEach((chip) => {
          const active = chip.getAttribute("data-category") === state.category;
          chip.classList.toggle("chip--active", active);
          chip.setAttribute("aria-pressed", String(active));
        });
      }

      renderProducts(grid, list);

      if (countEl) {
        countEl.textContent = list.length
          ? list.length + (list.length === 1 ? " product" : " products")
          : "";
      }
      if (emptyEl) emptyEl.hidden = list.length > 0;
      syncUrl();
    }

    update();
  }

  /* ==========================================================================
     6. BOOT
     ======================================================================== */

  function boot() {
    applyConfig(document);
    initNav();
    initFooterCategories();
    initHome();
    initShop();
    initSocialLinks(document);
    initMessengerLinks(document);
    document.body.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* Shared with js/product-page.js */
  window.MADA = {
    config: SITE_CONFIG,
    products: PRODUCTS,
    escapeHtml: escapeHtml,
    normalizeAsset: normalizeAsset,
    formatPrice: formatPrice,
    messengerUrl: messengerUrl,
    isAvailable: isAvailable,
    colorHex: colorHex,
    colorForImage: colorForImage,
    imageAlt: imageAlt,
    productUrl: productUrl,
    findProduct: findProduct,
    getCategories: getCategories,
    categoryCount: categoryCount,
    listingProducts: listingProducts,
    cardHtml: cardHtml,
    renderProducts: renderProducts,
    badgeHtml: badgeHtml,
    swatchHtml: swatchHtml,
    colorNameList: colorNameList,
    sizeNameList: sizeNameList,
    applyConfig: applyConfig,
    initMessengerLinks: initMessengerLinks,
    initSocialLinks: initSocialLinks
  };
})();
