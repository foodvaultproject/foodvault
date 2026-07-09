"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/account/ConfirmModal";
import { resetPassword } from "@/lib/auth";
import {
  deleteMemberAccountAction,
  updateMemberProfileAction,
} from "@/lib/member/account-actions";
import type { MemberProfile } from "@/lib/member/queries";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const readOnlyClass =
  "w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-foreground";

function CardShell({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-background p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </span>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

type MemberProfileFormProps = {
  profile: MemberProfile;
};

export function MemberProfileForm({ profile }: MemberProfileFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [country, setCountry] = useState(profile.country);
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const result = await updateMemberProfileAction({
      firstName,
      lastName,
      country,
    });

    setSaving(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    setEditingIdentity(false);
    setEditingContact(false);
    setMessage("Your account details have been saved.");
    router.refresh();
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setError(null);
    const result = await deleteMemberAccountAction();
    if ("error" in result && result.error) {
      setDeleting(false);
      setShowDeleteModal(false);
      setError(result.error);
    }
  }

  async function handlePasswordReset() {
    setResettingPassword(true);
    setError(null);
    setMessage(null);

    const result = await resetPassword(profile.email);
    setResettingPassword(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setMessage("A secure reset link has been sent to your email address.");
  }

  return (
    <>
      <div className="min-h-screen bg-[#f3f4f6]">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            My Account
          </h1>
          <p className="mt-3 text-muted-foreground">
            Manage your personal information and security settings.
          </p>

          {message ? (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-8 space-y-6">
            <CardShell
              title="Identity"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              }
              action={
                <button
                  type="button"
                  onClick={() => setEditingIdentity((value) => !value)}
                  className="text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  {editingIdentity ? "Cancel" : "Edit"}
                </button>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-muted-foreground">
                    First Name
                  </span>
                  <input
                    className={editingIdentity ? inputClass : readOnlyClass}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    readOnly={!editingIdentity}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-muted-foreground">
                    Last Name
                  </span>
                  <input
                    className={editingIdentity ? inputClass : readOnlyClass}
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    readOnly={!editingIdentity}
                  />
                </label>
              </div>
            </CardShell>

            <CardShell
              title="Contact"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c1.648 0 3 1.352 3 3v1.5M16.5 12H12m8.25 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              action={
                <button
                  type="button"
                  onClick={() => setEditingContact((value) => !value)}
                  className="text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  {editingContact ? "Cancel" : "Edit"}
                </button>
              }
            >
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-muted-foreground">
                    Email Address
                  </span>
                  <input className={readOnlyClass} value={profile.email} readOnly />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-muted-foreground">
                    Location
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      📍
                    </span>
                    <input
                      className={`${editingContact ? inputClass : readOnlyClass} pl-10`}
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      readOnly={!editingContact}
                    />
                  </div>
                  <p className="mt-2 text-xs text-primary">
                    FoodVault is currently exclusive to New Zealand.
                  </p>
                </label>
              </div>
            </CardShell>

            <CardShell
              title="Security"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              }
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <label className="block flex-1">
                  <span className="mb-2 block text-sm font-medium text-muted-foreground">
                    Password
                  </span>
                  <input className={readOnlyClass} value="••••••••••••" readOnly />
                </label>
                <button
                  type="button"
                  onClick={() => void handlePasswordReset()}
                  disabled={resettingPassword}
                  className="rounded-lg border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface disabled:opacity-60"
                >
                  {resettingPassword ? "Sending..." : "Send Reset Email"}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                A secure link will be sent to your email address.
              </p>
            </CardShell>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete your account?"
        description="This will permanently remove your FoodVault member profile and sign you out. This action cannot be undone."
        confirmLabel="Delete Account"
        destructive
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => void handleDeleteAccount()}
      />
    </>
  );
}
