import { GetServerSideProps } from "next";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface QuestionComponent {
  fe_id: string;
  type: string;
  title: string;
  isHidden: boolean;
  isLocked: boolean;
  props: any;
}

interface QuestionData {
  id: string;
  title: string;
  desc: string;
  componentList: QuestionComponent[];
}

interface QuestionPageProps {
  questionData: QuestionData;
  ssrRendered: boolean;
  performanceMetrics: {
    ssrTime: number;
    dataFetchTime: number;
  };
}

export const getServerSideProps: GetServerSideProps<QuestionPageProps> = async (
  context
) => {
  const { id } = context.params!;
  const startTime = Date.now();

  try {
    // 在服务端获取数据
    const dataFetchStart = Date.now();
    const response = await fetch(
      `http://localhost:3001/api/bff/question/${id}`
    );
    const dataFetchEnd = Date.now();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const endTime = Date.now();

    if (result.errno === 0) {
      return {
        props: {
          questionData: result.data,
          ssrRendered: true,
          performanceMetrics: {
            ssrTime: endTime - startTime,
            dataFetchTime: dataFetchEnd - dataFetchStart,
          },
        },
      };
    } else {
      throw new Error("Failed to fetch question data");
    }
  } catch (error) {
    console.error("SSR Error:", error);

    // 如果 SSR 失败，返回空数据，让客户端处理
    return {
      props: {
        questionData: {
          id: id as string,
          title: "",
          desc: "",
          componentList: [],
        },
        ssrRendered: false,
        performanceMetrics: {
          ssrTime: 0,
          dataFetchTime: 0,
        },
      },
    };
  }
};

const BFFQuestionPage: React.FC<QuestionPageProps> = ({
  questionData,
  ssrRendered,
  performanceMetrics,
}) => {
  const router = useRouter();
  const { id } = router.query;

  const [currentQuestionData, setCurrentQuestionData] =
    useState<QuestionData | null>(questionData || null);
  const [loading, setLoading] = useState(!questionData);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [performanceMetricsClient, setPerformanceMetricsClient] = useState({
    firstRender: 0,
    dataLoad: 0,
    totalTime: 0,
  });

  useEffect(() => {
    if (!questionData && id) {
      fetchQuestionData();
    }

    // 记录首次渲染时间
    if (!ssrRendered) {
      setPerformanceMetricsClient((prev) => ({
        ...prev,
        firstRender: performance.now(),
      }));
    }
  }, [id, questionData]);

  const fetchQuestionData = async () => {
    const startTime = performance.now();
    setLoading(true);

    try {
      const response = await fetch(`/api/bff/question/${id}`);
      const data = await response.json();

      if (data.errno === 0) {
        setCurrentQuestionData(data.data);

        const endTime = performance.now();
        setPerformanceMetricsClient((prev) => ({
          ...prev,
          dataLoad: endTime - startTime,
          totalTime: endTime - prev.firstRender,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch question data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (componentId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [componentId]: value,
    }));
  };

  const renderComponent = (component: QuestionComponent) => {
    if (component.isHidden) return null;

    const { type, props, title } = component;

    switch (type) {
      case "title":
        const HeadingTag = `h${
          props.level || 1
        }` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={component.fe_id} className="text-2xl font-bold mb-4">
            {props.text || title}
          </HeadingTag>
        );

      case "paragraph":
        return (
          <p key={component.fe_id} className="text-gray-600 mb-4">
            {props.text}
          </p>
        );

      case "input":
        return (
          <div key={component.fe_id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {props.title || title}
            </label>
            <input
              type="text"
              placeholder={props.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) =>
                handleAnswerChange(component.fe_id, e.target.value)
              }
            />
          </div>
        );

      case "textarea":
        return (
          <div key={component.fe_id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {props.title || title}
            </label>
            <textarea
              placeholder={props.placeholder}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) =>
                handleAnswerChange(component.fe_id, e.target.value)
              }
            />
          </div>
        );

      case "radio":
        return (
          <div key={component.fe_id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {props.title || title}
            </label>
            <div className="space-y-2">
              {props.options?.map((option: any) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name={component.fe_id}
                    value={option.value}
                    className="mr-2"
                    onChange={(e) =>
                      handleAnswerChange(component.fe_id, e.target.value)
                    }
                  />
                  {option.text}
                </label>
              ))}
            </div>
          </div>
        );

      case "checkbox":
        return (
          <div key={component.fe_id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {props.title || title}
            </label>
            <div className="space-y-2">
              {props.options?.map((option: any) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option.value}
                    className="mr-2"
                    onChange={(e) => {
                      const currentValues = answers[component.fe_id] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(
                            (v: string) => v !== option.value
                          );
                      handleAnswerChange(component.fe_id, newValues);
                    }}
                  />
                  {option.text}
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  if (!currentQuestionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">问卷不存在或已被删除</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          {currentQuestionData.title || "BFF 问卷答题"} - 低代码平台
        </title>
        <meta
          name="description"
          content={currentQuestionData.desc || "BFF + SSR 问卷答题页面"}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* SSR 性能指标显示 */}
      {ssrRendered && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3 z-50">
          <div className="text-xs text-green-800">
            <div className="font-medium">BFF + SSR 已启用</div>
            <div>服务端渲染: {performanceMetrics.ssrTime}ms</div>
            <div>数据获取: {performanceMetrics.dataFetchTime}ms</div>
          </div>
        </div>
      )}

      {/* 客户端性能指标显示 */}
      {!ssrRendered && (
        <div className="fixed top-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 z-50">
          <div className="text-xs text-blue-800">
            <div className="font-medium">CSR 模式</div>
            <div>
              首次渲染: {performanceMetricsClient.firstRender.toFixed(2)}ms
            </div>
            <div>
              数据加载: {performanceMetricsClient.dataLoad.toFixed(2)}ms
            </div>
            <div>总时间: {performanceMetricsClient.totalTime.toFixed(2)}ms</div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              BFF + SSR 问卷答题
            </h1>
            <p className="text-xl text-gray-600">
              这是使用 BFF 层和 SSR 优化的答题页面
            </p>
          </div>

          {/* 问卷标题 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {currentQuestionData.title}
            </h2>
            {currentQuestionData.desc && (
              <p className="text-gray-600">{currentQuestionData.desc}</p>
            )}
          </div>

          {/* 问卷内容 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {currentQuestionData.componentList.map(renderComponent)}

            {/* 提交按钮 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => {
                  console.log("提交答案:", answers);
                  alert("答案提交成功！");
                }}
              >
                提交问卷
              </button>
            </div>
          </div>

          {/* 返回原页面链接 */}
          <div className="mt-8 text-center">
            <a
              href={`/question/${id}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← 返回原版答题页面
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default BFFQuestionPage;
