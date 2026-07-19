import { db } from "@/lib/db";
import { CouponForm } from "@/components/admin/CouponForm";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl">Promotions</h1>

      <CouponForm />

      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line font-mono text-xs uppercase tracking-wide text-silver">
            <th className="pb-3">Code</th>
            <th className="pb-3">Discount</th>
            <th className="pb-3">Redeemed</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {coupons.map((c) => (
            <tr key={c.id}>
              <td className="readout py-3 text-signal">{c.code}</td>
              <td className="py-3 text-sm">
                {c.percentOff ? `${c.percentOff}% off` : c.amountOff ? `₦${Number(c.amountOff).toLocaleString()} off` : "—"}
              </td>
              <td className="py-3 font-mono text-xs">
                {c.timesRedeemed}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}
              </td>
              <td className="py-3 font-mono text-xs text-silver">{c.isActive ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {coupons.length === 0 && <p className="mt-6 text-silver">No promotions yet.</p>}
    </div>
  );
}
