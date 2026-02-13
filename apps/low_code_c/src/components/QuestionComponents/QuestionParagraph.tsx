import React, { FC, CSSProperties } from "react";

type PropsType = {
  text: string;
  isCenter?: boolean;
};

const QuestionParagraph: FC<PropsType> = (props: PropsType) => {
  const { text, isCenter } = props;
  const style: CSSProperties = {};
  if (isCenter) style.textAlign = "center";

  const textList = text.split("\n");

  return (
    <p>
      {textList.map((t, index) => (
        <span key={index}>
          {index > 0 && <br />}
          {t}
        </span>
      ))}
    </p>
  );
};

export default QuestionParagraph;
