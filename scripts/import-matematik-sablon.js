
import mongoose from 'mongoose';

// MongoDB Connection URI - BU BİLGİYİ DEĞİŞTİRMENİZE GEREK YOK
const MONGODB_URI = "mongodb+srv://tarfyazilim_db_user:rVJhMF2Xvm0eYXvb@tulu0.ztsglsx.mongodb.net/?appName=tulu0";

// ===========================================
// MODEL TANIMLARI (Mevcutla aynı, değiştirmeye gerek yok)
// ===========================================

const LanguageSchema = new mongoose.Schema({ name: { type: String, required: true }, nativeName: { type: String, required: true }, flag: { type: String }, baseLanguage: { type: String }, locale: { type: String }, category: { type: String }, themeMetadata: {islamicContent: Boolean, ageGroup: String, moralValues: [String], educationalFocus: String, difficultyLevel: String } }, { timestamps: true });
const ChapterSchema = new mongoose.Schema({ languageId: { type: String, required: true }, title: { type: String, required: true }, description: { type: String }, isPremium: { type: Boolean, default: false }, order: { type: Number, default: 1 }, moralLesson: { value: String, title: String, storyText: String, displayTiming: String } }, { timestamps: true });
const UnitSchema = new mongoose.Schema({ chapterId: { type: String, required: true }, languageId: { type: String, required: true }, title: { type: String, required: true }, description: { type: String }, isPremium: { type: Boolean, default: false }, order: { type: Number, default: 1 }, color: { type: String } }, { timestamps: true });
const LessonSchema = new mongoose.Schema({ unitId: { type: String, required: true }, chapterId: { type: String, required: true }, languageId: { type: String, required: true }, title: { type: String, required: true }, description: { type: String }, isPremium: { type: Boolean, default: false }, xpReward: { type: Number, default: 10 }, order: { type: Number, default: 1 } }, { timestamps: true });
const ExerciseSchema = new mongoose.Schema({ lessonId: { type: String, required: true }, unitId: { type: String, required: true }, chapterId: { type: String, required: true }, languageId: { type: String, required: true }, type: { type: String, required: true }, instruction: { type: String }, sourceText: { type: String }, sourceLanguage: { type: String }, targetLanguage: { type: String }, correctAnswer: { type: [String] }, options: { type: [String] }, order: { type: Number, default: 1 } }, { timestamps: true });

const Language = mongoose.models.Language || mongoose.model('Language', LanguageSchema);
const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema);
const Unit = mongoose.models.Unit || mongoose.model('Unit', UnitSchema);
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
const Exercise = mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema);


// ===========================================
// 🚀 ADIM 1: YENİ PROGRAMINIZIN İÇERİĞİNİ BURAYA GİRİN
// "matematikVeMantikData" objesini kendi programınıza göre doldurun.
// "chapters" dizisine yeni bölümler, "units" dizisine yeni üniteler,
// "lessons" dizisine yeni dersler ekleyebilirsiniz.
// ===========================================

const matematikVeMantikData = {
  programData: {
    name: "matematik & mantık",
    nativeName: "matematik ve mantık eğitimi",
    flag: "🧠",
    baseLanguage: "turkish",
    locale: "tr",
    category: "math_logic", // Bu kategori adı api/models/Language.ts içinde var olmalı
    themeMetadata: {
      islamicContent: false,
      ageGroup: "kids_8-12",
      moralValues: ["problem_solving", "logical_thinking"],
      educationalFocus: "temel matematik ve mantık becerileri",
      difficultyLevel: "beginner"
    }
  },

  chapters: [
    // ÖRNEK BÖLÜM 1: TEMEL SAYILAR
    {
      title: "temel sayılar",
      description: "sayıları tanıma ve sıralama",
      order: 1,
      isPremium: false,
      moralLesson: {
        value: "logical_thinking",
        title: "mantıklı düşünme",
        storyText: "sayılar arasındaki düzeni keşfetmek, hayattaki düzeni anlamamıza yardımcı olur.",
        displayTiming: "post_lesson"
      },
      units: [
        // ÖRNEK ÜNİTE 1.1: RAKAMLAR
        {
          title: "rakamları öğreniyorum",
          description: "0'dan 9'a kadar rakamlar",
          order: 1,
          color: "bg-[#3b82f6]", // Renk kodunu istediğiniz gibi değiştirin
          isPremium: false,
          lessons: [
            { title: "rakamları tanıma", description: "görsel olarak rakamları öğrenme", order: 1, xpReward: 10 },
            { title: "rakamları sıralama", description: "rakamları küçükten büyüğe sıralama", order: 2, xpReward: 10 },
          ]
        },
        // ÖRNEK ÜNİTE 1.2: İKİ BASAMAKLI SAYILAR
        {
            title: "iki basamaklı sayılar",
            description: "10'dan 99'a kadar sayılar",
            order: 2,
            color: "bg-[#16a34a]",
            isPremium: false,
            lessons: [
              { title: "onluk ve birlik", description: "sayıların basamak değerleri", order: 1, xpReward: 15 },
            ]
        }
      ]
    },
    // KENDİ BÖLÜMLERİNİZİ BURAYA EKLEYEBİLİRSİNİZ
    // {
    //   title: "toplama işlemi",
    //   description: "sayıları bir araya getirme",
    //   order: 2,
    //   ...
    // }
  ]
};

