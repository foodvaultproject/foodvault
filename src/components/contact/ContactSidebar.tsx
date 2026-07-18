export function ContactHero() {
  return (
    <section className="bg-gradient-to-b from-surface-lavender via-background to-background pt-7 sm:pt-10 md:pt-12">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          How Can We Help?
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
          Whether you&apos;re a member looking for savings, a brand interested in
          the vault, or just have a general question, our team is ready to
          assist.
        </p>
      </div>
    </section>
  );
}

export function ContactAlert() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 sm:p-6">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        <div>
          <h2 className="font-bold text-foreground">Before You Contact Us</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            FoodVault is a membership and discovery platform, not a direct
            retailer. We do not manufacture or sell products directly. For
            questions regarding{" "}
            <strong className="font-semibold text-foreground">
              specific orders, shipping status, product quality, returns, or
              refunds
            </strong>
            , please contact the partner business where you made the purchase.
            You can find their contact details on your order confirmation email.
          </p>
        </div>
      </div>
    </div>
  );
}
