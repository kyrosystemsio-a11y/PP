import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // BaptismSpinnerHero uses intentional Three.js imperative patterns that
  // conflict with React 19's stricter hook rules (per-frame mutation of
  // scene objects, r3f gl/camera configuration, object-keyed copy refs).
  {
    files: ["src/components/BaptismSpinnerHero.tsx"],
    rules: {
      "react-hooks/use-memo": "off",
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "prefer-const": "off",
    },
  },
]);

export default eslintConfig;
