# Galeri Eksen 11

Website galeri karya Eksen 11 (tema Banyuwangi, 14 November 2026, Universitas Jember). HTML, Plain CSS, dan JavaScript DOM.

## Screenshot


## Penjelasan singkat
- Responsive mobile-first (Grid, Flexbox, rem, media query).
- DOM dinamis: kartu karya dibuat lewat `createElement` dan `appendChild`, dengan filter status dan detail karya memakai `<dialog>`.
- Fetch API (`async/await`) memuat data karya, lengkap dengan status loading dan error. Data diperbarui otomatis tiap 30 detik.
- Halaman `admin.html` (login) untuk tambah, edit, hapus, sembunyikan (draft), dan tandai terjual. Data disimpan di Supabase, hak tulis hanya untuk akun admin.
- Tanpa Supabase, situs memakai `karya.json` (mode demo).

## Setup Supabase (sekali saja)
1. Buat project di supabase.com.
2. Authentication, Users, Add user, isi email dan kata sandi admin. Di Authentication, Sign In / Providers, matikan "Allow new users to sign up".
3. SQL Editor: tempel isi `setup.sql`, ganti `GANTI_EMAIL_ADMIN` (3 tempat) dengan email admin, lalu Run.
4. Project Settings, API: salin Project URL dan anon public key ke `config.js`.
5. Buka `admin.html` untuk masuk dan mengelola karya.

## Deployment
Link: https://valensinaga.github.io/eksen11-gallery/
