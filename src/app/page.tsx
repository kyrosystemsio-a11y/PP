import Image from "next/image";
import Link from "next/link";
import {
  getProductsByCategory,
  getProductBySlug,
} from "@/data/products";
import ProductCard from "@/components/ProductCard";
import PinataIcon from "@/components/PinataIcon";
import PinataUnravelHero from "@/components/PinataUnravelHero";

export default function Home() {
  const halloween = getProductsByCategory("halloween");
  const customBuilds = getProductsByCategory("custom");
  const colors = getProductsByCategory("colors").slice(0, 4);
  const designs = getProductsByCategory("design").slice(0, 4);
  const baptism = getProductBySlug("baptism");
  const tshirt = getProductBySlug("t-shirt");
  const collab = getProductBySlug("luis-loera-collab");

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <PinataUnravelHero />

      {/* Halloween seasonal block */}
      <section className="bg-[var(--color-ink)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold-bright)]">
                Seasonal Collection
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                Halloween Spin Piñatas
              </h2>
            </div>
            <Link
              href="/shop?category=halloween"
              className="cursor-pointer text-sm font-semibold text-[var(--color-gold-bright)] underline-offset-4 hover:underline"
            >
              Shop Halloween →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 lg:max-w-xl">
            {halloween.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Custom build promo */}
      <section className="bg-[var(--color-kraft)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="gold-foil-border rounded-3xl bg-white p-6 sm:p-10">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-rope)]">
                  Made Just For You
                </span>
                <h2 className="mt-2 font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
                  Build Your Own
                </h2>
                <p className="mt-4 leading-relaxed text-black/75">
                  Choose your ribbon color and upload a photo of your theme
                  or favorite character. We hand-build it from scratch —
                  glow version available with mini LED lights woven through
                  every rip cord. Allow 2–3 extra days for custom builds.
                </p>
                <Link
                  href="/shop?category=custom"
                  className="mt-6 inline-block cursor-pointer rounded-full bg-[var(--color-midway)] px-7 py-4 font-bold text-white transition-colors hover:bg-[var(--color-midway-light)]"
                >
                  Start Your Custom Build
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {customBuilds.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patent pending / reusable favorites */}
      <section className="bg-[var(--color-midway-deep)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-3xl sm:text-4xl">
            Handcrafted Favorites, Made to Last
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Reusable",
                copy: "A real spin-pull mechanism, not a one-smash design — pull the ribbons and bring it right back.",
              },
              {
                title: "Hand-Built",
                copy: "Every piñata is wrapped, ribboned, and finished by hand in small batches.",
              },
              {
                title: "Patent Pending",
                copy: "Our spin design is one-of-a-kind — there's no piñata quite like a Spinner Piñata.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-3">
                <PinataIcon className="h-20 w-20" color="#e7b740" />
                <h3 className="font-display text-lg text-[var(--color-gold-bright)]">
                  {item.title}
                </h3>
                <p className="max-w-xs text-sm text-white/75">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Influencer collaboration */}
      {collab && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div className="order-2 md:order-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-rope)]">
                  Limited Collaboration
                </span>
                <h2 className="mt-2 font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
                  {collab.name}
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-black/75">
                  {collab.description}
                </p>
                <Link
                  href={`/shop/${collab.slug}`}
                  className="mt-6 inline-block cursor-pointer rounded-full bg-[var(--color-midway)] px-7 py-4 font-bold text-white transition-colors hover:bg-[var(--color-midway-light)]"
                >
                  Shop the Collab
                </Link>
              </div>
              <div className="order-1 max-w-xs md:order-2 md:ml-auto">
                <ProductCard product={collab} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Colors collection */}
      <section className="bg-[var(--color-kraft)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-rope)]">
                17 Colors, One Look
              </span>
              <h2 className="mt-2 font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
                Colors Collection
              </h2>
            </div>
            <Link
              href="/shop?category=colors"
              className="cursor-pointer text-sm font-semibold text-[var(--color-midway)] underline-offset-4 hover:underline"
            >
              Shop All Colors →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {colors.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Design collection */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-rope)]">
                Themed & Tribute Builds
              </span>
              <h2 className="mt-2 font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
                Design Collection
              </h2>
            </div>
            <Link
              href="/shop?category=design"
              className="cursor-pointer text-sm font-semibold text-[var(--color-midway)] underline-offset-4 hover:underline"
            >
              Shop All Designs →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {designs.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Baptism feature */}
      {baptism && (
        <section className="bg-[var(--color-kraft)]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid items-center gap-10 rounded-3xl bg-white p-6 shadow-sm sm:p-10 md:grid-cols-2">
              <div className="relative aspect-square overflow-hidden rounded-2xl md:order-2">
                {baptism.image && (
                  <Image
                    src={baptism.image}
                    alt={baptism.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="md:order-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-rope)]">
                  Made for the Occasion
                </span>
                <h2 className="mt-2 font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
                  {baptism.name.replace(/\s*\(.*\)/, "")}
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-black/75">
                  {baptism.description}
                </p>
                <Link
                  href={`/shop/${baptism.slug}`}
                  className="mt-6 inline-block cursor-pointer rounded-full bg-[var(--color-midway)] px-7 py-4 font-bold text-white transition-colors hover:bg-[var(--color-midway-light)]"
                >
                  Shop Baptism Edition
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Merch */}
      {tshirt && (
        <section className="bg-[var(--color-ink)] text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold-bright)]">
                  Wear the Tornado
                </span>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                  {tshirt.name}
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-white/75">
                  {tshirt.description}
                </p>
                <Link
                  href={`/shop/${tshirt.slug}`}
                  className="mt-6 inline-block cursor-pointer rounded-full bg-[var(--color-gold)] px-7 py-4 font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-gold-bright)]"
                >
                  Shop Merch
                </Link>
              </div>
              <div className="max-w-xs md:ml-auto">
                <ProductCard product={tshirt} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Closer */}
      <section className="caution-stripe">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center sm:px-6">
          <h2 className="font-display text-2xl text-[var(--color-ink)] sm:text-3xl">
            Ready to Spin Up Your Next Party?
          </h2>
          <Link
            href="/shop"
            className="cursor-pointer rounded-full bg-[var(--color-ink)] px-7 py-4 font-bold text-white transition-colors hover:bg-[var(--color-midway-deep)]"
          >
            Shop All Piñatas
          </Link>
        </div>
      </section>
    </div>
  );
}
