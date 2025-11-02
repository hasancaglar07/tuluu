"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client"; // Use CSRF-protected client
import { useCSRF } from "@/hooks/use-csrf"; // Add CSRF hook
import axios from "axios";

/**
 * Zod schema for report form validation
 * Ensures at least one reason is selected before submission
 */
const reportSchema = z.object({
  reasons: z
    .array(z.string())
    .min(1, { message: "Please select at least one reason." }),
});

type ReportForm = z.infer<typeof reportSchema>;

/**
 * List of predefined report reasons
 * These will be translated using FormattedMessage
 */
const reasonsList = [
  "report.reasons.audio_problem",
  "report.reasons.wrong_hints",
  "report.reasons.missing_sound",
  "report.reasons.missing_hints",
  "report.reasons.answer_should_be_accepted",
  "report.reasons.other_problem",
];

interface ReportModalProps {
  /** Status of the current exercise/lesson (success/error) - affects button styling */
  status: string;
  /** Optional: Exercise ID for context in the report */
  exerciseId: string;
  /** Optional: Lesson ID for context in the report */
  lessonId: string;
}

/**
 * ReportModal Component with CSRF Protection
 *
 * A modal dialog that allows users to report issues with exercises or lessons.
 * Features:
 * - Multi-select checkbox form for different issue types
 * - Internationalization support with FormattedMessage
 * - CSRF protection for secure form submission
 * - Email notification to administrators via API
 * - Toast notifications for user feedback
 * - Responsive design with proper accessibility
 */
export default function ReportModal({
  status,
  exerciseId,
  lessonId,
}: ReportModalProps) {
  // State management
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("Submitting report data:", lessonId);
  console.log("Submitting report data:", exerciseId);
  // Hooks
  const intl = useIntl();
  const { userId } = useAuth();
  const { token: csrfToken } = useCSRF(); // Add CSRF hook
  const { getToken } = useAuth();
  // Form setup with validation
  const {
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reasons: [],
    },
  });

  // Watch selected reasons for real-time updates
  const selectedReasons = watch("reasons", []);

  /**
   * Handle form submission with CSRF protection
   * Sends report data to API endpoint and shows appropriate feedback
   */
  const onSubmit = async (data: ReportForm) => {
    if (isSubmitting) return;

    // Check if CSRF token is available
    if (!csrfToken) {
      toast.error(intl.formatMessage({ id: "report.error.csrf_missing" }), {
        description: intl.formatMessage({ id: "report.error.csrf_refresh" }),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare report data with context
      const reportData = {
        reasons: data.reasons,
        exerciseId,
        lessonId,
        status,
        userId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      const token = await getToken();

      // Send report to API with CSRF protection
      const response = await apiClient.post("/api/reports", reportData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        // Success: Reset form and close modal
        reset();
        setOpen(false);

        // Show success toast
        toast.success(intl.formatMessage({ id: "report.success.message" }), {
          description: intl.formatMessage({ id: "report.success.description" }),
          duration: 4000,
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;
        const internalError = error.response?.data?.error;

        if (status === 403 && internalError?.includes("CSRF")) {
          toast.error(intl.formatMessage({ id: "report.error.csrf_invalid" }), {
            description: intl.formatMessage({
              id: "report.error.csrf_refresh",
            }),
            duration: 6000,
          });
          return;
        }

        toast.error(intl.formatMessage({ id: "report.error.title" }), {
          description:
            message || intl.formatMessage({ id: "report.error.generic" }),
          duration: 5000,
        });
      } else {
        // Unknown error type
        toast.error(intl.formatMessage({ id: "report.error.title" }), {
          description: intl.formatMessage({ id: "report.error.generic" }),
          duration: 5000,
        });
      }

      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle checkbox change
   * Updates the selected reasons array
   */
  const handleReasonChange = (reason: string, checked: boolean) => {
    const updated = checked
      ? [...selectedReasons, reason]
      : selectedReasons.filter((r) => r !== reason);
    setValue("reasons", updated);
  };

  /**
   * Get button color based on status
   */
  const getButtonColor = () => {
    return status === "success" ? "text-green-500" : "text-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <DialogTrigger asChild>
        <button
          className="flex gap-2 font-bold items-center hover:opacity-80 transition-opacity"
          aria-label={intl.formatMessage({ id: "report.button.aria_label" })}
        >
          <Flag
            strokeWidth={3}
            className={cn("w-8 h-8 md:w-4 md:h-4", getButtonColor())}
          />
          <span className={cn(getButtonColor(), " hidden md:flex")}>
            <FormattedMessage id="report.button.text" />
          </span>
        </button>
      </DialogTrigger>

      {/* Modal Content */}
      <DialogContent className="w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden CSRF token field */}
          {csrfToken && (
            <input type="hidden" name="csrf-token" value={csrfToken} />
          )}

          <DialogHeader>
            <DialogTitle>
              <FormattedMessage id="report.modal.title" />
            </DialogTitle>
          </DialogHeader>

          {/* Reasons Selection */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <FormattedMessage id="report.modal.description" />
            </p>

            {reasonsList.map((reasonKey) => {
              const isChecked = selectedReasons.includes(reasonKey);
              return (
                <label
                  key={reasonKey}
                  className="flex items-start gap-3 cursor-pointer p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleReasonChange(reasonKey, checked as boolean)
                    }
                    className="mt-0.5"
                  />
                  <span className="text-sm leading-relaxed">
                    <FormattedMessage id={reasonKey} />
                  </span>
                </label>
              );
            })}

            {/* Validation Error */}
            {errors.reasons && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <FormattedMessage id="report.validation.select_reason" />
              </p>
            )}

            {/* CSRF Token Missing Warning */}
            {!csrfToken && (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <FormattedMessage id="report.warning.csrf_loading" />
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              <FormattedMessage id="common.cancel" />
            </Button>

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 flex-1"
              disabled={
                isSubmitting || selectedReasons.length === 0 || !csrfToken
              }
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              <FormattedMessage id="report.button.submit" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
