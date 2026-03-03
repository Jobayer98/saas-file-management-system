"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

export default function VerifyEmailForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("Invalid verification link");
        setIsLoading(false);
        return;
      }

      try {
        await authService.verifyEmail(token);
        setIsSuccess(true);
        toast.success("Email verified successfully!");
      } catch (error: any) {
        setError(error.message || "Email verification failed");
        toast.error("Email verification failed");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Verifying Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now sign in to
              your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircleIcon className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Verification Failed</CardTitle>
          <CardDescription>
            {error || "We couldn't verify your email address."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            The verification link may be invalid or expired. Please try
            registering again or contact support.
          </p>
          <div className="space-y-2">
            <Button onClick={() => router.push("/register")} className="w-full">
              Register Again
            </Button>
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
