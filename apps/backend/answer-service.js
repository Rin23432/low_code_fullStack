const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.ANSWER_SERVICE_PORT || 3102;
const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || "http://localhost:3101";

const submissions = [];

app.get("/health", (req, res) => {
  res.json({ service: "answer-service", status: "ok" });
});

app.post("/api/answer", async (req, res) => {
  const { questionId, answerList = [] } = req.body || {};
  if (!questionId) {
    return res.status(400).json({ code: 40001, msg: "questionId is required", data: null });
  }

  try {
    await axios.get(`${QUESTION_SERVICE_URL}/api/question/${questionId}`, { timeout: 3000 });
  } catch (error) {
    return res.status(400).json({ code: 40002, msg: "invalid questionId", data: null });
  }

  const item = {
    id: `ans_${Date.now()}`,
    questionId,
    answerList,
    createdAt: new Date().toISOString()
  };

  submissions.push(item);
  return res.json({ code: 0, msg: "ok", data: item });
});

app.get("/api/answer/list", (req, res) => {
  res.json({ code: 0, msg: "ok", data: { list: submissions } });
});

app.listen(PORT, () => {
  console.log(`[answer-service] listening on http://localhost:${PORT}`);
});