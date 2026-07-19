import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { initializePaystackTransaction } from "@/lib/payments/paystack";
import { stripe } from "@/lib/payments/stripe";

const orderSchema = z.object({
  addressId: z.string(),
  provider: z.enum(["PAYSTACK", "STRIPE"]),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  couponCode: z.string().optional(),
});

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `GS-${date}-${rand}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to place an order" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order payload", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { addressId, provider, items, couponCode } = parsed.data;

  // Re-price server-side from the DB — never trust client-submitted prices
  const variants = await db.productVariant.findMany({
    where: { id: { in: items.map((i) => i.variantId) } },
    include: { product: true },
  });

  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) return NextResponse.json({ error: "One of the items is no longer available" }, { status: 400 });
    if (variant.stock < item.quantity) {
      return NextResponse.json({ error: `Not enough stock for ${variant.product.name}` }, { status: 400 });
    }
  }

  let subtotal = 0;
  const orderItemsData = items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId)!;
    const unitPrice = Number(variant.price);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    return {
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    };
  });

  let discountTotal = 0;
  if (couponCode) {
    const coupon = await db.coupon.findUnique({ where: { code: couponCode } });
    if (coupon?.isActive) {
      if (coupon.percentOff) discountTotal = subtotal * (coupon.percentOff / 100);
      else if (coupon.amountOff) discountTotal = Number(coupon.amountOff);
    }
  }

  const shippingFee = 0; // wire up real shipping calculation here later
  const total = subtotal - discountTotal + shippingFee;
  const currency = provider === "PAYSTACK" ? "NGN" : "USD";

  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session.user.id,
      addressId,
      subtotal,
      shippingFee,
      discountTotal,
      total,
      couponCode,
      items: { create: orderItemsData },
    },
  });

  if (provider === "PAYSTACK") {
    const init = await initializePaystackTransaction({
      email: session.user.email!,
      amountKobo: Math.round(total * 100),
      reference: order.orderNumber,
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}/confirm`,
      metadata: { orderId: order.id },
    });

    await db.payment.create({
      data: {
        orderId: order.id,
        provider: "PAYSTACK",
        providerRef: init.data.reference,
        amount: total,
        currency,
      },
    });

    return NextResponse.json({ orderId: order.id, redirectUrl: init.data.authorization_url });
  }

  // STRIPE
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: currency.toLowerCase(),
    metadata: { orderId: order.id },
  });

  await db.payment.create({
    data: {
      orderId: order.id,
      provider: "STRIPE",
      providerRef: intent.id,
      amount: total,
      currency,
    },
  });

  return NextResponse.json({ orderId: order.id, clientSecret: intent.client_secret });
}
