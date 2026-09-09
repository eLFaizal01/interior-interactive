# Paket UI — Ruang Ceria

Paket aset untuk Ayo Lengkapi Ruangan! Gaya visual: krem hangat, toska, kuning madu, bentuk membulat, dan ikon sederhana. Ini aset dan katalog desain; aplikasi permainan belum dibuat atau dijalankan.

## Berkas yang dipakai

| Lokasi | Isi |
| --- | --- |
| `assets/images/ui/icons/` | 21 ikon kontrol serta simbol tiga ruangan |
| `assets/images/ui/buttons/` | 14 latar tombol: normal, hover, ditekan, dan nonaktif |
| `assets/images/ui/panels/` | 9 panel: katalog, HUD, dialog, kartu furnitur, kartu ruangan |
| `assets/images/ui/badges/` | Centang selesai, kunci, dan label tingkat kesulitan |
| `assets/images/ui/rewards/` | Bintang kosong dan terisi |
| `assets/images/ui/progress/` | Jalur progres, isi progres, dan latar timer |
| `assets/images/ui/effects/` | Kilau, konfeti, dan penanda target |
| `assets/images/ui/backgrounds/menu-room.png` | Ilustrasi latar menu, 1536 × 1024 |
| `config/ui-assets.json` | ID dan lokasi semua aset UI |
| `config/ui-theme.json` | Warna, ukuran teks, jarak sentuh, dan durasi animasi yang disarankan |
| `config/ui-components.json` | Teks Indonesia dan susunan tombol |
| `docs/ui/asset-overview.png` | Katalog visual aset terpisah |

Terdapat 59 aset vektor, masing-masing disertai PNG transparan beresolusi dua kali ukuran logis, serta satu latar menu PNG. Semua ID UI juga terdaftar di `config/assets.json`.

## Memasang aset nantinya

1. Pilih SVG jika mesin mendukungnya, atau PNG untuk impor sprite biasa. Keduanya memiliki gambar yang sama; jangan tampilkan keduanya sekaligus.
2. Letakkan label teks sebagai elemen aplikasi di atas latar tombol. Label tidak ditanam pada gambar agar bahasa dan ukuran dapat diganti. Ikon SVG berwarna gelap; untuk tombol toska, beri warna putih pada ikon melalui CSS/mask atau tint yang sesuai. Jika memakai PNG, gunakan alpha mask untuk tint putih; perkalian warna biasa tidak bisa mengubah ikon gelap menjadi putih.
3. Ukuran contoh tombol adalah 320 × 80 unit, dengan PNG 640 × 160 piksel. Area sentuh minimal 64 × 64 unit. Label panjang dapat memakai tombol yang lebih lebar.
4. Panel dan tombol mempunyai `nineSliceInsetsLogical` dengan urutan kiri, atas, kanan, bawah. Untuk PNG 2x, kalikan batas tersebut dengan dua. Gunakan nine-slice agar sudut membulat tidak melar. Jangan mengecilkan panel di bawah jumlah kedua inset.
5. Progres diisi aplikasi berdasarkan jumlah furnitur; gunakan clipping atau nine-slice. Jangan menaruh angka tetap pada gambar. Saat progres nol, sembunyikan isi; pada progres sangat kecil gunakan clipping agar tutup membulat tidak melar.
6. Untuk item benar, gunakan kartu selesai + badge centang + teks “Sudah dipasang”, kemudian nonaktifkan drag. Status tidak hanya dibedakan berdasarkan warna.
7. Hasil selalu menampilkan tiga tempat bintang; isi satu, dua, atau tiga sesuai aturan permainan. Bintang yang belum didapat memakai aset kosong.
8. Target oval adalah penanda tambahan/cadangan, bukan bayangan bentuk furnitur. Bayangan furnitur yang sesungguhnya dibuat dari model 3D saat integrasi.
9. Latar menu memiliki ruang kosong di kiri untuk judul dan tombol. Pada layar sempit, sesuaikan pemotongan atau tempatkan teks pada panel krem terpisah. Jangan menjadikan ilustrasi latar sebagai ruangan permainan.

Font Nunito hanya preferensi desain dan belum disertakan. Gunakan Segoe UI/Arial yang tersedia dahulu; jika menambahkan font, simpan berkas dan lisensinya. Teks kecil tetap sekurangnya 16 unit, teks utama 20–22 unit. Ikon kecil harus memiliki label yang dapat dibaca atau nama aksesibilitas.

## Mengganti dari folder lokal

Untuk mengganti bentuk tanpa mengubah kode aplikasi, timpa aset dengan nama dan ukuran kanvas yang sama. Jika mengganti format/nama, perbarui entri ID yang sama pada `config/ui-assets.json` dan `config/assets.json`. Jika memakai SVG dan PNG, perbarui kedua format supaya tampilan konsisten. Teks diubah di `config/ui-components.json`.

Generator `tools/build_ui_assets.py` dan pengekspor `tools/export_ui_assets.cjs` disertakan untuk pemeliharaan. Menjalankan ulang akan menimpa aset vektor/PNG hasil generator; jangan jalankan setelah revisi manual kecuali memang ingin membuat ulang. Pengekspor memerlukan paket `sharp` yang tersedia pada lingkungan pembuatan. Tidak ada unduhan font atau ikon pihak ketiga dalam paket ini.

## Asal ilustrasi

Ilustrasi latar menu dibuat menggunakan tool imagegen bawaan. Ikon, tombol, dan panel adalah bentuk vektor yang dibuat khusus untuk proyek. Prompt latar tersimpan dalam `docs/ui/IMAGE_PROMPT.txt`.
