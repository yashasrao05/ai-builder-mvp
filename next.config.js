/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable if you need any experimental features
  },
  // Ensure CSS is properly handled
  webpack: (config, { isServer }) => {
    // Handle CSS imports properly
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
