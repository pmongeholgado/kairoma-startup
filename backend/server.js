require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Falta OPENAI_API_KEY en backend/.env");
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "kairoma-backend" });
});

app.post("/idea", async (req, res) => {
  const t = (req.body?.topic || "").toString().trim().slice(0, 200);

  if (!t) return res.json({ idea: "Escribe un tema para generar ideas." });

  try {
    // Endpoint recomendado: Responses API
    const r = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Eres un generador de ideas súper práctico. Respondes en español, sin relleno. Das ideas concretas y accionables.",
        },
        {
          role: "user",
          content:
            `Tema: "${t}".\n` +
            `Dame EXACTAMENTE 3 ideas. Para cada una:\n` +
            `- Título (máx 6 palabras)\n` +
            `- 1 frase de explicación\n` +
            `- Primer paso hoy (muy concreto)\n` +
            `Formato:\n` +
            `1) TÍTULO — explicación. Primer paso: ...\n` +
            `2) ...\n` +
            `3) ...`,
        },
      ],
      max_output_tokens: 280,
    });

    const idea = (r.output_text || "").trim();
    if (!idea) return res.json({ idea: "No se pudo generar respuesta. Intenta otra vez." });

    res.json({ idea });
  } catch (err) {
    // ✅ Error real (para cerrar HOY sí o sí)
    const status = err?.status || err?.response?.status;
    const code = err?.error?.code || err?.response?.data?.error?.code;
    const message =
      err?.error?.message ||
      err?.response?.data?.error?.message ||
      err?.message ||
      String(err);

    console.error("🔥 OPENAI ERROR REAL =>", { status, code, message });

    // Mensaje al frontend (sin exponer nada sensible)
    res.status(500).json({
      idea:
        `Error IA (${status || "?"}${code ? ` / ${code}` : ""}). ` +
        `Mira la terminal: ahí está el motivo exacto.`,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🤖 Backend con IA en http://localhost:${PORT}`));