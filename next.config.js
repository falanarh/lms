/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8080/auth/:path*',
      },
    ]
  },
}

module.exports = nextConfig