// ===========================================
// 🚀 ADIM 2: EGZERSİZLER İÇİN KELİME/KAVRAM BANKASINI DOLDURUN
// "wordDatabase" objesine yeni ders başlıklarınızı ve onlara ait
// Türkçe, İngilizce/Arapça karşılıklarını, anlamlarını ve cümleleri ekleyin.
// Egzersizler bu verilerden otomatik üretilecektir.
// ===========================================

function getWordPairsForLesson(lessonTitle) {
  const wordDatabase = {
    // "İman ve Ahlak" programından mevcut kelimeler burada kalabilir,
    // yeni programınızın kelimelerini aşağıya ekleyin.

    // ÖRNEK: MATEMATİK PROGRAMI İÇİN YENİ KAVRAMLAR
    "rakamları tanıma": [
      { turkish: "bir", english: "one", meaning: "1 sayısı", sentence: "bir elma" },
      { turkish: "iki", english: "two", meaning: "2 sayısı", sentence: "iki armut" },
      { turkish: "üç", english: "three", meaning: "3 sayısı", sentence: "üç portakal" },
      { turkish: "dört", english: "four", meaning: "4 sayısı", sentence: "dört çilek" },
      { turkish: "beş", english: "five", meaning: "5 sayısı", sentence: "beş muz" }
    ],
    "rakamları sıralama": [
        { turkish: "sıfır", english: "zero", meaning: "0 sayısı", sentence: "sıfır noktası" },
        { turkish: "altı", english: "six", meaning: "6 sayısı", sentence: "altı top" },
        { turkish: "yedi", english: "seven", meaning: "7 sayısı", sentence: "yedi cüceler" },
        { turkish: "sekiz", english: "eight", meaning: "8 sayısı", sentence: "sekiz gezegen" },
        { turkish: "dokuz", english: "nine", meaning: "9 sayısı", sentence: "dokuz canlı" }
    ],
    "onluk ve birlik": [
        { turkish: "onluk", english: "tens", meaning: "sayının onluk basamağı", sentence: "25 sayısında 2 onluk vardır" },
        { turkish: "birlik", english: "ones", meaning: "sayının birlik basamağı", sentence: "25 sayısında 5 birlik vardır" },
        { turkish: "basamak", english: "digit", meaning: "sayıyı oluşturan rakam", sentence: "sayı basamaklardan oluşur" },
    ],

    // Varsayılan kelimeler (Eşleşme bulunamazsa kullanılır)
    default: [
      { turkish: "matematik", english: "mathematics", meaning: "sayı bilimi", sentence: "matematik eğlencelidir" },
      { turkish: "mantık", english: "logic", meaning: "doğru düşünme", sentence: "mantık önemlidir" },
    ]
  };

  const normalizedTitle = lessonTitle.toLowerCase();
  return wordDatabase[normalizedTitle] || wordDatabase.default;
}

// ===========================================
// EGZERSİZ OLUŞTURMA FONKSİYONLARI (Mevcutla aynı, değiştirmeye gerek yok)
// ===========================================

function generateExercisesForLesson(lessonTitle, lessonOrder, chapterIndex, unitIndex) {
  const exercises = [];
  let order = 1;
  const chapterNum = chapterIndex + 1;
  const words = getWordPairsForLesson(lessonTitle);

  // Basit bir egzersiz oluşturma mantığı (ihtiyaca göre geliştirebilirsiniz)
  // 5 translate, 5 select, 3 arrange
  
  // 5 translate
  for (let i = 0; i < 5; i++) {
    const word = words[i % words.length];
    exercises.push({
      type: "translate",
      instruction: i % 2 === 0 ? "türkçe'den ingilizce'ye çevir" : "ingilizce'den türkçe'ye çevir",
      sourceText: i % 2 === 0 ? word.turkish : word.english,
      sourceLanguage: i % 2 === 0 ? "turkish" : "english",
      targetLanguage: i % 2 === 0 ? "english" : "turkish",
      correctAnswer: [i % 2 === 0 ? word.english : word.turkish],
      options: [],
      order: order++,
    });
  }

  // 5 select
  for (let i = 0; i < 5; i++) {
    const word = words[i % words.length];
    exercises.push({
      type: "select",
      instruction: `"${word.turkish}" kelimesinin anlamı nedir?`,
      sourceText: word.turkish,
      sourceLanguage: "turkish",
      targetLanguage: "turkish",
      correctAnswer: [word.meaning],
      options: generateOptions(word.meaning, words),
      order: order++,
    });
  }

  // 3 arrange
  for (let i = 0; i < 3; i++) {
    const word = words[i % words.length];
    const sentenceWords = word.sentence.split(' ');
    exercises.push({
      type: "arrange",
      instruction: "cümleyi doğru şekilde sıralayın",
      sourceText: word.sentence,
      sourceLanguage: "turkish",
      targetLanguage: "turkish",
      correctAnswer: sentenceWords,
      options: shuffleArray([...sentenceWords]),
      order: order++,
    });
  }

  return exercises;
}

