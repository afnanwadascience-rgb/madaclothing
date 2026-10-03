
/* ============================================================================
   MADA — PRODUCT CATALOG
   ----------------------------------------------------------------------------
   This file contains the complete MADA product catalog.

   To add or update products:
   1. Put product photos inside: assets/products/
   2. Add/update the product object below.
   3. Keep image filenames exactly the same as the paths used here.

   IMAGE FILE NAMING:
   <product-id>-<number>.jpg
   Example:
   mada-tee-001-1.jpg
   ============================================================================ */

const PRODUCTS = [

  /* ==========================================================================
     T-SHIRTS — NEW PRODUCTS
     ========================================================================== */

  {
    id: "mada-tee-001",
    slug: "mada-essential-tee",
    name: "MADA Essential Tee",
    price: 600,
    currency: "BDT",
    category: "T-Shirts",
    shortDescription: "A clean everyday MADA T-shirt.",
    description:
      "A clean and versatile MADA T-shirt designed for everyday wear. A simple streetwear piece that works easily with different casual outfits.",
    images: [
      "/assets/products/mada-tee-001-1.jpg"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [],
    featured: true,
    available: true,
    badge: "NEW",
    material: "",
    fit: "",
    careInstructions: ""
  },

  {
    id: "mada-tee-002",
    slug: "mada-classic-tee",
    name: "MADA Classic Tee",
    price: 600,
    currency: "BDT",
    category: "T-Shirts",
    shortDescription: "A classic MADA streetwear T-shirt.",
    description:
      "A classic MADA T-shirt featuring a clean streetwear-inspired design. Made for comfortable everyday styling.",
    images: [
      "/assets/products/mada-tee-002-1.jpg"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [],
    featured: true,
    available: true,
    badge: "NEW",
    material: "",
    fit: "",
    careInstructions: ""
  },

  {
    id: "mada-tee-003",
    slug: "mada-signature-tee",
    name: "MADA Signature Tee",
    price: 600,
    currency: "BDT",
    category: "T-Shirts",
    shortDescription: "A signature MADA design for everyday wear.",
    description:
      "A modern MADA T-shirt with a distinctive design. A versatile streetwear piece created for everyday casual outfits.",
    images: [
      "/assets/products/mada-tee-003-1.jpg"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [],
    featured: true,
    available: true,
    badge: "NEW",
    material: "",
    fit: "",
    careInstructions: ""
  },

  {
    id: "mada-tee-004",
    slug: "mada-street-tee",
    name: "MADA Street Tee",
    price: 600,
    currency: "BDT",
    category: "T-Shirts",
    shortDescription: "A modern streetwear T-shirt from MADA.",
    description:
      "A modern MADA streetwear T-shirt designed for casual everyday styling. A simple and versatile addition to the MADA collection.",
    images: [
      "/assets/products/mada-tee-004-1.jpg"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [],
    featured: true,
    available: true,
    badge: "NEW",
    material: "",
    fit: "",
    careInstructions: ""
  },


  /* ==========================================================================
     OVERSIZED T-SHIRTS
     ========================================================================== */

  {
    id: "mada-oversized-001",
    slug: "mada-heavy-oversized-tee",
    name: "MADA Heavy Oversized Tee",
    price: 1490,
    currency: "BDT",
    category: "Oversized T-Shirts",
    shortDescription: "Heavy boxy tee with dropped shoulders.",
    description:
      "A heavy, boxy T-shirt with dropped shoulders and a wide body. Ribbed collar and a thick single-jersey knit that holds its shape.",
    images: [
      "/assets/products/mada-oversized-001-1.svg",
      "/assets/products/mada-oversized-001-2.svg",
      "/assets/products/mada-oversized-001-3.svg"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Bone", "Army"],
    featured: true,
    available: true,
    badge: "NEW",
    material: "100% cotton, 240 GSM single jersey",
    fit: "Oversized fit",
    careInstructions:
      "Machine wash cold, inside out. Do not tumble dry. Do not iron directly on print."
  },

  {
    id: "mada-oversized-002",
    slug: "mada-boxy-tee",
    name: "MADA Boxy Fit Tee",
    price: 1190,
    currency: "BDT",
    category: "Oversized T-Shirts",
    shortDescription: "Wide boxy cut that sits straight off the body.",
    description:
      "A wide, boxy cut with a slightly shorter length and open shoulders. Designed to be worn loose over everyday pieces.",
    images: [
      "/assets/products/mada-oversized-002-1.svg",
      "/assets/products/mada-oversized-002-2.svg"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Grey", "White"],
    featured: false,
    available: true,
    badge: null,
    material: "100% cotton, 220 GSM single jersey",
    fit: "Oversized fit",
    careInstructions:
      "Machine wash cold, inside out. Do not tumble dry. Do not iron directly on print."
  },


  /* ==========================================================================
     HOODIES
     ========================================================================== */

  {
    id: "mada-hoodie-001",
    slug: "mada-heavyweight-hoodie",
    name: "MADA Heavyweight Hoodie",
    price: 2790,
    currency: "BDT",
    category: "Hoodies",
    shortDescription: "Brushed-back hoodie with a double-layer hood.",
    description:
      "A heavyweight pullover hoodie with a double-layer hood, drawstrings, kangaroo pocket and ribbed cuffs. Brushed inside for warmth.",
    images: [
      "/assets/products/mada-hoodie-001-1.svg",
      "/assets/products/mada-hoodie-001-2.svg"
    ],
    sizes: ["M", "L", "XL"],
    colors: ["Black", "Charcoal"],
    featured: true,
    available: true,
    badge: null,
    material: "Cotton-rich fleece, 350 GSM",
    fit: "Relaxed fit",
    careInstructions:
      "Machine wash cold, inside out. Do not tumble dry. Do not iron directly on print."
  },

  {
    id: "mada-hoodie-002",
    slug: "mada-studio-hoodie",
    name: "MADA Studio Hoodie",
    price: 2590,
    currency: "BDT",
    category: "Hoodies",
    shortDescription: "Soft mid-weight pullover hoodie.",
    description:
      "A soft mid-weight pullover hoodie with a relaxed shape, drawstring hood and ribbed hem.",
    images: [
      "/assets/products/mada-hoodie-002-1.svg",
      "/assets/products/mada-hoodie-002-2.svg"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Grey"],
    featured: false,
    available: false,
    badge: null,
    material: "Cotton-rich fleece, 320 GSM",
    fit: "Relaxed fit",
    careInstructions:
      "Machine wash cold, inside out. Do not tumble dry. Do not iron directly on print."
  },


  /* ==========================================================================
     SHIRTS
     ========================================================================== */

  {
    id: "mada-shirt-001",
    slug: "mada-utility-overshirt",
    name: "MADA Utility Overshirt",
    price: 1990,
    currency: "BDT",
    category: "Shirts",
    shortDescription: "Button-front overshirt with chest pockets.",
    description:
      "A structured overshirt with a pointed collar, button front and two chest pockets. Built to be worn open over a tee or closed on its own.",
    images: [
      "/assets/products/mada-shirt-001-1.svg",
      "/assets/products/mada-shirt-001-2.svg"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Stone"],
    featured: true,
    available: true,
    badge: null,
    material: "Cotton twill",
    fit: "Regular fit",
    careInstructions:
      "Machine wash cold. Do not bleach. Iron on reverse."
  },


  /* ==========================================================================
     BOTTOMS
     ========================================================================== */

  {
    id: "mada-bottom-001",
    slug: "mada-tapered-sweatpant",
    name: "MADA Tapered Sweatpant",
    price: 1790,
    currency: "BDT",
    category: "Bottoms",
    shortDescription: "Tapered sweatpants with ribbed cuffs.",
    description:
      "Tapered sweatpants with an elastic waist, drawstring fastening and ribbed ankle cuffs. Straight through the thigh and narrow at the leg.",
    images: [
      "/assets/products/mada-bottom-001-1.svg",
      "/assets/products/mada-bottom-001-2.svg"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Grey"],
    featured: false,
    available: true,
    badge: null,
    material: "Cotton-rich fleece, 320 GSM",
    fit: "Tapered fit",
    careInstructions:
      "Machine wash cold, inside out. Do not tumble dry."
  },

  {
    id: "mada-bottom-002",
    slug: "mada-cargo-short",
    name: "MADA Cargo Short",
    price: 1290,
    currency: "BDT",
    category: "Bottoms",
    shortDescription: "Relaxed cargo shorts with side pockets.",
    description:
      "Relaxed cargo shorts with an elastic waist, side pockets and a straight leg that sits above the knee.",
    images: [
      "/assets/products/mada-bottom-002-1.svg",
      "/assets/products/mada-bottom-002-2.svg"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Stone", "Black"],
    featured: false,
    available: true,
    badge: null,
    material: "Cotton twill",
    fit: "Relaxed fit",
    careInstructions:
      "Machine wash cold. Do not bleach. Iron on reverse."
  },


  /* ==========================================================================
     ACCESSORIES
     ========================================================================== */

  {
    id: "mada-acc-001",
    slug: "mada-canvas-tote",
    name: "MADA Canvas Tote",
    price: 790,
    currency: "BDT",
    category: "Accessories",
    shortDescription: "Canvas carry-all with shoulder-length handles.",
    description:
      "A sturdy canvas carry-all with shoulder-length handles and a flat base. Sized for everyday essentials.",
    images: [
      "/assets/products/mada-acc-001-1.svg",
      "/assets/products/mada-acc-001-2.svg"
    ],
    sizes: ["One Size"],
    colors: ["Black", "Bone"],
    featured: false,
    available: true,
    badge: null,
    material: "Cotton canvas",
    fit: "One size",
    careInstructions:
      "Spot clean. Do not bleach."
  },

  {
    id: "mada-acc-002",
    slug: "mada-rib-beanie",
    name: "MADA Rib Beanie",
    price: 690,
    currency: "BDT",
    category: "Accessories",
    shortDescription: "Ribbed knit beanie with a folded cuff.",
    description:
      "A ribbed knit beanie with a folded cuff and a small woven MADA label.",
    images: [
      "/assets/products/mada-acc-002-1.svg",
      "/assets/products/mada-acc-002-2.svg"
    ],
    sizes: ["One Size"],
    colors: ["Black", "Grey"],
    featured: false,
    available: true,
    badge: "NEW",
    material: "Acrylic-cotton knit",
    fit: "One size",
    careInstructions:
      "Hand wash cold. Do not tumble dry."
  }

];


/* ============================================================================
   PREFERRED CATEGORY DISPLAY ORDER
   ----------------------------------------------------------------------------
   Categories with no available products are automatically hidden.
   ============================================================================ */

const CATEGORY_ORDER = [
  "T-Shirts",
  "Oversized T-Shirts",
  "Hoodies",
  "Shirts",
  "Bottoms",
  "Accessories"
];

