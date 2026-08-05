import type { Metadata } from "next";
import Image from "next/image";
import PinataIcon from "@/components/PinataIcon";

export const metadata: Metadata = {
  title: "Our Story | Spinner Piñata®",
  description:
    "How Spinner Piñata® reinvented the piñata with a reusable spin-and-pull design, hand-built one ribbon at a time.",
};

export default function OurStoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <PinataIcon className="h-24 w-24" color="#3a0a5e" />
        <h1 className="mt-4 font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
          Our Story
        </h1>
      </div>

      <div className="mt-10 flex flex-col gap-6 leading-relaxed text-black/80">
        <p>
          Spinner Piñata® started with a simple problem: a piñata is over the
          second the candy hits the ground. One swing, one smash, and the
          centerpiece of the party becomes confetti and cardboard on the
          floor.
        </p>
        <p>
          We wanted something that lasted the whole party — so we built a
          piñata that spins. Instead of a single bottom-drop, every Spinner
          Piñata is rigged with pull-ribbons that release candy a little at a
          time as it spins overhead, so the moment stretches out instead of
          ending in seconds.
        </p>
        <p>
          Every piece is hand-wrapped and hand-ribboned in small batches — no
          two are assembly-line identical. We build the Colors Collection in
          eighteen shades, themed Design pieces for tribute parties, seasonal
          drops for Halloween, and fully custom builds where you choose the
          ribbon color and send us a photo of the character or theme you want
          brought to life.
        </p>
        <p>
          Our spin mechanism is patent pending — there&apos;s nothing else
          quite like it. And because it&apos;s built to be pulled and spun
          rather than smashed once, a Spinner Piñata® can come back for
          birthday after birthday.
        </p>
      </div>

      <div className="relative mt-10 aspect-square overflow-hidden rounded-2xl">
        <Image
          src="/products/baptism.jpg"
          alt="Spinner Piñata® Baptism edition"
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
