/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PORT: "3000", // 保持字符串类型
    BACKEND_HOST: "http://localhost:3001", // 后端服务地址
  },

  // 新增：添加安全响应头（解决 x-content-type-options 提示）
  async headers() {
    return [
      {
        source: "/:path*", // 对所有路由生效
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // 防止 MIME 类型嗅探
          },
          {
            key: "X-Frame-Options",
            value: "DENY", // 防止点击劫持
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block", // XSS 保护
          },
        ],
      },
    ];
  },

  // 性能优化
  compress: true,
  poweredByHeader: false,

  // 图片优化
  images: {
    domains: ["localhost"],
  },

  // 实验性功能
  experimental: {
    swcMinify: true,
  },
};

module.exports = nextConfig;
