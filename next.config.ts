import type { NextConfig } from "next";

// Every route that renders markdown from content/ must have the folder traced into its
// serverless bundle; readdir() is not statically traceable.
const content = ["./content/**/*"];
const contentRoutes = [
  "/",
  "/lessons",
  "/lessons/[slug]",
  "/live",
  "/api/live",
  "/api/live/answers",
  "/homework",
  "/teach/results",
  "/reference",
  "/reference/grammar",
  "/reference/grammar/[slug]",
  "/reference/recommendations",
  "/reference/watch",
  "/reference/read",
];

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
  outputFileTracingIncludes: Object.fromEntries(contentRoutes.map((r) => [r, content])),
};

export default nextConfig;
