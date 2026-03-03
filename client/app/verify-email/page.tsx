"use client";

import { Suspense } from "react";
import VerifyEmailForm from "./verify-email-form";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
