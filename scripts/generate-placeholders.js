#!/usr/bin/env node
/* ============================================================================
   MADA — SAMPLE PRODUCT IMAGE GENERATOR
   ----------------------------------------------------------------------------
   Creates the placeholder artwork in assets/products/ for every image path
   listed in js/products.js that ends in .svg.

   ⚠ These are SAMPLE images (flat vector mockups) so the site works out of the
     box. Replace them with real product photography when you have it:
       1. put your photo in assets/products/  (e.g. mada-tee-001-1.jpg)
       2. update the path in js/products.js
       3. this script will skip real photos and never overwrite them.

   Usage:   node scripts/generate-placeholders.js
   ============================================================================ */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "assets", "products");
const W = 1200;
const H = 1500;

/* ---------------------------------------------------------------- helpers */
function loadGlobal(file, expression) {
  const code = fs.readFileSync(path.join(ROOT, file), "utf8");
  return vm.runInNewContext(code + "\n;" + expression, Object.create(null), {
    filename: file
  });
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseHex(hex) {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16)
  };
}

function toHex({ r, g, b }) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")
  );
}

/* amt < 0 → darker, amt > 0 → lighter */
function shade(hex, amt) {
  const { r, g, b } = parseHex(hex);
  const f = (v) => (amt >= 0 ? v + (255 - v) * amt : v * (1 + amt));
  return toHex({ r: f(r), g: f(g), b: f(b) });
}

function luminance(hex) {
  const { r, g, b } = parseHex(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function swatchColor(name, fallback) {
  const map = SITE_CONFIG.swatchColors || {};
  return map[String(name || "").trim().toLowerCase()] || fallback;
}

function text(x, y, str, size, opts) {
  opts = opts || {};
  return (
    `<text x="${x}" y="${y}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"` +
    ` font-size="${size}" font-weight="${opts.weight || 700}"` +
    ` letter-spacing="${opts.spacing || 0}" text-anchor="${opts.anchor || "start"}"` +
    ` fill="${opts.fill}" opacity="${opts.opacity == null ? 1 : opts.opacity}">` +
    escapeXml(str) +
    "</text>"
  );
}

function line(d, stroke, width, opacity) {
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}"/>`;
}

function circle(cx, cy, r, fill) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
}

/* ------------------------------------------------------------- templates */
/* Each template returns { bbox, parts } — parts is the SVG markup drawn in
   the garment colour (c = colour, d = darker shade, l = lighter shade). */

