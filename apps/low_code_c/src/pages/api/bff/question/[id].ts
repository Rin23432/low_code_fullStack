import type { NextApiRequest, NextApiResponse } from "next";

interface QuestionData {
  id: string;
  title: string;
  desc: string;
  js: string;
  css: string;
  isPublished: boolean;
  componentList: any[];
  createTime: string;
  updateTime: string;
  answerCount: number;
  isStar: boolean;
  isDeleted: boolean;
}

interface ApiResponse {
  errno: number;
  data: QuestionData;
  meta: {
    requestId: string;
    timestamp: number;
    delay: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  try {
    // 转发请求到 MOCK 服务
    const startTime = Date.now();
    const response = await fetch(
      `http://localhost:3001/api/bff/question/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const endTime = Date.now();

    // 添加 BFF 层的性能监控
    const bffDelay = endTime - startTime;

    // 设置 CORS 头，解决跨域问题
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // 返回数据并添加 BFF 性能指标
    res.status(200).json({
      ...data,
      meta: {
        ...data.meta,
        bffDelay,
        totalDelay: data.meta.delay + bffDelay,
      },
    });
  } catch (error) {
    console.error("BFF Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
