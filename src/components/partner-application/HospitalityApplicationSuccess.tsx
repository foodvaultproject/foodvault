import Link from "next/link";

const hospitalitySteps = [
  {
    number: 1,
    title: "Application Review",
    description:
      "Our team will review your venue details and offer details to ensure everything looks great.",
    status: "UNDER REVIEW",
    active: true,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
      />
    ),
  },
  {
    number: 2,
    title: "Approval & Notification",
    description:
      "Once approved, we'll send you a confirmation email with your listing link and partner dashboard access.",
    status: "WITHIN 24 HOURS",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    ),
  },
  {
    number: 3,
    title: "Listing Goes Live",
    description:
      "Your venue will automatically appear in the FoodVault local directory for all active members.",
    status: "AUTOMATIC",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
      />
    ),
  },
];

export function HospitalityApplicationSuccess() {
  return (
    <>
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
            className="absolute left-[16%] right-[16%] top-6 hidden border-t border-dashed border-border md:block"
            aria-hidden="true"
          />

          <div className="grid gap-8 md:grid-cols-3 md:gap-6">
            {hospitalitySteps.map((step) => (
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
            <h3 className="font-bold text-foreground">What happens next?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              You don&apos;t need to configure anything else on your website or POS.
              Once our team verifies your venue details, your listing will go live
              automatically within 24 hours. We&apos;ll email you as soon as members
              can start visiting!
            </p>
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
    </>
  );
}
