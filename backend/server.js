require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

// 🔑 IMPORTANTE: Railway necesita escuchar en 0.0.0.0
const HOST = "0.0.0.0";
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🟢 Healthcheck endpoint (Railway lo necesita)
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// 🟢 Verificación API key
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY no configurada");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Endpoint principal
app.post("/idea", async (req, res) => {
  const topic = (req.body?.topic || "").trim();

  if (!topic) {
    return res.json({ idea: "Escribe un tema para generar ideas." });
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Eres un generador de ideas práctico. Respondes en español con ideas accionables.",
        },
        {
          role: "user",
          content: `Tema: "${topic}". Dame 3 ideas concretas con primer paso.`,
        },
      ],
      max_output_tokens: 200,
    });

    const idea = response.output_text || "No se pudo generar respuesta.";

    res.json({ idea });
  } catch (error) {
    console.error("🔥 Error OpenAI:", error);
    res.status(500).json({ idea: "Error generando ideas." });
  }
});

// 🚀 Arranque servidor
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
});
