import React, { FC } from "react";
import styles from "./QuestionRadio.module.scss";

type PropType = {
  fe_id: string;
  props: {
    title: string;
    options: Array<{
      value: string;
      text: string;
    }>;
    value: string;
    isVertical: boolean;
  };
};

const QuestionRadio: FC<PropType> = (props) => {
  const {
    fe_id,
    props: { title, options, value, isVertical },
  } = props;
  return (
    <>
      <p>{title}</p>
      <ul className={styles.list}>
        {options.map((item) => {
          let liClassName = "";
          if (isVertical) {
            liClassName = styles.verticalItem;
          } else {
            liClassName = styles.horizontalItem;
          }

          return (
            <li className={liClassName} key={item.value}>
              <label>
                <input
                  id={`${fe_id}_${item.value}`}
                  type="radio"
                  name={fe_id}
                  value={item.value}
                  defaultChecked={value === item.value}
                />
                {item.text}
              </label>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default QuestionRadio;
