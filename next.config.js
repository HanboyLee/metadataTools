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
  }
}

module.exports = nextConfig
