import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AuthShell } from "../auth-shell";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage() {
  if (await isAuthenticated()) redirect("/admin/account");

  return (
    <AuthShell
      title="Forgot your password?"
      description="Enter the email address you sign in with and we will send you a link to choose a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/admin/login" className="font-semibold text-castle-600 hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
