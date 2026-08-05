import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping | Spinner Piñata®",
  description: "Where Spinner Piñata® ships and what to expect for delivery times.",
};

const REGIONS = [
  { name: "Local Pickup & Delivery", time: "Same week, based on availability" },
  { name: "Regional (Nearby States)", time: "3–5 business days" },
  { name: "Nationwide Shipping", time: "5–8 business days" },
  { name: "Custom Builds", time: "Add 2–3 days to the above for hand-built orders" },
];

export default function MapsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
        Shipping
      </h1>
      <p className="mt-3 text-black/70">
        We hand-build every piñata to order, so here&apos;s what to expect
        depending on where it&apos;s headed.
      </p>

      <div className="mt-10 overflow-hidden rounded-xl bg-white shadow-sm">
        {REGIONS.map((region, i) => (
          <div
            key={region.name}
            className={`flex items-center justify-between gap-4 px-5 py-4 ${
              i !== 0 ? "border-t border-black/10" : ""
            }`}
          >
            <span className="font-semibold">{region.name}</span>
            <span className="text-sm text-black/70">{region.time}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-black/60">
        Need it by a specific date? Mention your event date on the order or
        reach out via Contact Us and we&apos;ll do our best to make it work.
      </p>
    </div>
  );
}
