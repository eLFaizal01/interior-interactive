# Ayo Lengkapi Ruangan!

Prototipe lokal permainan menata ruangan untuk anak-anak, menggunakan Three.js dan Vite. Aset, data misi, dan kode permainan tetap terpisah agar mudah direvisi.

## Mulai bermain

Klik dua kali `Mulai Game.cmd`, lalu buka alamat lokal yang ditampilkan. Lihat [panduan menjalankan](docs/CARA_MENJALANKAN.md) untuk kontrol dan cara mengganti model. Dependensi sudah dipasang pada komputer ini.

Tersedia menu awal, tiga ruangan, tingkat mudah/sedang/sulit, contoh ruangan, drag-and-drop dengan snap, timer, jeda, petunjuk, progres, dan bintang. Mode bebas mendukung menambah, menggeser, memutar, dan menghapus benda tanpa waktu.

## Isi folder

- `assets/`: gambar, model 3D, tekstur, audio, dan efek lokal.
- `config/`: aturan permainan dan daftar lokasi aset.
- `data/rooms/`: susunan awal dan target furnitur setiap ruangan.
- `data/missions/`: pilihan furnitur untuk setiap tingkat kesulitan.
- `src/`: implementasi antarmuka, aturan permainan, dan ruangan 3D.
- `docs/`: panduan mengganti aset dan rancangan perilaku permainan.
- `tools/`: alat pembuatan serta ekspor aset UI.
- `tests/`: pemeriksaan aturan permainan dan konsistensi data.

Mulai dari `docs/PANDUAN_ASET.md`. Daftar lokasi model dan gambar ada di `config/assets.json`. Model 3D, gambar furnitur, dan suara belum disertakan; nilai `null` berarti aset belum tersedia, bukan berkas rusak.

Paket UI sudah tersedia di `assets/images/ui/`: 59 aset SVG beserta PNG transparan dan satu ilustrasi latar menu. Lihat [katalog visual](docs/ui/asset-overview.png) dan [panduan UI](docs/ui/PANDUAN_UI.md). Warna dan ukuran ada di `config/ui-theme.json`; teks tombol ada di `config/ui-components.json`.

Ada tiga ruangan contoh, masing-masing delapan target. Tingkat mudah menggunakan empat target, sedang enam, dan sulit delapan dengan dua pilihan pengecoh. Posisi target masih rancangan awal yang harus disesuaikan setelah model asli masuk.

Furnitur contoh berupa bentuk 3D sederhana. Mengisi `path` model GLB di daftar aset akan menggantinya saat halaman dimuat ulang. Susunan belum disimpan antar sesi, dan antarmuka impor belum dibuat. Proyek hanya berjalan lokal dan belum dipublikasikan.
"# interior-interactive" 
"# interior-interactive" 
"# interior-interactive" 
"# interior-interactive" 
