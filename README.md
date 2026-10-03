# MADA — Streetwear Catalog Website

**GO BEYOND.** A complete, production-ready catalog website for the MADA streetwear brand.
Plain HTML, CSS and JavaScript — no frameworks, no build step, no dependencies.
Deploys to GitHub + Vercel in minutes.

**How ordering works:** there is no checkout, no payment gateway and no accounts.
Every **Order** button on the site opens a Messenger chat
(`https://m.me/61594943794307`) in a new tab, where the order is confirmed by hand.

---

## Table of contents

1. [What's in this site](#1-whats-in-this-site)
2. [Folder structure](#2-folder-structure)
3. [Run it locally](#3-run-it-locally)
4. [HOW TO ADD A NEW PRODUCT](#4-how-to-add-a-new-product)
5. [Change a price](#5-change-a-price)
6. [Hide a product (sold out)](#6-hide-a-product-sold-out)
7. [Replace the product images](#7-replace-the-product-images)
8. [Update the Messenger URL](#8-update-the-messenger-url)
9. [Update the Facebook URL](#9-update-the-facebook-url)
10. [Set your domain](#10-set-your-domain)
11. [Deploy to Vercel](#11-deploy-to-vercel)
12. [Other common edits](#12-other-common-edits)
13. [Testing](#13-testing)
14. [Important: sample data notice](#14-important-sample-data-notice)

---

## 1. What's in this site

| Page | File | Notes |
| --- | --- | --- |
| Home | `index.html` | Hero, featured products, new arrivals, categories, CTA |
| Shop | `shop.html` | Search, category filter, sort — all driven by the catalog |
| Product detail | `product.html?id=...` | Gallery, sizes, colours, quantity, order block, related items |
| About | `about.html` | Brand text (edit to match your real story) |
| How to Order | `how-to-order.html` | 4-step ordering walkthrough |
| FAQ | `faq.html` | Accessible accordion |
| Contact | `contact.html` | Messenger + Facebook contact points |
| 404 | `404.html` | Not-found page |

Everything product-related — cards, listings, detail pages, featured sections,
filters, categories, search, badges, availability — is generated at runtime from
two central files:

- **`js/products.js`** → the entire catalog (`PRODUCTS` + `CATEGORY_ORDER`)
- **`js/config.js`** → the entire site config (`SITE_CONFIG`)

You never edit HTML to add or change a product.

---

## 2. Folder structure

```
mada/
├── index.html              Home
├── shop.html               Shop (search / filter / sort)
├── product.html            Product detail (reads ?id=...)
├── about.html
├── how-to-order.html
├── faq.html
├── contact.html
├── 404.html
│
├── js/
│   ├── config.js           ★ SITE_CONFIG — brand, Messenger, currency, policies
│   ├── products.js         ★ PRODUCTS — the whole catalog
│   ├── app.js              shared rendering (cards, header, footer, shop logic)
│   └── product-page.js     product detail page logic
│
├── css/
│   └── styles.css          full design system (mobile-first)
│
├── assets/
│   ├── logo/logo.svg       MADA wordmark
│   ├── products/           product images  <id>-<n>.jpg  (currently sample .svg)
│   └── social/og-cover.png share/OG image
│
├── scripts/
│   ├── verify.mjs          headless-browser test suite (116 checks)
│   ├── generate-placeholders.js   regenerates the sample SVG images
│   └── generate-brand-assets.ps1  regenerates favicon.ico + og-cover.png
│
├── favicon.ico / favicon.svg / manifest.webmanifest
├── robots.txt / sitemap.xml
└── README.md               (this file)
```

★ = the only two files you normally need to edit.

---

## 3. Run it locally

No install, no build. Because product images load with absolute paths
(`/assets/...`), open the site through a small local server instead of
double-clicking the HTML files.

**Option A — Python (preinstalled on most systems):**

```bash
cd mada
python -m http.server 8080
# open http://localhost:8080
```

**Option B — Node:**

```bash
npx serve .
```

Then open <http://localhost:8080>.

---

## 4. HOW TO ADD A NEW PRODUCT

**Step 1 — Add the images.**
Copy the product photos into `assets/products/` using the naming convention:

```
<product-id>-<n>.jpg
```

Examples for a product with id `mada-tee-004`:

```
mada-tee-004-1.jpg     ← first image = the card image
mada-tee-004-2.jpg
mada-tee-004-3.jpg
```

Optimise them before uploading (roughly 1200 × 1500 px, under ~300 KB each).

**Step 2 — Open `js/products.js` and paste the template block.**
There is a ready-made template at the bottom of the file. Copy it into the
`PRODUCTS` array and edit every field:

```js
{
  id: "mada-tee-004",                 // unique, no spaces — matches the image files
  slug: "mada-my-new-tee",            // used in the product link
  name: "MADA My New Tee",
  price: 990,                         // number only, no ৳ symbol
  currency: "BDT",
  category: "T-Shirts",               // must exist in CATEGORY_ORDER (see below)
  shortDescription: "One line about the product.",
  description: "A full paragraph describing the product.",
  images: [
    "/assets/products/mada-tee-004-1.jpg",
    "/assets/products/mada-tee-004-2.jpg"
  ],
  sizes: ["S", "M", "L", "XL"],
  colors: ["Black", "White"],
  featured: false,                    // true = shows in the Featured section on Home
  available: true,                    // false = SOLD OUT (see section 6)
  badge: "NEW",                       // "NEW" | "LIMITED" | null
  material: "100% cotton, 180 GSM",
  fit: "Regular fit",
  careInstructions: "Machine wash cold, inside out."
},
```

**Step 3 — (Only for a brand-new category)** add the category name to
`CATEGORY_ORDER`, also at the bottom of `js/products.js`:

```js
const CATEGORY_ORDER = [
  "T-Shirts",
  "Oversized T-Shirts",
  "Hoodies",
  "Shirts",
  "Bottoms",
  "Accessories",
  "Your New Category"        // ← add it here for the display order
];
```

Categories with **no products are hidden automatically** everywhere (nav chips,
home categories, footer), so you never have to clean up empty ones.

**Step 4 — Save the file and refresh the site.** The product instantly appears in
the Shop, in its category filter, in search, and (if `featured: true`) in the
Home featured section. Its detail page lives at
`product.html?id=mada-tee-004`.

> Tip: keep `id` lowercase, hyphenated and matching the image filenames —
> `id: "mada-tee-004"` + `mada-tee-004-1.jpg`.

### Field reference

| Field | Type | Effect |
| --- | --- | --- |
| `id` | string | Unique key; builds the detail-page link `product.html?id=...` |
| `slug` | string | Optional friendlier link name (defaults to `id`) |
| `name` | string | Product name |
| `price` | number | Number only — symbol comes from `SITE_CONFIG.currencySymbol` |
| `currency` | string | e.g. `"BDT"` |
| `category` | string | Must match an entry in `CATEGORY_ORDER` |
| `shortDescription` | string | One line used in listings |
| `description` | string | Full paragraph on the detail page |
| `images` | array | Paths; **first image** is used on cards |
| `sizes` | array | e.g. `["S","M","L","XL"]` — empty array hides the size selector |
| `colors` | array | e.g. `["Black","White"]` — empty array hides the colour selector |
| `featured` | boolean | `true` → Home "Featured" section |
| `available` | boolean | `false` → SOLD OUT, Order button disabled |
| `badge` | string/null | `"NEW"`, `"LIMITED"` or `null` |
| `material` / `fit` / `careInstructions` | string | Detail-page spec rows |

---

## 5. Change a price

Open `js/products.js`, find the product, change the `price` value, save.

```js
price: 850,     // ← change to e.g. 950
```

Prices are displayed with the currency from `js/config.js`
(`currency: "BDT"`, `currencySymbol: "৳"`). Never type the `৳` into `price` —
it must stay a plain number so sorting works.

---

## 6. Hide a product (sold out)

Set `available: false` on the product in `js/products.js`:

```js
available: false,
```

Result everywhere on the site:

- a **SOLD OUT** badge appears on the card,
- the **Order button is disabled** and does not link to Messenger,
- the detail page shows *“SOLD OUT — currently unavailable”* instead of the order button.

To remove sold-out items from listings entirely (instead of labelling them), set
in `js/config.js`:

```js
showSoldOutProducts: false,
```

To delete a product permanently, just delete its whole block from `PRODUCTS`.

---

## 7. Replace the product images

⚠ **The images currently in `assets/products/` are generated placeholders
(sample SVGs).** Replace them with real photography before launch.

1. Export your photos as `.jpg`, named `<product-id>-<n>.jpg`
   (see [section 4](#4-how-to-add-a-new-product)).
2. Copy them into `assets/products/`.
3. Update the `images` array of that product in `js/products.js` to point at the
   new `.jpg` files:

```js
images: [
  "/assets/products/mada-tee-001-1.jpg",
  "/assets/products/mada-tee-001-2.jpg"
],
```

4. Delete the leftover sample `.svg` files for that product.

Guidelines for consistent, premium-looking cards:

- same aspect ratio for every photo (4:5 portrait recommended),
- consistent background, product centred, no people/model shots required,
- 1200 × 1500 px, quality ~80, under ~300 KB each,
- the **first** image in the array is what shoppers see in every listing.

---

## 8. Update the Messenger URL

Open `js/config.js` and change `messengerUrl`:

```js
messengerUrl: "https://m.me/61594943794307",
```

That single value is applied to **every** Order button on the site (header, hero,
cards, product page, footer, FAQ, contact) and each one opens in a new tab.
There is nothing else to update.

---

## 9. Update the Facebook URL

The Facebook URL was **not invented** — it is intentionally empty until you
supply the real page.

Open `js/config.js` and paste your page URL:

```js
facebookUrl: "https://www.facebook.com/yourpagename",
```

- While it is `""`, every Facebook link on the site stays **hidden**
  (Contact page, FAQ answer, footer).
- As soon as you set it, the links appear automatically — no HTML edits needed.

---

## 10. Set your domain

`https://mada.example.com` is a **placeholder**. Search and replace it with your
real domain (with `https://`) in these files:

| File | What to replace |
| --- | --- |
| `sitemap.xml` | every `<loc>` URL |
| `robots.txt` | the commented `Sitemap:` line |
| `index.html` | `canonical`, `og:url`, `og:image` |
| `shop.html`, `product.html`, `about.html`, `how-to-order.html`, `faq.html`, `contact.html` | `canonical`, `og:url`, `og:image` |

A quick way (from the `mada` folder):

```bash
# Windows PowerShell
Get-ChildItem -Include *.html,robots.txt,sitemap.xml -Recurse |
  ForEach-Object {
    (Get-Content $_.FullName -Raw) -replace 'https://mada\.example\.com','https://yourdomain.com' |
      Set-Content $_.FullName
  }
```

Also update the same placeholder if you see it in page descriptions.

---

## 11. Deploy to Vercel

The site is a plain static folder — Vercel needs zero configuration.

### Option A — drag & drop (fastest)

1. Push this folder to GitHub (see below) **or** zip it.
2. Go to <https://vercel.com/new> → **Import** your repo (or **Deploy** a zip).
3. Vercel detects a static site automatically — click **Deploy**.
4. After the first deploy, add your custom domain under **Settings → Domains**.

### Option B — Git integration (auto deploys)

```bash
cd mada
git init
git add .
git commit -m "MADA catalog site"
git branch -M main
git remote add origin https://github.com/<you>/mada.git
git push -u origin main
```

Then in Vercel: **Add New → Project → Import** that repo, and keep every default
Framework Preset: *Other*, Build Command: *(empty)*, Output Directory: *(root)*.

Every future `git push` triggers a new deployment.

> Remember: after the first deploy, do
> [section 10](#10-set-your-domain) so canonical/OG/sitemap URLs point at your
> real Vercel domain (e.g. `https://mada.vercel.app`) or custom domain.

---

## 12. Other common edits

All of these live in **`js/config.js`**:

| Want to change… | Edit |
| --- | --- |
| Brand name / tagline | `brandName`, `tagline` |
| Currency | `currency`, `currencySymbol` |
| Site title & meta description | `siteTitle`, `siteDescription` |
| Delivery / returns / payment text | `deliveryInfo`, `returnPolicy`, `paymentInfo` |
| Colour dots on cards | `swatchColors` (add `"yourcolour": "#hex"`) |
| Navigation items | `navLinks` |
| Sold-out visibility | `showSoldOutProducts` |
| Order button label / helper line | `orderCtaLabel`, `orderHelper` |

To edit the About text, FAQ answers or How-to-Order steps, edit the plain HTML of
`about.html`, `faq.html`, `how-to-order.html` — they contain no dynamic content
besides the config-driven links.

To restyle, everything is tokenised at the top of `css/styles.css`
(`--bg`, `--ink`, `--accent`, spacing, radii…).

---

## 13. Testing

A headless-browser QA suite runs 116 checks (titles, headings, header/footer,
Messenger links on every page, new-tab behaviour, broken images, console errors,
horizontal overflow at 360/390/768/desktop, search/filter/sort, sold-out logic,
mobile menu, related products, quantity stepper…).

```bash
# start the local server first, in a separate terminal:
python -m http.server 8080

# then:
node scripts/verify.mjs
```

Expected output: `116/116 checks passed.`
Screenshots of the tested pages are written to your temp folder (path is printed
at the end).

Regenerate helpers (rarely needed):

```bash
node scripts/generate-placeholders.js      # rebuild the sample SVG images
powershell -File scripts/generate-brand-assets.ps1   # rebuild favicon.ico + og-cover.png
```

---

## 14. Important: sample data notice

⚠ **The catalog is sample data.** The 12 products in `js/products.js`, their
prices, and the SVG images in `assets/products/` are **placeholders for
demonstration only** — replace them with your real products, prices and photos
before going live.

Also note:

- **No invented claims.** The site contains no fake reviews, ratings,
  testimonials, statistics or contact details. Keep it that way — add only
  information you can stand behind.
- **No Facebook URL is set** until you provide one (see
  [section 9](#9-update-the-facebook-url)).
- **Domain placeholder** `https://mada.example.com` must be replaced (see
  [section 10](#10-set-your-domain)).
- Product detail pages are rendered client-side from `?id=`, so social shares of
  an individual product link show the generic product-page preview. If per-product
  share previews matter later, generate static product pages at build time.

---

**MADA — GO BEYOND.**
#   m a d a  
 