"use client";

import Link from "next/link";

const steps = [
  {
    number: 1,
    title: "Application Review",
    description:
      "Our team will review your application, website and business details to ensure they meet FoodVault's partner requirements.",
    status: "Application Under Review",
    active: true,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    ),
  },
  {
    number: 2,
    title: "Approval",
    description:
      "If approved, we'll email your confirmation and dashboard login instructions.",
    status: "Approval Email Sent",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    ),
  },
  {
    number: 3,
    title: "Create Your Offer",
    description:
      "Set up your member discount code on your website before continuing.",
    status: "Waiting for Partner Setup",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75v-.008zm0 5.25h.007v.008H3.75V18z" />
    ),
  },
  {
    number: 4,
    title: "Confirm Offer Live",
    description:
      'Return to your dashboard and click "I\'ve Activated My Member Offer".',
    status: "Awaiting Confirmation",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    number: 5,
    title: "Listing Goes Live",
    description:
      "Your business becomes searchable throughout FoodVault for all members.",
    status: "Live",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    ),
  },
];

const confettiColors = ["#4F46E5", "#16a34a", "#f472b6", "#22d3ee", "#7C3AED"];

function ConfettiOverlay() {
  const pieces = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: `${(i * 13 + 5) % 96 + 2}%`,
    top: `${(i * 19 + 8) % 88 + 4}%`,
    color: confettiColors[i % confettiColors.length],
    rotate: `${(i * 37) % 360}deg`,
    size: i % 3 === 0 ? 10 : i % 3 === 1 ? 8 : 6,
    rounded: i % 4 === 0 ? "rounded-sm" : i % 4 === 1 ? "rounded-none" : "rounded-full",
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={`absolute opacity-75 ${piece.rounded}`}
          style={{
            left: piece.left,
            top: piece.top,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotate})`,
          }}
        />
      ))}
    </div>
  );
}

export function PartnerApplicationSuccess() {
  return (
    <section className="relative overflow-hidden bg-background py-7 sm:py-10 md:py-12">
      <ConfettiOverlay />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Application Submitted Successfully
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Thank you for applying to the FoodVault Partner Network. We will review
            your details and provide an update within{" "}
            <strong className="font-semibold text-primary">24 hours</strong>.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-success" />
            Application Status: <strong>Pending Review</strong>
          </span>
        </div>

        <div className="mt-10 rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8 md:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              What Happens Next
            </h2>
          </div>

          <div className="relative mt-8">
            <div
              className="absolute left-[10%] right-[10%] top-6 hidden border-t border-dashed border-border md:block"
              aria-hidden="true"
            />

            <div className="grid gap-8 md:grid-cols-5 md:gap-4">
              {steps.map((step) => (
                <div key={step.number} className="relative text-center">
                  <span
                    className={`relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                      step.active
                        ? "bg-primary text-white shadow-sm"
                        : "bg-primary/10 text-primary/70"
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      {step.icon}
                    </svg>
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  <p
                    className={`mt-3 text-[10px] font-bold uppercase tracking-wide ${
                      step.active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-5 sm:p-6">
          <div className="flex gap-3">
            <span className="text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </span>
            <div>
              <h3 className="font-bold text-foreground">Before your listing goes live</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Your listing will not become visible until you have confirmed that
                your member offer has been activated on your own website. This helps
                ensure members receive the correct discount from day one and prevents
                incorrect or inactive offers from appearing on FoodVault.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-surface/60 p-5 sm:p-6">
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-sm font-bold text-muted-foreground">
              ?
            </span>
            <div>
              <h3 className="font-bold text-foreground">What happens after approval?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You&apos;ll receive an email containing:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Your approval confirmation</li>
                <li>Your suggested member discount code</li>
                <li>Instructions for activating your offer</li>
                <li>A link to your Partner Dashboard where you can confirm your offer is live</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="fv-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-sm px-8 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 sm:w-auto"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Return Home
          </Link>
        </div>
      </div>
    </section>
  );
}
