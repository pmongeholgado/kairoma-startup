require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

// Railway necesita escuchar en 0.0.0.0
const HOST = "0.0.0.0";
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * 🟢 HEALTHCHECK
 * Railway comprobará este endpoint
 */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "kairoma-backend",
  });
});

/**
 * 🔑 Comprobación API KEY al arrancar
 */
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY no configurada");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 🧠 ENDPOINT IDEA
 */
app.post("/idea", async (req, res) => {
  const topic = (req.body?.topic || "").toString().trim();

  if (!topic) {
    return res.json({
      idea: "Escribe un tema para generar ideas.",
    });
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
          content: `Tema: "${topic}". Dame exactamente 3 ideas claras y accionables con primer paso.`,
        },
      ],
      max_output_tokens: 220,
    });

    const idea =
      response.output_text?.trim() ||
      "No se pudo generar respuesta.";

    return res.json({ idea });
  } catch (error) {
    console.error("🔥 Error OpenAI:", error?.message || error);
    return res.status(500).json({
      idea: "Error generando ideas con IA.",
    });
  }
});

/**
 * 🚀 ARRANQUE SERVIDOR
 */
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
});
