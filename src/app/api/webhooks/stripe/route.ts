import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as { id: string; metadata: { orderId?: string } };

    const payment = await db.payment.findFirst({ where: { providerRef: intent.id } });
    if (!payment || payment.status === "SUCCESS") {
      return NextResponse.json({ received: true });
    }

    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", paidAt: new Date(), rawResponse: event as never },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID" },
      });

      const orderItems = await tx.orderItem.findMany({ where: { orderId: payment.orderId } });
      for (const item of orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    });
  }

  return NextResponse.json({ received: true });
}
