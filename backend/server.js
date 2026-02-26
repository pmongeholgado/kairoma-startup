require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

/* 🔹 Healthcheck Railway */
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

/* 🔹 Endpoint test */
app.get("/health", (req, res) => {
  res.json({ status: "running" });
});

/* 🔹 Endpoint idea (sin IA para probar estabilidad) */
app.post("/idea", async (req, res) => {
  const topic = req.body?.topic || "";
  res.json({ idea: `Idea de prueba sobre: ${topic}` });
});

/* 🚀 START */
app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on ${HOST}:${PORT}`);
});