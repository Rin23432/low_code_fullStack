import type { NextApiRequest, NextApiResponse } from "next";

// 后端服务地址
const BACKEND_HOST = process.env.BACKEND_HOST || "http://localhost:3001";

function genAnswerInfo(reqBody: any) {
  const answerList: any[] = [];

  Object.keys(reqBody).forEach((key) => {
    if (key === "questionId") return;
    answerList.push({
      componentId: key,
      value: reqBody[key],
    });
  });

  return {
    questionId: reqBody.questionId || "",
    answerList,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    // 不是 post 则返回错误
    return res.status(405).json({ errno: -1, msg: "Method 错误" });
  }

  // 设置 CORS 头
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 获取并格式化表单数据
  const answerInfo = genAnswerInfo(req.body);

  console.log("[BFF] 答案信息:", answerInfo);

  try {
    // 通过 BFF 层转发到后端服务
    console.log(`[BFF] 转发答案到后端: ${BACKEND_HOST}/api/answer`);

    const response = await fetch(`${BACKEND_HOST}/api/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(answerInfo),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const resData = await response.json();
    console.log("[BFF] 后端响应:", resData);

    if (resData.errno === 0) {
      // 如果提交成功了
      return res.redirect("/success");
    } else {
      // 提交失败了
      return res.redirect("/fail");
    }
  } catch (err) {
    console.error("[BFF] 提交答案失败:", err);
    return res.redirect("/fail");
  }
}
