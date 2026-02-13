import Head from "next/head";
import QuestionInput from "@/components/QuestionComponents/QuestionInput";
import QuestionRadio from "@/components/QuestionComponents/QuestionRadio";
import styles from "../../styles/Question.module.scss";
type PropsType = {
  errno: number;
  data?: {
    id: string;
    title: string;
    desc?: string;
    js?: string;
    css?: string;
    isPublished: boolean;
    isDeleted: boolean;
    componentList: Array<any>;
  };
  msg?: string;
};
import { getQuestionByIdm } from "@/services/question";
import PageWrapper from "@/components/PageWrapper";
import { genComponent } from "@/components/QuestionComponents";

export default function Question(props: PropsType) {
  const { errno, data, msg } = props;
  const {
    id,
    title,
    desc = "",
    js,
    css,
    componentList = [],
    isDeleted,
    isPublished,
  } = data || {};

  // 添加调试信息
  console.log("Question props:", props);
  console.log("componentList:", componentList);
  console.log("errno:", errno);

  if (errno !== 0) {
    return (
      <>
        <PageWrapper title="错误" desc={desc}>
          <main>
            <h1>{title}</h1>
            <p>{msg}</p>
          </main>
        </PageWrapper>
      </>
    );
  }
  if (isDeleted) {
    return (
      <>
        <PageWrapper title="错误" desc={desc}>
          <main>
            <h1>{title}</h1>
            <p>问题已被删除</p>
          </main>
        </PageWrapper>
      </>
    );
  }

  if (!isPublished) {
    return (
      <>
        <PageWrapper title="错误" desc={desc}>
          <main>
            <h1>{title}</h1>
            <p>问题未发布</p>
          </main>
        </PageWrapper>
      </>
    );
  }

  const ComponentListElem = (
    <>
      {componentList.map((c) => {
        const ComponentElem = genComponent(c);
        console.log("生成的组件:", c, ComponentElem);
        return (
          <div key={c.fe_id} className={styles.componentWrapper}>
            {ComponentElem}
          </div>
        );
      })}
    </>
  );

  return (
    <>
      <PageWrapper title="问题" desc="问题详情">
        <form action="/api/answer" method="POST">
          <input type="hidden" name="questionId" value={id} />
          {ComponentListElem}
          <div className={styles.submitBtnContainer}>
            <button type="submit" className={styles.submitBtn}>
              提交
            </button>
          </div>
        </form>
      </PageWrapper>
    </>
  );
}

export const getServerSideProps = async (context: any) => {
  const { id } = context.query;
  console.log("获取问题ID:", id);

  try {
    const data = await getQuestionByIdm(id);
    console.log("获取到的数据:", data);
    return {
      props: {
        ...data,
      },
    };
  } catch (error) {
    console.error("获取问题数据失败:", error);
    return {
      props: {
        errno: 1,
        msg: "获取问题数据失败",
        data: null,
      },
    };
  }
};
