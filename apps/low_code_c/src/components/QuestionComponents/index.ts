import QuestionTitle from "./QuestionTitle";
import QuestionInput from "./QuestionInput";
import QuestionTextarea from "./QuestionTextarea";
import QuestionRadio from "./QuestionRadio";
import QuestionCheckbox from "./QuestionCheckbox";
import QuestionParagraph from "./QuestionParagraph";

// 组件类型映射
const componentMap = {
  questionTitle: QuestionTitle,
  questionInput: QuestionInput,
  questionTextarea: QuestionTextarea,
  questionRadio: QuestionRadio,
  questionCheckbox: QuestionCheckbox,
  questionParagraph: QuestionParagraph,
};

// 生成组件的函数
export function genComponent(component: any) {
  const { type, props } = component;
  const Component = componentMap[type as keyof typeof componentMap];
  
  if (!Component) {
    console.warn(`Unknown component type: ${type}`);
    return <div>未知组件类型: {type}</div>;
  }
  
  return <Component {...props} />;
}

// 导出所有组件
export {
  QuestionTitle,
  QuestionInput,
  QuestionTextarea,
  QuestionRadio,
  QuestionCheckbox,
  QuestionParagraph,
};

