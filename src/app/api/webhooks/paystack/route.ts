import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const expectedSignature = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const reference = event.data.reference;

    const payment = await db.payment.findFirst({ where: { providerRef: reference } });
    if (!payment || payment.status === "SUCCESS") {
      return NextResponse.json({ received: true });
    }

    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", paidAt: new Date(), rawResponse: event },
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
