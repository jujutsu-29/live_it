"use client"

import { signInWithGoogle } from "@/lib/actions/signin"

export default function SignIn() {
  return (
    <form action={signInWithGoogle}>
      <button type="submit">Sign in with Google</button>
    </form>
  )
}