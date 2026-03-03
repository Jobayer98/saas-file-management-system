"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, AuthTokens } from "@/types";
import { authService } from "@/lib/api/services";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = getStoredToken();
      if (token) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      // Token is invalid, clear it
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      const { token, refreshToken, user: userData } = response.data;

      // Store tokens
      storeTokens({ token, refreshToken });
      setUser(userData);
      console.log(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // If refresh fails, user might be logged out
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Token storage utilities
function storeTokens(tokens: AuthTokens) {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", tokens.token);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }
}

function getStoredToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
}

function getStoredRefreshToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
}

function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
}

// Role-based access control helpers
export function hasRole(
  user: User | null,
  role: "admin" | "customer",
): boolean {
  if (!user) return false;

  switch (role) {
    case "admin":
      return user.isAdmin;
    case "customer":
      return !user.isAdmin;
    default:
      return false;
  }
}

export function requireAuth(user: User | null): asserts user is User {
  if (!user) {
    throw new Error("Authentication required");
  }
}

export function requireRole(
  user: User | null,
  role: "admin" | "customer",
): asserts user is User {
  requireAuth(user);
  if (!hasRole(user, role)) {
    throw new Error(`${role} role required`);
  }
}
