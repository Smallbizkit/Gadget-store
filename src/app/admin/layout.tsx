import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/coupons", label: "Promotions" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Belt-and-suspenders: middleware already blocks non-admins from /admin/*,
  // but server components should never assume that alone.
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-line bg-panel px-4 py-8">
        <p className="px-2 font-mono text-xs uppercase tracking-wide text-silver">Admin</p>
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-card px-2 py-2 text-sm text-titanium hover:bg-ink hover:text-signal"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="mt-10 block px-2 font-mono text-xs text-silver hover:text-signal">
          ← Back to store
        </Link>
      </aside>
      <div className="flex-1 px-8 py-8">{children}</div>
    </div>
  );
}
