import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Relax strict rules to reduce blocking errors during development
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Text content often contains apostrophes; this is safe in our pages
      "react/no-unescaped-entities": "off",
      // Allow require() where needed in the codebase
      "@typescript-eslint/no-require-imports": "off",
      // Prefer but don't enforce Next Image in all cases
      "@next/next/no-img-element": "warn",
      // Keep hooks dependency warnings informative, not blocking
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
