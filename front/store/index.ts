import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import userReducer from "./userSlice";
import progressReducer from "./progressSlice";
import lessonsReducer from "./lessonsSlice";
import settingsReducer from "./settingsSlice";
import { persistStore, persistReducer } from "redux-persist";
import type { WebStorage } from "redux-persist";
import { useDispatch } from "react-redux";

type UniversalStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const isServer = typeof window === "undefined";

if (isServer) {
  const globalScope = globalThis as unknown as {
    localStorage?: {
      getItem?: (key: string) => string | null;
      setItem?: (key: string, value: string) => void;
      removeItem?: (key: string) => void;
      clear?: () => void;
      key?: (index: number) => string | null;
      length?: number;
    };
  };

  if (
    typeof globalScope.localStorage !== "object" ||
    typeof globalScope.localStorage?.getItem !== "function"
  ) {
    const noop = () => null;
    const noops = () => {};
    globalScope.localStorage = {
      getItem: noop,
      setItem: noops,
      removeItem: noops,
      clear: noops,
      key: noop,
      length: 0,
    };
  }
}

const createStorage = (): UniversalStorage => {
  if (isServer) {
    return {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    };
  }

  return {
    getItem: async (key) => window.localStorage.getItem(key),
    setItem: async (key, value) => {
      window.localStorage.setItem(key, value);
    },
    removeItem: async (key) => {
      window.localStorage.removeItem(key);
    },
  };
};

const storage = createStorage() as unknown as WebStorage;

const rootReducer = combineReducers({
  user: userReducer,
  progress: progressReducer,
  lessons: lessonsReducer,
  settings: settingsReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "progress", "settings", "lessons"], // Only persist these reducers
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type AppDispatch = typeof store.dispatch; //app dsipatch type
export const persistor = persistStore(store);
export const useAppDispatch = () => useDispatch<AppDispatch>();
export type IRootState = ReturnType<typeof store.getState>; // store type
