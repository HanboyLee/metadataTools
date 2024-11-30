/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb'
    }
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'exiftool-vendored'];
    return config;
  },
  // Server configuration
  server: {
    host: '0.0.0.0'
  }
}

module.exports = nextConfig
