"use server";

const ensureServerStorage = () => {
  if (typeof window !== "undefined") {
    return;
  }

  const globalScope = globalThis as unknown as {
    localStorage?: {
      getItem: (key: string) => string | null;
      setItem: (key: string, value: string) => void;
      removeItem: (key: string) => void;
      clear: () => void;
      key: (index: number) => string | null;
      readonly length: number;
    };
  };

  if (
    typeof globalScope.localStorage === "object" &&
    typeof globalScope.localStorage?.getItem === "function" &&
    typeof globalScope.localStorage?.setItem === "function"
  ) {
    return;
  }

  const store = new Map<string, string>();

  globalScope.localStorage = {
    getItem: (key: string) => {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem: (key: string, value: string) => {
      store.set(String(key), String(value));
    },
    removeItem: (key: string) => {
      store.delete(String(key));
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] ?? null;
    },
    get length() {
      return store.size;
    },
  };
};

ensureServerStorage();
