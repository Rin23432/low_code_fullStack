import Head from "next/head";
import PageWrapper from "@/components/PageWrapper";
export default function Success() {
  return (
    <>
      <PageWrapper title="提交成功" desc="表单提交成功">
        <main>
          <h1>成功</h1>
          <p> 提交成功</p>
        </main>
      </PageWrapper>
    </>
  );
}
