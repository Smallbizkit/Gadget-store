"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.toUpperCase(), percentOff: Number(percentOff) }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not create coupon");
      return;
    }
    setCode("");
    setPercentOff("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 rounded-card border border-line bg-panel p-4">
      <div>
        <label className="font-mono text-xs uppercase tracking-wide text-silver">Code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="SAVE10"
          required
          className="mt-1 block rounded-card border border-line bg-ink px-3 py-2 text-sm outline-none focus-visible:border-signal"
        />
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wide text-silver">% off</label>
        <input
          type="number"
          value={percentOff}
          onChange={(e) => setPercentOff(e.target.value)}
          placeholder="10"
          required
          className="mt-1 block w-24 rounded-card border border-line bg-ink px-3 py-2 text-sm outline-none focus-visible:border-signal"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-card bg-signal px-5 py-2 text-sm font-medium text-ink disabled:opacity-60"
      >
        {loading ? "Adding…" : "Add coupon"}
      </button>
    </form>
  );
}
