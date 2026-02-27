require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Endpoint healthcheck Railway
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Falta OPENAI_API_KEY");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/idea", async (req, res) => {
  const topic = (req.body?.topic || "").trim();

  if (!topic) {
    return res.json({ idea: "Escribe un tema para generar ideas." });
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `Genera 3 ideas claras y accionables sobre: ${topic}`,
      max_output_tokens: 200,
    });

    const idea = response.output_text || "No se pudo generar la idea.";
    res.json({ idea });

  } catch (err) {
    console.error(err);
    res.status(500).json({ idea: "Error IA" });
  }
});

// 🔹 MUY IMPORTANTE para Railway
const PORT = Number(process.env.PORT || 8080);
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});