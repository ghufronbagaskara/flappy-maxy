
# Flappy Maxy

Flappy Maxy adalah game Flappy Bird versi web dengan satu twist penting: setelah game over, skor pemain otomatis dikirim ke email yang didaftarkan sebelumnya.

Singkatnya, ini bukan cuma game. Ini game + automation pipeline yang benar-benar dipakai.

## Apa yang ada di aplikasi ini

- Halaman registrasi pemain (nama + email)
- Game canvas bergaya arcade
- Scoring, collision, dan game over state
- Endpoint API untuk kirim skor
- Integrasi Resend untuk email delivery
- UI neon retro yang tetap responsif di layar kecil

## Stack

- Next.js (App Router)
- TypeScript (strict)
- Tailwind CSS + custom CSS animation
- Resend (email sending)
- HTML5 Canvas API (game rendering)

## Alur pengguna

1. Pemain buka aplikasi.
2. Isi nama dan email.
3. Main sampai game over.
4. Client kirim payload skor ke API.
5. Server validasi payload lalu kirim email skor lewat Resend.
6. Pemain lihat status kirim email di game over overlay.

## Menjalankan di lokal

Pastikan Node.js sudah terpasang (disarankan versi LTS terbaru).

```bash
npm install
```

Buat file `.env.local` di root project, lalu isi variabel ini:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Jalankan dev server:

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Build production

```bash
npm run lint
npm run build
npm run start
```

## Penutup

Enjoy the game...
