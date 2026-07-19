import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  categoryId: z.string(),
  brandId: z.string().optional(),
  basePrice: z.number().positive(),
  currency: z.enum(["NGN", "USD"]).default("NGN"),
  condition: z.enum(["NEW", "REFURBISHED", "USED"]).default("NEW"),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string().url()).default([]),
  variants: z
    .array(
      z.object({
        sku: z.string(),
        attributes: z.record(z.string()),
        price: z.number().positive(),
        stock: z.number().int().nonnegative(),
      })
    )
    .min(1),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, brand: true, variants: true, images: true },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { images, variants, ...rest } = parsed.data;

  const product = await db.product.create({
    data: {
      ...rest,
      images: { create: images.map((url, i) => ({ url, position: i })) },
      variants: { create: variants },
    },
  });

  return NextResponse.json(product, { status: 201 });
}
