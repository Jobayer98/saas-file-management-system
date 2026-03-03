"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect to appropriate dashboard based on user role
      const redirectPath = user?.isAdmin ? "/admin" : "/dashboard";
      router.push(redirectPath);
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>File & Folder Management</CardTitle>
          <CardDescription>
            Modern file and folder management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Secure, fast, and intuitive file management with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Drag & drop file uploads</li>
            <li>Folder organization</li>
            <li>File sharing & collaboration</li>
            <li>Version control</li>
            <li>Storage management</li>
          </ul>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
