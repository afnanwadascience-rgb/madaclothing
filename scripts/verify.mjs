#!/usr/bin/env node
/* ============================================================================
   MADA — HEADLESS QA SCRIPT (developer tool, not used by the website)
   ----------------------------------------------------------------------------
   Opens every page in headless Chrome, checks for console errors / broken
   requests, runs functional checks (search, filters, product page, order
   links, mobile menu, horizontal overflow) and saves screenshots.

   PREREQUISITES
     1. a local server:   python -m http.server 8080   (run inside this folder)
     2. Google Chrome installed (set CHROME below if it lives elsewhere)

   USAGE:   node scripts/verify.mjs
   ============================================================================ */

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE_URL || "http://127.0.0.1:8080";
const PORT = 9333;
const SHOTS = path.join(os.tmpdir(), "mada-qa");
const MESSENGER = "https://m.me/61594943794307";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
let failures = 0;

function check(name, ok, detail) {
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  → " + detail : ""}`);
  if (!ok) failures += 1;
}

/* ------------------------------------------------------------ CDP client */
async function connect() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "mada-chrome-"));
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--window-size=1440,900",
      "about:blank"
    ],
    { stdio: "ignore" }
  );

  let wsUrl = null;
  for (let i = 0; i < 80 && !wsUrl; i += 1) {
    await sleep(250);
    try {
      const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json());
      const page = list.find((t) => t.type === "page");
      if (page) wsUrl = page.webSocketDebuggerUrl;
    } catch {
      /* Chrome is not up yet */
    }
  }
  if (!wsUrl) {
    console.error("Could not connect to headless Chrome — is it installed?");
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let id = 0;
  const pending = new Map();
  const listeners = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) rej(new Error(msg.error.message));
      else res(msg.result);
      return;
    }
    listeners.forEach((fn) => fn(msg));
  };

  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      id += 1;
      pending.set(id, { res, rej });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const on = (fn) => listeners.push(fn);

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Network.enable");

  return { send, on, close: () => { try { ws.close(); } catch {} chrome.kill(); } };
}

/* ------------------------------------------------------------- page load */
let currentIssues = [];

function startCollecting(client) {
  currentIssues = [];
  client.on((msg) => {
    if (msg.method === "Runtime.exceptionThrown") {
      const d = msg.params.exceptionDetails;
      currentIssues.push(`JS exception: ${d.text} ${(d.exception && d.exception.description) || ""}`);
    }
    if (msg.method === "Runtime.consoleAPICalled") {
      const type = msg.params.type;
      if (type === "error" || type === "warning") {
        const text = msg.params.args.map((a) => a.value ?? a.description ?? "").join(" ");
        currentIssues.push(`console.${type}: ${text}`);
      }
    }
    if (msg.method === "Log.entryAdded") {
      const e = msg.params.entry;
      if (e.level === "error") currentIssues.push(`log error: ${e.text} (${e.url || ""})`);
    }
    if (msg.method === "Network.responseReceived") {
      const r = msg.params.response;
      if (r.status >= 400) currentIssues.push(`HTTP ${r.status}: ${r.url}`);
    }
    if (msg.method === "Network.loadingFailed") {
      const f = msg.params;
      if (!f.canceled) currentIssues.push(`request failed: ${f.errorText}`);
    }
  });
}

async function goto(client, url) {
  const loaded = new Promise((res) => {
    const fn = (msg) => {
      if (msg.method === "Page.loadEventFired") res();
    };
    client.on(fn);
    setTimeout(res, 12000);
  });
  await client.send("Page.navigate", { url });
  await loaded;
  await sleep(700);
}

async function setViewport(client, width, height, mobile) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: !!mobile
  });
}

async function evaluate(client, script) {
  const out = await client.send("Runtime.evaluate", {
    expression: script,
    returnByValue: true,
    awaitPromise: true
  });
  if (out.exceptionDetails) throw new Error(out.exceptionDetails.text);
  return out.result.value;
}

