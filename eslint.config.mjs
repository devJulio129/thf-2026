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
    // Los prototipos originales se sirven tal cual y traen bundles minificados.
    // No son codigo nuestro y no tiene sentido lintearlos.
    "public/prototipo/**",
    // Scratch del CLI de Supabase.
    "supabase/.temp/**",
  ]),
]);

export default eslintConfig;
