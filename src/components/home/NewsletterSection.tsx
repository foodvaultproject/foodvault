export function NewsletterSection() {
  return (
    <section className="border-t border-border bg-background py-7">
      <div className="mx-auto flex max-w-7xl flex-col items-stretch justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div className="text-center md:text-left">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">Stay Updated</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Get the latest member offers and brand spotlights in your inbox.
          </p>
        </div>
        <form className="flex w-full flex-col gap-3 sm:flex-row md:max-w-md md:shrink-0 lg:max-w-lg">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email"
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="fv-btn-primary inline-flex w-full shrink-0 items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
