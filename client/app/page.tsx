"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Cloud,
  Shield,
  Zap,
  Users,
  FileText,
  FolderOpen,
  Share2,
  Lock,
  Check,
  Star,
  ArrowRight,
  Upload,
  Search,
  History,
} from "lucide-react";

import { LANDING_PAGE_PACKAGES } from "@/lib/package-mapping";

interface PricingPlan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  maxStorage: string;
  maxFiles: string;
  maxFolders: number;
}

const pricingPlans: PricingPlan[] = LANDING_PAGE_PACKAGES;

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CloudFiles</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure Cloud Storage
            <span className="text-blue-600 block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Store, organize, and share your files with enterprise-grade
            security. Collaborate seamlessly with your team from anywhere in the
            world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/register">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need for file management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make file management effortless and
              secure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Drag & Drop Upload</h3>
              <p className="text-gray-600">
                Simply drag files into your browser for instant uploads with
                progress tracking
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Organization</h3>
              <p className="text-gray-600">
                Create nested folders with unlimited depth and organize files
                your way
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Sharing</h3>
              <p className="text-gray-600">
                Share files with password protection and expiration dates
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Enterprise Security
              </h3>
              <p className="text-gray-600">
                End-to-end encryption and enterprise-grade security protocols
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Search</h3>
              <p className="text-gray-600">
                Find files instantly with powerful search and filtering
                capabilities
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Version Control</h3>
              <p className="text-gray-600">
                Track file changes and restore previous versions when needed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose your plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and upgrade as you grow. All plans include our core
              features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? "border-blue-500 shadow-lg scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.displayName}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    {plan.price > 0 && (
                      <span className="text-gray-600">/month</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="text-sm text-gray-600">
                      <strong>{plan.maxStorage}</strong> storage
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>{plan.maxFolders}</strong> folders max
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>{plan.maxFiles}</strong>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    <Link href="/register">
                      {plan.price === 0 ? "Start Free" : "Get Started"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who trust CloudFiles for their file
            management needs. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
            >
              <Link href="/register">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 text-white border-white hover:bg-white hover:text-blue-600"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Cloud className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">CloudFiles</span>
              </div>
              <p className="text-gray-400">
                Secure, simple, and powerful file management for everyone.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Status
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 CloudFiles. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
