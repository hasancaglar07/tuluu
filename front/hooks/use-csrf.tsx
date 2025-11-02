"use client";

/**
 * CSRF Hook for React Components
 *
 * Provides CSRF token management for client-side forms and API requests.
 * Automatically fetches and manages CSRF tokens with proper error handling.
 */

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface CSRFState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for CSRF token management
 *
 * Features:
 * - Automatic token fetching on mount
 * - Token refresh functionality
 * - Loading and error states
 * - Memoized callbacks for performance
 */
export function useCSRF() {
  const [state, setState] = useState<CSRFState>({
    token: null,
    isLoading: true,
    error: null,
  });

  /**
   * Fetch CSRF token from the server
   */
  const fetchToken = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/csrf",
        {
          withCredentials: true, // Include cookies
        }
      );

      if (response.data.success) {
        setState({
          token: response.data.token,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.data.error || "Failed to fetch CSRF token");
      }
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      setState({
        token: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, []);

  /**
   * Refresh the CSRF token
   */
  const refreshToken = useCallback(() => {
    fetchToken();
  }, [fetchToken]);

  /**
   * Get headers with CSRF token for API requests
   */
  const getCSRFHeaders = useCallback(() => {
    if (!state.token) {
      return {};
    }

    return {
      "x-csrf-token": state.token,
    };
  }, [state.token]);

  /**
   * Create form data with CSRF token
   */
  const addCSRFToFormData = useCallback(
    (formData: FormData) => {
      if (state.token) {
        formData.append("csrf-token", state.token);
      }
      return formData;
    },
    [state.token]
  );

  // Fetch token on mount
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  return {
    token: state.token,
    isLoading: state.isLoading,
    error: state.error,
    refreshToken,
    getCSRFHeaders,
    addCSRFToFormData,
  };
}
