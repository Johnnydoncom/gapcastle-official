import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AuthShell } from "../auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  if (await isAuthenticated()) redirect("/admin");

  return (
    <AuthShell
      title="Staff sign in"
      description="Review applications, enquiries and Fun Food Factory submissions, and publish to the blog."
      footer={
        <Link href="/" className="font-semibold text-castle-600 hover:underline">
          ← Back to the website
        </Link>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
