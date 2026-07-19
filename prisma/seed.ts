import { PrismaClient, ProductCondition } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Resetting catalog data and reseeding with only the 7 real-photo products…");

  // Full reset of catalog + anything that depends on it, so old sample
  // products don't linger. Safe for dev/test data; if you've placed real
  // test orders you want to keep, don't run this against that DB.
  await db.orderItem.deleteMany({});
  await db.payment.deleteMany({});
  await db.order.deleteMany({});
  await db.review.deleteMany({});
  await db.wishlist.deleteMany({});
  await db.productImage.deleteMany({});
  await db.productVariant.deleteMany({});
  await db.product.deleteMany({});
  await db.brand.deleteMany({});
  await db.category.deleteMany({});

  const categoryDefs = [
    { name: "Phones", slug: "phones" },
    { name: "Laptops", slug: "laptops" },
    { name: "Tablets", slug: "tablets" },
    { name: "Audio", slug: "audio" },
    { name: "Desktops", slug: "desktops" },
  ];
  const categories = Object.fromEntries(
    await Promise.all(categoryDefs.map(async (c) => [c.slug, await db.category.create({ data: c })]))
  );

  const brandDefs = [
    { name: "Apple", slug: "apple" },
    { name: "Infinix", slug: "infinix" },
    { name: "Tecno", slug: "tecno" },
    { name: "Samsung", slug: "samsung" },
    { name: "Nokia", slug: "nokia" },
  ];
  const brands = Object.fromEntries(
    await Promise.all(brandDefs.map(async (b) => [b.slug, await db.brand.create({ data: b })]))
  );

  type Def = {
    name: string;
    slug: string;
    description: string;
    category: keyof typeof categories;
    brand: keyof typeof brands;
    basePrice: number;
    condition: ProductCondition;
    isFeatured?: boolean;
    images: string[];
    variants: { sku: string; attributes: Record<string, string>; price: number; stock: number }[];
  };

  const products: Def[] = [
    // Apple
    {
      name: "iPhone 15",
      slug: "apple-iphone-15",
      description: "6.1-inch Super Retina XDR display, A16 chip, and a 48MP main camera.",
      category: "phones",
      brand: "apple",
      basePrice: 950000,
      condition: ProductCondition.NEW,
      isFeatured: true,
      images: ["/products/apple/iphone-15.jpeg"],
      variants: [
        { sku: "APL-IP15-128-BLK", attributes: { storage: "128GB", color: "Black" }, price: 950000, stock: 10 },
        { sku: "APL-IP15-256-BLU", attributes: { storage: "256GB", color: "Blue" }, price: 1050000, stock: 6 },
      ],
    },
    {
      name: "iPhone 15 Pro",
      slug: "apple-iphone-15-pro",
      description: "Titanium design, A17 Pro chip, and a pro camera system with 5x telephoto zoom.",
      category: "phones",
      brand: "apple",
      basePrice: 1450000,
      condition: ProductCondition.NEW,
      images: ["/products/apple/iphone-15-pro.jpeg"],
      variants: [
        { sku: "APL-IP15PRO-256-TIT", attributes: { storage: "256GB", color: "Natural Titanium" }, price: 1450000, stock: 5 },
      ],
    },
    {
      name: "iPad Air",
      slug: "apple-ipad-air",
      description: "10.9-inch Liquid Retina display with M1 chip, ideal for work and creative apps.",
      category: "tablets",
      brand: "apple",
      basePrice: 650000,
      condition: ProductCondition.NEW,
      images: ["/products/apple/ipad-air.webp"],
      variants: [
        { sku: "APL-IPADAIR-64-WIFI", attributes: { connectivity: "Wi-Fi", storage: "64GB" }, price: 650000, stock: 9 },
      ],
    },
    {
      name: "MacBook Air 13\"",
      slug: "apple-macbook-air-13",
      description: "M2 chip, fanless design, and up to 18 hours of battery life in a 2.7lb frame.",
      category: "laptops",
      brand: "apple",
      basePrice: 1750000,
      condition: ProductCondition.NEW,
      isFeatured: true,
      images: ["/products/apple/macbook-air-13.webp"],
      variants: [
        { sku: "APL-MBA13-8-256", attributes: { ram: "8GB", storage: "256GB" }, price: 1750000, stock: 4 },
      ],
    },

    // Infinix
    {
      name: "Infinix Hot 70",
      slug: "infinix-hot-70",
      description: "Everyday 5G-ready phone with a large display and a sleek glass-back finish.",
      category: "phones",
      brand: "infinix",
      basePrice: 165000,
      condition: ProductCondition.NEW,
      isFeatured: true,
      images: ["/products/infinix/hot-70.jpeg"],
      variants: [
        { sku: "INF-HOT70-128-WHT", attributes: { storage: "128GB", ram: "8GB", color: "White" }, price: 165000, stock: 19 },
      ],
    },
    {
      name: "Infinix Smart 20",
      slug: "infinix-smart-20",
      description: "Entry-level phone with a vibrant display and long-lasting battery, built for daily basics.",
      category: "phones",
      brand: "infinix",
      basePrice: 92000,
      condition: ProductCondition.NEW,
      images: ["/products/infinix/smart-20.jpeg"],
      variants: [
        { sku: "INF-SMART20-64-ORG", attributes: { storage: "64GB", color: "Orange" }, price: 92000, stock: 27 },
      ],
    },
    {
      name: "Infinix Hot 60i",
      slug: "infinix-hot-60i",
      description: "Dual-SIM phone with a triple rear camera setup and a slim, modern profile.",
      category: "phones",
      brand: "infinix",
      basePrice: 130000,
      condition: ProductCondition.NEW,
      images: ["/products/infinix/hot-60i.jpeg"],
      variants: [
        { sku: "INF-HOT60I-128-BLK", attributes: { storage: "128GB", color: "Titan Black" }, price: 130000, stock: 15 },
      ],
    },

    // Tecno
    {
      name: "Tecno Pop 10",
      slug: "tecno-pop-10",
      description: "Compact, budget-friendly phone with dual rear cameras and a clean, minimal design.",
      category: "phones",
      brand: "tecno",
      basePrice: 78000,
      condition: ProductCondition.NEW,
      images: ["/products/tecno/pop-10.webp"],
      variants: [
        { sku: "TEC-POP10-64-WHT", attributes: { storage: "64GB", color: "White" }, price: 78000, stock: 22 },
      ],
    },
    {
      name: "Tecno Spark 30",
      slug: "tecno-spark-30",
      description: "64MP ultra-clear camera with a distinctive ring-flash design and all-day battery.",
      category: "phones",
      brand: "tecno",
      basePrice: 148000,
      condition: ProductCondition.NEW,
      isFeatured: true,
      images: ["/products/tecno/spark-30.jpeg"],
      variants: [
        { sku: "TEC-SPARK30-128-BLK", attributes: { storage: "128GB", color: "Black" }, price: 148000, stock: 16 },
      ],
    },
    {
      name: "Tecno Camon 50 Pro",
      slug: "tecno-camon-50-pro",
      description: "Premium camera-focused phone with a curved display and pro-grade portrait lens.",
      category: "phones",
      brand: "tecno",
      basePrice: 210000,
      condition: ProductCondition.NEW,
      isFeatured: true,
      images: ["/products/tecno/camon-50-pro.jpeg"],
      variants: [
        { sku: "TEC-CAMON50PRO-256-SLV", attributes: { storage: "256GB", color: "Silver" }, price: 210000, stock: 11 },
      ],
    },
    {
      name: "Tecno Pop 8",
      slug: "tecno-pop-8",
      description: "Reliable entry-level phone built for calls, messaging, and everyday light use.",
      category: "phones",
      brand: "tecno",
      basePrice: 62000,
      condition: ProductCondition.NEW,
      images: ["/products/tecno/pop-8.jpeg"],
      variants: [
        { sku: "TEC-POP8-32-BLU", attributes: { storage: "32GB", color: "Blue" }, price: 62000, stock: 20 },
      ],
    },

    // Samsung
    {
      name: "Samsung Galaxy A16",
      slug: "samsung-galaxy-a16",
      description: "Budget-friendly Galaxy phone with a bright AMOLED display and up to 6 years of software updates.",
      category: "phones",
      brand: "samsung",
      basePrice: 145000,
      condition: ProductCondition.NEW,
      isFeatured: true,
      images: ["/products/samsung/galaxy-a16.jpeg"],
      variants: [
        { sku: "SAM-A16-128-SLV", attributes: { storage: "128GB", color: "Silver" }, price: 145000, stock: 24 },
      ],
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description: "Titanium-frame flagship with a built-in S Pen, 200MP camera, and a 6.8-inch QHD+ display.",
      category: "phones",
      brand: "samsung",
      basePrice: 1850000,
      condition: ProductCondition.NEW,
      isFeatured: true,
      images: ["/products/samsung/galaxy-s24-ultra.jpeg"],
      variants: [
        { sku: "SAM-S24U-256-TIT", attributes: { storage: "256GB", color: "Titanium Black" }, price: 1850000, stock: 4 },
      ],
    },
    {
      name: "Samsung Galaxy Buds3 Pro",
      slug: "samsung-galaxy-buds3-pro",
      description: "Blade-style earbuds with active noise cancellation and adaptive sound for Galaxy devices.",
      category: "audio",
      brand: "samsung",
      basePrice: 195000,
      condition: ProductCondition.NEW,
      images: ["/products/samsung/galaxy-buds3-pro.jpeg"],
      variants: [
        { sku: "SAM-BUDS3PRO-SLV", attributes: { color: "Silver" }, price: 195000, stock: 17 },
      ],
    },

    // Nokia
    {
      name: "Nokia 3210 (2024)",
      slug: "nokia-3210-2024",
      description: "The classic reimagined — a durable feature phone with a built-in camera and weeks of standby battery.",
      category: "phones",
      brand: "nokia",
      basePrice: 45000,
      condition: ProductCondition.NEW,
      isFeatured: true,
      images: ["/products/nokia/3210-4g.jpeg"],
      variants: [
        { sku: "NOK-3210-BLK", attributes: { color: "Black" }, price: 45000, stock: 30 },
      ],
    },
    {
      name: "Nokia 105",
      slug: "nokia-105",
      description: "Ultra-affordable basic phone built for calls and texts, with a battery that lasts for days.",
      category: "phones",
      brand: "nokia",
      basePrice: 18000,
      condition: ProductCondition.NEW,
      images: ["/products/nokia/nokia-105.jpeg"],
      variants: [
        { sku: "NOK-105-BLK", attributes: { color: "Black" }, price: 18000, stock: 40 },
      ],
    },
    {
      name: "Nokia 3310",
      slug: "nokia-3310",
      description: "The legendary indestructible classic — available in four colors, with Snake pre-installed.",
      category: "phones",
      brand: "nokia",
      basePrice: 32000,
      condition: ProductCondition.NEW,
      isFeatured: true,
      images: ["/products/nokia/3310.jpeg"],
      variants: [
        { sku: "NOK-3310-RED", attributes: { color: "Red" }, price: 32000, stock: 18 },
        { sku: "NOK-3310-YEL", attributes: { color: "Yellow" }, price: 32000, stock: 12 },
        { sku: "NOK-3310-GRY", attributes: { color: "Grey" }, price: 32000, stock: 14 },
        { sku: "NOK-3310-BLU", attributes: { color: "Dark Blue" }, price: 32000, stock: 9 },
      ],
    },
    {
      name: "Nokia Lumia 630",
      slug: "nokia-lumia-630",
      description: "Compact Windows Phone with a Live Tile interface and quad-core performance.",
      category: "phones",
      brand: "nokia",
      basePrice: 55000,
      condition: ProductCondition.USED,
      images: ["/products/nokia/lumia-630.jpeg"],
      variants: [
        { sku: "NOK-LUMIA630-GRN", attributes: { color: "Green" }, price: 55000, stock: 3 },
      ],
    },

    // Apple
    {
      name: "iMac 27\" Retina (2019)",
      slug: "apple-imac-27-2019",
      description: "27-inch 5K Retina display all-in-one with a Core i9 processor, 1TB SSD, and 8GB RAM.",
      category: "desktops",
      brand: "apple",
      basePrice: 980000,
      condition: ProductCondition.REFURBISHED,
      isFeatured: true,
      images: ["/products/apple/imac-27.jpeg"],
      variants: [
        { sku: "APL-IMAC27-19-1TB-8GB", attributes: { storage: "1TB SSD", ram: "8GB" }, price: 980000, stock: 2 },
      ],
    },
  ];

  for (const p of products) {
    await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: categories[p.category].id,
        brandId: brands[p.brand].id,
        basePrice: p.basePrice,
        condition: p.condition,
        isFeatured: p.isFeatured ?? false,
        images: { create: p.images.map((url, i) => ({ url, position: i })) },
        variants: { create: p.variants },
      },
    });
  }

  console.log(`Seeded ${products.length} products across ${categoryDefs.length} categories and ${brandDefs.length} brands.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
