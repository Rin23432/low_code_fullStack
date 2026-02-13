import React, { useEffect, useState } from "react";
import Head from "next/head";

export default function Performance() {
  const [metrics, setMetrics] = useState<any>({});
  const [bffMetrics, setBffMetrics] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // 等待页面完全加载后再收集指标
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType("navigation")[0] as any;
      const paintEntries = performance.getEntriesByType(
        "paint"
      ) as PerformanceEntry[];
      const resourceEntries = performance.getEntriesByType(
        "resource"
      ) as PerformanceEntry[];

      const firstPaint = paintEntries.find(
        (p) => p.name === "first-paint"
      ) as any;
      const fcp = paintEntries.find(
        (p) => p.name === "first-contentful-paint"
      ) as any;

      // 计算关键性能指标
      const ttfb = navigation
        ? navigation.responseStart - navigation.requestStart
        : 0;
      const domContentLoaded = navigation
        ? navigation.domContentLoadedEventEnd - navigation.startTime
        : 0;
      const pageLoadTime = navigation
        ? navigation.loadEventEnd - navigation.startTime
        : 0;

      setMetrics({
        // 基础指标
        ttfb: `${ttfb.toFixed(2)}ms`,
        domContentLoaded: `${domContentLoaded.toFixed(2)}ms`,
        pageLoadTime: `${pageLoadTime.toFixed(2)}ms`,
        firstPaint: firstPaint ? `${firstPaint.startTime.toFixed(2)}ms` : "N/A",
        firstContentfulPaint: fcp ? `${fcp.startTime.toFixed(2)}ms` : "N/A",

        // 资源加载指标
        totalResources: resourceEntries.length,
        totalResourceSize: `${(
          resourceEntries.reduce((acc, r) => acc + (r as any).transferSize, 0) /
          1024
        ).toFixed(2)}KB`,

        // 导航指标
        navigationStart: navigation?.startTime,
        responseStart: navigation?.responseStart,
        domComplete: navigation?.domComplete,
        loadComplete: navigation?.loadEventEnd,
      });
    };

    // 等待 load 事件完成后再收集
    if (document.readyState === "complete") {
      collectMetrics();
    } else {
      window.addEventListener("load", collectMetrics);
      return () => window.removeEventListener("load", collectMetrics);
    }
  }, []);

  // 测试 BFF 层性能
  const testBFFPerformance = async () => {
    setIsTesting(true);
    const testData = {
      questionId: "test-123",
      c1: "测试姓名",
      c2: "male",
    };

    try {
      // 测试 BFF 接口
      const bffStart = performance.now();
      const bffResponse = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });
      const bffTime = performance.now() - bffStart;

      // 检查响应类型
      const contentType = bffResponse.headers.get("content-type");
      let bffData;

      if (contentType && contentType.includes("application/json")) {
        bffData = await bffResponse.json();
      } else {
        // 处理重定向或其他响应类型
        const responseText = await bffResponse.text();
        bffData = {
          status: bffResponse.status,
          statusText: bffResponse.statusText,
          contentType: contentType,
          isRedirect: bffResponse.redirected,
          responseLength: responseText.length,
          responsePreview: responseText.substring(0, 200) + "...",
        };
      }

      // 测试直接调用后端（模拟）
      let directTime = 0;
      let directData = null;
      let directStatus = 0;

      try {
        const directStart = performance.now();
        const directResponse = await fetch(
          "http://localhost:3001/api/backend/answer",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testData),
          }
        );
        directTime = performance.now() - directStart;
        directStatus = directResponse.status;

        if (directResponse.ok) {
          directData = await directResponse.json();
        } else {
          directData = { error: `HTTP ${directResponse.status}` };
        }
      } catch (directError: any) {
        directData = { error: directError.message };
        directTime = 0;
      }

      setBffMetrics({
        bffResponseTime: `${bffTime.toFixed(2)}ms`,
        directResponseTime:
          directTime > 0 ? `${directTime.toFixed(2)}ms` : "N/A",
        performanceImprovement:
          directTime > 0
            ? `${(((directTime - bffTime) / directTime) * 100).toFixed(2)}%`
            : "N/A",
        bffStatus: bffResponse.status,
        directStatus: directStatus,
        bffData: bffData,
        directData: directData,
        contentType: contentType,
        isRedirect: bffResponse.redirected,
      });
    } catch (error: any) {
      console.error("BFF 性能测试失败:", error);
      setBffMetrics({
        error: error.message,
        errorType: error.name,
        errorStack: error.stack,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // 测试 SSR 性能
  const testSSRPerformance = async () => {
    const start = performance.now();

    try {
      // 测试存在的 API 接口
      const response = await fetch("/api/hello");
      const data = await response.json();

      const ssrTime = performance.now() - start;

      setMetrics((prev: any) => ({
        ...prev,
        ssrTestTime: `${ssrTime.toFixed(2)}ms`,
        ssrData: data,
        ssrTestCompleted: true,
      }));
    } catch (error: any) {
      console.error("SSR 测试失败:", error);

      // 如果 API 调用失败，进行模拟测试
      const mockStart = performance.now();

      // 模拟服务端渲染过程
      await new Promise((resolve) => setTimeout(resolve, 100)); // 模拟 100ms 延迟

      const mockTime = performance.now() - mockStart;

      setMetrics((prev: any) => ({
        ...prev,
        ssrTestTime: `${mockTime.toFixed(2)}ms`,
        ssrData: {
          message: "模拟 SSR 测试",
          note: "实际 API 调用失败，这是模拟结果",
        },
        ssrTestCompleted: true,
        ssrTestError: error.message,
      }));
    }
  };

  // 测试 BFF 层跨域性能
  const testBFFCrossOrigin = async () => {
    const start = performance.now();
    const testData = {
      questionId: "cross-origin-test",
      c1: "跨域测试",
      c2: "female",
    };

    try {
      // 测试 BFF 接口（同源）
      const bffResponse = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      // 测试直接调用后端（跨域）
      const directResponse = await fetch("http://localhost:3001/api/backend/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const totalTime = performance.now() - start;

      setBffMetrics((prev: any) => ({
        ...prev,
        crossOriginTest: {
          bffStatus: bffResponse.status,
          directStatus: directResponse.status,
          totalTime: `${totalTime.toFixed(2)}ms`,
          crossOriginSuccess: directResponse.ok,
          note: "BFF 层成功解决了跨域问题"
        }
      }));

    } catch (error: any) {
      setBffMetrics((prev: any) => ({
        ...prev,
        crossOriginTest: {
          error: error.message,
          note: "跨域测试失败，BFF 层可能存在问题"
        }
      }));
    }
  };

  // 测试 BFF 层缓存性能
  const testBFFCache = async () => {
    const testData = {
      questionId: "cache-test",
      c1: "缓存测试",
      c2: "male",
    };

    try {
      // 第一次请求（无缓存）
      const firstStart = performance.now();
      const firstResponse = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });
      const firstTime = performance.now() - firstStart;

      // 等待一下
      await new Promise(resolve => setTimeout(resolve, 100));

      // 第二次请求（可能有缓存）
      const secondStart = performance.now();
      const secondResponse = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });
      const secondTime = performance.now() - secondStart;

      const cacheImprovement = ((firstTime - secondTime) / firstTime * 100).toFixed(2);

      setBffMetrics((prev: any) => ({
        ...prev,
        cacheTest: {
          firstRequest: `${firstTime.toFixed(2)}ms`,
          secondRequest: `${secondTime.toFixed(2)}ms`,
          cacheImprovement: `${cacheImprovement}%`,
          note: parseFloat(cacheImprovement) > 0 ? "缓存生效" : "缓存未生效"
        }
      }));

    } catch (error: any) {
      setBffMetrics((prev: any) => ({
        ...prev,
        cacheTest: {
          error: error.message
        }
      }));
    }
  };

  // 测试 BFF 层并发性能
  const testBFFConcurrency = async () => {
    const testData = {
      questionId: "concurrency-test",
      c1: "并发测试",
      c2: "male",
    };

    try {
      const start = performance.now();
      
      // 并发发送 5 个请求
      const promises = Array(5).fill(0).map(() => 
        fetch("/api/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testData),
        })
      );

      const responses = await Promise.all(promises);
      const totalTime = performance.now() - start;
      const avgTime = totalTime / 5;

      const successCount = responses.filter(r => r.ok).length;

      setBffMetrics((prev: any) => ({
        ...prev,
        concurrencyTest: {
          totalTime: `${totalTime.toFixed(2)}ms`,
          averageTime: `${avgTime.toFixed(2)}ms`,
          successCount: `${successCount}/5`,
          note: successCount === 5 ? "并发处理正常" : "并发处理存在问题"
        }
      }));

    } catch (error: any) {
      setBffMetrics((prev: any) => ({
        ...prev,
        concurrencyTest: {
          error: error.message
        }
      }));
    }
  };

  // 分析性能指标
  const analyzePerformance = () => {
    const ttfb = parseFloat(metrics.ttfb?.replace("ms", "") || "0");
    const fcp = parseFloat(
      metrics.firstContentfulPaint?.replace("ms", "") || "0"
    );
    const lcp = parseFloat(metrics.pageLoadTime?.replace("ms", "") || "0");

    let analysis = {
      ttfbRating: ttfb < 200 ? "优秀" : ttfb < 600 ? "良好" : "需要优化",
      fcpRating: fcp < 1800 ? "优秀" : fcp < 3000 ? "良好" : "需要优化",
      overallRating: "需要更多数据",
      recommendations: [] as string[],
    };

    if (ttfb > 600)
      analysis.recommendations.push("TTFB 过高，建议优化服务端响应");
    if (fcp > 3000) analysis.recommendations.push("FCP 过高，建议优化首屏渲染");
    if (
      metrics.totalResourceSize &&
      parseFloat(metrics.totalResourceSize) > 1000
    ) {
      analysis.recommendations.push("资源过大，建议压缩和优化");
    }

    return analysis;
  };

  const performanceAnalysis = analyzePerformance();

  return (
    <>
      <Head>
        <title>性能监控面板</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ padding: 24, fontFamily: "monospace" }}>
        <h1>🚀 性能监控面板</h1>

        {/* 基础性能指标 */}
        <section style={{ marginBottom: 32 }}>
          <h2>📊 基础性能指标</h2>
          <div style={{ background: "#f5f5f5", padding: 16, borderRadius: 8 }}>
            <pre>{JSON.stringify(metrics, null, 2)}</pre>
          </div>

          {/* 性能分析 */}
          <div
            style={{
              background: "#e7f3ff",
              padding: 16,
              borderRadius: 8,
              marginTop: 16,
            }}
          >
            <h3>📈 性能分析</h3>
            <p>
              <strong>TTFB 评级:</strong> {performanceAnalysis.ttfbRating}
            </p>
            <p>
              <strong>FCP 评级:</strong> {performanceAnalysis.fcpRating}
            </p>
            {performanceAnalysis.recommendations.length > 0 && (
              <div>
                <strong>优化建议:</strong>
                <ul>
                  {performanceAnalysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* BFF 层性能测试 */}
        <section style={{ marginBottom: 32 }}>
          <h2>🔗 BFF 层性能测试</h2>
          
          {/* 基础 BFF 测试 */}
          <button
            onClick={testBFFPerformance}
            disabled={isTesting}
            style={{
              padding: "12px 24px",
              fontSize: 16,
              backgroundColor: isTesting ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: isTesting ? "not-allowed" : "pointer",
              marginBottom: 16,
              marginRight: 12,
            }}
          >
            {isTesting ? "测试中..." : "基础 BFF 测试"}
          </button>

          {/* 跨域测试 */}
          <button
            onClick={testBFFCrossOrigin}
            style={{
              padding: "12px 24px",
              fontSize: 16,
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              marginBottom: 16,
              marginRight: 12,
            }}
          >
            跨域解决测试
          </button>

          {/* 缓存测试 */}
          <button
            onClick={testBFFCache}
            style={{
              padding: "12px 24px",
              fontSize: 16,
              backgroundColor: "#ffc107",
              color: "black",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              marginBottom: 16,
              marginRight: 12,
            }}
          >
            缓存性能测试
          </button>

          {/* 并发测试 */}
          <button
            onClick={testBFFConcurrency}
            style={{
              padding: "12px 24px",
              fontSize: 16,
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              marginBottom: 16,
            }}
          >
            并发性能测试
          </button>

          {Object.keys(bffMetrics).length > 0 && (
            <div
              style={{ background: "#f5f5f5", padding: 16, borderRadius: 8 }}
            >
              <h3>测试结果:</h3>
              <pre>{JSON.stringify(bffMetrics, null, 2)}</pre>

              {/* 结果分析 */}
              {bffMetrics.error && (
                <div
                  style={{
                    background: "#ffe6e6",
                    padding: 12,
                    borderRadius: 6,
                    marginTop: 12,
                  }}
                >
                  <strong>错误分析:</strong> BFF 接口返回了非 JSON
                  响应，可能是重定向到页面。
                  <br />
                  <strong>建议:</strong> 检查 API 路由是否正确处理 POST
                  请求，避免重定向。
                </div>
              )}

              {/* 跨域测试结果 */}
              {bffMetrics.crossOriginTest && (
                <div
                  style={{
                    background: "#e7f3ff",
                    padding: 12,
                    borderRadius: 6,
                    marginTop: 12,
                  }}
                >
                  <strong>跨域测试结果:</strong> {bffMetrics.crossOriginTest.note}
                </div>
              )}

              {/* 缓存测试结果 */}
              {bffMetrics.cacheTest && (
                <div
                  style={{
                    background: "#fff3cd",
                    padding: 12,
                    borderRadius: 6,
                    marginTop: 12,
                  }}
                >
                  <strong>缓存测试结果:</strong> {bffMetrics.cacheTest.note}
                  <br />
                  首次请求: {bffMetrics.cacheTest.firstRequest}, 
                  二次请求: {bffMetrics.cacheTest.secondRequest}, 
                  提升: {bffMetrics.cacheTest.cacheImprovement}
                </div>
              )}

              {/* 并发测试结果 */}
              {bffMetrics.concurrencyTest && (
                <div
                  style={{
                    background: "#d1ecf1",
                    padding: 12,
                    borderRadius: 6,
                    marginTop: 12,
                  }}
                >
                  <strong>并发测试结果:</strong> {bffMetrics.concurrencyTest.note}
                  <br />
                  总耗时: {bffMetrics.concurrencyTest.totalTime}, 
                  平均耗时: {bffMetrics.concurrencyTest.averageTime}, 
                  成功率: {bffMetrics.concurrencyTest.successCount}
                </div>
              )}
            </div>
          )}
        </section>

        {/* SSR 性能测试 */}
        <section style={{ marginBottom: 32 }}>
          <h2>⚡ SSR 性能测试</h2>
          <button
            onClick={testSSRPerformance}
            style={{
              padding: "12px 24px",
              fontSize: 16,
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            测试 SSR 性能
          </button>
        </section>

        {/* 性能优化建议 */}
        <section>
          <h2>💡 性能优化建议</h2>
          <div style={{ background: "#e7f3ff", padding: 16, borderRadius: 8 }}>
            <h3>BFF 层优化:</h3>
            <ul>
              <li>启用 HTTP keep-alive</li>
              <li>并行化多个后端请求 (Promise.all)</li>
              <li>添加短期缓存 (5-30s)</li>
              <li>压缩响应数据</li>
            </ul>

            <h3>SSR 优化:</h3>
            <ul>
              <li>减少服务端计算</li>
              <li>组件懒加载</li>
              <li>启用 gzip 压缩</li>
              <li>优化数据库查询</li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
