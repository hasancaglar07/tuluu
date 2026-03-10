import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Mongo URI (mevcut projedeki ile uyumlu)
const MONGODB_URI = "mongodb+srv://tarfyazilim_db_user:rVJhMF2Xvm0eYXvb@tulu0.ztsglsx.mongodb.net/?appName=tulu0";

// Mongoose modelleri (strict: false)
const Language = mongoose.models.Language || mongoose.model('Language', new mongoose.Schema({}, { strict: false }));
const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', new mongoose.Schema({}, { strict: false }));
const Unit = mongoose.models.Unit || mongoose.model('Unit', new mongoose.Schema({}, { strict: false }));
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', new mongoose.Schema({}, { strict: false }));
const Exercise = mongoose.models.Exercise || mongoose.model('Exercise', new mongoose.Schema({}, { strict: false }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manifest + Blob URL haritasını kullan
const MANIFEST_PATH = path.join(__dirname, 'english_icons_manifest.json');
const BLOB_MAP_PATH = path.join(__dirname, 'icons-blob-map.json');
const TTS_MAP_PATH = path.join(__dirname, 'icons-tts-map.json');

function titleCase(str) {
  return str.replace(/\b([a-z])([a-z]*)/gi, (_, a, b) => a.toUpperCase() + b.toLowerCase());
}

function aOrAn(word) {
  const w = (word || '').trim().toLowerCase();
  if (!w) return 'a';
  return /^[aeiou]/.test(w) ? 'an' : 'a';
}

// 5 ünite x 5 ders, her derste 11 aktivite (5 eğitim + 6 egzersiz)
// Üniteler manifest dosyasından okunur.

function groupIntoLessons(concepts, lessonCount = 5, perLesson = 3) {
  const lessons = [];
  let idx = 0;
  for (let i = 0; i < lessonCount; i++) {
    const slice = concepts.slice(idx, idx + perLesson);
    if (slice.length < perLesson) break;
    lessons.push(slice);
    idx += perLesson;
  }
  return lessons;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildEducationAndExercises(lessonTitle, concepts) {
  // concepts: [{label, imageUrl} x 3]
  const [w1, w2, w3] = concepts;
  const title1 = `Yeni kelimeler: ${titleCase(w1.label)}, ${titleCase(w2.label)}, ${titleCase(w3.label)}`;
  const activities = [];

  // 1) education_image_intro (3 kart)
  activities.push({
    type: 'education_image_intro',
    instruction: 'Yeni kelimeleri öğrenelim.',
    educationContent: {
      title: 'Yeni Kelimeler',
      subtitle: 'Resimlere bak ve kelimeyi dinle/oku',
      cards: [
        { imageUrl: w1.imageUrl, text: w1.label },
        { imageUrl: w2.imageUrl, text: w2.label },
        { imageUrl: w3.imageUrl, text: w3.label },
      ],
      showContinueButton: true,
    },
    mediaPack: {
      characterName: 'Tulu',
    },
  });

  // 2) education_visual (w1)
  activities.push({
    type: 'education_visual',
    instruction: `${titleCase(w1.label)} kelimesine yakından bakalım`,
    educationContent: {
      title: `Bu bir "${w1.label}"`,
      imageUrl: w1.imageUrl,
      description: `İngilizce kelime: ${w1.label}. Örnek: "I see ${aOrAn(w1.label)} ${w1.label}."`,
    },
    hoverHint: { text: 'Resimdeki nesneyi söyle ve aklında tut.' },
    mediaPack: { characterName: 'Tulu' },
  });

  // 3) education_visual (w2)
  activities.push({
    type: 'education_visual',
    instruction: `${titleCase(w2.label)} kelimesine yakından bakalım`,
    educationContent: {
      title: `Bu bir "${w2.label}"`,
      imageUrl: w2.imageUrl,
      description: `İngilizce kelime: ${w2.label}. Örnek: "I see ${aOrAn(w2.label)} ${w2.label}."`,
    },
    hoverHint: { text: 'Resimdeki nesneyi söyle ve aklında tut.' },
    mediaPack: { characterName: 'Tulu' },
  });

  // 4) education_visual (w3)
  activities.push({
    type: 'education_visual',
    instruction: `${titleCase(w3.label)} kelimesine yakından bakalım`,
    educationContent: {
      title: `Bu bir "${w3.label}"`,
      imageUrl: w3.imageUrl,
      description: `İngilizce kelime: ${w3.label}. Örnek: "I see ${aOrAn(w3.label)} ${w3.label}."`,
    },
    hoverHint: { text: 'Resimdeki nesneyi söyle ve aklında tut.' },
    mediaPack: { characterName: 'Tulu' },
  });

  // 5) education_image_intro (hızlı tekrar)
  activities.push({
    type: 'education_image_intro',
    instruction: 'Hızlı tekrar',
    educationContent: {
      title: 'Tekrar',
      subtitle: 'Bu üç kelimeyi hatırlıyor musun?',
      cards: [
        { imageUrl: w1.imageUrl, text: w1.label },
        { imageUrl: w2.imageUrl, text: w2.label },
        { imageUrl: w3.imageUrl, text: w3.label },
      ],
      showContinueButton: true,
    },
    autoRevealMilliseconds: 4000,
    mediaPack: { characterName: 'Tulu' },
  });

  // Yardımcılar (distractor ve cümle üretimi)
  // Image-based select: options are image URLs
  const makeSelect = (targetObj, poolObjs, optionCount = 4) => {
    const target = targetObj.label;
    const others = poolObjs.filter((p) => p.label !== targetObj.label);
    const pool = shuffle(others).slice(0, Math.max(0, optionCount - 1));
    const opts = shuffle([targetObj.imageUrl, ...pool.map((x) => x.imageUrl)]);
    const correct = targetObj.imageUrl;
    return {
      type: 'select',
      instruction: `Hangisi "${target}"?`,
      sourceText: target,
      correctAnswer: [correct],
      options: opts,
      hoverHint: { text: 'Doğru resmi seç.' },
      mediaPack: { characterName: 'Tulu' },
    };
  };

  const makeArrange = (target) => {
    const article = aOrAn(target);
    const tokens = ['I', 'see', article, target];
    const correct = tokens.join(' ');
    const scrambled = shuffle(tokens);
    return {
      type: 'arrange',
      instruction: `Kelimeleri doğru sıraya diz: (${target})`,
      sourceText: scrambled.join(' '),
      correctAnswer: [correct],
      options: tokens,
      hoverHint: { text: 'Cümleyi baştan sona doğru sırala.' },
      mediaPack: { characterName: 'Tulu' },
    };
  };

  // 6 egzersiz: 3 select + 3 arrange (w1,w2,w3)
  // Adaptive option counts: 4, 5, 6
  activities.push(makeSelect(w1, concepts, 4));
  activities.push(makeArrange(w1.label));
  activities.push(makeSelect(w2, concepts, 5));
  activities.push(makeArrange(w2.label));
  activities.push(makeSelect(w3, concepts, 6));
  activities.push(makeArrange(w3.label));

  // Sıra numarası ekle
  return activities.map((a, i) => ({ ...a, order: i + 1 }));
}

async function importData() {
  let session = null;
  try {
    console.log('🚀 İkon tabanlı İngilizce (4-7) import (manifest + blob map)...');
    if (!fs.existsSync(MANIFEST_PATH)) {
      throw new Error('Manifest bulunamadı. Önce: npm run icons:manifest ve (opsiyonel) npm run icons:upload');
    }
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const blobMap = fs.existsSync(BLOB_MAP_PATH)
      ? JSON.parse(fs.readFileSync(BLOB_MAP_PATH, 'utf-8'))
      : {};
    const ttsMap = fs.existsSync(TTS_MAP_PATH)
      ? JSON.parse(fs.readFileSync(TTS_MAP_PATH, 'utf-8'))
      : {};

    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı.');
    session = await mongoose.startSession();
    session.startTransaction();
    console.log('🔄 Transaction başlatıldı.');

    // Program başlığı
    const program = {
      name: 'ingilizce (4-7) — ikonlarla',
      nativeName: 'İkonlarla İngilizce (4-7 Yaş)',
      flag: '🇬🇧',
      baseLanguage: 'english',
      imageUrl: '',
      locale: 'tr',
      isActive: true,
      category: 'language_learning',
      themeMetadata: {
        islamicContent: false,
        ageGroup: 'kids_4-7',
        educationalFocus: 'İkonlar üzerinden temel İngilizce kelimeler',
        difficultyLevel: 'beginner',
      },
    };

    // Language dokümanı
    let languageDoc = await Language.findOne({ name: program.name });
    if (!languageDoc) {
      languageDoc = new Language(program);
      await languageDoc.save({ session });
      console.log(`📚 Program oluşturuldu: ${languageDoc.nativeName}`);
    } else {
      console.log(`ℹ️ Program zaten var, üzerine yazılacak: ${languageDoc.nativeName}`);
    }
    const languageId = languageDoc._id.toString();

    // Tek bir ana bölüm (Chapter)
    const chapterTitle = 'İkonlarla İngilizce';
    let chapterDoc = await Chapter.findOne({ title: chapterTitle, languageId });
    if (!chapterDoc) {
      chapterDoc = new Chapter({
        languageId,
        isActive: true,
        isExpanded: true,
        contentType: 'lesson',
        title: chapterTitle,
        description: '4-7 yaş için ikon temelli İngilizce kelime öğrenimi',
        order: 1,
        isPremium: false,
        imageUrl: '',
      });
      await chapterDoc.save({ session });
      console.log(`📖 Bölüm oluşturuldu: ${chapterDoc.title}`);
    }
    const chapterId = chapterDoc._id.toString();

    const stats = { units: 0, lessons: 0, exercises: 0 };

    for (let unitIndex = 0; unitIndex < manifest.categories.length; unitIndex++) {
      const cat = manifest.categories[unitIndex];
      const unitTitle = cat.titleTR;
      // pool'u manifest'ten al ve blob URL varsa kullan
      const pool = cat.items
        .filter((x) => x.exists !== false)
        .map((x) => ({
          fileName: x.fileName,
          label: x.label.toLowerCase(),
          imageUrl: blobMap[x.fileName] || x.imageUrl,
        }));

      const unitImageUrl = pool[0]?.imageUrl || '';
      const existing = await Unit.findOne({ title: unitTitle, chapterId });
      if (existing) {
        await Lesson.deleteMany({ unitId: existing._id.toString() }, { session });
        await Unit.deleteOne({ _id: existing._id.toString() }, { session });
        console.log(`🧹 Mevcut ünite temizlendi: ${unitTitle}`);
      }

      const unitDoc = new Unit({
        languageId,
        chapterId,
        isActive: true,
        isExpanded: false,
        title: unitTitle,
        description: `Bu ünitede ${unitTitle.toLowerCase()} konusunu ikonlarla öğreneceğiz.`,
        imageUrl: unitImageUrl,
        order: unitIndex + 1,
        isPremium: false,
      });
      await unitDoc.save({ session });
      stats.units++;
      console.log(`  📂 Ünite: ${unitDoc.title}`);

      // 5 ders x 3 kelime
      const lessonConceptGroups = groupIntoLessons(pool, 5, 3);

      for (let i = 0; i < lessonConceptGroups.length; i++) {
        const concepts = lessonConceptGroups[i];
        const lessonTitle = `${unitTitle} ${i + 1}`;
        const lessonDoc = new Lesson({
          languageId,
          chapterId,
          unitId: unitDoc._id.toString(),
          isActive: true,
          isTest: false,
          imageUrl: unitImageUrl,
          title: lessonTitle,
          order: i + 1,
          xpReward: 12,
          isPremium: false,
        });
        await lessonDoc.save({ session });
        stats.lessons++;
        console.log(`    📝 Ders: ${lessonDoc.title}`);

        // 11 aktivite üret (5 eğitim + 6 egzersiz)
        let activities = buildEducationAndExercises(lessonTitle, concepts);
        // Enrich with audio if available
        activities = activities.map((a) => {
          const targetWord = a.sourceText && a.sourceText.trim() ? a.sourceText.trim().toLowerCase() : '';
          const audio = ttsMap[targetWord];
          const enriched = { ...a, ttsVoiceId: 'en-US-Kids-1' };
          if (audio) {
            enriched.answerAudioUrl = audio;
            if (enriched.type?.startsWith('education_visual')) {
              enriched.educationContent = {
                ...(enriched.educationContent || {}),
                narrationAudioUrl: audio,
              };
            }
          }
          return enriched;
        });
        for (const act of activities) {
          const ex = new Exercise({
            languageId,
            chapterId,
            unitId: unitDoc._id.toString(),
            lessonId: lessonDoc._id.toString(),
            sourceLanguage: 'english',
            targetLanguage: 'turkish',
            isNewWord: false,
            isActive: true,
            neutralAnswerImage: unitImageUrl || '',
            badAnswerImage: unitImageUrl || '',
            correctAnswerImage: unitImageUrl || '',
            ...act,
          });
          await ex.save({ session });
          stats.exercises++;
        }
        console.log(`      ✅ ${activities.length} aktivite oluşturuldu.`);
      }
    }

    await session.commitTransaction();
    console.log('\n✅ Transaction başarıyla tamamlandı.');
    console.log(`📊 Özet → Ünite: ${stats.units}, Ders: ${stats.lessons}, Aktivite: ${stats.exercises}`);
  } catch (err) {
    if (session) await session.abortTransaction();
    console.error('❌ Hata:', err);
  } finally {
    if (session) session.endSession();
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı.');
  }
}

console.log("✅ 'generate-english-icons-program.js' hazır. Çalıştırılıyor...");
importData();
