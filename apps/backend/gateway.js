const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.GATEWAY_PORT || 3100;
const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || "http://localhost:3101";
const ANSWER_SERVICE_URL = process.env.ANSWER_SERVICE_URL || "http://localhost:3102";

app.get("/health", async (req, res) => {
  try {
    const [question, answer] = await Promise.all([
      axios.get(`${QUESTION_SERVICE_URL}/health`, { timeout: 1500 }),
      axios.get(`${ANSWER_SERVICE_URL}/health`, { timeout: 1500 })
    ]);
    res.json({
      service: "gateway",
      status: "ok",
      dependencies: {
        question: question.data.status,
        answer: answer.data.status
      }
    });
  } catch (error) {
    res.status(503).json({ service: "gateway", status: "degraded" });
  }
});

app.get("/api/question/list", async (req, res) => {
  try {
    const result = await axios.get(`${QUESTION_SERVICE_URL}/api/question/list`, { timeout: 3000 });
    res.json(result.data);
  } catch (error) {
    res.status(502).json({ code: 50201, msg: "question service unavailable", data: null });
  }
});

app.get("/api/question/:id", async (req, res) => {
  try {
    const result = await axios.get(`${QUESTION_SERVICE_URL}/api/question/${req.params.id}`, { timeout: 3000 });
    res.json(result.data);
  } catch (error) {
    const status = error.response?.status || 502;
    res.status(status).json(error.response?.data || { code: 50201, msg: "question service unavailable", data: null });
  }
});

app.post("/api/answer", async (req, res) => {
  try {
    const result = await axios.post(`${ANSWER_SERVICE_URL}/api/answer`, req.body, { timeout: 3000 });
    res.json(result.data);
  } catch (error) {
    const status = error.response?.status || 502;
    res.status(status).json(error.response?.data || { code: 50202, msg: "answer service unavailable", data: null });
  }
});

app.get("/api/answer/list", async (req, res) => {
  try {
    const result = await axios.get(`${ANSWER_SERVICE_URL}/api/answer/list`, { timeout: 3000 });
    res.json(result.data);
  } catch (error) {
    res.status(502).json({ code: 50202, msg: "answer service unavailable", data: null });
  }
});

app.listen(PORT, () => {
  console.log(`[gateway] listening on http://localhost:${PORT}`);
});