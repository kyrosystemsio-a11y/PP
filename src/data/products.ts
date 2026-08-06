export type Category =
  | "custom"
  | "influencers"
  | "halloween"
  | "glow"
  | "colors"
  | "design"
  | "baptism"
  | "merch";

export const CATEGORY_LABELS: Record<Category, string> = {
  custom: "Custom Builds",
  influencers: "Influencers Collection",
  halloween: "Halloween",
  glow: "Glow",
  colors: "Colors",
  design: "Design",
  baptism: "Baptism",
  merch: "Merchandise",
};

export interface Product {
  slug: string;
  name: string;
  price: number;
  category: Category;
  /** Path under /public/products, or null when we're using the illustrated placeholder */
  image: string | null;
  /** Hex used to tint the illustrated placeholder + swatch chip */
  swatch: string;
  description: string;
  isAnimatedGlow?: boolean;
  customizable?: boolean;
}

export const RIBBON_COLORS = [
  "Red",
  "Orange",
  "Yellow",
  "Apple Green",
  "Lime Green",
  "Regular Green",
  "Light Blue",
  "Turquoise",
  "Regular Blue",
  "Purple",
  "Brown",
  "Gold",
  "Black",
  "Pink",
  "Shocking Pink",
  "Magenta",
  "White",
] as const;

