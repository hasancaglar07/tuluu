import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ authenticated: false })
    }

    const user = await currentUser()

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        fullName: user?.fullName,
        emailAddresses: user?.emailAddresses,
        imageUrl: user?.imageUrl,
      },
    })
  } catch (error) {
    console.error("Error checking Clerk auth:", error)
    return NextResponse.json({ authenticated: false, error: "Failed to check authentication" })
  }
}
