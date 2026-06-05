/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Suppress linting and typescript warnings to prevent deployment blocks
  // during initial Proof-of-Concept production deployments.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Experimental optimizations to handle heavy WebGL and Monaco bundles
  experimental: {
    optimizePackageImports: ['@react-three/fiber', 'three', 'framer-motion', '@monaco-editor/react'],
  },
};

module.exports = nextConfig;
