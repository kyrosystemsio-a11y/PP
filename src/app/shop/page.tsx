import type { Metadata } from "next";
import { getProductsByCategory, type Category } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";

export const metadata: Metadata = {
  title: "Shop All Spin Piñatas | Spinner Piñata®",
  description:
    "Browse the full Spinner Piñata® catalog — colors, designs, Halloween, glow, baptism, and custom builds.",
};

const VALID_CATEGORIES: Category[] = [
  "custom",
  "influencers",
  "halloween",
  "glow",
  "colors",
  "design",
  "baptism",
  "merch",
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: rawCategory } = await searchParams;
  const category: Category | "all" = VALID_CATEGORIES.includes(
    rawCategory as Category
  )
    ? (rawCategory as Category)
    : "all";

  const products = getProductsByCategory(category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
        Shop All Piñatas
      </h1>
      <p className="mt-2 max-w-2xl text-black/70">
        Every Spinner Piñata® is hand-built to be pulled, spun, and reused
        party after party.
      </p>

      <div className="mt-6">
        <CategoryFilter active={category} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="mt-10 text-center text-black/60">
          No products in this collection yet.
        </p>
      )}
    </div>
  );
}
