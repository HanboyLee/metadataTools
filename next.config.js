/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  api: {
    bodyParser: false, // Disable the default body parser for the upload endpoint
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'exiftool-vendored'];
    return config;
  }
}

module.exports = nextConfig
