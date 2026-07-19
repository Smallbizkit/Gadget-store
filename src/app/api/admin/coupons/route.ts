import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const schema = z.object({
  code: z.string().min(3),
  percentOff: z.number().int().min(1).max(100).optional(),
  amountOff: z.number().positive().optional(),
  maxRedemptions: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coupon", issues: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.coupon.findUnique({ where: { code: parsed.data.code } });
  if (existing) {
    return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
  }

  const coupon = await db.coupon.create({
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    },
  });
  return NextResponse.json(coupon, { status: 201 });
}
