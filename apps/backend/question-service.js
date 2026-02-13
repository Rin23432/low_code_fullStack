const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.QUESTION_SERVICE_PORT || 3101;

const questions = [
  { id: "1001", title: "用户体验调研", status: "published" },
  { id: "1002", title: "产品反馈收集", status: "draft" }
];

app.get("/health", (req, res) => {
  res.json({ service: "question-service", status: "ok" });
});

app.get("/api/question/list", (req, res) => {
  res.json({ code: 0, msg: "ok", data: { list: questions } });
});

app.get("/api/question/:id", (req, res) => {
  const question = questions.find((q) => q.id === req.params.id);
  if (!question) {
    return res.status(404).json({ code: 40401, msg: "question not found", data: null });
  }
  return res.json({ code: 0, msg: "ok", data: question });
});

app.listen(PORT, () => {
  console.log(`[question-service] listening on http://localhost:${PORT}`);
});