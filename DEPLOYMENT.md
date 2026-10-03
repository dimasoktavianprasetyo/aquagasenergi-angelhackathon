# Panduan Deployment - Industrial Energy Efficiency Copilot

Repositori ini telah dikonfigurasikan agar siap dideploy secara instan baik untuk lingkungan Cloud (Vercel, Railway, Render) maupun lingkungan Container (Docker Compose).

---

## 1. Opsi A: Frontend di Vercel + Backend di Railway / Render (Rekomendasi Cloud)

Karena backend menggunakan arsitektur **gRPC Microservices (port 50051 & 50052)** dan **WebSocket real-time streaming**, arsitektur cloud terpisah adalah praktik terbaik:

### Langkah 1: Deploy Backend (Railway / Render)
1. Buat proyek baru di [Railway.app](https://railway.app) atau [Render.com](https://render.com).
2. Hubungkan repositori GitHub Anda.
3. Railway/Render akan secara otomatis mendeteksi berkas:
   - `backend/Dockerfile`
   - `railway.json` / `render.yaml`
4. Backend akan langsung aktif dan mengekspos endpoint HTTP & WebSocket (misal: `https://age-copilot-backend.up.railway.app`).

### Langkah 2: Deploy Frontend di Vercel
1. Masuk ke dashboard [Vercel](https://vercel.com) dan pilih **Add New Project**.
2. Pilih repositori ini.
3. Vercel akan otomatis membaca berkas `vercel.json` (framework: Vite, output: `frontend/dist`).
4. Pada bagian **Environment Variables**, tambahkan:
   - `VITE_API_URL` : `https://age-copilot-backend.up.railway.app`
   - `VITE_WS_URL`  : `wss://age-copilot-backend.up.railway.app/ws/copilot`
5. Klik **Deploy**. Selesai!

---

## 2. Opsi B: Full-Stack 1 Perintah dengan Docker Compose (Local / Server VPS)

Untuk menjalankan seluruh platform (Frontend Vite + Nginx Reverse Proxy + Backend Gateway + 2 gRPC Microservices) sekaligus:

```bash
docker compose up --build
```

Setelah container berjalan:
- **Frontend**: Akses di `http://localhost:5173`
- **Backend API Gateway**: Akses di `http://localhost:8000`
- **gRPC Services**: Berjalan internal pada port `50051` dan `50052`.

---

## 3. Konfigurasi Berkas Deployment dalam Repositori

- `vercel.json` (Root): Konfigurasi monorepo Vercel otomatis untuk build frontend.
- `frontend/vercel.json`: Konfigurasi Vercel bila direktori root disetel ke `frontend`.
- `frontend/.env.example`: Contoh variabel lingkungan frontend.
- `backend/Dockerfile`: Container Python 3.11 terisolasi dengan seluruh dependensi numerik dan gRPC.
- `frontend/Dockerfile` & `frontend/nginx.conf`: Multi-stage build Nginx dengan reverse proxy `/api/` dan `/ws/`.
- `docker-compose.yml`: Orkestrator full-stack multi-container.
- `railway.json` & `render.yaml`: Konfigurasi deklaratif 1-klik untuk platform cloud PaaS.
- `backend/gateway/grpc_client.py`: Dilengkapi proteksi *in-process fallback* otomatis bila gRPC tidak aktif.
