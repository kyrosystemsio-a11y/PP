import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUCTS, getProductBySlug, CATEGORY_LABELS } from "@/data/products";
import PinataIcon from "@/components/PinataIcon";
import AddToCartForm from "@/components/AddToCartForm";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} | Spinner Piñata®`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm text-black/60">
        <Link href="/shop" className="hover:underline">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/shop?category=${product.category}`}
          className="hover:underline"
        >
          {CATEGORY_LABELS[product.category]}
        </Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div
          className="relative aspect-square overflow-hidden rounded-2xl"
          style={{ backgroundColor: product.swatch }}
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center p-12">
              <PinataIcon
                className="h-full w-full"
                color="#ffffff33"
                glow={product.isAnimatedGlow}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <h1 className="font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
            {product.name}
          </h1>
          <p className="text-2xl font-bold text-[var(--color-ink)]">
            ${product.price.toFixed(2)}
          </p>
          <p className="leading-relaxed text-black/75">
            {product.description}
          </p>

          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}
