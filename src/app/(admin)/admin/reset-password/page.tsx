import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../auth-shell";
import { findResetToken } from "@/lib/password-reset";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  // keep the token in the address bar from leaking to other sites
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({ searchParams }: PageProps<"/admin/reset-password">) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";

  let account: Awaited<ReturnType<typeof findResetToken>> = null;
  try {
    account = value ? await findResetToken(value) : null;
  } catch (error) {
    console.error("[admin] reset token lookup failed:", error instanceof Error ? error.message : error);
  }

  if (!account) {
    return (
      <AuthShell
        title="This link has expired"
        description="Password reset links work once and expire after 60 minutes. Request a new one and use the most recent email."
      >
        <Link
          href="/admin/forgot-password"
          className="flex w-full items-center justify-center rounded-full bg-castle-600 px-7 py-4 font-semibold text-white hover:bg-castle-700"
        >
          Request a new link
        </Link>
        <p className="mt-5 text-center text-sm">
          <Link href="/admin/login" className="font-semibold text-castle-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      description={
        <>
          For <strong className="font-semibold text-ink">{account.email}</strong>. You will be signed in straight away, and signed
          out on every other device.
        </>
      }
    >
      <ResetPasswordForm token={value} email={account.email} />
    </AuthShell>
  );
}
