// This slice manages user-related state like subscription, hearts, XP, etc.

import { apiClient } from "@/lib/api-client";
import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";

// Define user subscription types
export type SubscriptionType = "free" | "premium";

// Define user state interface
export interface UserState {
  xp: number;
  gems: number; // Added gems property
  gel: number; // Added gel property
  hearts: number;
  streak: number;
  loading: boolean;
  error: string | null;
}

// Initial state for the user
const initialState: UserState = {
  xp: 0,
  gems: 0, // Initialize with 250 gems
  gel: 0, // Initialize with 15 gel
  hearts: 5,
  streak: 0,
  loading: false,
  error: null,
};

export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async ({ userId, token }: { userId: string; token: string }, thunkAPI) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch user data" + error);
    }
  }
);

// Create the user slice
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Action to log out a user
    logout: () => {
      return initialState;
    },

    // Action to add XP
    addXp: (state, action: PayloadAction<number>) => {
      state.xp += action.payload;
    },

    // Action to update hearts
    updateHearts: (state, action: PayloadAction<number>) => {
      state.hearts = Math.max(0, Math.min(5, state.hearts + action.payload));
    },

    // Action to increment streak
    incrementStreak: (state) => {
      state.streak += 1;
    },

    // Action to reset streak
    resetStreak: (state) => {
      state.streak = 0;
    },

    // Action to add gems
    addGems: (state, action: PayloadAction<number>) => {
      state.gems += action.payload;
    },

    // Action to remove gems
    removeGems: (state, action: PayloadAction<number>) => {
      state.gems = Math.max(0, state.gems - action.payload);
    },

    // Action to set gems (for admin purposes)
    setGems: (state, action: PayloadAction<number>) => {
      state.gems = Math.max(0, action.payload);
    },

    // Action to add gel
    addGel: (state, action: PayloadAction<number>) => {
      state.gel += action.payload;
    },

    // Action to remove gel
    removeGel: (state, action: PayloadAction<number>) => {
      state.gel = Math.max(0, state.gel - action.payload);
    },

    // Action to set gel (for admin purposes)
    setGel: (state, action: PayloadAction<number>) => {
      state.gel = Math.max(0, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state: UserState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserData.fulfilled,
        (state: UserState, action: PayloadAction<UserState>) => {
          // Overwrite the entire state with fetched data
          return {
            ...action.payload,
            loading: false,
            error: null,
          };
        }
      )
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;

        if (action.payload) {
          // payload exists only if you used rejectWithValue in the thunk
          state.error = action.payload as string;
        } else {
          // fallback error message from error object
          state.error = action.error.message ?? "Unknown error";
        }
      });
  },
});

// Export actions and reducer
export const {
  addXp,
  addGems,
  removeGems,
  setGems,
  addGel,
  removeGel,
  setGel,
  updateHearts,
  incrementStreak,
  resetStreak,
} = userSlice.actions;

export default userSlice.reducer;
