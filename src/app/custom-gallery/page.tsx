import type { Metadata } from "next";
import Link from "next/link";
import { getProductsByCategory } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Custom Gallery | Spinner Piñata®",
  description: "A look at our custom-built Spinner Piñata®s — your colors, your theme.",
};

export default function CustomGalleryPage() {
  const customBuilds = getProductsByCategory("custom");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
        Custom Gallery
      </h1>
      <p className="mt-3 max-w-2xl text-black/70">
        Every custom build starts with your ribbon color and a photo of the
        theme or character you want. Here&apos;s where it starts — browse the
        base builds below, then tell us what to make.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-2xl">
        {customBuilds.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-[var(--color-midway)]">
          Ready to build yours?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-black/70">
          Add a custom build to your cart and include your ribbon color and
          theme details, or reach out directly through{" "}
          <Link href="/contact-us" className="underline">
            Contact Us
          </Link>{" "}
          before ordering.
        </p>
      </div>
    </div>
  );
}
