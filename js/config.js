/* ============================================================================
   MADA — CENTRAL SITE CONFIGURATION
   ----------------------------------------------------------------------------
   Everything the website needs to know about the business lives in this file.
   You should NOT need to edit any other file to change these values.

   TO CHANGE THE MESSENGER LINK  → messengerUrl
   TO CHANGE THE FACEBOOK PAGE    → facebookUrl
   TO CHANGE CURRENCY             → currency / currencySymbol
   TO CHANGE DELIVERY/RETURN TEXT → deliveryInfo / returnPolicy

   See README.md for step-by-step instructions.
   ============================================================================ */

const SITE_CONFIG = {
  /* --- Brand ------------------------------------------------------------- */
  brandName: "MADA",
  tagline: "GO BEYOND.",

  /* --- Ordering (every Order button on the site uses this link) ---------- */
  messengerUrl: "https://m.me/61594943794307",
  orderCtaLabel: "ORDER ON MESSENGER",
  orderHelper:
    "Chat with us to check size, color, availability, delivery, and place your order.",

  /* --- Social ------------------------------------------------------------
     Paste the MADA Facebook Page URL between the quotes, for example:
     facebookUrl: "https://www.facebook.com/yourpagename"
     While this is empty ("") the Facebook link is hidden automatically.     */
  facebookUrl: "",

  /* --- Money ------------------------------------------------------------- */
  currency: "BDT",
  currencySymbol: "৳",

  /* --- Site-wide text ---------------------------------------------------- */
  siteTitle: "MADA — Go Beyond | Modern Streetwear",
  siteDescription:
    "MADA — modern streetwear and T-shirts. Browse the collection and order through Messenger.",

  /* --- Business information (edit these to match your real policies) ----- */
  deliveryInfo:
    "Delivery coverage, cost and timing are confirmed with you in Messenger for your area.",
  returnPolicy:
    "Need to change something about your order? Message us in Messenger and we will go through the options with you.",
  paymentInfo:
    "There is no online payment on this website. Payment is arranged directly in your Messenger conversation with the MADA team.",

  /* --- Catalog display ---------------------------------------------------
     showSoldOutProducts: true  → sold-out items stay visible with a SOLD OUT label
     showSoldOutProducts: false → sold-out items are removed from all listings   */
  showSoldOutProducts: true,

  /* --- Colour dots used on product cards (add your own colours here) ----- */
  swatchColors: {
    black: "#111111",
    white: "#ffffff",
    bone: "#ece5d8",
    offwhite: "#f4f2ee",
    charcoal: "#3a3a3a",
    grey: "#9a9a9a",
    gray: "#9a9a9a",
    "dark grey": "#4d4d4d",
    navy: "#1f2a40",
    olive: "#5f6b47",
    army: "#556b4d",
    stone: "#c8c1b5",
    beige: "#d9d1c3",
    sand: "#d7c9b0",
    red: "#b3261e",
    rust: "#a8471f",
    blue: "#2c5f9e",
    green: "#2f6b4f",
    yellow: "#e0b400",
    pink: "#d78ba3",
    purple: "#6b4f9e"
  },

  /* --- Navigation (used by the header and the footer) -------------------- */
  navLinks: [
    { label: "Home", href: "index.html", key: "home" },
    { label: "Shop", href: "shop.html", key: "shop" },
    { label: "About", href: "about.html", key: "about" },
    { label: "How to Order", href: "how-to-order.html", key: "how-to-order" },
    { label: "FAQ", href: "faq.html", key: "faq" },
    { label: "Contact", href: "contact.html", key: "contact" }
  ]
};
