// Environment variables configuration
export const env = {
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api",
  YOUTUBE_CLIENT_ID: process.env.YOUTUBE_CLIENT_ID || "your-youtube-client-id",
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY || "pk_test_your-stripe-public-key",
} as const

// Type-safe environment variable access
export type EnvKey = keyof typeof env
