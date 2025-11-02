"use client";

/**
 * CSRF-Protected Form Component
 *
 * A wrapper component that automatically handles CSRF token inclusion
 * in forms. Use this instead of regular <form> elements for protection.
 */

import type React from "react";
import type { FormHTMLAttributes } from "react";
import { useCSRF } from "@/hooks/use-csrf";
import { Loader2 } from "lucide-react";

interface CSRFFormProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    csrfToken: string | null
  ) => void;
  children: React.ReactNode;
  showLoadingState?: boolean;
}

/**
 * Form component with automatic CSRF protection
 *
 * Features:
 * - Automatic CSRF token inclusion
 * - Loading state management
 * - Error handling for missing tokens
 * - TypeScript support
 */
export function CSRFForm({
  onSubmit,
  children,
  showLoadingState = true,
  ...formProps
}: CSRFFormProps) {
  const { token, isLoading, error } = useCSRF();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token && !isLoading) {
      console.error("CSRF token not available");
      return;
    }

    onSubmit(event, token);
  };

  if (isLoading && showLoadingState) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading security token...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Security token error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 underline"
        >
          Refresh page
        </button>
      </div>
    );
  }

  return (
    <form {...formProps} onSubmit={handleSubmit}>
      {/* Hidden CSRF token field */}
      {token && <input type="hidden" name="csrf-token" value={token} />}
      {children}
    </form>
  );
}
