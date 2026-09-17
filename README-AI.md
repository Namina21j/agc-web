# AGC WEB — Integrasi AI Generator Modul Ajar

Generator Modul Ajar sekarang memanggil backend `/api/generate-module`. API key **tidak** ditaruh di browser.

## Menjalankan lokal

Prasyarat: Node.js 18+.

```bash
npm install
```

Set environment variable:

**Windows PowerShell**
```powershell
$env:OPENAI_API_KEY="sk-..."
$env:OPENAI_MODEL="gpt-5.6-luna"
npm start
```

**macOS/Linux**
```bash
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-5.6-luna"
npm start
```

Buka `http://localhost:3000/generator-modul-ajar.html`.

## Deployment

Deploy seluruh folder ini ke hosting Node.js yang mendukung environment variables. Set `OPENAI_API_KEY` pada dashboard hosting, bukan di file frontend. Endpoint frontend tetap `/api/generate-module`.

Model default dapat diubah dengan `OPENAI_MODEL`. Dokumentasi resmi OpenAI menggunakan Responses API untuk generasi teks dan menyarankan API key disimpan sebagai secret di server/environment, bukan client-side.
