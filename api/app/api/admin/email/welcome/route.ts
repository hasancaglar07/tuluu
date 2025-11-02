import { type NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { authGuard } from "@/lib/utils";
/**
 * @swagger
 * /api/admin/send-welcome-email:
 *   post:
 *     summary: Send a welcome email to a newly created user
 *     description: Only authenticated admin users can send a welcome email with login credentials to a new user.
 *     tags: [Admin]
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newuser@example.com
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: Welcome email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Welcome email sent successfully
 *       400:
 *         description: Missing required fields (email, name, or password)
 *       401:
 *         description: Unauthorized – user is not logged in
 *       403:
 *         description: Forbidden – user is not an admin
 *       500:
 *         description: Server error – failed to send the email
 */

// POST /api/admin/email/welcome - Send welcome email to new user
export async function POST(req: NextRequest) {
  try {
    // Check if the user is authenticated and has admin role
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    // Get the request body
    const body = await req.json();
    const { email, name, password } = body;

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Get the website URL from environment or use a default
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
    const loginUrl = `${websiteUrl}/${process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}`;

    // Create email content
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Welcome to Our Platform!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #333; text-align: center;">Welcome to Our Platform!</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">Hello ${name},</p>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">Thank you for joining our platform. We're excited to have you on board!</p>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">Here are your login credentials:</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">Please keep this information secure. We recommend changing your password after your first login.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
          </div>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">Best regards,<br>The Team</p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Welcome email sent successfully",
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}