async function shoot(client, name, fullPage) {
  const shot = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: !!fullPage
  });
  fs.writeFileSync(path.join(SHOTS, `${name}.png`), Buffer.from(shot.data, "base64"));
}

/* ------------------------------------------------------------------ main */
fs.mkdirSync(SHOTS, { recursive: true });
const client = await connect();
startCollecting(client);

const PAGES = [
  ["index", "/index.html"],
  ["shop", "/shop.html"],
  ["product", "/product.html?id=mada-essential-tee"],
  ["about", "/about.html"],
  ["how-to-order", "/how-to-order.html"],
  ["faq", "/faq.html"],
  ["contact", "/contact.html"],
  ["404", "/404.html"]
];

/* --- desktop pass ------------------------------------------------------- */
await setViewport(client, 1440, 900, false);

for (const [name, route] of PAGES) {
  currentIssues = [];
  await goto(client, BASE + route);
  const info = await evaluate(
    client,
    `(() => ({
        title: document.title,
        h1: (document.querySelector("h1") || {}).textContent || "",
        header: !!document.querySelector(".site-header"),
        footer: !!document.querySelector(".site-footer"),
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        messenger: [...document.querySelectorAll("a[data-messenger]")].map(a => a.href),
        blank: [...document.querySelectorAll("a[data-messenger]")].every(a => a.target === "_blank"),
        brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute("src"))
      }))()`
  );

  check(`${name}: title`, info.title.length > 10, info.title);
  check(`${name}: single h1`, !!info.h1.trim(), info.h1.trim().slice(0, 60));
  check(`${name}: header + footer`, info.header && info.footer);
  check(`${name}: no horizontal overflow`, info.overflow <= 1, `overflow ${info.overflow}px`);
  check(
    `${name}: all order links → Messenger`,
    info.messenger.length > 0 && info.messenger.every((h) => h === MESSENGER),
    `${info.messenger.length} link(s)`
  );
  check(`${name}: order links open in new tab`, info.blank);
  check(`${name}: no broken images`, info.brokenImages.length === 0, info.brokenImages.join(", "));
  check(`${name}: no console/network errors`, currentIssues.length === 0, currentIssues.join(" | "));
}

/* --- home content ------------------------------------------------------- */
currentIssues = [];
await goto(client, BASE + "/index.html");
const home = await evaluate(
  client,
  `(() => ({
      featured: document.querySelectorAll("#featured-grid .card").length,
      arrivals: document.querySelectorAll("#arrivals-grid .card").length,
      categories: document.querySelectorAll("#category-grid .cat-card").length,
      heroCta: [...document.querySelectorAll(".hero .btn")].map(a => a.textContent.trim())
    }))()`
);
check("home: featured products rendered", home.featured > 0, `${home.featured} cards`);
check("home: new arrivals rendered", home.arrivals > 0, `${home.arrivals} cards`);
check("home: category cards", home.categories === 6, `${home.categories} categories`);
check(
  "home: hero CTAs",
  home.heroCta.join(" | ").toLowerCase().includes("shop collection") &&
    home.heroCta.join(" | ").toLowerCase().includes("messenger"),
  home.heroCta.join(" | ")
);
await shoot(client, "desktop-home", true);

