const PAYSTACK_BASE = "https://api.paystack.co";

function headers() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function initializePaystackTransaction(params: {
  email: string;
  amountKobo: number; // Paystack expects the smallest currency unit
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  if (!res.ok) throw new Error(`Paystack init failed: ${res.status}`);
  return res.json() as Promise<{
    status: boolean;
    data: { authorization_url: string; access_code: string; reference: string };
  }>;
}

export async function verifyPaystackTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Paystack verify failed: ${res.status}`);
  return res.json() as Promise<{
    status: boolean;
    data: { status: string; amount: number; reference: string; metadata?: Record<string, unknown> };
  }>;
}
