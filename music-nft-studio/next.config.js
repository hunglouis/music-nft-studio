/** @type {import('next').NextConfig} */
const nextConfig = {
  // Chuyển eslint vào đúng đối tượng của nó
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
}
module.exports = nextConfig