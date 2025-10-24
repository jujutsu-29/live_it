"use client"

import type { ReactNode } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // console.log("AuthGuard session:", session)

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If no session, redirect
  if (!session) {
    router.push("/signin")
    return null
  }

  return <>{children}</>
}
