# Basa Jawa Translator V3

Web app OCR aksara Jawa: mode biasa dan mode prediksi (3 pembacaan independen lalu merge teks).


## Deploy
1. Upload **isi folder ini** ke root repository GitHub (bukan folder pembungkus dan bukan ZIP).
2. Import repository ke Vercel, Framework Preset: Other, Root Directory: `./`.
3. Vercel Settings > Environment Variables: `GEMINI_API_KEY` (API key rahasia Google AI Studio). Opsional `GEMINI_MODEL` (default `gemini-2.5-flash`).
4. Redeploy setelah env vars ditambahkan.

Jangan pernah menaruh API key di index.html atau repository publik.

## Test
Run `npm test`.

Note: Live OCR accuracy has not been validated. Review output carefully.
