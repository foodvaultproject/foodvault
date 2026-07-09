"use client";

import { useEffect, useState } from "react";
import { getPartnerSession } from "@/lib/partner-auth";
import {
  portalBtnGhost,
  portalBtnPrimary,
  portalCard,
  portalCardContent,
  portalCardTitle,
  portalDestructive,
  portalFieldGap,
  portalFormGrid,
  portalHelper,
  portalInput,
  portalLabel,
  portalPageHeader,
  portalPageNarrow,
  portalPageSubtitle,
  portalPageTitle,
  portalSectionStack,
} from "@/lib/partner-portal-classes";
import { PartnerPortalShell } from "./PartnerPortalShell";
import { PartnerAffiliateSetupBanner } from "./PartnerAffiliateSetupBanner";

export function PartnerAccountPage() {
  const [businessEmail, setBusinessEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    getPartnerSession().then((session) => {
      if (session) {
        setBusinessEmail(session.email);
      }
    });
  }, []);

  return (
    <PartnerPortalShell>
      <div className={portalPageNarrow}>
        <PartnerAffiliateSetupBanner className="mb-5" />
        <div className={portalPageHeader}>
          <h1 className={portalPageTitle}>My Account</h1>
          <p className={portalPageSubtitle}>
            Manage your partner profile, security settings, and communication preferences.
          </p>
        </div>

        <div className={portalSectionStack}>
          <section className={portalCard}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
                  </svg>
                </span>
                <h2 className={portalCardTitle}>Business Information</h2>
              </div>
              <button type="button" className="text-xs font-medium text-primary hover:text-primary-hover">
                Edit
              </button>
            </div>
            <div className={portalCardContent}>
              <label htmlFor="businessEmail" className={portalLabel}>
                Business Email
              </label>
              <input
                id="businessEmail"
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                className={`${portalFieldGap} ${portalInput}`}
              />
              <p className={`${portalHelper} mt-1`}>
                This is your primary contact email for administrative updates.
              </p>
            </div>
          </section>

          <section className={portalCard}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </span>
              <h2 className={portalCardTitle}>Security</h2>
            </div>

            <div className={portalCardContent}>
              <label htmlFor="currentPassword" className={portalLabel}>
                Current Password
              </label>
              <div className={`relative ${portalFieldGap}`}>
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`${portalInput} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="my-4 border-t border-border" />

            <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
              Change Password
            </p>
            <div className={`${portalFormGrid} ${portalCardContent}`}>
              <div>
                <label htmlFor="newPassword" className={portalLabel}>
                  New Password
                </label>
                <div className={`relative ${portalFieldGap}`}>
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`${portalInput} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className={portalLabel}>
                  Confirm New Password
                </label>
                <div className={`relative ${portalFieldGap}`}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${portalInput} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className={`rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 ${portalCardContent}`}>
              <div className="flex gap-2.5">
                <span className="text-primary">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </span>
                <p className={`${portalHelper} leading-relaxed`}>
                  Password requirements: Must contain at least 8 characters, including
                  uppercase, lowercase, and at least one number.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" className={portalDestructive}>
            Deactivate Account
          </button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" className={portalBtnGhost}>
              Discard Changes
            </button>
            <button type="button" className={portalBtnPrimary}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </PartnerPortalShell>
  );
}