const TEMPLATES = {
  tee: {
    bbox: { cx: 600, cy: 779, w: 770, h: 702 },
    parts: (g) => {
      const d =
        "M545 428 L365 450 L215 610 L262 790 L358 700 L352 1130 L848 1130 L842 700 " +
        "L938 790 L985 610 L835 450 L655 428 Q600 545 545 428 Z";
      return [
        `<path d="${d}" fill="${g.c}"/>`,
        line("M552 470 Q600 580 648 470", g.d, 7, 0.35),
        line("M243 617 L288 783", g.d, 6, 0.3),
        line("M957 617 L912 783", g.d, 6, 0.3),
        line("M364 1094 L836 1094", g.d, 6, 0.3),
        text(600, 700, "MADA", 62, { fill: g.l, spacing: 12, anchor: "middle", weight: 800 })
      ].join("\n    ");
    }
  },

  oversized: {
    bbox: { cx: 600, cy: 772, w: 850, h: 665 },
    parts: (g) => {
      const d =
        "M555 440 L330 462 L175 640 L230 830 L330 720 L325 1105 L875 1105 L870 720 " +
        "L970 830 L1025 640 L870 462 L645 440 Q600 555 555 440 Z";
      return [
        `<path d="${d}" fill="${g.c}"/>`,
        line("M562 470 Q600 590 638 470", g.d, 7, 0.35),
        line("M203 650 L256 818", g.d, 6, 0.3),
        line("M997 650 L944 818", g.d, 6, 0.3),
        line("M337 1071 L863 1071", g.d, 6, 0.3),
        text(600, 745, "MADA", 68, { fill: g.l, spacing: 14, anchor: "middle", weight: 800 })
      ].join("\n    ");
    }
  },

  hoodie: {
    bbox: { cx: 600, cy: 758, w: 680, h: 773 },
    parts: (g) => {
      const d =
        "M430 500 L260 880 L330 960 L455 665 L440 1145 L760 1145 L745 665 L870 960 " +
        "L940 880 L770 500 C790 330 410 330 430 500 Z";
      return [
        `<path d="${d}" fill="${g.c}"/>`,
        line("M470 505 C515 610 685 610 730 505", g.d, 9, 0.45),
        line("M568 540 L556 660", g.l, 7, 0.9),
        line("M632 540 L644 660", g.l, 7, 0.9),
        circle(556, 668, 8, g.l),
        circle(644, 668, 8, g.l),
        `<path d="M468 900 L732 900 L706 1075 L494 1075 Z" fill="none" stroke="${g.d}" stroke-width="7" opacity="0.4"/>`,
        line("M448 1108 L752 1108", g.d, 6, 0.35),
        line("M271 856 L341 936", g.d, 6, 0.35),
        line("M929 856 L859 936", g.d, 6, 0.35),
        text(600, 800, "MADA", 54, { fill: g.l, spacing: 10, anchor: "middle", weight: 800 })
      ].join("\n    ");
    }
  },

  shirt: {
    bbox: { cx: 600, cy: 786, w: 770, h: 708 },
    parts: (g) => {
      const d =
        "M548 432 L372 452 L215 850 L295 935 L395 640 L385 1140 L815 1140 L805 640 " +
        "L905 935 L985 850 L828 452 L652 432 Q600 505 548 432 Z";
      return [
        `<path d="${d}" fill="${g.c}"/>`,
        `<path d="M578 520 L622 520 L622 1140 L578 1140 Z" fill="${g.d}" opacity="0.45"/>`,
        `<path d="M548 432 L600 470 L598 556 L518 484 Z" fill="${g.d}" opacity="0.75"/>`,
        `<path d="M652 432 L600 470 L602 556 L682 484 Z" fill="${g.d}" opacity="0.75"/>`,
        `<rect x="440" y="700" width="90" height="100" fill="none" stroke="${g.d}" stroke-width="6" opacity="0.4"/>`,
        `<rect x="670" y="700" width="90" height="100" fill="none" stroke="${g.d}" stroke-width="6" opacity="0.4"/>`,
        line("M440 745 L530 745", g.d, 5, 0.4),
        line("M670 745 L760 745", g.d, 5, 0.4),
        line("M225 826 L305 911", g.d, 6, 0.35),
        line("M975 826 L895 911", g.d, 6, 0.35),
        line("M395 1104 L805 1104", g.d, 6, 0.3),
        circle(600, 660, 11, g.l),
        circle(600, 790, 11, g.l),
        circle(600, 920, 11, g.l),
        circle(600, 1050, 11, g.l)
      ].join("\n    ");
    }
  },

  pants: {
    bbox: { cx: 600, cy: 787, w: 400, h: 785 },
    parts: (g) => {
      const d =
        "M435 395 L765 395 L795 555 L800 1180 L645 1180 L600 700 L555 1180 L400 1180 L415 555 Z";
      return [
        `<path d="${d}" fill="${g.c}"/>`,
        `<rect x="437" y="397" width="326" height="60" fill="${g.d}" opacity="0.5"/>`,
        line("M585 435 L574 508", g.l, 7, 0.9),
        line("M615 435 L627 508", g.l, 7, 0.9),
        circle(574, 516, 8, g.l),
        circle(627, 516, 8, g.l),
        line("M447 520 L524 604", g.d, 7, 0.35),
        line("M753 520 L676 604", g.d, 7, 0.35),
        line("M600 457 L600 690", g.d, 5, 0.3),
        line("M406 1136 L554 1136", g.d, 6, 0.35),
        line("M646 1136 L794 1136", g.d, 6, 0.35)
      ].join("\n    ");
    }
  },

  shorts: {
    bbox: { cx: 600, cy: 647, w: 400, h: 505 },
    parts: (g) => {
      const d =
        "M435 395 L765 395 L790 545 L800 900 L640 900 L600 700 L560 900 L400 900 L410 545 Z";
      return [
        `<path d="${d}" fill="${g.c}"/>`,
        `<rect x="437" y="397" width="326" height="60" fill="${g.d}" opacity="0.5"/>`,
        line("M585 435 L574 500", g.l, 7, 0.9),
        line("M615 435 L627 500", g.l, 7, 0.9),
        circle(574, 508, 8, g.l),
        circle(627, 508, 8, g.l),
        `<rect x="432" y="615" width="112" height="120" fill="none" stroke="${g.d}" stroke-width="6" opacity="0.4"/>`,
        `<rect x="656" y="615" width="112" height="120" fill="none" stroke="${g.d}" stroke-width="6" opacity="0.4"/>`,
        line("M432 652 L544 652", g.d, 5, 0.4),
        line("M656 652 L768 652", g.d, 5, 0.4),
        line("M410 858 L552 858", g.d, 6, 0.35),
        line("M648 858 L790 858", g.d, 6, 0.35)
      ].join("\n    ");
    }
  },

  tote: {
    bbox: { cx: 600, cy: 717, w: 540, h: 906 },
    parts: (g) => {
      return [
        `<path d="M480 575 C480 380 720 380 720 575" fill="none" stroke="${g.d}" stroke-width="34" opacity="0.85"/>`,
        `<path d="M460 575 C460 350 740 350 740 575" fill="none" stroke="${g.c}" stroke-width="34"/>`,
        `<rect x="330" y="570" width="540" height="580" rx="16" fill="${g.c}"/>`,
        line("M352 612 L848 612", g.d, 6, 0.35),
        `<rect x="530" y="850" width="140" height="72" rx="8" fill="${g.bg}"/>`,
        text(600, 899, "MADA", 34, { fill: g.c, spacing: 6, anchor: "middle", weight: 800 })
      ].join("\n    ");
    }
  },

  beanie: {
    bbox: { cx: 600, cy: 707, w: 496, h: 445 },
    parts: (g) => {
      const crown =
        "M370 800 C370 380 830 380 830 800 Z";
      const ribs = [];
      for (let x = 440; x <= 770; x += 55) {
        ribs.push(`<path d="M${x} 470 L${x} 800" stroke="${g.d}" stroke-width="5" opacity="0.25"/>`);
      }
      const cuffRibs = [];
      for (let x = 395; x <= 820; x += 45) {
        cuffRibs.push(`<path d="M${x} 805 L${x} 922" stroke="${g.d}" stroke-width="5" opacity="0.25"/>`);
      }
      return [
        `<clipPath id="crown"><path d="${crown}"/></clipPath>`,
        `<path d="${crown}" fill="${g.c}"/>`,
        `<g clip-path="url(#crown)">${ribs.join("")}</g>`,
        `<rect x="352" y="795" width="496" height="135" rx="22" fill="${g.c}"/>`,
        cuffRibs.join(""),
        `<rect x="352" y="795" width="496" height="135" rx="22" fill="none" stroke="${g.d}" stroke-width="6" opacity="0.45"/>`,
        `<rect x="545" y="838" width="110" height="56" rx="8" fill="${g.bg}"/>`,
        text(600, 877, "MADA", 30, { fill: g.c, spacing: 4, anchor: "middle", weight: 800 })
      ].join("\n    ");
    }
  }
};

