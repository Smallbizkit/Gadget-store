"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };
type Brand = { id: string; name: string };

export type VariantInput = {
  id?: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
};

type Props = {
  categories: Category[];
  brands: Brand[];
  productId?: string; // present when editing
  initial?: {
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    brandId?: string;
    basePrice: number;
    condition: "NEW" | "REFURBISHED" | "USED";
    isPublished: boolean;
    variants: VariantInput[];
  };
};

const emptyVariant: VariantInput = { sku: "", attributes: {}, price: 0, stock: 0 };

export function ProductForm({ categories, brands, productId, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    brandId: initial?.brandId ?? "",
    basePrice: initial?.basePrice ?? 0,
    condition: initial?.condition ?? "NEW",
    isPublished: initial?.isPublished ?? true,
  });
  const [variants, setVariants] = useState<VariantInput[]>(initial?.variants ?? [{ ...emptyVariant }]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateVariant(index: number, patch: Partial<VariantInput>) {
    setVariants((v) => v.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...form,
      basePrice: Number(form.basePrice),
      brandId: form.brandId || undefined,
      images: [],
      variants: variants.map((v) => ({ ...v, price: Number(v.price), stock: Number(v.stock) })),
    };

    const res = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
      method: productId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not save product");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Product name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="rounded-card border border-line bg-panel px-4 py-3 text-sm outline-none focus-visible:border-signal"
        />
        <input
          placeholder="Slug (url-safe-name)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
          className="rounded-card border border-line bg-panel px-4 py-3 text-sm outline-none focus-visible:border-signal"
        />
      </div>

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
        rows={4}
        className="w-full rounded-card border border-line bg-panel px-4 py-3 text-sm outline-none focus-visible:border-signal"
      />

      <div className="grid grid-cols-3 gap-4">
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="rounded-card border border-line bg-panel px-4 py-3 text-sm outline-none focus-visible:border-signal"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={form.brandId}
          onChange={(e) => setForm({ ...form, brandId: e.target.value })}
          className="rounded-card border border-line bg-panel px-4 py-3 text-sm outline-none focus-visible:border-signal"
        >
          <option value="">No brand</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select
          value={form.condition}
          onChange={(e) => setForm({ ...form, condition: e.target.value as never })}
          className="rounded-card border border-line bg-panel px-4 py-3 text-sm outline-none focus-visible:border-signal"
        >
          <option value="NEW">New</option>
          <option value="REFURBISHED">Refurbished</option>
          <option value="USED">Used</option>
        </select>
      </div>

      <input
        type="number"
        placeholder="Base price (₦)"
        value={form.basePrice}
        onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
        required
        className="w-full rounded-card border border-line bg-panel px-4 py-3 text-sm outline-none focus-visible:border-signal"
      />

      <label className="flex items-center gap-2 text-sm text-titanium">
        <input
          type="checkbox"
          checked={form.isPublished}
          onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
        />
        Published (visible in the storefront)
      </label>

      <div>
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-wide text-silver">Variants</p>
          <button
            type="button"
            onClick={() => setVariants((v) => [...v, { ...emptyVariant }])}
            className="font-mono text-xs text-signal"
          >
            + Add variant
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 rounded-card border border-line bg-panel p-3">
              <input
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariant(i, { sku: e.target.value })}
                className="col-span-1 rounded bg-ink px-2 py-1.5 text-xs outline-none"
              />
              <input
                placeholder='Attributes e.g. storage=256GB,color=Black'
                value={Object.entries(v.attributes).map(([k, val]) => `${k}=${val}`).join(",")}
                onChange={(e) => {
                  const attrs: Record<string, string> = {};
                  e.target.value.split(",").forEach((pair) => {
                    const [k, val] = pair.split("=");
                    if (k && val) attrs[k.trim()] = val.trim();
                  });
                  updateVariant(i, { attributes: attrs });
                }}
                className="col-span-2 rounded bg-ink px-2 py-1.5 text-xs outline-none"
              />
              <input
                type="number"
                placeholder="Price"
                value={v.price}
                onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
                className="rounded bg-ink px-2 py-1.5 text-xs outline-none"
              />
              <input
                type="number"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                className="rounded bg-ink px-2 py-1.5 text-xs outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-card bg-signal px-6 py-3 text-sm font-medium text-ink disabled:opacity-60"
      >
        {loading ? "Saving…" : productId ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
