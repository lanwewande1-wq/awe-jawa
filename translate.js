export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { mode, image, mimeType, text } = req.body || {};
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'API key belum dipasang di Vercel.' });
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const base = `Baca aksara Jawa (Hanacaraka) dari gambar secara teliti. Jangan mengarang bagian yang tidak terbaca. Jawab dalam JSON valid dengan keys: jawa (teks aksara Jawa), latin (transliterasi Latin dengan spasi kata yang wajar), indonesia (terjemahan Bahasa Indonesia), catatan (array bagian yang meragukan).`;
  const prompts = mode === 'prediction' ? [
    'Fokus pada bentuk karakter, pasangan, sandhangan, dan tanda baca. ' + base,
    'Fokus pada pemisahan kata dan konteks kalimat, jangan menebak karakter buram. ' + base,
    'Baca secara independen, teliti urutan aksara dan tanda diakritik. ' + base
  ] : [base];
  const call = async (parts) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.2 } })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || 'Gemini API error');
    return data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  };
  const parse = (raw) => {
    const cleaned = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    try { return JSON.parse(cleaned); } catch { return { jawa: '', latin: raw, indonesia: '', catatan: ['Format respons tidak terbaca; periksa hasil.'] }; }
  };
  try {
    const imagePart = { inline_data: { mime_type: mimeType || 'image/jpeg', data: image } };
    if (mode !== 'prediction') {
      const raw = await call([{ text: prompts[0] }, imagePart]);
      return res.status(200).json({ result: parse(raw), scans: [] });
    }
    const scans = [];
    for (const prompt of prompts) scans.push(parse(await call([{ text: prompt }, imagePart])));
    const mergePrompt = `Gabungkan hasil baca berikut. Utamakan karakter yang konsisten, rapikan spasi dan paragraf. Jangan membuat kata baru bila tidak didukung. Hasilkan JSON keys jawa, latin, indonesia, catatan.\n${JSON.stringify(scans)}`;
    const merged = parse(await call([{ text: mergePrompt }]));
    return res.status(200).json({ result: merged, scans });
  } catch (e) { return res.status(500).json({ error: e.message || 'Terjadi kesalahan saat memproses gambar.' }); }
}
