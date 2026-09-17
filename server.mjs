import express from "express";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

const schemaInstruction = `Kembalikan HANYA JSON valid tanpa markdown dengan struktur:
{
  "title": "string",
  "identity": {"subject":"string","grade":"string","duration":"string","model":"string"},
  "learning_objectives":"string",
  "character_focus":["string"],
  "meaningful_understanding":"string",
  "trigger_questions":["string","string","string"],
  "steps":{"introduction":"string","core":"string","closing":"string"},
  "assessment":{"diagnostic":"string","formative":"string","summative":"string"},
  "media_and_sources":["string"],
  "teacher_notes":"string"
}
Buat isi dalam Bahasa Indonesia, praktis untuk guru, selaras dengan Kurikulum Merdeka bila relevan, dan jangan mengarang regulasi atau sumber spesifik. Tujuan harus terukur. Langkah inti harus rinci namun ringkas dan selaras dengan model pembelajaran. Sertakan diferensiasi atau catatan adaptasi bila konteks memerlukannya.`;

function buildPrompt(data) {
  return `${schemaInstruction}\n\nData guru:\nTopik: ${data.topic}\nMata pelajaran: ${data.subject}\nKelas/Fase: ${data.grade}\nAlokasi waktu: ${data.duration || "belum ditentukan"}\nTujuan pembelajaran dari guru: ${data.objective}\nModel pembelajaran: ${data.model}\nProfil/fokus karakter: ${data.character || "tidak ditentukan"}\nCatatan tambahan: ${data.notes || "tidak ada"}`;
}

app.post("/api/generate-module", async (req, res) => {
  if (!client) return res.status(503).json({ error: "OPENAI_API_KEY belum dikonfigurasi di server." });
  const data = req.body || {};
  for (const key of ["topic", "subject", "grade", "objective"]) {
    if (!String(data[key] || "").trim()) return res.status(400).json({ error: `Kolom ${key} wajib diisi.` });
  }

  try {
    const response = await client.responses.create({
      model,
      instructions: "Anda adalah perancang pembelajaran untuk guru Indonesia. Utamakan akurasi pedagogis, kejelasan, keterukuran, dan konteks kelas.",
      input: buildPrompt(data),
      store: false
    });
    const raw = response.output_text?.trim() || "";
    let module;
    try { module = JSON.parse(raw); }
    catch {
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
      module = JSON.parse(cleaned);
    }
    res.json({ module });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghubungi layanan AI. Periksa API key, model, dan koneksi server." });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true, aiConfigured: Boolean(client), model }));
app.listen(port, () => console.log(`AGC WEB berjalan di http://localhost:${port}`));
