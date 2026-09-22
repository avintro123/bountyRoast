import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // In React 19 / Next.js 16, client hydration effects (reading URL params
      // or localStorage on mount) trigger compiler optimization hints.
      // We set them to 'warn' so CI checks for real syntax/code errors without
      // blocking builds on client-side state synchronization.

      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/immutability": "warn",
      "@next/next/no-img-element": "warn",
    },
  },

  // Ignore build artifacts and generated files
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
