import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'pf-01',
    name: 'The Kampala Imperial Silk Gown',
    tagline: 'Sculptural asymmetric evening couture with hand-threaded golden filigree',
    category: 'couture',
    priceUGX: 1850000,
    priceUSD: 495,
    image: '/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg',
    gallery: [
      '/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg',
      '/src/assets/images/hero_peterz_couture_1793621754106.jpg',
    ],
    description: 'An architectural tribute to royal Ugandan elegance. Tailored from heavy emerald duchess silk, featuring custom hand-embroidered golden motif drapes cascading across an asymmetric sculpted bodice. Each piece is crafted by master artisans over 65 hours in our Nakasero atelier.',
    fabric: '100% Ugandan Mulberry Silk & Metallic Gold Threading',
    details: [
      'Asymmetric one-shoulder silhouette with structural pleat fold',
      'Hand-embroidered organic Buganda court geometric motifs',
      'Full floor-length drape with interior silk habotai lining',
      'Concealed invisible side zipper with hand-cast brass hook'
    ],
    care: [
      'Specialist dry clean only',
      'Store in provided breathable G-Digitalz Fashions garment shroud',
      'Cool iron with protective press cloth'
    ],
    availableSizes: ['UK 8 / XS', 'UK 10 / S', 'UK 12 / M', 'UK 14 / L', 'Bespoke Made-to-Measure'],
    inStock: true,
    featured: true,
    badge: 'Atelier Signature',
    rating: 5.0,
    reviewCount: 28
  },
  {
    id: 'pf-02',
    name: 'Nakasero Mandarin Linen Suit',
    tagline: 'Two-piece tailored raw ivory linen suit with ancestral geometric cuffs',
    category: 'men',
    priceUGX: 1450000,
    priceUSD: 390,
    image: '/src/assets/images/product_bespoke_linen_suit_1793621755616.jpg',
    gallery: [
      '/src/assets/images/product_bespoke_linen_suit_1793621755616.jpg',
      '/src/assets/images/hero_peterz_couture_1793621754106.jpg',
    ],
    description: 'A sovereign study in modern African menswear. Tailored from breathable raw Ugandan organic flax linen in pristine ivory and sand-beige tones. Features a refined standing band collar, horn buttons, and subtle geometric cuff embroidery inspired by traditional Buganda craftsmanship.',
    fabric: '100% Organic African Flax Linen & Raw Silk Trim',
    details: [
      'Unstructured modern silhouette with soft shoulder contour',
      'Intricate chevron cuff embroidery hand-finished in Kampala',
      'Matching slim-straight pleated linen trousers with side tab adjusters',
      'Lightweight half-canvas construction ideal for tropical & global climates'
    ],
    care: [
      'Gentle eco dry clean recommended',
      'Do not tumble dry',
      'Steam iron on medium heat with linen setting'
    ],
    availableSizes: ['38R / S', '40R / M', '42R / L', '44R / XL', 'Bespoke Made-to-Measure'],
    inStock: true,
    featured: true,
    badge: 'Tailored Luxury',
    rating: 4.9,
    reviewCount: 34
  },
  {
    id: 'pf-03',
    name: 'Victoria Heritage Blazer Dress',
    tagline: 'Double-breasted trench silhouette with woven earth-tone jacquard tapestry',
    category: 'women',
    priceUGX: 980000,
    priceUSD: 265,
    image: '/src/assets/images/product_contemporary_kitenge_blazer_1793621755842.jpg',
    gallery: [
      '/src/assets/images/product_contemporary_kitenge_blazer_1793621755842.jpg',
    ],
    description: 'A striking fusion of executive tailoring and East African textile panache. Features structured peak lapels, tonal earth-ochre and deep terracotta woven graphic panels, and a cinched belted waist with antique brass buckle. Worn seamlessly as a commanding dress or open over tailored trousers.',
    fabric: 'Heavyweight Ugandan Jacquard Weave & Structured Wool Blend',
    details: [
      'Double-breasted front with custom-cast matte buttons',
      'Detachable tailored belt with brass geometric clasp',
      'Structured padded shoulders with sharp hourglass cut',
      'Full interior cupro lining for smooth friction-free drape'
    ],
    care: [
      'Professional dry clean only',
      'Hang on wide contoured wooden hanger',
      'Do not soak or bleach'
    ],
    availableSizes: ['UK 8 / XS', 'UK 10 / S', 'UK 12 / M', 'UK 14 / L', 'UK 16 / XL'],
    inStock: true,
    featured: true,
    badge: 'Bestseller',
    rating: 4.9,
    reviewCount: 42
  },
  {
    id: 'pf-04',
    name: 'Kawanda Artisan Leather & Fiber Tote',
    tagline: 'Cognac calfskin weekender with hand-woven Ugandan natural reed & brass hardware',
    category: 'accessories',
    priceUGX: 720000,
    priceUSD: 195,
    image: '/src/assets/images/product_artisan_leather_tote_1793621756800.jpg',
    gallery: [
      '/src/assets/images/product_artisan_leather_tote_1793621756800.jpg',
    ],
    description: 'Handcrafted by third-generation leather artisans in Kampala. Combines vegetable-tanned Ugandan cognac leather with hand-woven natural banana fiber panels and solid forged brass feet and buckles. Designed for weekend escapes to Lake Victoria or transatlantic journeys.',
    fabric: 'Vegetable-Tanned Full-Grain Cowhide & Artisanal Banana Fiber Weave',
    details: [
      'Reinforced rolled leather handles with removable adjustable shoulder strap',
      'Two-way solid brass heavy-duty zipper closure',
      'Interior padded 15-inch laptop pocket & zipper passport compartment',
      'Protective brass studs at bottom base'
    ],
    care: [
      'Treat periodically with natural beeswax leather balm',
      'Keep dry; wipe gently with soft damp micro-cloth',
      'Store in cotton dust bag when not in travel'
    ],
    availableSizes: ['One Size (48cm x 28cm x 22cm)'],
    inStock: true,
    featured: true,
    badge: 'Artisan Crafted',
    rating: 5.0,
    reviewCount: 19
  },
  {
    id: 'pf-05',
    name: 'Pearl Sunset Silk Drape Cape',
    tagline: 'Fluid cascading silk overlay inspired by evening reflections on Lake Victoria',
    category: 'women',
    priceUGX: 680000,
    priceUSD: 180,
    image: '/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg',
    gallery: [
      '/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg',
    ],
    description: 'An ethereal layering garment that elevates simple daywear into regal evening presence. Crafted from lightweight shimmering golden-olive silk habotai, finished with delicate micro-rolled hems and subtle collar tie strings.',
    fabric: '100% Shimmering Silk Habotai',
    details: [
      'Open front design with self-tie neck tassels',
      'Hand-rolled borders with artisanal French seams',
      'Flowing floor-length wings that catch subtle breezes'
    ],
    care: ['Gentle hand wash in cold water or dry clean', 'Lay flat to dry out of direct sunlight'],
    availableSizes: ['One Size Fits All', 'Petite', 'Tall'],
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewCount: 15
  },
  {
    id: 'pf-06',
    name: 'Rwenzori Heritage Safari Jacket',
    tagline: 'Modernized four-pocket safari coat in textured sand khaki linen',
    category: 'men',
    priceUGX: 890000,
    priceUSD: 240,
    image: '/src/assets/images/product_bespoke_linen_suit_1793621755616.jpg',
    gallery: [
      '/src/assets/images/product_bespoke_linen_suit_1793621755616.jpg',
    ],
    description: 'Inspired by expeditions through the Rwenzori mountains, refined for modern metropolitan life in Kampala and international runways. Features four pleated bellows pockets, horn buttons, and an internal waist drawstring for an adjustable profile.',
    fabric: 'Textured Ugandan Heavy Slub Linen & Cotton Drill',
    details: [
      'Four functional utility cargo pockets with box pleats',
      'Internal adjustable drawcord for tailored waist cinching',
      'Action back shoulder pleats allowing full range of mobility',
      'Unlined body for maximum ventilation in warm climates'
    ],
    care: ['Dry clean or delicate cycle machine wash at 30°C', 'Warm iron while slightly damp'],
    availableSizes: ['38 / S', '40 / M', '42 / L', '44 / XL'],
    inStock: true,
    featured: false,
    rating: 4.9,
    reviewCount: 22
  }
];
