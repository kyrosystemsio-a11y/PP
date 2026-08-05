import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Spinner Piñata®",
  description: "How Spinner Piñata® collects and uses your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
        Privacy Policy
      </h1>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-black/75">
        <p>
          We collect the information you provide when placing an order or
          contacting us — name, email, shipping address, and any custom
          build details like ribbon color or theme photos.
        </p>
        <p>
          This information is used only to fulfill your order, communicate
          about it, and improve our products. We do not sell your personal
          information to third parties.
        </p>
        <p>
          Photos submitted for custom builds are used solely to produce your
          order and are not shared publicly without your permission.
        </p>
        <p>
          If you have questions about your data or want it removed, contact
          us and we&apos;ll take care of it promptly.
        </p>
      </div>
    </div>
  );
}
