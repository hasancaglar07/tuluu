import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { put } from '@vercel/blob';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MANIFEST_PATH = path.join(__dirname, 'english_icons_manifest.json');
const OUT_MAP_PATH = path.join(__dirname, 'icons-tts-map.json');

// Sağlayıcı seçimi: ELEVENLABS | AZURE | GOOGLE (mock)
const PROVIDER = process.env.TTS_PROVIDER || 'ELEVENLABS';

async function tts(text) {
  const normalized = text.trim();
  if (!normalized) throw new Error('Boş metin için TTS çağrısı yapılamaz');

  if (PROVIDER === 'ELEVENLABS') {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // default (Rachel)
    if (!apiKey) throw new Error('ELEVENLABS_API_KEY eksik');
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: normalized, model_id: 'eleven_multilingual_v2' }),
    });
    if (!res.ok) throw new Error(`ElevenLabs hata: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return { data: buf, contentType: 'audio/mpeg' };
  }

  if (PROVIDER === 'AZURE') {
    // Örnek: Azure Speech SDK REST (SSML)
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;
    const voice = process.env.AZURE_SPEECH_VOICE || 'en-US-AnaNeural';
    if (!key || !region) throw new Error('Azure anahtarı/region eksik');
    const ssml = `<?xml version="1.0"?><speak version="1.0" xml:lang="en-US"><voice name="${voice}">${normalized}</voice></speak>`;
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      },
      body: ssml,
    });
    if (!res.ok) throw new Error(`Azure TTS hata: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return { data: buf, contentType: 'audio/mpeg' };
  }

  // GOOGLE veya fallback: mock (boş mp3)
  return { data: Buffer.alloc(0), contentType: 'audio/mpeg' };
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN yok (.env)');
    process.exit(1);
  }

  const exists = await fs
    .access(MANIFEST_PATH)
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    console.error('❌ Manifest yok. Önce npm run icons:manifest');
    process.exit(1);
  }

  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf-8'));
  const vocabSet = new Set();
  for (const cat of manifest.categories) {
    for (const it of cat.items) {
      if (it.label) vocabSet.add(it.label.toLowerCase());
    }
  }

  const map = {};
  let success = 0;
  let fail = 0;

  console.log(`🔊 TTS üretimi başlıyor (provider: ${PROVIDER}) ...`);
  for (const word of Array.from(vocabSet)) {
    try {
      const { data, contentType } = await tts(word);
      const key = `tts/${word}.mp3`;
      const blob = await put(key, data, {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: contentType || 'audio/mpeg',
      });
      map[word] = blob.url;
      console.log(`  ✅ ${word} → ${blob.url}`);
      success++;
    } catch (e) {
      console.error(`  ❌ ${word} üretilemedi: ${e.message}`);
      fail++;
    }
  }

  await fs.writeFile(OUT_MAP_PATH, JSON.stringify(map, null, 2));
  console.log(`\n🎉 TTS tamamlandı. Başarılı: ${success}, Hatalı: ${fail}`);
  console.log(`🗺️  TTS haritası: ${OUT_MAP_PATH}`);
}

main().catch((e) => {
  console.error('Beklenmeyen hata:', e);
  process.exit(1);
});