export const PRODUCTS: Product[] = [
  // Baptism
  { slug: "baptism", name: "Spinata BAPTISM (\"Bolo\")", price: 67.99, category: "baptism", image: "/products/baptism.jpg", swatch: "#7fc3e8", description: "A one-of-a-kind baptism edition, hand-finished in soft blues and whites for the occasion." },

  // Custom Builds
  {
    slug: "custom-build-glow",
    name: "Custom Build — Spinata GLOW",
    price: 89.99,
    category: "custom",
    image: "/products/custom-build-glow.gif",
    swatch: "#3a0a5e",
    customizable: true,
    isAnimatedGlow: true,
    description:
      "Your choice of ribbon color and a photo upload of your desired theme or character, hand-built with mini LED lights woven through the rip cords. Allow 2–3 extra days to complete your custom-build Spinner Pinata®.",
  },
  {
    slug: "custom-build-regular",
    name: "Custom Build — Spinata Regular",
    price: 69.99,
    category: "custom",
    image: "/products/custom-build-regular.jpg",
    swatch: "#b5472b",
    customizable: true,
    description:
      "Your choice of ribbon color. Upload a photo of your desired theme or character. Allow 2–3 extra days added to complete your custom-build Spinner Pinata®.",
  },

  // Colors Collection — $59.99
  { slug: "spinata-blue", name: "Spinata Blue", price: 59.99, category: "colors", image: "/products/blue.jpg", swatch: "#2563ec", description: "A bold cobalt blue Spinner Pinata®, hand-wrapped and ready to spin." },
  { slug: "spinata-red", name: "Spinata Red", price: 59.99, category: "colors", image: "/products/red.jpg", swatch: "#dd2626", description: "Classic fiesta red — the color that started it all." },
  { slug: "spinata-white", name: "Spinata White", price: 59.99, category: "colors", image: "/products/white.jpg", swatch: "#f6f6f1", description: "Crisp, clean white — a blank canvas for any party theme." },
  { slug: "spinata-pink", name: "Spinata Pink", price: 59.99, category: "colors", image: "/products/pink.jpg", swatch: "#f572b6", description: "Soft bubblegum pink, perfect for birthdays and showers." },
  { slug: "spinata-green", name: "Spinata Green", price: 59.99, category: "colors", image: "/products/green.jpg", swatch: "#1f8a4c", description: "Rich forest green with a satin ribbon finish." },
  { slug: "spinata-orange", name: "Spinata Orange", price: 59.99, category: "colors", image: "/products/orange.jpg", swatch: "#e8722e", description: "Sun-bright orange, a fiesta favorite." },
  { slug: "spinata-yellow", name: "Spinata Yellow", price: 59.99, category: "colors", image: "/products/yellow.jpg", swatch: "#f3c61a", description: "Sunshine yellow — cheerful and impossible to miss." },
  { slug: "spinata-apple-green", name: "Spinata Apple Green", price: 59.99, category: "colors", image: "/products/apple-green.webp", swatch: "#8bc53f", description: "Crisp apple green with a glossy ribbon wrap." },
  { slug: "spinata-gold", name: "Spinata Gold", price: 59.99, category: "colors", image: "/products/gold.jpg", swatch: "#cf9a2e", description: "Metallic gold finish for milestone celebrations." },
  { slug: "spinata-turquoise", name: "Spinata Turquoise", price: 59.99, category: "colors", image: "/products/turquoise.jpg", swatch: "#1fb6b0", description: "Beachy turquoise with a satin sheen." },
  { slug: "spinata-shocking-pink", name: "Spinata Shocking Pink", price: 59.99, category: "colors", image: "/products/shocking-pink.jpg", swatch: "#ff2d96", description: "Maximum-volume neon pink." },
  { slug: "spinata-black", name: "Spinata Black", price: 59.99, category: "colors", image: "/products/black.jpg", swatch: "#1a1620", description: "Sleek matte black for a modern party look." },
  { slug: "spinata-magenta", name: "Spinata Magenta", price: 59.99, category: "colors", image: "/products/magenta.jpg", swatch: "#c3198a", description: "Deep magenta with a rich satin ribbon." },
  { slug: "spinata-purple", name: "Spinata Purple", price: 59.99, category: "colors", image: "/products/purple.jpg", swatch: "#6d2f9e", description: "Royal purple — our signature midway color." },
  { slug: "spinata-lime", name: "Spinata Lime", price: 59.99, category: "colors", image: "/products/lime.jpg", swatch: "#b6d92f", description: "Electric lime for a high-energy party." },
  { slug: "spinata-light-blue", name: "Spinata Light Blue", price: 59.99, category: "colors", image: "/products/light-blue.jpg", swatch: "#7fc3e8", description: "Soft sky blue, calm and breezy." },
  { slug: "spinata-mocha", name: "Spinata Brown (Mocha)", price: 59.99, category: "colors", image: "/products/brown.jpg", swatch: "#895129", description: "Warm mocha brown with a kraft-paper feel." },
  { slug: "ivory", name: "Spinata Ivory", price: 59.99, category: "colors", image: "/products/ivory.webp", swatch: "#fffff0", description: "Elegant ivory, a favorite for weddings." },

  // Design Collection
  { slug: "dia-de-los-muertos", name: "Spinata DIA DE LOS MUERTOS", price: 65.99, category: "design", image: "/products/dia-de-los-muertos.jpg", swatch: "#3a0a5e", description: "Hand-decorated with vibrant sugar-skull medallions on ivory satin — a tribute piece for Día de los Muertos." },
  { slug: "spinata-mexi", name: "Spinata MEXI", price: 69.99, category: "design", image: "/products/mexi.jpg", swatch: "#1f8a4c", description: "A tri-color tribute wrap celebrating Mexican heritage." },
  { slug: "spinata-rainbow", name: "Spinata RAINBOW", price: 69.99, category: "design", image: "/products/rainbow.jpg", swatch: "#e8722e", description: "Every ribbon color in one spin — our most colorful build." },
  { slug: "spinata-corona", name: "Spinata CORONA", price: 69.99, category: "design", image: "/products/corona.jpg", swatch: "#f5f3ee", description: "Corona-branded medallions on crisp white satin for the ultimate adult party piece." },
  { slug: "spinata-modelo", name: "Spinata MODELO", price: 69.99, category: "design", image: "/products/modelo.jpg", swatch: "#cf9a2e", description: "Modelo-branded medallions for game day and fiestas." },
  { slug: "spinata-buchanans", name: "Spinata BUCHANANS", price: 69.99, category: "design", image: "/products/buchanans.jpg", swatch: "#1a1620", description: "A Buchanan's-inspired tribute build for the whisky-loving host." },

  // Halloween Collection
  { slug: "black-halloween", name: "Spinata BLACK HALLOWEEN", price: 65.99, category: "halloween", image: "/products/black-halloween.jpg", swatch: "#1a1620", description: "Jack-o'-lantern medallions on black satin — spooky season's favorite spinner." },
  { slug: "white-halloween", name: "Spinata WHITE HALLOWEEN", price: 65.99, category: "halloween", image: "/products/white-halloween.jpg", swatch: "#f5f3ee", description: "Pumpkin medallions on ghost-white satin for a friendlier kind of spooky." },

  // Specialty
  { slug: "glow", name: "Spinata GLOW", price: 79.99, category: "glow", image: "/products/glow.jpg", swatch: "#e8fb5c", isAnimatedGlow: true, description: "Now with mini LED lights woven through every rip cord — spins and glows in the dark." },
  { slug: "luis-loera-collab", name: "Luis LOERA Collaboration", price: 67.99, category: "influencers", image: null, swatch: "#e8722e", description: "Our influencer collaboration build with Luis Loera — limited run." },
  { slug: "t-shirt", name: "Spinner Pinata® T-Shirt", price: 20.00, category: "merch", image: "/products/t-shirt.jpg", swatch: "#18101f", description: "Soft cotton tee with the Spinner Pinata® logo. Wear the tornado." },
];

export function getProductsByCategory(category: Category | "all"): Product[] {
  if (category === "all") return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === category);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
