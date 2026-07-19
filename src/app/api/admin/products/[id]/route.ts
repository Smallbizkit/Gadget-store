import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  basePrice: z.number().positive().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  condition: z.enum(["NEW", "REFURBISHED", "USED"]).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(), // present = update, absent = create
        sku: z.string(),
        attributes: z.record(z.string()),
        price: z.number().positive(),
        stock: z.number().int().nonnegative(),
      })
    )
    .optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const product = await db.product.findUnique({
    where: { id: params.id },
    include: { images: true, variants: true, category: true, brand: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { variants, ...rest } = parsed.data;

  if (variants) {
    for (const v of variants) {
      if (v.id) {
        await db.productVariant.update({
          where: { id: v.id },
          data: { sku: v.sku, attributes: v.attributes, price: v.price, stock: v.stock },
        });
      } else {
        await db.productVariant.create({
          data: { ...v, productId: params.id },
        });
      }
    }
  }

  const product = await db.product.update({ where: { id: params.id }, data: rest });
  return NextResponse.json(product);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  await db.product.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}
