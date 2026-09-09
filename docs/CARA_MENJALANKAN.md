# Menjalankan prototipe lokal

1. Klik dua kali `Mulai Game.cmd` di folder utama Game.
2. Tunggu sampai muncul alamat Local, lalu buka `http://127.0.0.1:5173` di browser.
3. Biarkan jendela peluncur tetap terbuka selama bermain. Tekan Ctrl+C di jendela tersebut untuk berhenti.

Jika alamat sudah dipakai oleh salinan game yang masih aktif, buka alamat tersebut atau hentikan salinan sebelumnya. Server menggunakan komputer ini saja; game belum dipublikasikan ke internet. Jangan membuka `index.html` langsung karena data dan model harus dimuat melalui server lokal.

## Cara bermain

- Pilih Main Tantangan, ruangan, dan tingkat kesulitan.
- Baca misi, tekan Lihat Contohnya, dan perhatikan susunan selama lima detik.
- Tarik benda dari katalog kiri ke bayangannya. Dekati target yang cocok hingga menyala hijau, lalu lepaskan.
- Alternatif: klik/ketuk benda, lalu klik/ketuk tempatnya. Untuk keyboard: pilih benda dengan Tab dan Enter, gunakan panah untuk menggeser posisi, lalu Enter untuk memasang. Escape membatalkan pilihan.
- Timer langsung mulai setelah contoh awal selesai, meskipun belum ada furnitur yang ditarik. Waktu membaca misi sebelum contoh tidak terpotong. Perilaku ini diatur oleh `timer.startOn: "preview-end"` di `config/game.json`.
- Geser area ruangan kosong untuk memutar kamera, gulir untuk mendekat, atau geser dengan tombol kanan untuk menggeser pandangan. Atur Kamera mengembalikan pandangan awal.
- Jeda menghentikan waktu dan interaksi; meninggalkan layar juga menjeda otomatis. Tampilan Awal menghentikan waktu selama contoh ditampilkan.
- Lanjut Tanpa Waktu mempertahankan furnitur yang sudah terpasang selama sesi tersebut. Memuat ulang halaman atau meninggalkan misi memulai susunan baru.
- Bermain Bebas: tambahkan benda berkali-kali, geser benda yang sudah dipasang, pilih benda untuk memutar 45 derajat atau menghapusnya. Mode ini tidak memakai target, timer, atau bintang.
- Pilihan aktif ditandai kartu “Dipilih” dan label nama benda. Objek yang dipilih di mode bebas atau sedang ditarik memiliki garis sorot dan lingkaran di lantai. Klik tempat kosong pada mode bebas, tekan Escape, atau tombol × pada label untuk membatalkan pilihan. Penanda mengikuti benda saat diputar/digeser dan hilang ketika benda dihapus.

## Mengganti aset

Model contoh dibuat dari bentuk 3D sederhana agar prototipe langsung bisa digunakan. Masukkan GLB ke folder furnitur, isi `path` pada ID `model.*` di `config/assets.json`, lalu muat ulang halaman. Skala menggunakan `defaultScale`, posisi dan arah target memakai `data/rooms/*.json`. Gunakan GLB tanpa kompresi Draco/KTX2 untuk versi awal ini. GLB beserta material/tekstur bawaan didukung; FBX belum dihubungkan.

Gambar furnitur opsional memakai `image.*`; jika kosong, katalog dibuat dari model 3D yang dimuat. Jika model gagal dimuat, game memberi pesan dan menggunakan furnitur contoh. Untuk mengganti latar menu, tombol, ikon, atau bintang, gunakan entri `ui.*` pada konfigurasi utama. Label tombol yang terdaftar dapat diedit melalui `config/ui-components.json`.

Bayangan dibuat dari model yang dipipihkan ke lantai. `shadowAssetId` khusus masih cadangan data, belum dipakai oleh prototipe. Suara bawaan dibuat secara sintetis; jika `audio.correct` atau `audio.celebration` memiliki `path`, aplikasi memakai berkas tersebut.

## Batas versi awal

Belum ada penyimpanan susunan antar sesi, impor dari dalam aplikasi, pemilihan folder melalui UI, atau pengecekan benturan pada mode bebas. Semua target dan aset disiapkan melalui folder lokal. Model 3D asli serta pengujian langsung oleh anak-anak tetap diperlukan untuk menyesuaikan ukuran, posisi, dan toleransi snap.

## Verifikasi pengembangan

- `npm test`: memeriksa timer, jeda, preview, timeout, lanjut tanpa waktu, batas bintang, penempatan duplikat, serta data misi/model contoh.
- `npm run build`: menghasilkan `dist/` beserta salinan aset, konfigurasi, dan data.
- `npm run preview`: membuka hasil build pada alamat yang ditampilkan.

Pemeriksaan otomatis tidak menggantikan uji drag-and-drop, performa WebGL, serta tampilan pada perangkat anak. Pengujian UI browser belum dilakukan pada tahap ini. Tool browser WebMCP opsional menggunakan deteksi dukungan, tetapi belum diverifikasi pada konteks browser yang mendukungnya.