/* --- shop: search / filter / sort --------------------------------------- */
currentIssues = [];
await goto(client, BASE + "/shop.html");
const shop = await evaluate(
  client,
  `(() => {
      const total = document.querySelectorAll("#shop-grid .card").length;
      const chips = document.querySelectorAll("#shop-categories .chip").length;

      const search = document.querySelector("#shop-search");
      search.value = "hoodie";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      const afterSearch = document.querySelectorAll("#shop-grid .card").length;

      search.value = "";
      search.dispatchEvent(new Event("input", { bubbles: true }));

      const chip = [...document.querySelectorAll("#shop-categories .chip")]
        .find(c => c.dataset.category === "T-Shirts");
      chip.click();
      const afterFilter = document.querySelectorAll("#shop-grid .card").length;
      const filterCats = [...document.querySelectorAll("#shop-grid .card__cat")]
        .map(e => e.textContent.trim());
      chip.click();

      const sort = document.querySelector("#shop-sort");
      sort.value = "price-asc";
      sort.dispatchEvent(new Event("change", { bubbles: true }));
      const prices = [...document.querySelectorAll("#shop-grid .card__price")]
        .map(e => Number(e.textContent.replace(/[^0-9]/g, "")));
      const sorted = prices.every((p, i) => i === 0 || prices[i - 1] <= p);

      sort.value = "featured";
      sort.dispatchEvent(new Event("change", { bubbles: true }));

      search.value = "zzzzzz";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      const emptyShown = !document.querySelector("#shop-empty").hidden;
      search.value = "";
      search.dispatchEvent(new Event("input", { bubbles: true }));

      return { total, chips, afterSearch, afterFilter, filterCats, sorted, emptyShown };
    })()`
);
check("shop: full catalogue rendered", shop.total === 12, `${shop.total} cards`);
check("shop: category chips (All + 6)", shop.chips === 7, `${shop.chips} chips`);
check("shop: search narrows results", shop.afterSearch === 2, `${shop.afterSearch} for "hoodie"`);
check("shop: category filter works", shop.afterFilter === 3, `${shop.afterFilter} T-Shirts`);
check(
  "shop: filter only shows that category",
  shop.filterCats.every((c) => c === "T-Shirts"),
  shop.filterCats.join(", ")
);
check("shop: price sort ascending", shop.sorted);
check("shop: empty state appears", shop.emptyShown);
check("shop: no console/network errors", currentIssues.length === 0, currentIssues.join(" | "));
await shoot(client, "desktop-shop", true);

/* --- product page ------------------------------------------------------- */
currentIssues = [];
await goto(client, BASE + "/product.html?id=mada-essential-tee");
const product = await evaluate(
  client,
  `(() => {
      const qty = document.querySelector("#qty-input");
      document.querySelector('[data-qty="1"]').click();
      const afterPlus = qty.value;
      document.querySelector('[data-qty="-1"]').click();
      const sizeInputs = document.querySelectorAll('#product-sizes input');
      const colorInputs = document.querySelectorAll('#product-colors input');
      colorInputs[colorInputs.length - 1].click();
      return {
        name: document.querySelector("#product-name").textContent.trim(),
        price: document.querySelector("#product-price").textContent.trim(),
        sizes: sizeInputs.length,
        colors: colorInputs.length,
        images: document.querySelectorAll("#product-thumbs button").length,
        details: document.querySelectorAll("#product-details .detail-row").length,
        related: document.querySelectorAll("#related-grid .card").length,
        orderHref: (document.querySelector("#product-order a") || {}).href || "",
        afterPlus,
        summary: document.querySelector("#selection-summary").textContent.trim(),
        status: document.querySelector("#product-status").textContent.trim()
      };
    })()`
);
check("product: name", product.name === "MADA Essential Tee", product.name);
check("product: price in BDT", product.price === "৳850", product.price);
check("product: sizes", product.sizes === 4, `${product.sizes} sizes`);
check("product: colours", product.colors === 2, `${product.colors} colours`);
check("product: gallery", product.images === 3, `${product.images} thumbs`);
check("product: detail rows", product.details >= 5, `${product.details} rows`);
check("product: related products", product.related > 0, `${product.related} cards`);
check("product: order link → Messenger", product.orderHref === MESSENGER, product.orderHref);
check("product: quantity stepper", product.afterPlus === "2", `qty ${product.afterPlus}`);
check(
  "product: selection summary",
  product.summary.includes("Qty 1") && product.summary.includes("White"),
  product.summary
);
check("product: availability shown", product.status.length > 0, product.status);
check("product: no console/network errors", currentIssues.length === 0, currentIssues.join(" | "));
await shoot(client, "desktop-product", true);

