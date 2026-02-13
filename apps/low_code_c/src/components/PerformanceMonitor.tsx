import { useEffect, useState } from "react";
import styles from "../styles/PerformanceMonitor.module.scss";

interface PerformanceMonitorProps {
  renderTime?: number;
  pageType: "question" | "stat";
}

export default function PerformanceMonitor({
  renderTime,
  pageType,
}: PerformanceMonitorProps) {
  const [clientRenderTime, setClientRenderTime] = useState<number | null>(null);
  const [hydrationTime, setHydrationTime] = useState<number | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  useEffect(() => {
    // 记录客户端渲染时间
    const startTime = performance.now();

    // 模拟一些客户端操作
    setTimeout(() => {
      const endTime = performance.now();
      setClientRenderTime(endTime - startTime);
    }, 100);

    // 获取性能指标
    if ("performance" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const metrics: any = {};

        entries.forEach((entry) => {
          if (entry.entryType === "navigation") {
            const navEntry = entry as PerformanceNavigationTiming;
            metrics.dnsLookup =
              navEntry.domainLookupEnd - navEntry.domainLookupStart;
            metrics.tcpConnection = navEntry.connectEnd - navEntry.connectStart;
            metrics.serverResponse =
              navEntry.responseEnd - navEntry.requestStart;
            metrics.domContentLoaded =
              navEntry.domContentLoadedEventEnd -
              navEntry.domContentLoadedEventStart;
            metrics.loadComplete =
              navEntry.loadEventEnd - navEntry.loadEventStart;
          }
        });

        setPerformanceMetrics(metrics);
      });

      observer.observe({ entryTypes: ["navigation"] });

      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // 记录水合时间
    const startHydration = performance.now();

    const handleHydration = () => {
      const endHydration = performance.now();
      setHydrationTime(endHydration - startHydration);
    };

    // 监听 DOM 变化来判断水合完成
    const observer = new MutationObserver(() => {
      handleHydration();
      observer.disconnect();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 延迟检查，确保水合完成
    setTimeout(handleHydration, 500);
  }, []);

  const getPerformanceGrade = (time: number) => {
    if (time < 100) return { grade: "A", color: "#52c41a", text: "优秀" };
    if (time < 300) return { grade: "B", color: "#1890ff", text: "良好" };
    if (time < 500) return { grade: "C", color: "#faad14", text: "一般" };
    return { grade: "D", color: "#ff4d4f", text: "需要优化" };
  };

  const renderTimeGrade = renderTime ? getPerformanceGrade(renderTime) : null;
  const clientTimeGrade = clientRenderTime
    ? getPerformanceGrade(clientRenderTime)
    : null;

  return (
    <div className={styles.performanceMonitor}>
      <h3 className={styles.title}>性能监控面板</h3>

      <div className={styles.metricsGrid}>
        {/* SSR 渲染时间 */}
        {renderTime && (
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>SSR 渲染时间</span>
              <span
                className={styles.grade}
                style={{ color: renderTimeGrade?.color }}
              >
                {renderTimeGrade?.grade}
              </span>
            </div>
            <div className={styles.metricValue}>{renderTime.toFixed(2)} ms</div>
            <div className={styles.metricText}>{renderTimeGrade?.text}</div>
          </div>
        )}

        {/* 客户端渲染时间 */}
        {clientRenderTime && (
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>客户端渲染时间</span>
              <span
                className={styles.grade}
                style={{ color: clientTimeGrade?.color }}
              >
                {clientTimeGrade?.grade}
              </span>
            </div>
            <div className={styles.metricValue}>
              {clientRenderTime.toFixed(2)} ms
            </div>
            <div className={styles.metricText}>{clientTimeGrade?.text}</div>
          </div>
        )}

        {/* 水合时间 */}
        {hydrationTime && (
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>水合时间</span>
            </div>
            <div className={styles.metricValue}>
              {hydrationTime.toFixed(2)} ms
            </div>
            <div className={styles.metricText}>React 水合完成</div>
          </div>
        )}

        {/* 页面类型 */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>页面类型</span>
          </div>
          <div className={styles.metricValue}>
            {pageType === "question" ? "答题页" : "统计页"}
          </div>
          <div className={styles.metricText}>SSR 已启用</div>
        </div>
      </div>

      {/* 网络性能指标 */}
      {performanceMetrics && (
        <div className={styles.networkMetrics}>
          <h4>网络性能指标</h4>
          <div className={styles.networkGrid}>
            <div className={styles.networkItem}>
              <span>DNS 查询:</span>
              <span>
                {performanceMetrics.dnsLookup?.toFixed(2) || "N/A"} ms
              </span>
            </div>
            <div className={styles.networkItem}>
              <span>TCP 连接:</span>
              <span>
                {performanceMetrics.tcpConnection?.toFixed(2) || "N/A"} ms
              </span>
            </div>
            <div className={styles.networkItem}>
              <span>服务器响应:</span>
              <span>
                {performanceMetrics.serverResponse?.toFixed(2) || "N/A"} ms
              </span>
            </div>
            <div className={styles.networkItem}>
              <span>DOM 加载:</span>
              <span>
                {performanceMetrics.domContentLoaded?.toFixed(2) || "N/A"} ms
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 性能建议 */}
      <div className={styles.recommendations}>
        <h4>性能优化建议</h4>
        <ul>
          {renderTime && renderTime > 500 && (
            <li>SSR 渲染时间较长，建议优化数据获取逻辑</li>
          )}
          {clientRenderTime && clientRenderTime > 300 && (
            <li>客户端渲染时间较长，建议减少不必要的计算</li>
          )}
          {hydrationTime && hydrationTime > 200 && (
            <li>水合时间较长，建议优化组件结构</li>
          )}
          {(!renderTime || renderTime < 300) &&
            (!clientRenderTime || clientRenderTime < 200) && (
              <li>性能表现良好，继续保持！</li>
            )}
        </ul>
      </div>
    </div>
  );
}

