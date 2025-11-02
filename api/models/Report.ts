import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type HydratedDocument,
  type Model,
} from "mongoose";

/**
 * Report Model
 *
 * Manages user-submitted reports for lessons, exercises, and general issues.
 * Prevents duplicate reports from the same user for the same lesson.
 *
 * Features:
 * - Unique constraint on userId + lessonId combination
 * - Comprehensive indexing for performance
 * - Status tracking and priority management
 * - Static methods for common queries
 * - Full TypeScript support
 */

// 1. Define Schema
const ReportSchema = new Schema(
  {
    // User Information
    userId: {
      type: String,
      required: true,
      trim: true,
    },

    // Content References
    lessonId: {
      type: String,
      ref: "Lesson",
      required: true, // Not all reports are lesson-specific
      trim: true,
    },

    exerciseId: {
      type: String,
      ref: "Exercise",
      required: true, // Not all reports are exercise-specific
      trim: true,
    },

    // Report Classification
    type: {
      type: String,
      enum: [
        "bug", // Technical issues
        "content_issue", // Content problems (wrong answers, typos, etc.)
        "user_report", // General user feedback
        "payment_issue", // Payment-related problems
        "audio_issue", // Audio/TTS problems
        "ui_issue", // User interface problems
        "performance_issue", // Performance-related issues
      ],
      required: true,
    },

    // Report Status Management
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed", "duplicate"],
      default: "open",
    },

    // Report Content
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Additional Report Data
    reasons: [
      {
        type: String,
        trim: true,
      },
    ],

    // Metadata
    date: {
      type: Date,
      default: Date.now,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // Technical Context
    userAgent: {
      type: String,
      trim: true,
    },

    url: {
      type: String,
      trim: true,
    },

    // Admin Fields
    assignedTo: {
      type: String,
      trim: true,
    },

    adminNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    resolvedAt: {
      type: Date,
    },

    resolvedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 2. Indexes for Performance and Constraints

// Unique constraint: One report per user per lesson
// This prevents duplicate reports for the same lesson
ReportSchema.index(
  { userId: 1, lessonId: 1 },
  {
    unique: true,
    sparse: true, // Allows multiple reports without lessonId
    name: "unique_user_lesson_report",
  }
);

// Performance indexes
ReportSchema.index({ userId: 1, status: 1 }); // User's reports by status
ReportSchema.index({ type: 1, status: 1 }); // Reports by type and status
ReportSchema.index({ priority: 1, status: 1 }); // Priority-based queries
ReportSchema.index({ date: -1 }); // Recent reports first
ReportSchema.index({ status: 1, date: -1 }); // Status with recent first
ReportSchema.index({ assignedTo: 1, status: 1 }); // Admin assignment queries

// 3. Virtual Fields

// Virtual for report age in days
ReportSchema.virtual("ageInDays").get(function () {
  const now = new Date();
  const created = this.createdAt || this.date;
  return Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );
});

// Virtual for resolution time (if resolved)
ReportSchema.virtual("resolutionTimeInHours").get(function () {
  if (!this.resolvedAt) return null;
  const created = this.createdAt || this.date;
  return Math.floor(
    (this.resolvedAt.getTime() - created.getTime()) / (1000 * 60 * 60)
  );
});

// 4. Static Methods for Common Queries

ReportSchema.statics.findOpenReportsByUser = function (userId: string) {
  return this.find({
    userId,
    status: { $in: ["open", "in_progress"] },
  }).sort({ date: -1 });
};

ReportSchema.statics.findReportsByLesson = function (lessonId: string) {
  return this.find({ lessonId }).sort({ date: -1 });
};

ReportSchema.statics.findHighPriorityReports = function () {
  return this.find({
    priority: { $in: ["high", "critical"] },
    status: { $in: ["open", "in_progress"] },
  }).sort({ priority: -1, date: -1 });
};

ReportSchema.statics.findReportsByType = function (type: string) {
  return this.find({ type }).sort({ date: -1 });
};

ReportSchema.statics.getReportStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

ReportSchema.statics.checkExistingReport = function (
  userId: string,
  exerciseId?: string
) {
  if (!exerciseId) return Promise.resolve(null);

  return this.findOne({
    userId,
    exerciseId,
    status: { $in: ["open", "in_progress"] },
  });
};

// 5. Instance Methods

ReportSchema.methods.markAsResolved = function (
  resolvedBy: string,
  adminNotes?: string
) {
  this.status = "resolved";
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  if (adminNotes) {
    this.adminNotes = adminNotes;
  }
  return this.save();
};

ReportSchema.methods.assignTo = function (adminId: string) {
  this.assignedTo = adminId;
  if (this.status === "open") {
    this.status = "in_progress";
  }
  return this.save();
};

ReportSchema.methods.updatePriority = function (priority: string) {
  this.priority = priority;
  return this.save();
};

// 6. Pre-save Middleware

ReportSchema.pre("save", function (next) {
  // Auto-generate title if not provided
  if (!this.title && this.type) {
    const typeMap = {
      bug: "Bug Report",
      content_issue: "Content Issue",
      user_report: "User Feedback",
      payment_issue: "Payment Issue",
      audio_issue: "Audio Problem",
      ui_issue: "UI Issue",
      performance_issue: "Performance Issue",
    };
    this.title = typeMap[this.type] || "General Report";
  }

  // Set resolved timestamp when status changes to resolved
  if (this.status === "resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }

  next();
});

// 7. Type Definitions
export type ReportType = InferSchemaType<typeof ReportSchema>;
export type ReportDocument = HydratedDocument<ReportType>;

export interface ReportModel extends Model<ReportType> {
  findOpenReportsByUser(userId: string): Promise<ReportDocument[]>;
  findReportsByLesson(lessonId: string): Promise<ReportDocument[]>;
  findHighPriorityReports(): Promise<ReportDocument[]>;
  findReportsByType(type: string): Promise<ReportDocument[]>;
  getReportStats(): Promise<ReportDocument[]>;
  checkExistingReport(
    userId: string,
    exerciseId?: string
  ): Promise<ReportDocument | null>;
}

// 8. Safe Export for HMR (Hot Module Replacement)
const Report =
  (models.Report as ReportModel) ||
  model<ReportType, ReportModel>("Report", ReportSchema);

export default Report;
