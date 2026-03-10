import { put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN bulunamadı (.env)');
    process.exit(1);
  }

  const manifestPath = path.join(__dirname, 'english_icons_manifest.json');
  const exists = await fs
    .access(manifestPath)
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    console.error('❌ Manifest bulunamadı. Önce: npm run icons:manifest');
    process.exit(1);
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
  const map = {};
  let uploaded = 0;
  let skipped = 0;

  console.log('🚀 İkon yükleme başlıyor (Vercel Blob) ...');
  for (const cat of manifest.categories) {
    console.log(`📦 Kategori: ${cat.titleTR}`);
    for (const it of cat.items) {
      if (!it.exists) {
        console.warn(`  ⚠️ Atlandı (yok): ${it.fileName}`);
        skipped++;
        continue;
      }
      try {
        const data = await fs.readFile(it.filePath);
        const key = `icons/${it.fileName}`; // sabit dosya adı (idempotent)
        const blob = await put(key, data, {
          access: 'public',
          addRandomSuffix: false,
          token: process.env.BLOB_READ_WRITE_TOKEN,
          contentType: 'image/png',
        });
        map[it.fileName] = blob.url;
        console.log(`  ✅ ${it.fileName} → ${blob.url}`);
        uploaded++;
      } catch (e) {
        console.error(`  ❌ Yüklenemedi: ${it.fileName}`, e.message);
      }
    }
  }

  const out = path.join(__dirname, 'icons-blob-map.json');
  await fs.writeFile(out, JSON.stringify(map, null, 2));
  console.log(`\n🎉 Tamamlandı. Yüklendi: ${uploaded}, Atlandı: ${skipped}`);
  console.log(`🗺️  URL haritası: ${out}`);
}

main().catch((e) => {
  console.error('Beklenmeyen hata:', e);
  process.exit(1);
});

