import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getMailService } from "@/lib/mail-service";
import Report from "@/models/Report";
import connectDB from "@/lib/db/connect";
import { z } from "zod";

/**
 * Report API Endpoint
 *
 * Handles user-submitted reports about issues with exercises or lessons.
 * Prevents duplicate reports and sends email notifications to administrators.
 *
 * Features:
 * - User authentication validation
 * - Duplicate report prevention
 * - Database persistence
 * - Email sending via Gmail SMTP
 * - Beautiful HTML email template
 * - Comprehensive error handling
 */

interface ReportData {
  reasons: string[];
  exerciseId?: string;
  lessonId?: string;
  status: string;
  userId: string;
  timestamp: string;
  userAgent: string;
  url: string;
  type?: string;
  title?: string;
  description?: string;
  priority?: string;
}

/**
 * Generate beautiful HTML email template for reports
 */
const generateEmailTemplate = (reportData: ReportData, userEmail?: string) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const reasonsHtml = reportData.reasons
    .map(
      (reason) =>
        `<li style="margin: 8px 0; padding: 8px; background-color: #f8f9fa; border-left: 3px solid #007bff; border-radius: 4px;">${reason}</li>`
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>User Report Submission</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 300;">🚨 User Report Received</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">A user has reported an issue that needs attention</p>
      </div>

      <!-- Content -->
      <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none;">
        
        <!-- Report Summary -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #495057; margin: 0 0 15px 0; font-size: 20px;">📋 Report Summary</h2>
          <div style="display: grid; gap: 10px;">
            <div><strong>Report Type:</strong> <span style="text-transform: capitalize;">${
              reportData.type || "General"
            }</span></div>
            <div><strong>Priority:</strong> <span style="background: ${
              reportData.priority === "critical"
                ? "#dc3545"
                : reportData.priority === "high"
                ? "#fd7e14"
                : reportData.priority === "medium"
                ? "#ffc107"
                : "#28a745"
            }; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">${
    reportData.priority || "medium"
  }</span></div>
            <div><strong>Submitted:</strong> ${formatDate(
              reportData.timestamp
            )}</div>
            <div><strong>Status:</strong> <span style="background: ${
              reportData.status === "success" ? "#d4edda" : "#f8d7da"
            }; color: ${
    reportData.status === "success" ? "#155724" : "#721c24"
  }; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">${
    reportData.status
  }</span></div>
          </div>
        </div>

        <!-- User Information -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">👤 User Information</h3>
          <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px;">
            <div style="margin-bottom: 8px;"><strong>User ID:</strong> <code>${
              reportData.userId
            }</code></div>
            ${
              userEmail
                ? `<div style="margin-bottom: 8px;"><strong>Email:</strong> ${userEmail}</div>`
                : ""
            }
            <div style="margin-bottom: 8px;"><strong>Page URL:</strong> <a href="${
              reportData.url
            }" style="color: #007bff; text-decoration: none;">${
    reportData.url
  }</a></div>
            <div><strong>Browser:</strong> <small style="color: #6c757d;">${
              reportData.userAgent
            }</small></div>
          </div>
        </div>

        <!-- Context Information -->
        ${
          reportData.exerciseId || reportData.lessonId
            ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">🎯 Context</h3>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px;">
            ${
              reportData.exerciseId
                ? `<div style="margin-bottom: 8px;"><strong>Exercise ID:</strong> <code>${reportData.exerciseId}</code></div>`
                : ""
            }
            ${
              reportData.lessonId
                ? `<div><strong>Lesson ID:</strong> <code>${reportData.lessonId}</code></div>`
                : ""
            }
          </div>
        </div>
        `
            : ""
        }

        <!-- Report Details -->
        ${
          reportData.title || reportData.description
            ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">📝 Report Details</h3>
          <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px;">
            ${
              reportData.title
                ? `<div style="margin-bottom: 10px;"><strong>Title:</strong> ${reportData.title}</div>`
                : ""
            }
            ${
              reportData.description
                ? `<div><strong>Description:</strong><br><p style="margin: 5px 0; padding: 10px; background: white; border-radius: 4px;">${reportData.description}</p></div>`
                : ""
            }
          </div>
        </div>
        `
            : ""
        }

        <!-- Reported Issues -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">⚠️ Reported Issues</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${reasonsHtml}
          </ul>
        </div>

        <!-- Action Required -->
        <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 6px; padding: 20px;">
          <h3 style="color: #0c5460; margin: 0 0 10px 0;">🔧 Action Required</h3>
          <p style="margin: 0; color: #0c5460;">Please review this report and take appropriate action. Consider:</p>
          <ul style="color: #0c5460; margin: 10px 0 0 20px;">
            <li>Investigating the reported issues</li>
            <li>Updating content or fixing bugs</li>
            <li>Following up with the user if needed</li>
          </ul>
        </div>

      </div>

      <!-- Footer -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #e1e5e9; border-top: none;">
        <p style="margin: 0; color: #6c757d; font-size: 14px;">
          This report was automatically generated by the Learning Platform<br>
          <small>Report generated at ${formatDate(reportData.timestamp)}</small>
        </p>
      </div>

    </body>
    </html>
  `;
};

/**
 * Determine report type based on reasons
 */
const determineReportType = (reasons: string[]): string => {
  const reasonText = reasons.join(" ").toLowerCase();

  if (
    reasonText.includes("bug") ||
    reasonText.includes("error") ||
    reasonText.includes("broken")
  ) {
    return "bug";
  }
  if (
    reasonText.includes("audio") ||
    reasonText.includes("sound") ||
    reasonText.includes("pronunciation")
  ) {
    return "audio_issue";
  }
  if (
    reasonText.includes("content") ||
    reasonText.includes("wrong") ||
    reasonText.includes("incorrect")
  ) {
    return "content_issue";
  }
  if (
    reasonText.includes("payment") ||
    reasonText.includes("billing") ||
    reasonText.includes("charge")
  ) {
    return "payment_issue";
  }
  if (
    reasonText.includes("slow") ||
    reasonText.includes("performance") ||
    reasonText.includes("loading")
  ) {
    return "performance_issue";
  }
  if (
    reasonText.includes("interface") ||
    reasonText.includes("design") ||
    reasonText.includes("layout")
  ) {
    return "ui_issue";
  }

  return "user_report";
};

/**
 * Determine report priority based on type and reasons
 */
const determineReportPriority = (type: string, reasons: string[]): string => {
  const reasonText = reasons.join(" ").toLowerCase();

  // Critical issues
  if (
    reasonText.includes("crash") ||
    reasonText.includes("cannot") ||
    type === "payment_issue"
  ) {
    return "critical";
  }

  // High priority issues
  if (
    type === "bug" ||
    reasonText.includes("broken") ||
    reasonText.includes("error")
  ) {
    return "high";
  }

  // Medium priority (default)
  if (type === "content_issue" || type === "audio_issue") {
    return "medium";
  }

  // Low priority
  return "low";
};

/**
 * @swagger
 * /api/reportsAttachment:
 *   post:
 *     summary: Submit a report with attachments
 *     description: |
 *       Submits a detailed report about issues with lessons, exercises, or other content.
 *       The report is validated, saved to the database, and an email notification is sent
 *       to administrators. Includes duplicate prevention and comprehensive error handling.
 *       Requires user authentication.
 *     tags:
 *       - Reports
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportSubmissionRequest'
 *           examples:
 *             lessonIssue:
 *               summary: Report lesson content issue
 *               value:
 *                 userId: "user_123abc"
 *                 lessonId: "507f1f77bcf86cd799439011"
 *                 exerciseId: "507f1f77bcf86cd799439021"
 *                 reasons: ["Incorrect translation", "Audio quality poor"]
 *                 title: "Translation Error in Spanish Lesson"
 *                 description: "The correct translation should be 'Hola' not 'Hello'"
 *                 type: "content_error"
 *                 priority: "medium"
 *                 url: "/lesson/507f1f77bcf86cd799439011"
 *                 userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                 timestamp: "2024-01-15T10:30:00Z"
 *                 status: "open"
 *             technicalIssue:
 *               summary: Report technical problem
 *               value:
 *                 userId: "user_456def"
 *                 lessonId: "507f1f77bcf86cd799439012"
 *                 reasons: ["Page not loading", "Audio not playing"]
 *                 description: "The lesson page fails to load completely and audio doesn't work"
 *                 type: "technical_issue"
 *                 priority: "high"
 *                 url: "/lesson/507f1f77bcf86cd799439012"
 *                 userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
 *                 timestamp: "2024-01-15T11:15:00Z"
 *                 status: "open"
 *     responses:
 *       '200':
 *         description: Report submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportSubmissionResponse'
 *             examples:
 *               successExample:
 *                 summary: Successful report submission
 *                 value:
 *                   message: "Report submitted successfully. Thank you for your feedback!"
 *                   reportId: "507f1f77bcf86cd799439031"
 *                   type: "content_error"
 *                   priority: "medium"
 *                   emailResult:
 *                     messageId: "<abc123@example.com>"
 *                     accepted: ["admin@example.com"]
 *                     rejected: []
 *       '400':
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Request validation failed
 *                 value:
 *                   message: "Validation error"
 *                   errors:
 *                     reasons: ["At least one reason must be provided"]
 *                     userId: ["Required"]
 *               missingReasons:
 *                 summary: No reasons provided
 *                 value:
 *                   message: "At least one reason must be selected."
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   message: "Unauthorized. Please log in to submit a report."
 *       '403':
 *         description: Forbidden - User ID mismatch
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               userMismatch:
 *                 value:
 *                   message: "User ID mismatch."
 *       '409':
 *         description: Conflict - Duplicate report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateReportResponse'
 *             examples:
 *               duplicateReport:
 *                 value:
 *                   message: "You have already submitted a report for this lesson. Please wait for it to be reviewed."
 *                   existingReportId: "507f1f77bcf86cd799439030"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               emailConfigError:
 *                 summary: Email service not configured
 *                 value:
 *                   message: "Email service is not configured properly."
 *               serverError:
 *                 summary: General server error
 *                 value:
 *                   message: "An unexpected error occurred. Please try again later."
 *   get:
 *     summary: Retrieve reports or report statistics
 *     description: |
 *       Retrieves user reports, report statistics, or performs a health check
 *       based on query parameters. Supports filtering by user ID and
 *       retrieving aggregate statistics.
 *     tags:
 *       - Reports
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Get reports for a specific user (requires authentication as that user)
 *         example: "user_123abc"
 *       - in: query
 *         name: stats
 *         schema:
 *           type: boolean
 *         description: Get report statistics instead of individual reports
 *         example: true
 *     responses:
 *       '200':
 *         description: Successfully retrieved data
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/UserReportsResponse'
 *                 - $ref: '#/components/schemas/ReportStatsResponse'
 *                 - $ref: '#/components/schemas/HealthCheckResponse'
 *             examples:
 *               userReports:
 *                 summary: User's reports
 *                 value:
 *                   reports:
 *                     - _id: "507f1f77bcf86cd799439031"
 *                       userId: "user_123abc"
 *                       lessonId: "507f1f77bcf86cd799439011"
 *                       type: "content_error"
 *                       title: "Translation Error in Spanish Lesson"
 *                       status: "open"
 *                       priority: "medium"
 *                       createdAt: "2024-01-15T10:30:00Z"
 *                   count: 1
 *               reportStats:
 *                 summary: Report statistics
 *                 value:
 *                   stats:
 *                     totalReports: 150
 *                     openReports: 45
 *                     resolvedReports: 105
 *                     reportsByType:
 *                       content_error: 80
 *                       technical_issue: 45
 *                       feature_request: 25
 *                     reportsByPriority:
 *                       high: 20
 *                       medium: 85
 *                       low: 45
 *                   timestamp: "2024-01-15T12:00:00Z"
 *               healthCheck:
 *                 summary: API health check
 *                 value:
 *                   message: "Reports API is operational"
 *                   timestamp: "2024-01-15T12:00:00Z"
 *       '401':
 *         description: Unauthorized - User not authenticated or accessing other user's data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   message: "Unauthorized"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   message: "Internal server error"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ReportSubmissionRequest:
 *       type: object
 *       required:
 *         - userId
 *         - reasons
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user submitting the report
 *           example: "user_123abc"
 *         lessonId:
 *           type: string
 *           format: objectId
 *           description: ID of the lesson being reported (optional)
 *           example: "507f1f77bcf86cd799439011"
 *         exerciseId:
 *           type: string
 *           format: objectId
 *           description: ID of the exercise being reported (optional)
 *           example: "507f1f77bcf86cd799439021"
 *         reasons:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *           description: List of reasons for the report
 *           example: ["Incorrect translation", "Audio quality poor"]
 *         title:
 *           type: string
 *           description: Title of the report (optional, will be generated if not provided)
 *           example: "Translation Error in Spanish Lesson"
 *         description:
 *           type: string
 *           description: Detailed description of the issue (optional)
 *           example: "The correct translation should be 'Hola' not 'Hello'"
 *         type:
 *           type: string
 *           enum: [content_error, technical_issue, feature_request, other]
 *           description: Type of report (optional, will be determined automatically)
 *           example: "content_error"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Priority level (optional, will be determined automatically)
 *           example: "medium"
 *         url:
 *           type: string
 *           description: URL where the issue occurred
 *           example: "/lesson/507f1f77bcf86cd799439011"
 *         userAgent:
 *           type: string
 *           description: User's browser information
 *           example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the issue occurred
 *           example: "2024-01-15T10:30:00Z"
 *         status:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *           description: Initial status of the report
 *           example: "open"
 *
 *     EmailResult:
 *       type: object
 *       properties:
 *         messageId:
 *           type: string
 *           description: Unique identifier for the sent email
 *           example: "<abc123@example.com>"
 *         accepted:
 *           type: array
 *           items:
 *             type: string
 *           description: Email addresses that accepted the message
 *           example: ["admin@example.com"]
 *         rejected:
 *           type: array
 *           items:
 *             type: string
 *           description: Email addresses that rejected the message
 *           example: []
 *
 *     ReportSubmissionResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Report submitted successfully. Thank you for your feedback!"
 *         reportId:
 *           type: string
 *           format: objectId
 *           description: ID of the created report
 *           example: "507f1f77bcf86cd799439031"
 *         type:
 *           type: string
 *           description: Determined type of the report
 *           example: "content_error"
 *         priority:
 *           type: string
 *           description: Determined priority of the report
 *           example: "medium"
 *         emailResult:
 *           $ref: '#/components/schemas/EmailResult'
 *           description: Result of the email notification
 *
 *     DuplicateReportResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Duplicate report message
 *           example: "You have already submitted a report for this lesson. Please wait for it to be reviewed."
 *         existingReportId:
 *           type: string
 *           format: objectId
 *           description: ID of the existing report
 *           example: "507f1f77bcf86cd799439030"
 *
 *     ReportSummary:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Report ID
 *           example: "507f1f77bcf86cd799439031"
 *         userId:
 *           type: string
 *           description: User who submitted the report
 *           example: "user_123abc"
 *         lessonId:
 *           type: string
 *           format: objectId
 *           description: Associated lesson ID
 *           example: "507f1f77bcf86cd799439011"
 *         type:
 *           type: string
 *           description: Type of report
 *           example: "content_error"
 *         title:
 *           type: string
 *           description: Report title
 *           example: "Translation Error in Spanish Lesson"
 *         status:
 *           type: string
 *           description: Current status
 *           example: "open"
 *         priority:
 *           type: string
 *           description: Priority level
 *           example: "medium"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the report was created
 *           example: "2024-01-15T10:30:00Z"
 *
 *     UserReportsResponse:
 *       type: object
 *       properties:
 *         reports:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReportSummary'
 *           description: List of user's reports
 *         count:
 *           type: integer
 *           description: Number of reports returned
 *           example: 1
 *
 *     ReportStats:
 *       type: object
 *       properties:
 *         totalReports:
 *           type: integer
 *           description: Total number of reports
 *           example: 150
 *         openReports:
 *           type: integer
 *           description: Number of open reports
 *           example: 45
 *         resolvedReports:
 *           type: integer
 *           description: Number of resolved reports
 *           example: 105
 *         reportsByType:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Count of reports by type
 *           example:
 *             content_error: 80
 *             technical_issue: 45
 *             feature_request: 25
 *         reportsByPriority:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: Count of reports by priority
 *           example:
 *             high: 20
 *             medium: 85
 *             low: 45
 *
 *     ReportStatsResponse:
 *       type: object
 *       properties:
 *         stats:
 *           $ref: '#/components/schemas/ReportStats'
 *           description: Report statistics
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the statistics were generated
 *           example: "2024-01-15T12:00:00Z"
 *
 *     HealthCheckResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Health check message
 *           example: "Reports API is operational"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Current timestamp
 *           example: "2024-01-15T12:00:00Z"
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: General validation error message
 *           example: "Validation error"
 *         errors:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 *           description: Field-specific validation errors
 *           example:
 *             reasons: ["At least one reason must be provided"]
 *             userId: ["Required"]
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Unauthorized. Please log in to submit a report."
 *
 *   examples:
 *     ReportsAttachmentUsageExample:
 *       summary: How to use the Reports Attachment API with Axios
 *       description: |
 *         **Step 1: Submit a Report with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const submitReport = async (reportData) => {
 *           try {
 *             const response = await axios.post('/api/reportsAttachment', reportData, {
 *               headers: {
 *                 'Content-Type': 'application/json',
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             if (response.status === 200) {
 *               console.log('Report submitted successfully!');
 *               return {
 *                 success: true,
 *                 data: response.data
 *               };
 *             }
 *           } catch (error) {
 *             console.error('Failed to submit report:', error);
 *             return {
 *               success: false,
 *               error: error.response?.data || error.message
 *             };
 *           }
 *         };
 *
 *         // Usage example
 *         const reportResult = await submitReport({
 *           userId: 'user_123abc',
 *           lessonId: '507f1f77bcf86cd799439011',
 *           exerciseId: '507f1f77bcf86cd799439021',
 *           reasons: ['Incorrect translation', 'Audio quality poor'],
 *           title: 'Translation Error in Spanish Lesson',
 *           description: 'The correct translation should be "Hola" not "Hello"',
 *           url: '/lesson/507f1f77bcf86cd799439011',
 *           userAgent: navigator.userAgent,
 *           timestamp: new Date().toISOString()
 *         });
 *         ```
 *
 *         **Step 2: Handle Different Response Scenarios**
 *         ```javascript
 *         const handleReportSubmission = async (reportData) => {
 *           try {
 *             const response = await axios.post('/api/reportsAttachment', reportData);
 *             const result = response.data;
 *
 *             // Show success message
 *             showSuccessMessage(result.message);
 *
 *             // Store report ID for reference
 *             localStorage.setItem('lastReportId', result.reportId);
 *
 *             // Log email result
 *             console.log('Email sent:', result.emailResult);
 *
 *             return result;
 *           } catch (error) {
 *             if (axios.isAxiosError(error)) {
 *               const status = error.response?.status;
 *               const errorData = error.response?.data;
 *
 *               switch (status) {
 *                 case 400:
 *                   if (errorData.errors) {
 *                     handleValidationErrors(errorData.errors);
 *                   } else {
 *                     showError(errorData.message);
 *                   }
 *                   break;
 *                 case 401:
 *                   handleUnauthorized();
 *                   break;
 *                 case 403:
 *                   showError('You can only submit reports for your own account');
 *                   break;
 *                 case 409:
 *                   showDuplicateReportMessage(errorData);
 *                   break;
 *                 case 500:
 *                   showError('Server error occurred. Please try again later.');
 *                   break;
 *                 default:
 *                   showError('An unexpected error occurred');
 *               }
 *             }
 *             throw error;
 *           }
 *         };
 *
 *         const handleValidationErrors = (errors) => {
 *           Object.entries(errors).forEach(([field, messages]) => {
 *             console.error(`${field}: ${messages.join(', ')}`);
 *             showFieldError(field, messages[0]);
 *           });
 *         };
 *
 *         const showDuplicateReportMessage = (errorData) => {
 *           showWarning(`${errorData.message} Report ID: ${errorData.existingReportId}`);
 *         };
 *         ```
 *
 *         **Step 3: Fetch User Reports and Statistics**
 *         ```javascript
 *         const fetchUserReports = async (userId) => {
 *           try {
 *             const response = await axios.get('/api/reportsAttachment', {
 *               params: { userId },
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             return response.data;
 *           } catch (error) {
 *             console.error('Failed to fetch user reports:', error);
 *             throw error;
 *           }
 *         };
 *
 *         const fetchReportStats = async () => {
 *           try {
 *             const response = await axios.get('/api/reportsAttachment', {
 *               params: { stats: true },
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             return response.data.stats;
 *           } catch (error) {
 *             console.error('Failed to fetch report statistics:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage
 *         const userReports = await fetchUserReports('user_123abc');
 *         console.log(`User has ${userReports.count} open reports`);
 *
 *         const stats = await fetchReportStats();
 *         console.log(`Total reports: ${stats.totalReports}, Open: ${stats.openReports}`);
 *         ```
 *
 *     ReactReportFormExample:
 *       summary: React component for report submission
 *       description: |
 *         ```typescript
 *         import React, { useState } from 'react';
 *         import axios from 'axios';
 *
 *         interface ReportFormProps {
 *           userId: string;
 *           lessonId?: string;
 *           exerciseId?: string;
 *           onReportSubmitted: (reportId: string) => void;
 *           onError: (error: string) => void;
 *         }
 *
 *         export function ReportForm({
 *           userId,
 *           lessonId,
 *           exerciseId,
 *           onReportSubmitted,
 *           onError
 *         }: ReportFormProps) {
 *           const [reasons, setReasons] = useState<string[]>([]);
 *           const [title, setTitle] = useState('');
 *           const [description, setDescription] = useState('');
 *           const [submitting, setSubmitting] = useState(false);
 *           const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
 *
 *           const availableReasons = [
 *             'Incorrect translation',
 *             'Audio quality poor',
 *             'Page not loading',
 *             'Audio not playing',
 *             'Typo or spelling error',
 *             'Inappropriate content',
 *             'Technical bug',
 *             'Feature request',
 *             'Other'
 *           ];
 *
 *           const handleReasonToggle = (reason: string) => {
 *             setReasons(prev =>
 *               prev.includes(reason)
 *                 ? prev.filter(r => r !== reason)
 *                 : [...prev, reason]
 *             );
 *           };
 *
 *           const submitReport = async () => {
 *             setSubmitting(true);
 *             setValidationErrors({});
 *
 *             try {
 *               const reportData = {
 *                 userId,
 *                 lessonId,
 *                 exerciseId,
 *                 reasons,
 *                 title: title.trim() || undefined,
 *                 description: description.trim() || undefined,
 *                 url: window.location.pathname,
 *                 userAgent: navigator.userAgent,
 *                 timestamp: new Date().toISOString(),
 *                 status: 'open'
 *               };
 *
 *               const response = await axios.post('/api/reportsAttachment', reportData);
 *
 *               if (response.status === 200) {
 *                 onReportSubmitted(response.data.reportId);
 *                 // Reset form
 *                 setReasons([]);
 *                 setTitle('');
 *                 setDescription('');
 *               }
 *             } catch (error) {
 *               if (axios.isAxiosError(error)) {
 *                 const errorData = error.response?.data;
 *
 *                 if (error.response?.status === 400 && errorData?.errors) {
 *                   setValidationErrors(errorData.errors);
 *                 } else if (error.response?.status === 409) {
 *                   onError(`Duplicate report: ${errorData?.message}`);
 *                 } else {
 *                   onError(errorData?.message || 'Failed to submit report');
 *                 }
 *               } else {
 *                 onError('Network error occurred');
 *               }
 *             } finally {
 *               setSubmitting(false);
 *             }
 *           };
 *
 *           return (
 *             <div className="report-form">
 *               <h3>Report an Issue</h3>
 *
 *               <div className="form-group">
 *                 <label>What's wrong? (Select all that apply)</label>
 *                 <div className="reasons-grid">
 *                   {availableReasons.map((reason) => (
 *                     <label key={reason} className="reason-checkbox">
 *                       <input
 *                         type="checkbox"
 *                         checked={reasons.includes(reason)}
 *                         onChange={() => handleReasonToggle(reason)}
 *                         disabled={submitting}
 *                       />
 *                       {reason}
 *                     </label>
 *                   ))}
 *                 </div>
 *                 {validationErrors.reasons && (
 *                   <div className="validation-error">
 *                     {validationErrors.reasons.join(', ')}
 *                   </div>
 *                 )}
 *               </div>
 *
 *               <div className="form-group">
 *                 <label htmlFor="report-title">Title (optional)</label>
 *                 <input
 *                   id="report-title"
 *                   type="text"
 *                   value={title}
 *                   onChange={(e) => setTitle(e.target.value)}
 *                   placeholder="Brief summary of the issue"
 *                   disabled={submitting}
 *                 />
 *               </div>
 *
 *               <div className="form-group">
 *                 <label htmlFor="report-description">Description (optional)</label>
 *                 <textarea
 *                   id="report-description"
 *                   value={description}
 *                   onChange={(e) => setDescription(e.target.value)}
 *                   placeholder="Provide more details about the issue..."
 *                   rows={4}
 *                   disabled={submitting}
 *                 />
 *               </div>
 *
 *               <div className="form-actions">
 *                 <button
 *                   onClick={submitReport}
 *                   disabled={submitting || reasons.length === 0}
 *                   className="submit-button"
 *                 >
 *                   {submitting ? 'Submitting...' : 'Submit Report'}
 *                 </button>
 *               </div>
 *
 *               {submitting && (
 *                 <div className="submitting-indicator">
 *                   <p>Submitting your report...</p>
 *                   <div className="progress-spinner"></div>
 *                 </div>
 *               )}
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Reports
 *     description: Operations for submitting and managing user reports
 */
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in to submit a report." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate environment variables
    const requiredEnvVars = ["MAIL_USER", "MAIL_PASSWORD", "MAIL_HOST"];
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      console.error("Missing environment variables:", missingVars);
      return NextResponse.json(
        { message: "Email service is not configured properly." },
        { status: 500 }
      );
    }

    // Parse request body
    const reportData: ReportData = body;

    console.log("💾 Report :", reportData);
    // Validate required fields
    if (
      !reportData.reasons ||
      !Array.isArray(reportData.reasons) ||
      reportData.reasons.length === 0
    ) {
      return NextResponse.json(
        { message: "At least one reason must be selected." },
        { status: 400 }
      );
    }

    // Validate user ID matches authenticated user
    if (reportData.userId !== userId) {
      return NextResponse.json(
        { message: "User ID mismatch." },
        { status: 403 }
      );
    }

    // Check for existing report (prevent duplicates for same lesson)
    if (reportData.lessonId) {
      const existingReport = await Report.checkExistingReport(
        userId,
        reportData.exerciseId
      );
      if (existingReport) {
        return NextResponse.json(
          {
            message:
              "You have already submitted a report for this lesson. Please wait for it to be reviewed.",
            existingReportId: existingReport._id,
          },
          { status: 400 } // Conflict
        );
      }
    }

    // Determine report metadata
    const reportType =
      reportData.type || determineReportType(reportData.reasons);
    const reportPriority =
      reportData.priority ||
      determineReportPriority(reportType, reportData.reasons);

    // Generate title and description
    const title =
      reportData.title ||
      `${reportType
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())} Report`;
    const description = reportData.description || reportData.reasons.join("; ");

    // Generate email content
    const emailData = {
      ...reportData,
      type: reportType,
      priority: reportPriority,
      title,
      description,
    };
    const emailHtml = generateEmailTemplate(emailData);

    // Send email first
    const mailService = getMailService();
    const to = process.env.MAIL_USER;
    if (!to) {
      return NextResponse.json(
        { message: "Email recipient not configured." },
        { status: 500 }
      );
    }

    console.log("📧 Sending report email...");
    const result = await mailService.sendMail({
      to,
      subject: `🚨 ${reportPriority.toUpperCase()} Priority Report: ${title}`,
      html: emailHtml,
      text: `
