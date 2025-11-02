import { apiClient } from "@/lib/api-client";
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

// ==========================================
// TYPES & INTERFACES
// ==========================================

/**
 * Interface for hearts currency configuration
 * Defines how hearts work in the application
 */
interface HeartsCurrency {
  gemsCost: number; // Cost in gems to purchase hearts
  maxAmount: number; // Maximum hearts a user can have
  refillTimeHours: number; // Hours between automatic heart refills
  enabled: boolean; // Whether hearts system is enabled
}

/**
 * Interface for gems currency configuration
 * Defines how gems work in the application
 */
interface GemsCurrency {
  exchangeRate: number; // Rate for converting real money to gems
  enabled: boolean; // Whether gems system is enabled
  dailyBonus: number; // Daily bonus gems amount
}

/**
 * Interface for currency settings
 * Contains all currency-related configurations
 */
interface CurrencySettings {
  hearts: HeartsCurrency;
  gems: GemsCurrency;
  defaultCurrency: string; // Default currency for payments (USD, EUR, etc.)
}

/**
 * Interface for general application settings
 * Contains global app configurations
 */
interface GeneralSettings {
  enablePayments: boolean; // Whether payment system is enabled
  testMode: boolean; // Whether app is in test/development mode
  companyName: string; // Company/app name for branding
}

/**
 * Main settings state interface
 * Contains all application settings
 */
interface SettingsState {
  currencies: CurrencySettings;
  general: GeneralSettings;
  loading: boolean; // Loading state for async operations
  error: string | null; // Error message if any operation fails
  initialized: boolean; // Whether settings have been loaded initially
}

// ==========================================
// INITIAL STATE
// ==========================================

/**
 * Initial state for settings
 * Provides default values before API data is loaded
 */
const initialState: SettingsState = {
  currencies: {
    hearts: {
      gemsCost: 500,
      maxAmount: 5,
      refillTimeHours: 5,
      enabled: true,
    },
    gems: {
      exchangeRate: 100,
      enabled: true,
      dailyBonus: 5,
    },
    defaultCurrency: "USD",
  },
  general: {
    enablePayments: true,
    testMode: true,
    companyName: "TULU",
  },
  loading: false,
  error: null,
  initialized: false,
};

// ==========================================
// ASYNC THUNKS
// ==========================================

/**
 * Async thunk to fetch settings from the API
 * Makes a GET request to /api/shop/settings to retrieve current settings
 *
 * @returns Promise<SettingsState> - The settings data from the API
 * @throws Will throw an error if the API request fails
 */
export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async ({ token }: { token: string }, thunkAPI) => {
    try {
      const response = await apiClient.get(`/api/shop`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data.settings;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch settings " + error);
    }
  }
);

/**
 * Async thunk to update settings via API
 * Makes a PUT request to /api/shop/settings to update settings
 *
 * @param settingsData - Partial settings data to update
 * @returns Promise<SettingsState> - The updated settings data from the API
 * @throws Will throw an error if the API request fails
 */
export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async (
    settingsData: Partial<
      Omit<SettingsState, "loading" | "error" | "initialized">
    >,
    { rejectWithValue }
  ) => {
    try {
      console.log("🔄 Updating settings via API...", settingsData);

      // Make API request to update settings
      const response = await fetch("/api/shop/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsData),
      });

      // Check if response is successful
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Parse response data
      const data = await response.json();
      console.log("✅ Settings updated successfully:", data);

      return data;
    } catch (error) {
      console.error("❌ Error updating settings:", error);

      // Return a rejected value with error message
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update settings";
      return rejectWithValue(errorMessage);
    }
  }
);

// ==========================================
// SETTINGS SLICE
// ==========================================

