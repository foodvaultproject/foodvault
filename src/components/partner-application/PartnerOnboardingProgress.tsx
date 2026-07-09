type PartnerOnboardingProgressProps = {
  currentStep: 1 | 2;
};

const steps = [
  { number: 1, label: "Create Account" },
  { number: 2, label: "Business Application" },
] as const;

function StepIcon({
  stepNumber,
  currentStep,
}: {
  stepNumber: 1 | 2;
  currentStep: 1 | 2;
}) {
  if (stepNumber < currentStep) {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </span>
    );
  }

  if (stepNumber === currentStep) {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-primary text-white">
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </span>
    );
  }

  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-border bg-background" />
  );
}

export function PartnerOnboardingProgress({ currentStep }: PartnerOnboardingProgressProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ol className="mx-auto flex max-w-3xl items-center">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isComplete = step.number < currentStep;

            return (
              <li
                key={step.number}
                className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <StepIcon stepNumber={step.number} currentStep={currentStep} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Step {step.number}
                    </p>
                    <p
                      className={`truncate text-sm font-semibold sm:text-base ${
                        isActive || isComplete ? "text-primary" : "text-muted-foreground"
                      } ${isActive ? "border-b-2 border-primary pb-1" : ""}`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 hidden h-0.5 flex-1 sm:block ${
                      isComplete ? "bg-primary" : "bg-border"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
