# Rancangan implementasi

## Modul yang disediakan

Prototipe menggunakan `src/main.js` untuk alur UI dan input, `src/core/session.js` untuk timer serta aturan misi, `src/rooms/scene.js` untuk Three.js dan pemuatan GLB, serta `src/rooms/furniture.js` untuk model contoh. Folder lain di bawah tetap menjadi pembagian tanggung jawab untuk pemisahan kode lebih lanjut; belum setiap folder mempunyai implementasi terpisah.

| Folder | Tanggung jawab |
| --- | --- |
| core | Status permainan dan kejadian antarmodul |
| assets | Membaca daftar aset dan memuat model, gambar, suara |
| rooms | Memuat ruangan, dekorasi, dan target |
| missions | Membaca tingkat, target aktif, dan pengecoh |
| interaction | Drag dari panel ke dunia 3D, validasi target, snap |
| camera | Menghubungkan kontrol kamera yang sudah ada |
| timer | Waktu aktif, jeda, habis waktu, lanjut tanpa waktu |
| rewards | Bintang dan perayaan |
| ui | Menu, katalog, HUD, petunjuk, jeda, hasil |
| audio | Bunyi penempatan dan perayaan |
| freeplay | Menghubungkan sistem interior bebas yang sudah ada |

## Alur status

Menu → Pilih Ruangan/Tingkat → Misi → Contoh Awal → Siap → Bermain → Hasil.

- Timer mulai setelah contoh awal selesai (`preview-end`), sesuai revisi pengguna. Waktu membaca misi sebelum contoh tidak terpotong. Mode `first-drag` masih tersedia sebagai konfigurasi alternatif.
- Saat drag, input kamera dimatikan. Kembalikan kontrol pada drop, pembatalan drag, atau kehilangan fokus.
- Target cocok yang berada dalam toleransi menyala hijau. Drop valid menggunakan posisi dan rotasi target, mengunci objek, menandai katalog, menambah progres, dan memainkan bunyi serta kilau.
- Drop salah mengembalikan item ke katalog dengan pesan ramah, tanpa penalti. Pengecoh tidak mempunyai target valid.
- Jeda menghentikan timer dan interaksi. Kehilangan fokus memicu jeda agar waktu tidak terpotong saat aplikasi ditinggalkan.
- Timer menggunakan waktu aktif yang berlalu, bukan jumlah frame. Drop setelah waktu habis tidak diterima sebelum anak memilih lanjut tanpa waktu.
- Waktu habis membuka pilihan Coba Lagi atau Lanjut Tanpa Waktu. Coba Lagi mereset misi; lanjut mempertahankan seluruh penempatan dan menandai hasil sebagai tanpa waktu.
- Selesai tanpa waktu: satu bintang. Selesai berwaktu: tiga bintang jika sisa waktu >= durasi awal / 3, selain itu dua bintang.
- Petunjuk menyorot satu target yang belum selesai. Tampilan Awal memperlihatkan susunan lengkap sementara dan memulihkan susunan anak sesudahnya. Kedua bantuan tidak memberi penalti bintang. Selama Tampilan Awal, waktu dan interaksi dihentikan.
- Bermain Bebas terpisah dari status misi, timer, dan bintang; dihubungkan ke sistem interior yang sudah ada ketika tersedia.

## UI

Panel katalog besar di kiri, ruangan perspektif di tengah–kanan. Bagian atas memuat nama misi, timer, dan progres. Kanan bawah memuat Petunjuk, Tampilan Awal, dan Jeda. Katalog final sebaiknya memakai pratinjau model 3D dengan gambar sebagai cadangan.

## Pemeriksaan sebelum implementasi

Pastikan semua ID aset dan target valid, setiap tingkat memiliki 4/6/8 target unik, sulit mempunyai dua pengecoh yang berbeda dari furnitur target, dan posisi furnitur sesuai model ruangan. Koordinat contoh bukan jaminan semua model akan cocok.
