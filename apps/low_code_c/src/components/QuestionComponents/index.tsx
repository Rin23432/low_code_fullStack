import QuestionInput from "./QuestionInput";
import QuestionRadio from "./QuestionRadio";
import React from "react";
import QuestionTitle from "./QuestionTitle";
import QuestionParagraph from "./QuestionParagraph";
import QuestionInfo from "./QuestionInfo";
import QuestionTextarea from "./QuestionTextarea";
import QuestionCheckbox from "./QuestionCheckbox";

type ComponentInfoType = {
  type: string;
  fe_id: string;
  isHidden: string;
  props: any;
};

export const genComponent = (component: ComponentInfoType) => {
  const { fe_id, type, isHidden, props = {} } = component;

  if (isHidden) {
    return null;
  }

  if (type === "questionInput") {
    return <QuestionInput fe_id={fe_id} props={props} />;
  }
  if (type === "questionRadio") {
    return <QuestionRadio fe_id={fe_id} props={props} />;
  }
  if (type === "questionTitle") {
    return <QuestionTitle {...props}></QuestionTitle>;
  }

  if (type === "questionParagraph") {
    return <QuestionParagraph {...props}></QuestionParagraph>;
  }
  if (type === "questionInfo") {
    return <QuestionInfo {...props}></QuestionInfo>;
  }
  if (type === "questionTextarea") {
    return <QuestionTextarea fe_id={fe_id} props={props} />;
  }
  if (type === "questionCheckbox") {
    return <QuestionCheckbox fe_id={fe_id} props={props} />;
  }

  return null;
};
