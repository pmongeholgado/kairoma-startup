require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

// 🔹 Middlewares
app.use(cors());
app.use(express.json());

// 🔑 Cliente OpenAI
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY no configurada");
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🟢 Endpoint raíz (NECESARIO para healthcheck Railway)
app.get("/", (req, res) => {
  res.status(200).send("Kairoma backend OK");
});

// 💡 Endpoint IA
app.post("/idea", async (req, res) => {
  const topic = (req.body?.topic || "").trim();

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
            "Genera ideas prácticas, claras y accionables en español.",
        },
        {
          role: "user",
          content: `Tema: ${topic}. Dame 3 ideas breves con primer paso.`,
        },
      ],
      max_output_tokens: 200,
    });

    const idea = response.output_text || "No se pudo generar respuesta.";

    res.json({ idea });
  } catch (error) {
    console.error("🔥 ERROR IA:", error);
    res.status(500).json({
      idea: "Error generando idea con IA",
    });
  }
});

// 🔥 PUERTO PRODUCCIÓN (RAILWAY)
const PORT = process.env.PORT || 3000;

// 🔥 BIND necesario para contenedores
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Kairoma backend corriendo en puerto ${PORT}`);
});
