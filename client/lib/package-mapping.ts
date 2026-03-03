// Package name mapping between backend and frontend display names
export const PACKAGE_DISPLAY_NAMES = {
  free: 'Free',
  basic: 'Silver', 
  pro: 'Gold',
  enterprise: 'Diamond'
} as const;

export const PACKAGE_BACKEND_NAMES = {
  'Free': 'free',
  'Silver': 'basic',
  'Gold': 'pro', 
  'Diamond': 'enterprise'
} as const;

export type BackendPackageName = keyof typeof PACKAGE_DISPLAY_NAMES;
export type DisplayPackageName = keyof typeof PACKAGE_BACKEND_NAMES;

export function getDisplayName(backendName: BackendPackageName): string {
  return PACKAGE_DISPLAY_NAMES[backendName] || backendName;
}

export function getBackendName(displayName: DisplayPackageName): string {
  return PACKAGE_BACKEND_NAMES[displayName] || displayName.toLowerCase();
}

// Package configuration for the landing page
export const LANDING_PAGE_PACKAGES = [
  {
    id: "free",
    name: "Free",
    displayName: "Free",
    price: 0,
    description: "Perfect for personal use",
    maxStorage: "100MB",
    maxFiles: "20 files per folder",
    maxFolders: 10,
    features: [
      "10 folders maximum",
      "100MB total storage",
      "Basic file types (PDF, Images)",
      "3-level folder nesting",
      "Email support"
    ]
  },
  {
    id: "basic",
    name: "Silver",
    displayName: "Silver",
    price: 9.99,
    description: "Great for small teams",
    maxStorage: "1GB",
    maxFiles: "100 files per folder",
    maxFolders: 50,
    features: [
      "50 folders maximum",
      "1GB total storage",
      "Extended file types (Video, Audio)",
      "5-level folder nesting",
      "File sharing & collaboration",
      "Priority email support"
    ]
  },
  {
    id: "pro",
    name: "Gold",
    displayName: "Gold",
    price: 29.99,
    description: "Perfect for growing businesses",
    maxStorage: "10GB",
    maxFiles: "500 files per folder",
    maxFolders: 200,
    popular: true,
    features: [
      "200 folders maximum",
      "10GB total storage",
      "All file types supported",
      "10-level folder nesting",
      "Advanced sharing controls",
      "File versioning & history",
      "Team collaboration tools",
      "Priority support"
    ]
  },
  {
    id: "enterprise",
    name: "Diamond",
    displayName: "Diamond",
    price: 99.99,
    description: "Unlimited for large organizations",
    maxStorage: "100GB",
    maxFiles: "2000 files per folder",
    maxFolders: 1000,
    features: [
      "1000 folders maximum",
      "100GB total storage",
      "Unlimited file types",
      "20-level folder nesting",
      "Advanced security features",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "SLA guarantee"
    ]
  }
];