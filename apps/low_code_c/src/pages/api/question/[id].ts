import type { NextApiRequest, NextApiResponse } from "next";

// 后端服务地址
const BACKEND_HOST = process.env.BACKEND_HOST || "http://localhost:3001";

// 内存缓存
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 只允许 GET 请求
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  const cacheKey = `question_${id}`;

  // 设置 CORS 头
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    // 检查缓存
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[BFF] 缓存命中: ${cacheKey}`);
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(cached.data);
    }

    // 设置请求超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时

    console.log(`[BFF] 转发请求到后端: ${BACKEND_HOST}/api/question/${id}`);

    // 转发请求到后端服务
    const response = await fetch(`${BACKEND_HOST}/api/question/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    // 缓存数据
    cache.set(cacheKey, { data, timestamp: Date.now() });

    console.log(`[BFF] 请求成功，数据已缓存: ${cacheKey}`);
    res.setHeader("X-Cache", "MISS");

    return res.status(200).json(data);
  } catch (error) {
    console.error(`[BFF] 请求失败:`, error);

    // 如果是超时错误，尝试返回过期的缓存数据
    if (error instanceof Error && error.name === "AbortError") {
      const expiredCache = cache.get(cacheKey);
      if (expiredCache) {
        console.log(`[BFF] 请求超时，返回过期缓存: ${cacheKey}`);
        res.setHeader("X-Cache", "EXPIRED");
        return res.status(200).json(expiredCache.data);
      }
    }

    return res.status(500).json({
      errno: 1,
      msg: "获取问题数据失败",
      data: null,
    });
  }
}

