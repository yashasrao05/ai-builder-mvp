/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  
  // Optimize for Vercel deployment
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  
  // Environment variables validation
  env: {
    CUSTOM_APP_NAME: 'AI Website Builder',
    DEPLOYMENT_URL: process.env.VERCEL_URL || 'localhost:3000',
  },
  
  // Redirect root to builder
  async redirects() {
    return [
      {
        source: '/',
        destination: '/',
        permanent: false,
      },
    ];
  },
  
  // API routes optimization
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
