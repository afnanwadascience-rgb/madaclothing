/* ============================================================================
   MADA — PRODUCT DETAIL PAGE
   ----------------------------------------------------------------------------
   Reads  product.html?id=<product-slug>  and builds the gallery, options,
   quantity selector and the Order on Messenger button from js/products.js.
   ============================================================================ */

(function () {
  "use strict";

  const M = window.MADA;
  if (!M) return;

  const esc = M.escapeHtml;
  const params = new URLSearchParams(window.location.search);
  const product = M.findProduct(params.get("id"));

  const root = document.getElementById("product-root");
  const missing = document.getElementById("product-missing");

  if (!product) {
    if (root) root.hidden = true;
    if (missing) missing.hidden = false;
    document.title = "Product not found | " + SITE_CONFIG.brandName;
    M.applyConfig(document);
    M.initMessengerLinks(document);
    M.initSocialLinks(document);
    return;
  }

  const available = M.isAvailable(product);
  const images = (product.images || []).map(M.normalizeAsset);
  const sizes = product.sizes || [];
  const colors = product.colors || [];

  const state = {
    image: 0,
    size: sizes[0] || "",
    color: colors[0] || "",
    qty: 1
  };

  /* ---------------------------------------------------------------- setting */
  document.title = product.name + " | " + SITE_CONFIG.brandName + " — " + SITE_CONFIG.tagline;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && product.shortDescription) metaDesc.setAttribute("content", product.shortDescription);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", product.name + " | " + SITE_CONFIG.brandName);

  /* ------------------------------------------------------------- breadcrumb */
  const bc = document.getElementById("bc-current");
  if (bc) bc.textContent = product.name;

  /* ----------------------------------------------------------- image gallery */
  const mainImg = document.getElementById("product-main-img");
  const thumbs = document.getElementById("product-thumbs");

  function showImage(index) {
    state.image = index;
    if (mainImg && images[index]) {
      mainImg.src = images[index];
      mainImg.alt = M.imageAlt(product, index);
      mainImg.setAttribute("fetchpriority", "high");
    }
    if (thumbs) {
      Array.prototype.forEach.call(thumbs.children, (btn, i) => {
        const active = i === index;
        btn.classList.toggle("thumb--active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
    }
  }

  if (thumbs) {
    thumbs.innerHTML = images
      .map(
        (src, i) =>
          '<button class="thumb" type="button" data-index="' +
          i +
          '" aria-label="Show image ' +
          (i + 1) +
          ' of ' +
          esc(product.name) +
          '" aria-pressed="false">' +
          '<img src="' +
          esc(src) +
          '" alt="" width="240" height="300" loading="lazy" decoding="async">' +
          "</button>"
      )
      .join("");
    thumbs.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-index]");
      if (btn) showImage(Number(btn.getAttribute("data-index")));
    });
  }

  /* ------------------------------------------------------------------ title */
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("product-category", product.category);
  setText("product-name", product.name);
  setText("product-price", M.formatPrice(product.price));
  setText("product-short", product.shortDescription || "");
  setText("product-description", product.description || "");

  const badgeSlot = document.getElementById("product-badge");
  if (badgeSlot && product.badge) badgeSlot.innerHTML = M.badgeHtml(product);

  const shortEl = document.getElementById("product-short");
  if (shortEl) shortEl.hidden = !product.shortDescription;
  const descEl = document.getElementById("product-description");
  if (descEl) descEl.hidden = !product.description;

  /* ------------------------------------------------------------- availability */
  const status = document.getElementById("product-status");
  if (status) {
    status.innerHTML = available
      ? '<span class="status status--in">In stock — order on Messenger</span>'
      : '<span class="status status--out">SOLD OUT — currently unavailable</span>';
  }

  /* ---------------------------------------------------------------- options */
  function optionList(name, values, initial, withDot) {
    return values
      .map((value, i) => {
        const checked = value === initial ? " checked" : "";
        const dot = withDot
          ? '<span class="option__dot" style="background:' + esc(M.colorHex(value)) + '"></span>'
          : "";
        return (
          '<label class="option__chip">' +
          '<input type="radio" name="' +
          name +
          '" value="' +
          esc(value) +
          '"' +
          checked +
          ">" +
          "<span>" +
          dot +
          esc(value) +
          "</span></label>"
        );
      })
      .join("");
  }

  const sizeWrap = document.getElementById("product-sizes");
  if (sizeWrap) {
    if (sizes.length > 1) {
      sizeWrap.innerHTML = optionList("size", sizes, state.size, false);
      sizeWrap.closest("[data-option]").hidden = false;
      sizeWrap.addEventListener("change", (event) => {
        state.size = event.target.value;
        updateSummary();
      });
    } else {
      sizeWrap.closest("[data-option]").hidden = true;
      state.size = sizes[0] || "";
    }
  }

  const colorWrap = document.getElementById("product-colors");
  if (colorWrap) {
    if (colors.length > 1) {
      colorWrap.innerHTML = optionList("color", colors, state.color, true);
      colorWrap.closest("[data-option]").hidden = false;
      colorWrap.addEventListener("change", (event) => {
        state.color = event.target.value;
        updateSummary();
      });
    } else {
      colorWrap.closest("[data-option]").hidden = true;
      state.color = colors[0] || "";
    }
  }

  /* --------------------------------------------------------------- quantity */
  const qtyInput = document.getElementById("qty-input");
  if (qtyInput) {
    document.querySelectorAll("[data-qty]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const delta = Number(btn.getAttribute("data-qty"));
        let next = (Number(qtyInput.value) || 1) + delta;
        next = Math.min(20, Math.max(1, next));
        qtyInput.value = String(next);
        state.qty = next;
        updateSummary();
      });
    });
    qtyInput.addEventListener("input", () => {
      let next = parseInt(qtyInput.value, 10);
      if (!Number.isFinite(next)) next = 1;
      next = Math.min(20, Math.max(1, next));
      state.qty = next;
      updateSummary();
    });
    qtyInput.addEventListener("blur", () => {
      qtyInput.value = String(state.qty);
    });
  }

  /* --------------------------------------------------------- order / soldout */
  const orderSlot = document.getElementById("product-order");
  if (orderSlot) {
    orderSlot.innerHTML = available
      ? '<a class="btn btn--primary btn--block" data-messenger href="' +
        esc(M.messengerUrl()) +
        '" target="_blank" rel="noopener noreferrer">' +
        esc(SITE_CONFIG.orderCtaLabel) +
        "</a>" +
        '<p class="order-help" data-config="orderHelper">' +
        esc(SITE_CONFIG.orderHelper) +
        "</p>"
      : '<button class="btn btn--muted btn--block" type="button" disabled>SOLD OUT</button>' +
        '<p class="order-help">This item is currently unavailable. Check the Shop page for the rest of the collection.</p>';
    M.initMessengerLinks(orderSlot);
  }

  const summary = document.getElementById("selection-summary");
  function updateSummary() {
    if (!summary) return;
    const parts = [];
    if (state.size) parts.push(state.size);
    if (state.color) parts.push(state.color);
    parts.push("Qty " + state.qty);
    summary.textContent = available
      ? "Your selection: " + parts.join(" • ") + " — send this in your message."
      : "";
    summary.hidden = !available;
  }

  /* -------------------------------------------------------- product details */
  const details = document.getElementById("product-details");
  if (details) {
    const rows = [
      ["Material", product.material],
      ["Fit", product.fit],
      ["Care", product.careInstructions],
      ["Sizes", (product.sizes || []).join(" • ")],
      ["Colors", (product.colors || []).join(" • ")],
      ["Category", product.category]
    ].filter((row) => row[1]);

    details.innerHTML = rows
      .map(
        (row) =>
          "<div class=\"detail-row\"><dt>" +
          esc(row[0]) +
          "</dt><dd>" +
          esc(row[1]) +
          "</dd></div>"
      )
      .join("");
  }

  /* ------------------------------------------------------------ related items */
  const relatedGrid = document.getElementById("related-grid");
  if (relatedGrid) {
    const related = M.listingProducts()
      .filter((p) => p.category === product.category && (p.slug || p.id) !== (product.slug || product.id))
      .slice(0, 4);
    const section = relatedGrid.closest("[data-section]");
    if (!related.length) {
      if (section) section.hidden = true;
    } else {
      M.renderProducts(relatedGrid, related);
    }
  }

  /* ------------------------------------------------------------------- finish */
  showImage(0);
  updateSummary();
  M.applyConfig(document);
  M.initSocialLinks(document);
  M.initMessengerLinks(document);
  document.body.classList.add("is-ready");
})();
