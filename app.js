const startBtn = document.getElementById("startBtn");
const actionBox = document.getElementById("actionBox");
const generateBtn = document.getElementById("generateBtn");
const result = document.getElementById("result");
const userInput = document.getElementById("userInput");
const actions = document.getElementById("actions");
const againBtn = document.getElementById("againBtn");
const copyBtn = document.getElementById("copyBtn");
const toast = document.getElementById("toast");

let lastIdeaText = "";

// Mostrar input al pulsar "Probar gratis"
startBtn.addEventListener("click", () => {
  actionBox.classList.remove("hidden");
  startBtn.style.display = "none";
  const microText = document.getElementById("microText");
  if (microText) microText.style.display = "none";
  setTimeout(() => userInput.focus(), 50);
});

// Enter genera idea
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    generateIdea();
  }
});

generateBtn.addEventListener("click", generateIdea);
againBtn.addEventListener("click", generateIdea);

// Copiar resultado
copyBtn.addEventListener("click", async () => {
  if (!lastIdeaText) return;
  await navigator.clipboard.writeText(lastIdeaText);
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 900);
});

// ✅ FUNCIÓN PRINCIPAL — llamada al backend (misma URL del sitio)
async function generateIdea() {
  const topic = userInput.value.trim();

  if (!topic) {
    result.innerHTML = `<div class="ideaCard">⚠️ Escribe un tema primero</div>`;
    return;
  }

  result.innerHTML = `<div class="ideaCard">⏳ Generando idea…</div>`;

  try {
    const response = await fetch("/idea", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });

    // ✅ Si no es OK, intentamos leer texto y mostrarlo (Railway 502/HTML/etc.)
    if (!response.ok) {
      const txt = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status} ${response.statusText} | ${txt.slice(0, 200)}`);
    }

    // ✅ Asegura JSON (por si Railway devuelve algo raro)
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const txt = await response.text().catch(() => "");
      throw new Error(`Respuesta no-JSON: ${contentType} | ${txt.slice(0, 200)}`);
    }

    const data = await response.json();
    const idea = (data && data.idea) ? String(data.idea) : "No se pudo generar la idea.";

    lastIdeaText = idea;

    result.innerHTML = `
      <div class="ideaCard">
        <strong>💡 Idea</strong><br><br>
        ${idea.replace(/\n/g, "<br>")}
      </div>
    `;

    actions.classList.remove("hidden");
  } catch (error) {
    console.error("❌ Frontend fetch error:", error);

    result.innerHTML = `
      <div class="ideaCard">
        ❌ Error conectando con el servidor.<br><br>
        <small>${String(error.message || error).replace(/</g, "&lt;")}</small>
      </div>
    `;
  }
}