import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignorar erros de ESLint durante o build de produção
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros de TypeScript durante o build de produção
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