function templateFor(product) {
  const category = String(product.category || "").toLowerCase();
  const name = String(product.name || "").toLowerCase();

  if (category.indexOf("oversized") !== -1) return TEMPLATES.oversized;
  if (category.indexOf("t-shirt") !== -1 || category.indexOf("tee") !== -1) return TEMPLATES.tee;
  if (category.indexOf("hoodie") !== -1) return TEMPLATES.hoodie;
  if (category.indexOf("shirt") !== -1) return TEMPLATES.shirt;
  if (category.indexOf("bottom") !== -1) return /short/.test(name) ? TEMPLATES.shorts : TEMPLATES.pants;
  if (category.indexOf("accessor") !== -1) return /beanie|cap|hat/.test(name) ? TEMPLATES.beanie : TEMPLATES.tote;
  return TEMPLATES.tee;
}

/* Same rule as js/app.js → colourForImage(): image N shows colour N. */
function colorForImage(product, index) {
  const colors = product.colors && product.colors.length ? product.colors : [null];
  return colors[index % colors.length];
}

function backgroundFor(garment, index) {
  const light = "#f4f3f0";
  const dark = "#141414";
  const mid = "#dedcd7";
  const order = index % 2 === 0 ? [light, dark, mid] : [dark, light, mid];
  const g = luminance(garment);
  let best = order[0];
  let bestDiff = -1;
  order.forEach((bg) => {
    const diff = Math.abs(luminance(bg) - g);
    if (diff > bestDiff) {
      bestDiff = diff;
      best = bg;
    }
  });
  return best;
}

