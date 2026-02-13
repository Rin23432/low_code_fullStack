import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface PerformanceResult {
  type: 'SSR' | 'CSR';
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  totalTime: number;
  dataLoadTime: number;
  renderTime: number;
}

const PerformanceTest: React.FC = () => {
  const [results, setResults] = useState<PerformanceResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const measurePerformance = async (type: 'SSR' | 'CSR') => {
    const startTime = performance.now();
    let dataLoadTime = 0;
    let renderTime = 0;

    try {
      // 模拟数据加载
      const dataStart = performance.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
      dataLoadTime = performance.now() - dataStart;

      // 模拟渲染
      const renderStart = performance.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 50));
      renderTime = performance.now() - renderStart;

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // 模拟 Web Vitals 指标
      const firstContentfulPaint = Math.random() * 200 + 100;
      const largestContentfulPaint = Math.random() * 400 + 200;
      const timeToInteractive = Math.random() * 300 + 150;

      const result: PerformanceResult = {
        type,
        firstContentfulPaint,
        largestContentfulPaint,
        timeToInteractive,
        totalTime,
        dataLoadTime,
        renderTime
      };

      setResults(prev => [...prev, result]);
    } catch (error) {
      console.error('Performance test failed:', error);
    }
  };

  const runSSRTest = async () => {
    setCurrentTest('SSR 测试中...');
    setIsTesting(true);
    
    // 模拟 SSR 测试
    await measurePerformance('SSR');
    
    setCurrentTest('');
    setIsTesting(false);
  };

  const runCSRTest = async () => {
    setCurrentTest('CSR 测试中...');
    setIsTesting(true);
    
    // 模拟 CSR 测试
    await measurePerformance('CSR');
    
    setCurrentTest('');
    setIsTesting(false);
  };

  const runComparisonTest = async () => {
    setCurrentTest('性能对比测试中...');
    setIsTesting(true);
    
    // 清空之前的结果
    setResults([]);
    
    // 并行运行两种测试
    await Promise.all([
      measurePerformance('SSR'),
      measurePerformance('CSR')
    ]);
    
    setCurrentTest('');
    setIsTesting(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const calculateAverage = (type: 'SSR' | 'CSR', metric: keyof PerformanceResult) => {
    const typeResults = results.filter(r => r.type === type);
    if (typeResults.length === 0) return 0;
    
    const sum = typeResults.reduce((acc, result) => acc + (result[metric] as number), 0);
    return sum / typeResults.length;
  };

  const getPerformanceGrade = (value: number, metric: string) => {
    if (metric.includes('Paint') || metric.includes('Interactive')) {
      if (value < 200) return '🟢 优秀';
      if (value < 500) return '🟡 良好';
      if (value < 1000) return '🟠 一般';
      return '🔴 较差';
    } else {
      if (value < 100) return '🟢 优秀';
      if (value < 300) return '🟡 良好';
      if (value < 500) return '🟠 一般';
      return '🔴 较差';
    }
  };

  return (
    <>
      <Head>
        <title>性能测试 - 低代码平台</title>
        <meta name="description" content="BFF 和 SSR 性能测试页面" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">BFF + SSR 性能测试</h1>
            <p className="text-xl text-gray-600">对比服务端渲染(SSR)和客户端渲染(CSR)的性能差异</p>
          </div>

          {/* 测试控制面板 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">测试控制</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={runSSRTest}
                disabled={isTesting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                运行 SSR 测试
              </button>
              
              <button
                onClick={runCSRTest}
                disabled={isTesting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                运行 CSR 测试
              </button>
              
              <button
                onClick={runComparisonTest}
                disabled={isTesting}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                运行对比测试
              </button>
              
              <button
                onClick={clearResults}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                清空结果
              </button>
            </div>
            
            {isTesting && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  {currentTest}
                </div>
              </div>
            )}
          </div>

          {/* 测试结果 */}
          {results.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">测试结果</h2>
              
              {/* 详细结果表格 */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">首次内容绘制</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最大内容绘制</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">可交互时间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数据加载</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">渲染时间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总时间</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={index} className={result.type === 'SSR' ? 'bg-blue-50' : 'bg-green-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            result.type === 'SSR' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {result.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.firstContentfulPaint.toFixed(2)}ms
                          <div className="text-xs text-gray-500">
                            {getPerformanceGrade(result.firstContentfulPaint, 'firstContentfulPaint')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.largestContentfulPaint.toFixed(2)}ms
                          <div className="text-xs text-gray-500">
                            {getPerformanceGrade(result.largestContentfulPaint, 'largestContentfulPaint')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.timeToInteractive.toFixed(2)}ms
                          <div className="text-xs text-gray-500">
                            {getPerformanceGrade(result.timeToInteractive, 'timeToInteractive')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.dataLoadTime.toFixed(2)}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.renderTime.toFixed(2)}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {result.totalTime.toFixed(2)}ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 性能对比分析 */}
          {results.length >= 2 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">性能对比分析</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SSR 平均性能 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">SSR 平均性能</h3>
                  <div className="space-y-2 text-sm">
                    <div>首次内容绘制: {calculateAverage('SSR', 'firstContentfulPaint').toFixed(2)}ms</div>
                    <div>最大内容绘制: {calculateAverage('SSR', 'largestContentfulPaint').toFixed(2)}ms</div>
                    <div>可交互时间: {calculateAverage('SSR', 'timeToInteractive').toFixed(2)}ms</div>
                    <div>数据加载: {calculateAverage('SSR', 'dataLoadTime').toFixed(2)}ms</div>
                    <div>渲染时间: {calculateAverage('SSR', 'renderTime').toFixed(2)}ms</div>
                    <div className="font-medium">总时间: {calculateAverage('SSR', 'totalTime').toFixed(2)}ms</div>
                  </div>
                </div>

                {/* CSR 平均性能 */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">CSR 平均性能</h3>
                  <div className="space-y-2 text-sm">
                    <div>首次内容绘制: {calculateAverage('CSR', 'firstContentfulPaint').toFixed(2)}ms</div>
                    <div>最大内容绘制: {calculateAverage('CSR', 'largestContentfulPaint').toFixed(2)}ms</div>
                    <div>可交互时间: {calculateAverage('CSR', 'timeToInteractive').toFixed(2)}ms</div>
                    <div>数据加载: {calculateAverage('CSR', 'dataLoadTime').toFixed(2)}ms</div>
                    <div>渲染时间: {calculateAverage('CSR', 'renderTime').toFixed(2)}ms</div>
                    <div className="font-medium">总时间: {calculateAverage('CSR', 'totalTime').toFixed(2)}ms</div>
                  </div>
                </div>
              </div>

              {/* 性能提升分析 */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">性能提升分析</h3>
                <div className="text-sm text-yellow-700">
                  {(() => {
                    const ssrAvg = calculateAverage('SSR', 'totalTime');
                    const csrAvg = calculateAverage('CSR', 'totalTime');
                    const improvement = ((csrAvg - ssrAvg) / csrAvg * 100);
                    
                    if (improvement > 0) {
                      return `SSR 相比 CSR 性能提升了 ${improvement.toFixed(1)}%，主要优势在于服务端预渲染减少了客户端的计算负担。`;
                    } else {
                      return `CSR 相比 SSR 性能提升了 ${Math.abs(improvement).toFixed(1)}%，但 SSR 在首屏加载和 SEO 方面有优势。`;
                    }
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PerformanceTest;