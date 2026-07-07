import BaptismSpinnerHero from '@/components/BaptismSpinnerHero';

export default function Page() {
  return (
    <>
      <BaptismSpinnerHero
        displayFont="var(--font-cormorant), Georgia, serif"
        bodyFont="var(--font-outfit), system-ui, sans-serif"
      />
      <section id="build">{/* next section — primary CTA lands here */}</section>
    </>
  );
}
