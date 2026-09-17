document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("moduleForm");
  const resultSection = document.getElementById("resultSection");
  const resultContent = document.getElementById("resultContent");
  const resultMeta = document.getElementById("resultMeta");
  const status = document.getElementById("formStatus");
  const generateBtn = form.querySelector('button[type="submit"]');
  const API_ENDPOINT = window.AGC_CONFIG?.moduleGeneratorEndpoint || "/api/generate-module";

  const value = id => document.getElementById(id).value.trim();
  const esc = text => String(text ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const list = items => Array.isArray(items) ? items : [];
  const paragraphs = text => esc(text).replace(/\n+/g, "</p><p>");

  function renderModule(data) {
    const identity = data.identity || {};
    const steps = data.steps || {};
    const assessment = data.assessment || {};
    const questions = list(data.trigger_questions);
    const media = list(data.media_and_sources);
    const characters = list(data.character_focus);

    resultContent.innerHTML = `
      <header class="module-cover"><p>MODUL AJAR • DIBUAT DENGAN AI</p><h1>${esc(data.title || value("topic"))}</h1><div>${esc(identity.subject || value("subject"))} · ${esc(identity.grade || value("grade"))}</div></header>
      <div class="module-body">
        <section><h3>A. Identitas Pembelajaran</h3><dl>
          <dt>Mata Pelajaran</dt><dd>${esc(identity.subject || value("subject"))}</dd>
          <dt>Kelas / Fase</dt><dd>${esc(identity.grade || value("grade"))}</dd>
          <dt>Alokasi Waktu</dt><dd>${esc(identity.duration || value("duration") || "Disesuaikan kebutuhan")}</dd>
          <dt>Model Pembelajaran</dt><dd>${esc(identity.model || value("model"))}</dd>
        </dl></section>
        <section><h3>B. Tujuan Pembelajaran</h3><p>${paragraphs(data.learning_objectives || value("objective"))}</p></section>
        <section><h3>C. Profil / Fokus Karakter</h3><ul>${characters.map(x => `<li>${esc(x)}</li>`).join("") || `<li>${esc(value("character") || "Bernalar kritis dan gotong royong")}</li>`}</ul></section>
        <section><h3>D. Pemahaman Bermakna</h3><p>${paragraphs(data.meaningful_understanding || "Peserta didik memahami konsep dan menghubungkannya dengan situasi nyata.")}</p></section>
        <section><h3>E. Pertanyaan Pemantik</h3><ol>${questions.map(x => `<li>${esc(x)}</li>`).join("")}</ol></section>
        <section><h3>F. Langkah-Langkah Pembelajaran</h3>
          <div class="lesson-step"><b>Pendahuluan</b><p>${paragraphs(steps.introduction || "Guru membuka pembelajaran, mengaitkan pengetahuan awal, menyampaikan tujuan, dan memotivasi peserta didik.")}</p></div>
          <div class="lesson-step"><b>Kegiatan Inti</b><p>${paragraphs(steps.core || "Peserta didik mengeksplorasi materi melalui aktivitas yang sesuai dengan model pembelajaran, berdiskusi, mengolah informasi, dan menyampaikan hasil.")}</p></div>
          <div class="lesson-step"><b>Penutup</b><p>${paragraphs(steps.closing || "Peserta didik melakukan refleksi, menyimpulkan pembelajaran, dan menerima tindak lanjut.")}</p></div>
        </section>
        <section><h3>G. Asesmen</h3><div class="assessment-grid">
          <div><b>Diagnostik</b><p>${paragraphs(assessment.diagnostic || "Pertanyaan awal untuk memetakan pengetahuan dan kesiapan belajar.")}</p></div>
          <div><b>Formatif</b><p>${paragraphs(assessment.formative || "Observasi, diskusi, lembar aktivitas, dan umpan balik selama proses.")}</p></div>
          <div><b>Sumatif</b><p>${paragraphs(assessment.summative || "Tugas, produk, atau tes untuk mengukur ketercapaian tujuan pembelajaran.")}</p></div>
        </div></section>
        <section><h3>H. Media & Sumber Belajar</h3><ul>${media.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>
        <section><h3>I. Catatan / Diferensiasi</h3><p>${paragraphs(data.teacher_notes || value("notes") || "Sesuaikan aktivitas dengan kondisi kelas, kebutuhan peserta didik, dan sumber daya sekolah.")}</p></section>
      </div>`;
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = "Lengkapi kolom yang wajib diisi terlebih dahulu.";
      return;
    }

    const payload = {
      topic: value("topic"), subject: value("subject"), grade: value("grade"),
      duration: value("duration"), objective: value("objective"), model: value("model"),
      character: value("character"), notes: value("notes")
    };

    generateBtn.disabled = true;
    generateBtn.classList.add("is-loading");
    generateBtn.textContent = "⏳ Menyusun dengan AI...";
    status.textContent = "AI sedang menyusun modul ajar. Mohon tunggu...";

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Server AI tidak dapat memproses permintaan.");
      if (!body.module) throw new Error("Respons AI tidak berisi modul ajar.");

      resultMeta.textContent = `${payload.subject} • ${payload.grade} • ${payload.duration || "Durasi disesuaikan"} • AI aktif`;
      renderModule(body.module);
      resultSection.hidden = false;
      status.textContent = "Modul ajar berhasil dibuat oleh AI. Tinjau dan sesuaikan sebelum digunakan.";
      resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      status.textContent = error.message.includes("Failed to fetch")
        ? "Server AI belum berjalan. Jalankan backend AGC WEB terlebih dahulu."
        : error.message;
      status.classList.add("error");
    } finally {
      generateBtn.disabled = false;
      generateBtn.classList.remove("is-loading");
      generateBtn.textContent = "✦ Susun Modul Ajar dengan AI";
    }
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    form.reset(); status.textContent = ""; status.classList.remove("error"); resultSection.hidden = true;
  });
  document.getElementById("printBtn").addEventListener("click", () => window.print());
});
