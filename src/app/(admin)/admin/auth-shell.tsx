import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/** Centered card used by sign in, forgot password and reset password. */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="grid flex-1 place-items-center px-4 py-10 sm:px-5 sm:py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto block w-fit" aria-label="Back to the Gap Castle website">
          <Image src="/logo-lockup.png" alt="Gap Castle" width={2137} height={1538} priority className="h-14 w-auto sm:h-16" />
        </Link>
        <div className="mt-8 rounded-[24px] border border-castle-100 bg-white p-6 shadow-lift sm:mt-10 sm:rounded-[28px] sm:p-10">
          <h1 className="font-display text-[1.75rem] leading-tight font-semibold sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{description}</p>}
          <div className="mt-7 sm:mt-8">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-ink/60">{footer}</div>}
      </div>
    </main>
  );
}
