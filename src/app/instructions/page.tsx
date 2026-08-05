import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Spinner Piñata®",
  description:
    "How to hang, spin, and pull your Spinner Piñata® for the best party reveal.",
};

const STEPS = [
  {
    title: "Hang It Up",
    copy: "Loop the top cord over a sturdy hook, tree branch, or party arch. Leave enough room below for the ribbons to hang freely.",
  },
  {
    title: "Load the Candy",
    copy: "Fill the body through the top opening, then re-secure it. Distribute weight evenly so it spins smoothly.",
  },
  {
    title: "Spin It Up",
    copy: "Give the body a gentle spin to get the tornado motion going — this is what sets a Spinner Piñata® apart from a traditional one.",
  },
  {
    title: "Pull the Ribbons",
    copy: "While it spins, guests take turns pulling a ribbon. Each pull releases a little candy, so everyone gets a turn before it's empty.",
  },
  {
    title: "Reuse It",
    copy: "Once it's empty, just restock it. Because nothing gets smashed, your Spinner Piñata® is ready for the next party right away.",
  },
];

export default function InstructionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
        How It Works
      </h1>
      <p className="mt-3 text-black/70">
        Five steps from box to tornado of confetti.
      </p>

      <ol className="mt-10 flex flex-col gap-6">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4 rounded-xl bg-white p-5 shadow-sm">
            <span className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-midway)] text-white">
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-black/70">
                {step.copy}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