User Report Received

Type: ${reportType}
Priority: ${reportPriority}
User ID: ${reportData.userId}
Timestamp: ${reportData.timestamp}
Status: ${reportData.status}
URL: ${reportData.url}

Title: ${title}
Description: ${description}

Reported Issues:
${reportData.reasons
  .map((reason, index) => `${index + 1}. ${reason}`)
  .join("\n")}

${reportData.exerciseId ? `Exercise ID: ${reportData.exerciseId}` : ""}
${reportData.lessonId ? `Lesson ID: ${reportData.lessonId}` : ""}

Please review and take appropriate action.
      `.trim(),
    });

    console.log("✅ Email sent successfully:", result);

    // Save report to database only if email was sent successfully
    const newReport = new Report({
      userId,
      lessonId: reportData.lessonId,
      exerciseId: reportData.exerciseId,
      type: reportType,
      title,
      description,
      reasons: reportData.reasons,
      priority: reportPriority,
      userAgent: reportData.userAgent,
      url: reportData.url,
      status: "open",
    });

    const savedReport = await newReport.save();
    console.log("💾 Report saved to database:", savedReport._id);

    // Return success response
    return NextResponse.json(
      {
        message: "Report submitted successfully. Thank you for your feedback!",
        reportId: savedReport._id.toString(),
        type: reportType,
        priority: reportPriority,
        emailResult: result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("❌ Error processing report:", error);

    // Narrow the error to a MongoDB error with a code
    if (typeof error === "object" && error !== null && "code" in error) {
      const mongoError = error as { code: number };
      if (mongoError.code === 11000) {
        return NextResponse.json(
          { message: "You have already submitted a report for this lesson." },
          { status: 409 }
        );
      }
    }

    // Handle SyntaxError
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid request format." },
        { status: 400 }
      );
    }

    // Fallback for all other errors
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const stats = searchParams.get("stats");

    // Return user's reports
    if (userId) {
      const { userId: authUserId } = await auth();
      if (!authUserId || authUserId !== userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const userReports = await Report.findOpenReportsByUser(userId);
      return NextResponse.json({
        reports: userReports,
        count: userReports.length,
      });
    }

    // Return report statistics
    if (stats === "true") {
      const reportStats = await Report.getReportStats();
      return NextResponse.json({
        stats: reportStats,
        timestamp: new Date().toISOString(),
      });
    }

    // Health check
    return NextResponse.json(
      {
        message: "Reports API is operational",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/reports:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
