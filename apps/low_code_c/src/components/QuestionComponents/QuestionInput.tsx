import React, { FC } from "react";
import styles from "./QuestionInput.module.scss";

type PropsType = {
  fe_id: string;
  props: {
    title: string;
    placeholder: string;
  };
};

const QuestionInput: FC<PropsType> = (props: PropsType) => {
  const {
    fe_id,
    props: { title, placeholder },
  } = props;
  return (
    <>
      <p>{title}</p>
      <div className={styles.inputWrapper}>
        <input
          id={fe_id}
          className={styles.input}
          name={fe_id}
          placeholder={placeholder}
        />
      </div>
    </>
  );
};

export default QuestionInput;
