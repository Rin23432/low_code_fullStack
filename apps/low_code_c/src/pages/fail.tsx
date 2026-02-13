import Head from "next/head";

export default function Fail() {
  return (
    <>
      <Head>
        <title>提交失败</title> {/* 这里修改为你的标题 */}
        <meta name="description" content="提交失败" /> {/* 可选：添加描述 */}
      </Head>
      <main>
        <h1>提交失败</h1>
      </main>
    </>
  );
}
