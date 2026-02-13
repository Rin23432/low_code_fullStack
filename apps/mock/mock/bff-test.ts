import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

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
  initialData?: QuestionData;
  ssrRendered?: boolean;
}

const QuestionPage: React.FC<QuestionPageProps> = ({ initialData, ssrRendered = false }) => {
  const router = useRouter();
  const { id } = router.query;
  
  const [questionData, setQuestionData] = useState<QuestionData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [performanceMetrics, setPerformanceMetrics] = useState({
    firstRender: 0,
    dataLoad: 0,
    totalTime: 0
  });

  useEffect(() => {
    if (!initialData && id) {
      fetchQuestionData();
    }
    
    // 记录首次渲染时间
    if (!ssrRendered) {
      setPerformanceMetrics(prev => ({
        ...prev,
        firstRender: performance.now()
      }));
    }
  }, [id, initialData]);

  const fetchQuestionData = async () => {
    const startTime = performance.now();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/bff/question/${id}`);
      const data = await response.json();
      
      if (data.errno === 0) {
        setQuestionData(data.data);
        
        const endTime = performance.now();
        setPerformanceMetrics(prev => ({
          ...prev,
          dataLoad: endTime - startTime,
          totalTime: endTime - prev.firstRender
        }));
      }
    } catch (error) {
      console.error('Failed to fetch question data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (componentId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [componentId]: value
    }));
  };

  const renderComponent = (component: QuestionComponent) => {
    if (component.isHidden) return null;

    const { type, props, title } = component;

    switch (type) {
      case 'title':
        const HeadingTag = `h${props.level || 1}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={component.fe_id} className="text-2xl font-bold mb-4">
            {props.text || title}
          </HeadingTag>
        );
        
      case 'paragraph':
        return (
          <p key={component.fe_id} className="text-gray-600 mb-4">
            {props.text}
          </p>
        );
        
      case 'input':
        return (
          <div key={component.fe_id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {props.title || title}
            </label>
            <input
              type="text"
              placeholder={props.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleAnswerChange(component.fe_id, e.target.value)}
            />
          </div>
        );
        
      case 'textarea':
        return (
          <div key={component.fe_id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {props.title || title}
            </label>
            <textarea
              placeholder={props.placeholder}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleAnswerChange(component.fe_id, e.target.value)}
            />
          </div>
        );
        
      case 'radio':
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
                    onChange={(e) => handleAnswerChange(component.fe_id, e.target.value)}
                  />
                  {option.text}
                </label>
              ))}
            </div>
          </div>
        );
        
      case 'checkbox':
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
                        : currentValues.filter((v: string) => v !== option.value);
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

  if (!questionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">问卷不存在或已被删除</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 性能指标显示 */}
        {!ssrRendered && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">性能指标</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">首次渲染:</span> {performanceMetrics.firstRender.toFixed(2)}ms
              </div>
              <div>
                <span className="font-medium">数据加载:</span> {performanceMetrics.dataLoad.toFixed(2)}ms
              </div>
              <div>
                <span className="font-medium">总时间:</span> {performanceMetrics.totalTime.toFixed(2)}ms
              </div>
            </div>
          </div>
        )}
        
        {/* 问卷标题 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{questionData.title}</h1>
          {questionData.desc && (
            <p className="text-gray-600">{questionData.desc}</p>
          )}
        </div>
        
        {/* 问卷内容 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {questionData.componentList.map(renderComponent)}
          
          {/* 提交按钮 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => {
                console.log('提交答案:', answers);
                alert('答案提交成功！');
              }}
            >
              提交问卷
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;