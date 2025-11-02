import { NextResponse } from "next/server"

export async function GET() {
  // Redirect to Clerk sign-in with Google OAuth
  // In a real implementation, you'd configure Clerk to handle this
  const clerkSignInUrl = `/sign-in?redirect_url=${encodeURIComponent("/install")}`

  return NextResponse.redirect(new URL(clerkSignInUrl, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
}
