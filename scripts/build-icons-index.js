import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Ikonları tek klasörden okuyup sade bir JSON envanteri üretir
// Varsayılan kaynak: scripts/thiings_icons_png
// İstenirse Windows yolu da desteklenir (ikonlar klasörü masaüstünde ise)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kullanıcıya verilen Windows yolu ve repo içindeki kopya
const WINDOWS_ICONS_PATH = 'C:/Users/ihsan/Desktop/ikonlar/thiings_icons_png';
const LOCAL_ICONS_PATH = path.join(__dirname, 'thiings_icons_png');

function detectIconsDir() {
  // Öncelik: repo içi kopya
  if (fs.existsSync(LOCAL_ICONS_PATH)) return LOCAL_ICONS_PATH;
  // Windows yolu WSL altında değilse bile JSON üretimi için kontrol et
  if (fs.existsSync(WINDOWS_ICONS_PATH)) return WINDOWS_ICONS_PATH;
  throw new Error('İkon klasörü bulunamadı. scripts/thiings_icons_png veya C:/Users/ihsan/Desktop/ikonlar/thiings_icons_png konumunu kontrol edin.');
}

function toSlugLabel(fileName) {
  // Dosya ismi: "African_Lion_african-lion.png" gibi
  // Son alt çizgiden sonraki kısım slug (african-lion)
  const base = fileName.replace(/\.[a-zA-Z0-9]+$/, '');
  const parts = base.split('_');
  const slug = parts[parts.length - 1];
  const label = slug.replace(/-/g, ' ');
  return { slug, label };
}

function buildIndex(rootDir) {
  const files = fs.readdirSync(rootDir).filter(f => f.toLowerCase().endsWith('.png'));
  const items = files.map((f) => {
    const { slug, label } = toSlugLabel(f);
    const abs = path.resolve(rootDir, f);
    const fileUrl = 'file://' + abs.replace(/\\/g, '/');
    return {
      fileName: f,
      slug,
      label, // insan okunur (en)
      filePath: abs,
      imageUrl: fileUrl,
    };
  });
  return items;
}

function main() {
  const root = detectIconsDir();
  const index = buildIndex(root);
  const outPath = path.join(__dirname, 'icons-index.json');
  fs.writeFileSync(outPath, JSON.stringify({ sourceDir: root, count: index.length, items: index }, null, 2));
  console.log(`✅ ${index.length} ikon indekslendi → ${outPath}`);
}

main();

