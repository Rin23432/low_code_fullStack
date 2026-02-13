module.exports = {
  webpack: {
    configure(webpackConfig) {
      if (webpackConfig.mode === 'production') {
        // 抽离公共代码，只在生产环境
        if (webpackConfig.optimization == null) {
          webpackConfig.optimization = {};
        }
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            // 保留 antd 拆分（不影响 React 核心）
            antd: {
              name: 'antd-chunk',
              test: /[\\/]node_modules[\\/]antd[\\/]/, // 更精确的匹配，避免误判
              priority: 100,
            },
            // 合并 React 相关核心依赖到同一个 chunk（关键修复）
            react: {
              name: 'react-chunk',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/, // 包含所有 React 核心包
              priority: 99,
            },
            // 其他第三方依赖
            vendors: {
              name: 'vendors-chunk',
              test: /[\\/]node_modules[\\/]/,
              priority: 98,
              // 排除已被上面的 cacheGroups 处理的模块
              reuseExistingChunk: true,
            },
          },
        };
      }
      return webpackConfig;
    },
  },

  devServer: {
    port: 8000, // B 端，前端
    proxy: {
      '/api': 'http://localhost:3001', // Mock
    },
  },
};
