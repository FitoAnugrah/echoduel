# 🎵 Echoduel: Web Tebak Suara Real-time

> **Echoduel** adalah platform game tebak musik dinamis berbasis *real-time multiplayer* dengan implementasi *fetching* API terdistribusi. 

Proyek ini dikembangkan untuk memenuhi syarat Ujian Akhir Semester (UAS) mata kuliah pemrograman web.

---

## 🎯 Fitur Utama
- **Real-time Multiplayer:** Memanfaatkan WebSockets (Socket.io) untuk membuat *room*, mengundang teman ("Invite Teman"), dan sinkronisasi *gameplay* antar pemain tanpa *delay*.
- **Fetching API Terdistribusi:** Mengambil sumber data audio secara dinamis dari API musik eksternal, sehingga tebakan selalu unik setiap sesinya.
- **Modern UI/UX:** Antarmuka yang responsif dan interaktif dibangun menggunakan Tailwind CSS.

---

## 💻 Tech Stack
Proyek ini mengadopsi arsitektur *Client-Server* dengan pemisahan *folder* yang jelas:

**Frontend (`/src`):**
- Vite (Build Tool)
- HTML5, Vanilla JavaScript
- Tailwind CSS & PostCSS

**Backend (`/backend`):**
- Node.js
- Express.js
- Socket.io (Real-time Engine)

---

## 📂 Struktur Repositori Utama
- `/backend` : Berisi logika *server*, konfigurasi Socket.io, dan *handling* API.
- `/src` : Berisi aset *frontend*, komponen UI, dan logika klien (*gameplay*).
- `vite.config.js` & `tailwind.config.js` : Konfigurasi *bundler* dan *styling*.

---

## 🚀 Cara Menjalankan di Komputer Lokal

Karena proyek ini terbagi menjadi Frontend dan Backend, Anda perlu menjalankan keduanya secara bersamaan.

### Prasyarat
- [Node.js](https://nodejs.org/) terinstal di komputer.

### Langkah-langkah
1. **Clone repositori ini:**
   ```bash
     git clone [https://github.com/](https://github.com/)[USERNAME-KALIAN]/echoduel.git
     cd echoduel
  
2. Jalankan Backend (Server):
Buka terminal baru, arahkan ke folder backend, dan jalankan server.

         cd backend
         npm install
         npm start

3.Jalankan Frontend (Client):
Buka terminal baru lainnya, pastikan berada di folder utama proyek (echoduel), lalu jalankan Vite.

      npm install
      npm run dev

4.Buka tautan lokal yang diberikan oleh Vite (biasanya http://localhost:5173) di browser Anda.
