const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

class PerformanceTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
  }

  async init() {
    console.log("🚀 启动浏览器...");
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
    });
    this.page = await this.browser.newPage();

    // 启用性能监控
    await this.page.setCacheEnabled(false);
    await this.page.setRequestInterception(true);

    this.page.on("request", (request) => {
      request.continue();
    });
  }

  async measurePageLoad(url, label) {
    console.log(`📊 测试 ${label}: ${url}`);

    const startTime = Date.now();

    // 导航到页面
    await this.page.goto(url, { waitUntil: "networkidle0" });

    // 等待页面完全加载
    await this.page.waitForTimeout(2000);

    // 获取性能指标
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const paint = performance.getEntriesByType("paint");

      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find((p) => p.name === "first-paint")?.startTime || 0,
        firstContentfulPaint:
          paint.find((p) => p.name === "first-contentful-paint")?.startTime ||
          0,
        totalTime: navigation.loadEventEnd - navigation.navigationStart,
      };
    });

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    const result = {
      label,
      url,
      timestamp: new Date().toISOString(),
      performanceMetrics,
      totalTime,
      success: true,
    };

    this.results.push(result);
    console.log(`✅ ${label} 测试完成: ${totalTime}ms`);

    return result;
  }

  async testBFFPerformance() {
    console.log("\n🔍 测试 BFF 性能...");

    // 测试 BFF API 响应时间
    const apiStart = Date.now();
    const response = await this.page.evaluate(async () => {
      const start = performance.now();
      const res = await fetch("/api/bff/question/test123");
      const end = performance.now();
      return {
        status: res.status,
        responseTime: end - start,
      };
    });

    const apiEnd = Date.now();
    const apiResult = {
      label: "BFF API 测试",
      url: "/api/bff/question/test123",
      timestamp: new Date().toISOString(),
      performanceMetrics: {
        apiResponseTime: response.responseTime,
        totalTime: apiEnd - apiStart,
      },
      totalTime: apiEnd - apiStart,
      success: response.status === 200,
    };

    this.results.push(apiResult);
    console.log(`✅ BFF API 测试完成: ${response.responseTime.toFixed(2)}ms`);
  }

  async testSSRPerformance() {
    console.log("\n🌐 测试 SSR 性能...");

    // 测试 SSR 页面加载
    await this.measurePageLoad(
      "http://localhost:3000/question/test123",
      "SSR 页面加载"
    );

    // 测试客户端导航性能
    await this.page.goto("http://localhost:3000", {
      waitUntil: "networkidle0",
    });
    await this.page.waitForTimeout(1000);

    const navigationStart = Date.now();
    await this.page.click('a[href*="/question/"]');
    await this.page.waitForSelector("h1", { timeout: 10000 });
    const navigationEnd = Date.now();

    const navigationResult = {
      label: "SSR 客户端导航",
      url: "Navigation to question page",
      timestamp: new Date().toISOString(),
      performanceMetrics: {
        navigationTime: navigationEnd - navigationStart,
      },
      totalTime: navigationEnd - navigationStart,
      success: true,
    };

    this.results.push(navigationResult);
    console.log(
      `✅ SSR 客户端导航测试完成: ${navigationEnd - navigationStart}ms`
    );
  }

  async testCSRPerformance() {
    console.log("\n💻 测试 CSR 性能...");

    // 测试纯客户端渲染页面
    await this.measurePageLoad(
      "http://localhost:3000/performance-test",
      "CSR 页面加载"
    );
  }

  async generateReport() {
    console.log("\n📋 生成性能报告...");

    const report = {
      summary: {
        totalTests: this.results.length,
        successfulTests: this.results.filter((r) => r.success).length,
        failedTests: this.results.filter((r) => !r.success).length,
        timestamp: new Date().toISOString(),
      },
      results: this.results,
      analysis: this.analyzeResults(),
    };

    // 保存报告到文件
    const reportPath = path.join(__dirname, "performance-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📄 性能报告已保存到: ${reportPath}`);

    // 打印摘要
    this.printSummary(report);

    return report;
  }

  analyzeResults() {
    const ssrResults = this.results.filter((r) => r.label.includes("SSR"));
    const bffResults = this.results.filter((r) => r.label.includes("BFF"));
    const csrResults = this.results.filter((r) => r.label.includes("CSR"));

    const analysis = {
      ssr: {
        averageLoadTime: 0,
        averageNavigationTime: 0,
      },
      bff: {
        averageResponseTime: 0,
      },
      csr: {
        averageLoadTime: 0,
      },
    };

    if (ssrResults.length > 0) {
      const loadTimes = ssrResults
        .filter((r) => r.label.includes("页面加载"))
        .map((r) => r.totalTime);
      analysis.ssr.averageLoadTime =
        loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;

      const navigationTimes = ssrResults
        .filter((r) => r.label.includes("客户端导航"))
        .map((r) => r.performanceMetrics.navigationTime);
      if (navigationTimes.length > 0) {
        analysis.ssr.averageNavigationTime =
          navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;
      }
    }

    if (bffResults.length > 0) {
      const responseTimes = bffResults.map(
        (r) => r.performanceMetrics.apiResponseTime
      );
      analysis.bff.averageResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    }

    if (csrResults.length > 0) {
      const loadTimes = csrResults.map((r) => r.totalTime);
      analysis.csr.averageLoadTime =
        loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    }

    return analysis;
  }

  printSummary(report) {
    console.log("\n📊 性能测试摘要");
    console.log("=".repeat(50));
    console.log(`总测试数: ${report.summary.totalTests}`);
    console.log(`成功: ${report.summary.successfulTests}`);
    console.log(`失败: ${report.summary.failedTests}`);

    if (report.analysis.ssr.averageLoadTime > 0) {
      console.log(
        `\n🌐 SSR 平均页面加载时间: ${report.analysis.ssr.averageLoadTime.toFixed(
          2
        )}ms`
      );
    }

    if (report.analysis.ssr.averageNavigationTime > 0) {
      console.log(
        `🌐 SSR 平均客户端导航时间: ${report.analysis.ssr.averageNavigationTime.toFixed(
          2
        )}ms`
      );
    }

    if (report.analysis.bff.averageResponseTime > 0) {
      console.log(
        `🔍 BFF 平均响应时间: ${report.analysis.bff.averageResponseTime.toFixed(
          2
        )}ms`
      );
    }

    if (report.analysis.csr.averageLoadTime > 0) {
      console.log(
        `💻 CSR 平均页面加载时间: ${report.analysis.csr.averageLoadTime.toFixed(
          2
        )}ms`
      );
    }

    // 性能对比
    if (
      report.analysis.ssr.averageLoadTime > 0 &&
      report.analysis.csr.averageLoadTime > 0
    ) {
      const improvement =
        ((report.analysis.csr.averageLoadTime -
          report.analysis.ssr.averageLoadTime) /
          report.analysis.csr.averageLoadTime) *
        100;
      console.log(`\n🚀 SSR 相比 CSR 性能提升: ${improvement.toFixed(1)}%`);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    try {
      await this.init();

      console.log("🎯 开始性能测试...\n");

      // 运行所有测试
      await this.testBFFPerformance();
      await this.testSSRPerformance();
      await this.testCSRPerformance();

      // 生成报告
      await this.generateReport();

      console.log("\n🎉 所有测试完成！");
    } catch (error) {
      console.error("❌ 测试过程中发生错误:", error);
    } finally {
      await this.cleanup();
    }
  }
}

// 主函数
async function main() {
  const tester = new PerformanceTester();
  await tester.runAllTests();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = PerformanceTester;
