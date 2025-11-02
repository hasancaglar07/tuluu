import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, webhookUrl } = await request.json()

    if (!userId || !webhookUrl) {
      return NextResponse.json({ error: "User ID and webhook URL are required" }, { status: 400 })
    }

    // Prepare webhook payload
    const webhookPayload = {
      type: "user.updated",
      data: {
        id: userId,
        private_metadata: {
          role: "admin",
          subscription: "free",
          subscriptionStatus: "active",
          status: "active",
        },
      },
      timestamp: new Date().toISOString(),
    }

    // Trigger the webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Installation-Wizard/1.0",
      },
      body: JSON.stringify(webhookPayload),
    })

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed with status: ${webhookResponse.status}`)
    }

    const webhookResult = await webhookResponse.text()

    return NextResponse.json({
      success: true,
      message: "Webhook triggered successfully",
      webhookResponse: {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: webhookResult,
      },
      updatedMetadata: {
        role: "admin",
        subscription: "free",
        subscriptionStatus: "active",
        status: "active",
      },
    })
  } catch (error) {
    console.error("Error triggering webhook:", error)
    return NextResponse.json({ error: `Failed to trigger webhook: ${error.message}` }, { status: 500 })
  }
}
