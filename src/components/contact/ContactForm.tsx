"use client";

import Link from "next/link";
import { useState } from "react";

const contactTypes = [
  {
    id: "member",
    label: "Member",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: "partner",
    label: "Partner",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
  },
  {
    id: "affiliate",
    label: "Affiliate",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    id: "general",
    label: "General Enquiry",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    id: "not-sure",
    label: "Not Sure",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
];

const categoryOptions = [
  "Membership & billing",
  "Account & login",
  "Partner application",
  "Affiliate Support",
  "Technical support",
  "Billing & payments",
  "General question",
  "Other",
];

export function ContactForm() {
  const [contactType, setContactType] = useState("member");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-background p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-light text-success">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-bold text-foreground">Enquiry sent</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for contacting FoodVault. Our team will respond within 1–2
          business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset>
        <legend className="text-sm font-bold uppercase tracking-wide text-foreground">
          1. I am contacting as a...
        </legend>
        <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-3">
          {contactTypes.map((type) => (
            <label
              key={type.id}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-2 text-center transition-colors sm:gap-2 sm:p-4 ${
                contactType === type.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="contactType"
                value={type.id}
                checked={contactType === type.id}
                onChange={() => setContactType(type.id)}
                className="sr-only"
              />
              <span className="[&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6">{type.icon}</span>
              <span className="text-[10px] font-semibold leading-tight sm:text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="category"
          className="text-sm font-bold uppercase tracking-wide text-foreground"
        >
          2. Select Category
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue=""
          className="mt-3 w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-base"
        >
          <option value="" disabled>
            Please select a reason for contact
          </option>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-foreground">
          3. Your Information
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="sr-only">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="John Doe"
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="subject"
          className="text-sm font-bold uppercase tracking-wide text-foreground"
        >
          4. Subject Line
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          placeholder="How can we help you today?"
          className="mt-3 w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="text-sm font-bold uppercase tracking-wide text-foreground"
        >
          5. Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Please provide as much detail as possible..."
          className="mt-3 w-full resize-y rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-foreground">
          6. Attachments (Optional)
        </p>
        <label
          htmlFor="attachments"
          className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-border bg-surface px-4 py-10 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
          <span className="mt-3 text-sm font-medium text-foreground">
            Click to upload or drag and drop
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            Support for screenshots (PNG, JPG) and PDFs. Max 10MB.
          </span>
          <input
            id="attachments"
            name="attachments"
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            className="sr-only"
            multiple
          />
        </label>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <label htmlFor="consent" className="text-sm leading-relaxed text-muted-foreground">
          I agree to the FoodVault{" "}
          <Link href="/privacy" className="font-semibold text-primary hover:text-primary-hover">
            Privacy Policy
          </Link>{" "}
          and consent to the processing of my personal data for the purpose of
          handling this enquiry.
        </label>
      </div>

      <button
        type="submit"
        className="fv-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-sm px-6 py-3.5 text-base font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
      >
        Send Enquiry
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </form>
  );
}
