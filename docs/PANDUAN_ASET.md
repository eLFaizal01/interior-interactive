# Mengganti aset lokal

## Susunan aset

- `assets/models/rooms/<id-ruangan>/`: model dasar ruangan.
- `assets/models/furniture/<id-furnitur>/`: model furnitur beserta teksturnya jika diperlukan.
- `assets/images/furniture/`: gambar katalog furnitur.
- `assets/images/rooms/`: gambar pilihan ruangan.
- `assets/images/ui/`: ikon tombol, bintang, dan elemen antarmuka.
- `assets/audio/music/` dan `assets/audio/sfx/`: musik serta bunyi permainan.
- `assets/effects/`: aset kilau atau perayaan.
- `assets/incoming/`: tempat sementara menaruh aset yang belum disiapkan.

## Dua cara mengganti

1. Jika aset sudah terdaftar, timpa berkas lama dengan aset baru yang memiliki nama dan format sama. Jalur konfigurasi tidak perlu berubah.
2. Jika nama atau format berubah, masukkan berkas ke folder yang sesuai lalu ubah `path` pada entri terkait di `config/assets.json`. Jalur dihitung dari folder utama proyek, menggunakan `/`.

Contoh: isi `model.bed.path` dengan `assets/models/furniture/bed/bed.glb`, lalu isi `image.bed.path` dengan `assets/images/furniture/bed.png`. ID `model.bed` harus tetap sama agar rujukan misi tidak putus.

Gunakan GLB sebagai format pertukaran model yang disarankan, PNG/WebP untuk gambar, dan WAV/OGG untuk audio. Dukungan akhir mengikuti mesin game yang dipilih. Jangan sekadar mengubah ekstensi FBX menjadi GLB; ekspor melalui aplikasi pembuat model. GLB dapat menyimpan material dan tekstur dalam satu berkas.

## Standar model

- Satuan data proyek: meter; sumbu Y ke atas; rotasi dalam derajat.
- Titik asal furnitur di tengah bagian bawah yang menyentuh lantai.
- Arah depan model disepakati sebagai +Z. Adapter mesin game mengonversi koordinat bila berbeda.
- Skala aset diatur lewat `defaultScale` di daftar aset. Transformasi target ada di data ruangan.
- Pertahankan ukuran, titik asal, dan arah depan saat menimpa model agar target tetap sesuai.
- Jika bentuk atau ukuran berubah, periksa kembali posisi target, bayangan, dan toleransi snap.

Setiap target mempunyai rujukan bayangan opsional. Jika `shadowAssetId` bernilai `null`, implementasi nantinya membuat bayangan dari model furnitur. Ukuran `footprintMeters` adalah cadangan area petunjuk, bukan siluet furnitur final.

## Menambah atau mengubah misi

Ubah `data/rooms/<id>.json` untuk posisi dan arah target. Ubah `data/missions/<id>.json` untuk target yang dimainkan dan pengecoh. ID target harus merujuk ke target yang ada pada ruangan tersebut.

Untuk target yang tidak dipilih pada tingkat tertentu, furnitur tetap tampil sebagai dekorasi terkunci. Saat contoh awal ditampilkan, semua delapan furnitur terlihat. Hanya furnitur misi yang kemudian disembunyikan.

Simpan salinan aset asli di luar folder produksi jika perlu. Berkas `.gitkeep` hanya penanda folder kosong dan boleh dibiarkan.