/**
 * Settings slice using Redux Toolkit
 * Manages application settings state with async operations
 */
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    /**
     * Clear any error messages
     * Used to reset error state after user acknowledgment
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Update hearts currency settings locally
     * Used for optimistic updates before API confirmation
     *
     * @param action - Action containing partial hearts settings
     */
    updateHeartsCurrency: (
      state,
      action: PayloadAction<Partial<HeartsCurrency>>
    ) => {
      state.currencies.hearts = {
        ...state.currencies.hearts,
        ...action.payload,
      };
    },

    /**
     * Update gems currency settings locally
     * Used for optimistic updates before API confirmation
     *
     * @param action - Action containing partial gems settings
     */
    updateGemsCurrency: (
      state,
      action: PayloadAction<Partial<GemsCurrency>>
    ) => {
      state.currencies.gems = {
        ...state.currencies.gems,
        ...action.payload,
      };
    },

    /**
     * Update general settings locally
     * Used for optimistic updates before API confirmation
     *
     * @param action - Action containing partial general settings
     */
    updateGeneralSettings: (
      state,
      action: PayloadAction<Partial<GeneralSettings>>
    ) => {
      state.general = {
        ...state.general,
        ...action.payload,
      };
    },

    /**
     * Reset settings to initial state
     * Used for logout or reset functionality
     */
    resetSettings: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // ==========================================
    // FETCH SETTINGS CASES
    // ==========================================

    /**
     * Handle pending state for fetchSettings
     * Sets loading to true and clears any previous errors
     */
    builder.addCase(fetchSettings.pending, (state) => {
      state.loading = true;
      state.error = null;
      console.log("⏳ Fetching settings - pending...");
    });

    /**
     * Handle fulfilled state for fetchSettings
     * Updates state with fetched data and sets loading to false
     */
    builder.addCase(fetchSettings.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.initialized = true;

      // Update settings with API data

      state.currencies.defaultCurrency = action.payload.defaultCurrency;

      state.currencies.hearts.enabled = action.payload.heartsEnabled;
      state.currencies.hearts.gemsCost = action.payload.gemsCost;
      state.currencies.hearts.maxAmount = action.payload.maxHearts;
      state.currencies.hearts.refillTimeHours =
        action.payload.heartRefillTimeHours;

      state.currencies.gems.dailyBonus = action.payload.gemsDailyBonus;
      state.currencies.gems.enabled = action.payload.gemsEnabled;
      state.currencies.gems.exchangeRate = action.payload.gemExchangeRate;

      state.general.companyName = action.payload.companyName;
      state.general.testMode = action.payload.testMode;
      state.general.enablePayments = action.payload.paymentsEnabled;

      console.log("✅ Settings fetch completed successfully");
    });

    /**
     * Handle rejected state for fetchSettings
     * Sets error message and stops loading
     */
    builder.addCase(fetchSettings.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Failed to fetch settings";
      state.initialized = true; // Still mark as initialized to prevent infinite loading
      console.log("❌ Settings fetch failed:", state.error);
    });

    // ==========================================
    // UPDATE SETTINGS CASES
    // ==========================================

    /**
     * Handle pending state for updateSettings
     * Sets loading to true and clears any previous errors
     */
    builder.addCase(updateSettings.pending, (state) => {
      state.loading = true;
      state.error = null;
      console.log("⏳ Updating settings - pending...");
    });

    /**
     * Handle fulfilled state for updateSettings
     * Updates state with new data from API response
     */
    builder.addCase(updateSettings.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      // Update settings with API response data
      if (action.payload.currencies) {
        state.currencies = action.payload.currencies;
      }
      if (action.payload.general) {
        state.general = action.payload.general;
      }

      console.log("✅ Settings update completed successfully");
    });

    /**
     * Handle rejected state for updateSettings
     * Sets error message and stops loading
     */
    builder.addCase(updateSettings.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Failed to update settings";
      console.log("❌ Settings update failed:", state.error);
    });
  },
});

// ==========================================
// EXPORTS
// ==========================================

// Export actions for use in components
export const {
  clearError,
  updateHeartsCurrency,
  updateGemsCurrency,
  updateGeneralSettings,
  resetSettings,
} = settingsSlice.actions;

// Export reducer for store configuration
export default settingsSlice.reducer;

// ==========================================
// SELECTORS
// ==========================================

/**
 * Selector to get all settings state
 * @param state - Root state
 * @returns Complete settings state
 */
export const selectSettings = (state: { settings: SettingsState }) =>
  state.settings;

/**
 * Selector to get currency settings
 * @param state - Root state
 * @returns Currency settings object
 */
export const selectCurrencySettings = (state: { settings: SettingsState }) =>
  state.settings.currencies;

/**
 * Selector to get hearts currency settings
 * @param state - Root state
 * @returns Hearts currency configuration
 */
export const selectHeartsCurrency = (state: { settings: SettingsState }) =>
  state.settings.currencies.hearts;

/**
 * Selector to get gems currency settings
 * @param state - Root state
 * @returns Gems currency configuration
 */
export const selectGemsCurrency = (state: { settings: SettingsState }) =>
  state.settings.currencies.gems;

/**
 * Selector to get general settings
 * @param state - Root state
 * @returns General settings object
 */
export const selectGeneralSettings = (state: { settings: SettingsState }) =>
  state.settings.general;

/**
 * Selector to get loading state
 * @param state - Root state
 * @returns Boolean indicating if settings are being loaded
 */
export const selectSettingsLoading = (state: { settings: SettingsState }) =>
  state.settings.loading;

/**
 * Selector to get error state
 * @param state - Root state
 * @returns Error message or null
 */
export const selectSettingsError = (state: { settings: SettingsState }) =>
  state.settings.error;

/**
 * Selector to check if settings are initialized
 * @param state - Root state
 * @returns Boolean indicating if settings have been loaded initially
 */
export const selectSettingsInitialized = (state: { settings: SettingsState }) =>
  state.settings.initialized;
