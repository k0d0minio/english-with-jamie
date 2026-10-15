import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/reference/grammar/[slug]": ["./src/content/grammar/**/*"],
    "/reference/grammar": ["./src/content/grammar/**/*"],
  },
};

export default nextConfig;