/* --- sold out product --------------------------------------------------- */
currentIssues = [];
await goto(client, BASE + "/product.html?id=mada-studio-hoodie");
const soldOut = await evaluate(
  client,
  `(() => ({
      hasOrderLink: !!document.querySelector("#product-order a[data-messenger]"),
      disabled: (document.querySelector("#product-order button") || {}).disabled,
      label: (document.querySelector("#product-order button") || {}).textContent || "",
      status: document.querySelector("#product-status").textContent.trim(),
      card: null
    }))()`
);
check("sold out: no order link", !soldOut.hasOrderLink);
check("sold out: order button disabled", soldOut.disabled === true, soldOut.label.trim());
check("sold out: status label", /SOLD OUT/i.test(soldOut.status), soldOut.status);
check("sold out: no console/network errors", currentIssues.length === 0, currentIssues.join(" | "));

/* --- unknown product + 404 --------------------------------------------- */
currentIssues = [];
await goto(client, BASE + "/product.html?id=does-not-exist");
const missing = await evaluate(
  client,
  `(() => ({
      shown: !document.querySelector("#product-missing").hidden,
      root: document.querySelector("#product-root").hidden
    }))()`
);
check("product: unknown id shows not-found block", missing.shown && missing.root);
check("product: not-found has no console errors", currentIssues.length === 0, currentIssues.join(" | "));

/* --- mobile pass -------------------------------------------------------- */
for (const width of [360, 390, 768]) {
  await setViewport(client, width, 780, true);
  for (const [name, route] of [
    ["index", "/index.html"],
    ["shop", "/shop.html"],
    ["product", "/product.html?id=mada-heavy-oversized-tee"]
  ]) {
    currentIssues = [];
    await goto(client, BASE + route);
    const m = await evaluate(
      client,
      `(() => ({
          overflow: document.documentElement.scrollWidth - window.innerWidth,
          cards: document.querySelectorAll("#shop-grid .card, #featured-grid .card").length
        }))()`
    );
    check(`mobile ${width}px ${name}: no horizontal overflow`, m.overflow <= 1, `overflow ${m.overflow}px`);
    check(`mobile ${width}px ${name}: no console/network errors`, currentIssues.length === 0, currentIssues.join(" | "));
  }
}

/* mobile menu behaviour */
await setViewport(client, 390, 780, true);
currentIssues = [];
await goto(client, BASE + "/index.html");
const menu = await evaluate(
  client,
  `(() => {
      const toggle = document.querySelector("#nav-toggle");
      const panel = document.querySelector("#mobile-menu");
      const before = panel.hidden;
      toggle.click();
      const opened = !panel.hidden && toggle.getAttribute("aria-expanded") === "true";
      toggle.click();
      const closed = panel.hidden && toggle.getAttribute("aria-expanded") === "false";
      return { before, opened, closed, cta: !!panel.querySelector("a[data-messenger]") };
    })()`
);
check("mobile menu: hidden by default", menu.before === true);
check("mobile menu: opens", menu.opened);
check("mobile menu: closes", menu.closed);
check("mobile menu: contains Messenger CTA", menu.cta);
await shoot(client, "mobile-home", true);
await goto(client, BASE + "/shop.html");
await shoot(client, "mobile-shop", true);
await goto(client, BASE + "/product.html?id=mada-essential-tee");
await shoot(client, "mobile-product", true);
await goto(client, BASE + "/how-to-order.html");
await shoot(client, "desktop-how-to-order", true);
await goto(client, BASE + "/faq.html");
await shoot(client, "desktop-faq", true);

client.close();

console.log("\n" + results.join("\n"));
console.log(`\n${results.length - failures}/${results.length} checks passed.`);
console.log(`Screenshots → ${SHOTS}`);
process.exit(failures ? 1 : 0);
