import { put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOKS_DIR = path.join(__dirname, 'Books');

async function uploadBook(bookId) {
  const bookPath = path.join(BOOKS_DIR, bookId);
  const manifestPath = path.join(bookPath, 'manifest.json');
  
  console.log(`\n📚 Yükleniyor: ${bookId}...`);
  
  // Manifest'i oku
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
  
  // Cover'ı yükle
  const coverPath = path.join(bookPath, 'cover.jpg');
  try {
    const coverFile = await fs.readFile(coverPath);
    const coverBlob = await put(`books/${bookId}/cover.jpg`, coverFile, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    console.log(`  ✅ Kapak: ${coverBlob.url}`);
    manifest.coverImage = coverBlob.url;
  } catch (error) {
    console.error(`  ❌ Kapak yüklenemedi:`, error.message);
  }
  
  // Sayfaları yükle
  const pagesDir = path.join(bookPath, 'pages');
  try {
    const pageFiles = (await fs.readdir(pagesDir))
      .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
      .sort();
    
    console.log(`  📄 ${pageFiles.length} sayfa yükleniyor...`);
    
    for (let i = 0; i < pageFiles.length; i++) {
      const file = pageFiles[i];
      const filePath = path.join(pagesDir, file);
      
      try {
        const fileData = await fs.readFile(filePath);
        
        const blob = await put(`books/${bookId}/pages/${file}`, fileData, {
          access: 'public',
          addRandomSuffix: false,
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        
        if (manifest.pages[i]) {
          manifest.pages[i].imageUrl = blob.url;
        }
        
        console.log(`  ✅ ${file}`);
      } catch (error) {
        console.error(`  ❌ ${file} yüklenemedi:`, error.message);
      }
    }
  } catch (error) {
    console.error(`  ❌ Pages klasörü okunamadı:`, error.message);
  }
  
  // Audio dosyalarını yükle (varsa)
  const audioDir = path.join(bookPath, 'audio');
  try {
    await fs.access(audioDir);
    const audioFiles = (await fs.readdir(audioDir))
      .filter(f => f.endsWith('.mp3') || f.endsWith('.ogg'))
      .sort();
    
    if (audioFiles.length > 0) {
      console.log(`  🔊 ${audioFiles.length} audio dosyası yükleniyor...`);
      
      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i];
        const filePath = path.join(audioDir, file);
        
        try {
          const fileData = await fs.readFile(filePath);
          
          const blob = await put(`books/${bookId}/audio/${file}`, fileData, {
            access: 'public',
            addRandomSuffix: false,
            token: process.env.BLOB_READ_WRITE_TOKEN
          });
          
          if (manifest.pages[i]) {
            manifest.pages[i].audioUrl = blob.url;
          }
          
          console.log(`  ✅ ${file}`);
        } catch (error) {
          console.error(`  ❌ ${file} yüklenemedi:`, error.message);
        }
      }
    }
  } catch (error) {
    // Audio klasörü yoksa sessizce geç
  }
  
  // Güncellenmiş manifest'i kaydet
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✨ ${bookId} tamamlandı!`);
  
  return manifest;
}

async function main() {
  console.log('🚀 Vercel Blob Upload başlıyor...\n');
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ HATA: BLOB_READ_WRITE_TOKEN bulunamadı!');
    console.error('   .env dosyasını oluşturup token\'ı ekle:');
    console.error('   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx\n');
    process.exit(1);
  }
  
  try {
    const books = await fs.readdir(BOOKS_DIR);
    let successCount = 0;
    let failCount = 0;
    
    for (const bookId of books) {
      const bookPath = path.join(BOOKS_DIR, bookId);
      const stat = await fs.stat(bookPath);
      
      if (stat.isDirectory()) {
        try {
          await uploadBook(bookId);
          successCount++;
        } catch (error) {
          console.error(`❌ ${bookId} yüklenirken hata:`, error.message);
          failCount++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Upload işlemi tamamlandı!');
    console.log(`✅ Başarılı: ${successCount} kitap`);
    if (failCount > 0) {
      console.log(`❌ Başarısız: ${failCount} kitap`);
    }
    console.log('📝 Manifest dosyaları güncellendi.');
    console.log('\n➡️  Şimdi "npm run import:stories" çalıştırarak');
    console.log('   kitapları MongoDB\'ye import edebilirsin.');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('❌ Beklenmeyen hata:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);