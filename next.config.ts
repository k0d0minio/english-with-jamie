import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind v4 is compiled by Turbopack via this loader (no PostCSS config in this project).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  outputFileTracingIncludes: {
    "/reference/grammar/[slug]": ["./src/content/grammar/**/*"],
    "/reference/grammar": ["./src/content/grammar/**/*"],
  },
};

export default nextConfig;
