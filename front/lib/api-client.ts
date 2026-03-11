/**
 * Enhanced API Client with CSRF Protection
 *
 * Provides a configured axios instance with automatic CSRF token handling.
 * All requests will include CSRF tokens when available.
 */

import axios, { type AxiosInstance } from "axios";

const API_PROXY_PREFIX = "/_api";
const API_TIMEOUT_MS = 15000;
const CSRF_TOKEN_TTL_MS = 5 * 60 * 1000;

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const isBrowser = typeof window !== "undefined";
const proxyEnv = process.env.NEXT_PUBLIC_USE_API_PROXY;
const useApiProxy =
  isBrowser &&
  (proxyEnv === "true" ||
    (typeof proxyEnv === "undefined" && process.env.NODE_ENV === "development"));

const getBrowserSafeBaseURL = () => {
  if (useApiProxy) {
    return API_PROXY_PREFIX;
  }
  if (configuredApiUrl) {
    return configuredApiUrl;
  }
  return "http://127.0.0.1:3001";
};

const absoluteApiOrigin = (() => {
  if (!configuredApiUrl) return null;
  try {
    return new URL(configuredApiUrl).origin;
  } catch {
    return null;
  }
})();

let csrfTokenCache: { token: string; expiresAt: number } | null = null;
let csrfTokenPromise: Promise<string | null> | null = null;

function getCsrfEndpoint(): string {
  if (useApiProxy) {
    return `${API_PROXY_PREFIX}/api/csrf`;
  }
  if (configuredApiUrl) {
    return `${configuredApiUrl}/api/csrf`;
  }
  return "/api/csrf";
}

async function getCsrfToken(): Promise<string | null> {
  const now = Date.now();
  if (csrfTokenCache && csrfTokenCache.expiresAt > now) {
    return csrfTokenCache.token;
  }

  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }

  csrfTokenPromise = axios
    .get(getCsrfEndpoint(), {
      withCredentials: true,
      timeout: 5000,
    })
    .then((response) => {
      if (response.data?.success && response.data?.token) {
        const token = response.data.token as string;
        csrfTokenCache = {
          token,
          expiresAt: Date.now() + CSRF_TOKEN_TTL_MS,
        };
        return token;
      }
      return null;
    })
    .catch((error) => {
      console.warn("Failed to get CSRF token for request:", error);
      return null;
    })
    .finally(() => {
      csrfTokenPromise = null;
    });

  return csrfTokenPromise;
}

/**
 * Create an axios instance with CSRF protection
 */
export function createAPIClient(): AxiosInstance {
  const client = axios.create({
    baseURL: getBrowserSafeBaseURL(),
    withCredentials: true, // Include cookies for CSRF tokens
    timeout: API_TIMEOUT_MS,
  });

  // Request interceptor to add CSRF token
  client.interceptors.request.use(
    async (config) => {
      // Browser-side: normalize absolute API urls to same-origin proxy urls.
      // This avoids cross-origin preflights and keeps cookies/session handling local.
      if (
        useApiProxy &&
        absoluteApiOrigin &&
        typeof config.url === "string" &&
        config.url.startsWith(absoluteApiOrigin)
      ) {
        config.url = config.url.replace(absoluteApiOrigin, API_PROXY_PREFIX);
      }

      // Skip CSRF for GET, HEAD, OPTIONS requests
      if (
        ["get", "head", "options"].includes(config.method?.toLowerCase() || "")
      ) {
        return config;
      }

      // Skip CSRF for webhook endpoints
      if (config.url?.includes("/webhooks/")) {
        return config;
      }

      const existingToken =
        config.headers?.["x-csrf-token"] ?? config.headers?.["X-CSRF-Token"];
      if (existingToken) {
        return config;
      }

      const token = await getCsrfToken();
      if (token) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers["x-csrf-token"] = token;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle CSRF errors specifically
      if (
        error.response?.status === 403 &&
        error.response?.data?.error?.includes("CSRF")
      ) {
        console.error("CSRF validation failed. Page refresh may be required.");
        // You could trigger a page refresh or show a specific error message here
      }

      return Promise.reject(error);
    }
  );

  return client;
}

// Export a default configured client
export const apiClient = createAPIClient();
