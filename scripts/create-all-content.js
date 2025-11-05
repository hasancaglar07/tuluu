/**
 * TÜM EĞİTİM İÇERİĞİNİ OLUŞTURMA SCRİPTİ
 * 
 * Bu script, tüm programlar, bölümler, üniteler ve lesson dosyalarını
 * otomatik olarak oluşturur.
 * 
 * Kullanım: node create-all-content.js
 */

const fs = require('fs');
const path = require('path');

// Ana klasör
const BASE_DIR = path.join(__dirname, 'Programlar');

// Lesson şablonu
const createLessonContent = (type, unitTitle, content) => {
  const templates = {
    listen: `# Öğrenme Anı 1: ${unitTitle} - Dinle ve Seç

## Egzersiz Bilgileri

**Egzersiz Türü:** Listen

**Yönerge:** ${content.instruction}

**Doğru Cevaplar:** 
${content.correctAnswers.map(a => `- ${a}`).join('\n')}

**Seç & çevir için seçenekler (Options):**
${content.options.map(o => `- ${o}`).join('\n')}

**Ses URL'si:** 
\`\`\`
${content.audioUrl || 'https://example.com/audio/sound.mp3'}
\`\`\`

## Notlar

- ✅ Yeni Kelime Olarak İşaretle: Açık

---

## İçerik Alanı

${content.mainContent}
`,

    select: `# Öğrenme Anı 2: ${unitTitle} - Seç

## Egzersiz Bilgileri

**Egzersiz Türü:** Select

**Yönerge:** ${content.instruction}

**Doğru Cevaplar:** 
${content.correctAnswers.map(a => `- ${a}`).join('\n')}

**Seçenekler:**
${content.options.map(o => `- ${o}`).join('\n')}

**Ses URL'si:** 
\`\`\`
${content.audioUrl || '(boş bırak)'}
\`\`\`

## Notlar

- ✅ Yeni Kelime Olarak İşaretle: Açık

---

## İçerik Alanı

${content.mainContent}
`,

    translate: `# Öğrenme Anı 3: ${unitTitle} - Çevir

## Egzersiz Bilgileri

**Egzersiz Türü:** Translate

**Yönerge:** ${content.instruction}

**Doğru Cevaplar:** 
${content.correctAnswers.map(a => `- ${a}`).join('\n')}

**Seçenekler:** 
\`\`\`
(boş bırak - kullanıcı yazarak cevap verecek)
\`\`\`

**Ses URL'si:** 
\`\`\`
${content.audioUrl || '(boş bırak)'}
\`\`\`

## Notlar

- ✅ Yeni Kelime Olarak İşaretle: Açık

---

## İçerik Alanı

${content.mainContent}
`,

    speak: `# Öğrenme Anı 4: ${unitTitle} - Söyle

## Egzersiz Bilgileri

**Egzersiz Türü:** Speak

**Yönerge:** ${content.instruction}

**Doğru Cevaplar:** 
${content.correctAnswers.map(a => `- ${a}`).join('\n')}

**Seçenekler:** 
\`\`\`
(boş bırak - ses tanıma ile çalışır)
\`\`\`

**Ses URL'si (Model ses):** 
\`\`\`
${content.audioUrl || 'https://example.com/audio/model.mp3'}
\`\`\`

## Notlar

- ✅ Yeni Kelime Olarak İşaretle: Açık

---

## İçerik Alanı

${content.mainContent}
`,

    arrange: `# Öğrenme Anı 5: ${unitTitle} - Sırala

## Egzersiz Bilgileri

**Egzersiz Türü:** Arrange

**Yönerge:** ${content.instruction}

**Doğru Cevaplar (Doğru sırayla):**
${content.correctAnswers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

**Seçenekler (karışık sırayla gir):**
${content.options.map(o => `- ${o}`).join('\n')}

**Ses URL'si:** 
\`\`\`
${content.audioUrl || '(boş bırak)'}
\`\`\`

## Notlar

- ✅ Yeni Kelime Olarak İşaretle: Açık

---

## İçerik Alanı

${content.mainContent}
`
  };

  return templates[type] || '';
};

// Klasör oluştur
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Dosya oluştur
const createFile = (filePath, content) => {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Oluşturuldu: ${filePath}`);
};

// İlerleme sayacı
let totalCreated = 0;

console.log('🚀 Tüm eğitim içeriği oluşturuluyor...\n');
console.log('⏳ Bu işlem birkaç dakika sürebilir...\n');

// SCRIPT DEVAM EDECEK - Bu sadece yapının başlangıcı
console.log('📝 Script hazırlandı. Manuel oluşturma başlıyor...');