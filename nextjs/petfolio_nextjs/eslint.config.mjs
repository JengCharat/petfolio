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
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off", // อนุญาต @ts-ignore, @ts-nocheck
    },
    overrides: [
      {
        files: ["./app/services/pet_page_service.tsx"],
        rules: {
          "@typescript-eslint/no-explicit-any": "off", // ปิด error any สำหรับไฟล์นี้
        },
      },
    ],
  },
];

export default eslintConfig;
