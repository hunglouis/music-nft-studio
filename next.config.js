/** @type {import('next').NextConfig} */
const nextConfig = {
  // Chuyển eslint vào đúng đối tượng của nó
  typescript: {
    ignoreBuildErrors: true 
  },
}
module.exports = nextConfig
// next.config.js
module.exports = {
  experimental: {
    turbo: {
      // Cấu hình các tùy chọn nâng cao nếu cần
    },
  },
};

