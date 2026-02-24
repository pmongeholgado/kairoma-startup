require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

// 🔹 Configuración básica
app.use(cors());
app.use(express.json());

// 🔹 Validación de clave
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Falta OPENAI_API_KEY en backend/.env");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔹 Endpoint salud (Railway lo usa para verificar)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "kairoma-backend",
  });
});

// 🔹 Endpoint principal
app.post("/idea", async (req, res) => {
  const t = (req.body?.topic || "")
    .toString()
    .trim()
    .slice(0, 200);

  if (!t) {
    return res.json({
      idea: "Escribe un tema para generar ideas.",
    });
  }

  try {
    const r = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Eres un generador de ideas práctico. Respondes en español con ideas claras y accionables.",
        },
        {
          role: "user",
          content:
            `Tema: "${t}".\n` +
            `Dame EXACTAMENTE 3 ideas.\n` +
            `Formato:\n` +
            `1) Título — explicación breve. Primer paso: ...\n` +
            `2) ...\n` +
            `3) ...`,
        },
      ],
      max_output_tokens: 280,
    });

    const idea = (r.output_text || "").trim();

    if (!idea) {
      return res.json({
        idea: "No se pudo generar respuesta. Intenta otra vez.",
      });
    }

    return res.json({ idea });
  } catch (err) {
    const status = err?.status || err?.response?.status;
    const code =
      err?.error?.code ||
      err?.response?.data?.error?.code;
    const message =
      err?.error?.message ||
      err?.response?.data?.error?.message ||
      err?.message ||
      String(err);

    console.error("🔥 OPENAI ERROR REAL =>", {
      status,
      code,
      message,
    });

    return res.status(500).json({
      idea:
        `Error IA (${status || "?"}${code ? ` / ${code}` : ""}). ` +
        `Mira la terminal: ahí está el motivo exacto.`,
    });
  }
});

// 🔹 Puerto compatible con Railway
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Kairoma backend corriendo en puerto ${PORT}`);
});
