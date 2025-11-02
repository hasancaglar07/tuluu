import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import PaymentTransaction from "@/models/PaymentTransaction";
import { InvoiceQuerySchema } from "@/lib/validations/payment";
import { authGuard } from "@/lib/utils";

/**
 * @swagger
 * /api/admin/payments/invoices/{id}:
 *   get:
 *     summary: Get a completed invoice by ID or the latest one
 *     tags:
 *       - Invoices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID, transaction ID, or "latest" for the most recent one
 *     responses:
 *       200:
 *         description: Invoice successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error
 *                 errors:
 *                   type: object
 *       404:
 *         description: Invoice not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invoice not found
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Prepare an invoice for download (PDF link)
 *     tags:
 *       - Invoices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID or transaction ID
 *     responses:
 *       200:
 *         description: Invoice ready for download
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
 *                   example: Invoice ready for download
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Invoice'
 *                     - type: object
 *                       properties:
 *                         downloadUrl:
 *                           type: string
 *                           example: /api/admin/payments/invoices/abc123/pdf
 *                         downloadReady:
 *                           type: boolean
 *                           example: true
 *       500:
 *         description: Internal server error
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    // **Connect to database**
    await connectDB();

    // **Get invoice ID from params**
    const { id } = await params;

    // **Validate ID parameter**
    const validation = InvoiceQuerySchema.safeParse({ id });
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // **Handle special case for "latest" ID**
    let transaction;
    if (id === "latest") {
      transaction = await PaymentTransaction.findOne({
        status: "completed",
        type: { $ne: "refund" },
      })
        .populate("userId", "username email avatar")
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // **Find transaction by ID or transaction ID**
      transaction = await PaymentTransaction.findOne({
        $or: [{ _id: id }, { transactionId: id }],
        status: "completed",
      })
        .populate("userId", "username email avatar")
        .lean();
    }

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 }
      );
    }

    // **Generate invoice number if not exists**
    const invoiceNumber = transaction.transactionId
      ? `INV-${transaction.transactionId.replace("TXN_", "")}`
      : `INV-${transaction._id.toString().slice(-6)}`;

    // **Format invoice data**
    const invoice = {
      id: transaction._id.toString(),
      number: invoiceNumber,
      transactionId: transaction.transactionId,
      date: transaction.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      dueDate: transaction.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      status: "Paid", // Since we only fetch completed transactions
      customer: {
        id: transaction.userId._id.toString(),
        name: transaction.billingAddress?.name,
        email: transaction.billingAddress?.email,
        address: transaction.billingAddress
          ? `${transaction.billingAddress.line1}${
              transaction.billingAddress.line2
                ? ", " + transaction.billingAddress.line2
                : ""
            }, ${transaction.billingAddress.city}, ${
              transaction.billingAddress.state || ""
            } ${transaction.billingAddress.postalCode}`
          : "Address not provided",
      },
      company: {
        name: "TULU Clone",
        address: "456 Business Ave, Suite 100, San Francisco, CA 94107",
        email: "billing@duolingoclone.com",
        phone: "+1 (555) 123-4567",
      },
      items: [
        {
          description: transaction.description,
          quantity: 1,
          unitPrice: transaction.amount / 100, // Convert from cents
          amount: transaction.amount / 100,
        },
      ],
      subtotal: transaction.amount / 100,
      discountAmount: (transaction.discountAmount || 0) / 100,
      taxAmount: (transaction.taxAmount || 0) / 100,
      feeAmount: (transaction.feeAmount || 0) / 100,
      total: transaction.netAmount / 100,
      currency: transaction.currency,
      paymentMethod: `${transaction.paymentMethodType}${
        transaction.lastFourDigits
          ? ` (ending in ${transaction.lastFourDigits})`
          : ""
      }`,
      paymentProvider: transaction.paymentProvider,
      receiptUrl: transaction.receiptUrl,
      metadata: {
        itemType: transaction.itemType,
        itemId: transaction.itemId,
        subscriptionId: transaction.subscriptionId,
        planId: transaction.planId,
        promoCodeId: transaction.promoCodeId,
        promoCodeDiscount: (transaction.promoCodeDiscount || 0) / 100,
      },
    };

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch invoice",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    // **Connect to database**
    await connectDB();

    // **Get invoice ID from params**
    const { id } = await params;

    // **Fetch invoice data using the GET logic**
    const invoiceResponse = await GET(request, {
      params: Promise.resolve({ id }),
    });
    const invoiceData = await invoiceResponse.json();

    if (!invoiceData.success) {
      return invoiceResponse;
    }

    // **In a real implementation, you would generate a PDF here**
    // **For now, return the invoice data with a download flag**
    return NextResponse.json({
      success: true,
      data: {
        ...invoiceData.data,
        downloadUrl: `/api/admin/payments/invoices/${id}/pdf`,
        downloadReady: true,
      },
      message: "Invoice ready for download",
    });
  } catch (error) {
    console.error("Error generating invoice download:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate invoice download",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
