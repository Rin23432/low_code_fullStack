import type { NextApiRequest, NextApiResponse } from "next";

// 模拟问题列表数据
const mockQuestionList = [
  {
    id: "1",
    title: "用户满意度调查",
    desc: "了解用户对我们产品的满意程度",
    isPublished: true,
    isDeleted: false,
    componentList: [
      {
        fe_id: "c1",
        type: "questionInput",
        title: "您对我们的产品有什么建议？",
        placeholder: "请输入您的建议",
      },
      {
        fe_id: "c2",
        type: "questionRadio",
        title: "您对我们的服务满意吗？",
        options: [
          { value: "非常满意", text: "非常满意" },
          { value: "满意", text: "满意" },
          { value: "一般", text: "一般" },
          { value: "不满意", text: "不满意" },
        ],
        value: "",
        isVertical: true,
      },
    ],
  },
  {
    id: "2",
    title: "产品功能调研",
    desc: "收集用户对产品功能的反馈",
    isPublished: true,
    isDeleted: false,
    componentList: [
      {
        fe_id: "c1",
        type: "questionCheckbox",
        title: "您希望我们增加哪些功能？",
        list: [
          { value: "功能1", text: "功能1", checked: false },
          { value: "功能2", text: "功能2", checked: false },
          { value: "功能3", text: "功能3", checked: false },
        ],
        isVertical: true,
      },
    ],
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 只允许 GET 请求
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // 设置 CORS 头
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 返回模拟数据
  return res.status(200).json({
    errno: 0,
    data: mockQuestionList,
    msg: "获取成功",
  });
}

