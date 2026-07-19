import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories, brands] = await Promise.all([
    db.product.findUnique({ where: { id: params.id }, include: { variants: true } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl">Edit product</h1>
      <ProductForm
        categories={categories}
        brands={brands}
        productId={product.id}
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId: product.categoryId,
          brandId: product.brandId ?? undefined,
          basePrice: Number(product.basePrice),
          condition: product.condition,
          isPublished: product.isPublished,
          variants: product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            attributes: v.attributes as Record<string, string>,
            price: Number(v.price),
            stock: v.stock,
          })),
        }}
      />
    </div>
  );
}
