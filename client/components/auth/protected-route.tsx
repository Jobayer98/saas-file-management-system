"use client";

import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: "admin" | "customer";
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireRole,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isLoading && isAuthenticated && requireRole) {
      const hasRequiredRole =
        requireRole === "admin" ? user?.isAdmin : !user?.isAdmin;
      if (!hasRequiredRole) {
        // Redirect to appropriate dashboard based on user role
        const redirectPath = user?.isAdmin ? "/admin" : "/dashboard";
        router.push(redirectPath);
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requireRole, router]);

  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return fallback || <div>Redirecting to login...</div>;
  }

  if (requireRole) {
    const hasRequiredRole =
      requireRole === "admin" ? user?.isAdmin : !user?.isAdmin;
    if (!hasRequiredRole) {
      return fallback || <div>Access denied. Redirecting...</div>;
    }
  }

  return <>{children}</>;
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
