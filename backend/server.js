require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const path = require("path");

const app = express();

// 🔑 Railway SIEMPRE usa su PORT interno
const PORT = process.env.PORT || 3000;

// 🔐 Middleware
app.use(cors());
app.use(express.json());

// 🟢 HEALTHCHECK (lo que Railway comprueba)
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// 🟢 Endpoint IA
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY no configurada");
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
      input: [
        {
          role: "system",
          content:
            "Eres un generador de ideas práctico. Respondes en español con ideas accionables.",
        },
        {
          role: "user",
          content: `Tema: "${topic}". Dame 3 ideas con primer paso.`,
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

// 🚀 IMPORTANTE: escuchar en 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend listo en puerto ${PORT}`);
});