function generateOptions(correctAnswer, allWords) {
    const options = new Set([correctAnswer]);
    const meanings = allWords.map(w => w.meaning).filter(m => m !== correctAnswer);
    
    while (options.size < 4 && meanings.length > 0) {
        const randomIndex = Math.floor(Math.random() * meanings.length);
        options.add(meanings.splice(randomIndex, 1)[0]);
    }
    
    return shuffleArray(Array.from(options));
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ===========================================
// ANA İÇE AKTARMA FONKSİYONU (Mevcutla aynı, değiştirmeye gerek yok)
// ===========================================

async function importData() {
  let session = null;
  try {
    console.log(`🚀 ${matematikVeMantikData.programData.nativeName} Programı Import Başlıyor...\n`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');
    session = await mongoose.startSession();
    session.startTransaction();
    console.log('🔄 Transaction başlatıldı\n');

    const stats = { totalChapters: 0, totalUnits: 0, totalLessons: 0, totalExercises: 0, totalXP: 0 };

    console.log('📚 Program oluşturuluyor...');
    const languageDoc = new Language(matematikVeMantikData.programData);
    await languageDoc.save({ session });
    const languageId = languageDoc._id.toString();
    console.log(`✅ Program oluşturuldu: ${languageDoc.name} (ID: ${languageId})\n`);

    for (let chapterIndex = 0; chapterIndex < matematikVeMantikData.chapters.length; chapterIndex++) {
      const chapterData = matematikVeMantikData.chapters[chapterIndex];
      console.log(`📖 Bölüm ${chapterData.order}: ${chapterData.title}`);
      const chapterDoc = new Chapter({ languageId, ...chapterData, units: undefined });
      await chapterDoc.save({ session });
      const chapterId = chapterDoc._id.toString();
      stats.totalChapters++;
      console.log(`   ✅ Bölüm oluşturuldu (ID: ${chapterId})`);

      for (const unitData of chapterData.units) {
        const unitDoc = new Unit({ chapterId, languageId, ...unitData, lessons: undefined });
        await unitDoc.save({ session });
        const unitId = unitDoc._id.toString();
        stats.totalUnits++;
        console.log(`   📂 Ünite: ${unitData.title} (${unitData.lessons.length} ders)`);

        for (const lessonData of unitData.lessons) {
          const lessonDoc = new Lesson({ unitId, chapterId, languageId, ...lessonData, isPremium: chapterData.isPremium });
          await lessonDoc.save({ session });
          const lessonId = lessonDoc._id.toString();
          stats.totalLessons++;
          stats.totalXP += lessonData.xpReward;
          console.log(`      📝 Ders: ${lessonData.title} (${lessonData.xpReward} XP)`);

          const exercises = generateExercisesForLesson(lessonData.title, lessonData.order, chapterIndex, unitData.order - 1);
          for (const exerciseData of exercises) {
            const exerciseDoc = new Exercise({ lessonId, unitId, chapterId, languageId, ...exerciseData });
            await exerciseDoc.save({ session });
            stats.totalExercises++;
          }
          console.log(`         ✅ ${exercises.length} egzersiz eklendi`);
        }
      }
      console.log();
    }

    await session.commitTransaction();
    console.log('✅ Transaction commit edildi\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 İMPORT BAŞARILI! 🎉');
    console.log(`📚 Program: ${matematikVeMantikData.programData.name}`);
    console.log(`📖 Bölüm: ${stats.totalChapters}`);
    console.log(`📂 Ünite: ${stats.totalUnits}`);
    console.log(`📝 Ders: ${stats.totalLessons}`);
    console.log(`🎯 Egzersiz: ${stats.totalExercises}`);
    console.log(`⭐ Toplam XP: ${stats.totalXP}`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    if (session) {
      await session.abortTransaction();
      console.log('❌ Transaction geri alındı (rollback)\n');
    }
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ HATA OLUŞTU!', error);
    console.error('═══════════════════════════════════════════════════════\n');
  } finally {
    if (session) {
      session.endSession();
    }
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

importData();