function buildSvg(product, index, total) {
  const template = templateFor(product);
  const colorName = colorForImage(product, index);
  const garment = swatchColor(colorName, "#4a4a4a");
  const bg = backgroundFor(garment, index);
  const fg = luminance(bg) > 0.45 ? "#111111" : "#f5f5f5";
  const g = {
    c: garment,
    d: shade(garment, -0.38),
    l: shade(garment, 0.32),
    bg: bg
  };

  const box = template.bbox;
  const scale = Math.min(960 / box.w, 1000 / box.h);
  const transform =
    `translate(600 740) scale(${scale.toFixed(3)}) translate(${(-box.cx).toFixed(1)} ${(-box.cy).toFixed(1)})`;
  const shadowFill = luminance(bg) > 0.45 ? "#000000" : "#ffffff";
  const shadowOpacity = luminance(bg) > 0.45 ? 0.1 : 0.06;

  const label = colorName ? `${product.name} — ${colorName}` : product.name;
  const number = String(index + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>${escapeXml(label)}</title>
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <g transform="${transform}">
    <ellipse cx="${box.cx}" cy="${box.cy + box.h / 2 + 26}" rx="${(box.w * 0.4).toFixed(
    0
  )}" ry="30" fill="${shadowFill}" opacity="${shadowOpacity}"/>
    ${template.parts(g)}
  </g>
  ${text(60, 108, "MADA", 46, { fill: fg, spacing: 14, weight: 800 })}
  ${text(1140, 108, "GO BEYOND.", 26, { fill: fg, spacing: 6, anchor: "end", opacity: 0.7 })}
  <path d="M60 145 H1140" stroke="${fg}" stroke-width="2" opacity="0.2"/>
  <path d="M60 1348 H1140" stroke="${fg}" stroke-width="2" opacity="0.2"/>
  ${text(60, 1400, String(product.name || "").toUpperCase(), 42, { fill: fg, spacing: 3, weight: 800 })}
  ${text(60, 1446, [product.category, colorName].filter(Boolean).join("  •  "), 26, {
    fill: fg,
    spacing: 2,
    weight: 600,
    opacity: 0.7
  })}
  ${text(1140, 1446, number, 30, { fill: fg, spacing: 4, anchor: "end", weight: 700, opacity: 0.7 })}
</svg>
`;
}

/* ------------------------------------------------------------------- main */
const SITE_CONFIG = loadGlobal("js/config.js", "SITE_CONFIG");
const PRODUCTS = loadGlobal("js/products.js", "PRODUCTS");

if (!Array.isArray(PRODUCTS)) {
  console.error("Could not read PRODUCTS from js/products.js");
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let created = 0;
let skipped = 0;
const warnings = [];

PRODUCTS.forEach((product) => {
  if (!product || !product.id) {
    warnings.push("A product is missing an id — skipped.");
    return;
  }
  const images = Array.isArray(product.images) ? product.images : [];
  if (!images.length) {
    warnings.push(`${product.id}: no images listed in js/products.js.`);
    return;
  }

  images.forEach((imagePath, index) => {
    const clean = String(imagePath).replace(/^\/+/, "");
    const target = path.join(ROOT, clean);

    if (!/\.svg$/i.test(clean)) {
      /* Never overwrite real photography. */
      if (fs.existsSync(target)) skipped += 1;
      else warnings.push(`${product.id}: image not found → ${clean}`);
      return;
    }

    fs.writeFileSync(target, buildSvg(product, index, images.length), "utf8");
    created += 1;
  });
});

console.log(`MADA placeholders → ${created} svg file(s) written to assets/products/`);
if (skipped) console.log(`${skipped} real image(s) left untouched.`);
warnings.forEach((w) => console.warn("  ! " + w));
