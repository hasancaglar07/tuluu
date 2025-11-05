
import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://tarfyazilim_db_user:rVJhMF2Xvm0eYXvb@tulu0.ztsglsx.mongodb.net/?appName=tulu0";

// ===========================================
// MODEL REFERANSLARI
// ===========================================
const Language = mongoose.models.Language || mongoose.model('Language', new mongoose.Schema({}, { strict: false }));
const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', new mongoose.Schema({}, { strict: false }));
const Unit = mongoose.models.Unit || mongoose.model('Unit', new mongoose.Schema({}, { strict: false }));
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', new mongoose.Schema({}, { strict: false }));
const Exercise = mongoose.models.Exercise || mongoose.model('Exercise', new mongoose.Schema({}, { strict: false }));

// ===========================================
// 🚀 YER TUTUCU VARLIK URL'LERİ
// ===========================================
const placeholderUrls = {
    programIcon: "https://storage.googleapis.com/gemini-assistant-assets/project_icons/language_learning.png",
    chapterIcons: {
        colors: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/colors.png",
        numbers: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/numbers.png",
        animals: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/animals.png",
        fruits: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/fruits.png",
        family: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/family.png",
        body: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/body.png",
        toys: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/toys.png",
        clothes: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/clothes.png",
        feelings: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/feelings.png",
        weather: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/weather.png",
    },
    audio: "https://storage.googleapis.com/gemini-assistant-assets/concept_sounds/german_placeholder.mp3"
};

// ===========================================
// 🚀 ALMANCA (4-7 YAŞ) PROGRAMI İÇERİĞİ
// ===========================================
const programData = {
  programData: {
    name: "almanca (4-7 yaş)",
    nativeName: "Almanca Eğitimi (4-7 Yaş)",
    flag: "🇩🇪",
    baseLanguage: "german",
    imageUrl: placeholderUrls.programIcon,
    locale: "de",
    isActive: true,
    category: "language_learning",
    themeMetadata: {islamicContent: false, ageGroup: "kids_4-7", moralValues: ["curiosity", "communication"], educationalFocus: "Temel Almanca kelime ve ifadeleri öğrenme", difficultyLevel: "beginner" },
  },
  chapters: [
    // BÖLÜM 1-5 (FREE)
    { order: 1, isPremium: false, title: "renkler", description: "Die Farben.", imageUrl: placeholderUrls.chapterIcons.colors, units: [{ order: 1, title: "rot, gelb, blau", lessons: [{ title: "renkleri tanıma", order: 1, xpReward: 10 }] }] },
    { order: 2, isPremium: false, title: "sayılar (1-5)", description: "Zählen bis fünf.", imageUrl: placeholderUrls.chapterIcons.numbers, units: [{ order: 1, title: "sayıları sayma", lessons: [{ title: "sayıları öğrenme", order: 1, xpReward: 10 }] }] },
    { order: 3, isPremium: false, title: "hayvanlar", description: "Haustiere.", imageUrl: placeholderUrls.chapterIcons.animals, units: [{ order: 1, title: "katze, hund, vogel", lessons: [{ title: "hayvanları tanıma", order: 1, xpReward: 15 }] }] },
    { order: 4, isPremium: false, title: "meyveler", description: "Unsere Lieblingsfrüchte.", imageUrl: placeholderUrls.chapterIcons.fruits, units: [{ order: 1, title: "apfel, banane, erdbeere", lessons: [{ title: "meyveleri öğrenme", order: 1, xpReward: 15 }] }] },
    { order: 5, isPremium: false, title: "ailem", description: "Familienmitglieder.", imageUrl: placeholderUrls.chapterIcons.family, units: [{ order: 1, title: "mutter, vater, baby", lessons: [{ title: "aile üyeleri", order: 1, xpReward: 15 }] }] },
    // BÖLÜM 6-10 (PREMIUM)
    { order: 6, isPremium: true, title: "vücudum", description: "Teile unseres Körpers.", imageUrl: placeholderUrls.chapterIcons.body, units: [{ order: 1, title: "auge, ohr, nase, mund", lessons: [{ title: "yüzümüzün bölümleri", order: 1, xpReward: 20 }] }] },
    { order: 7, isPremium: true, title: "oyuncaklar", description: "Unsere Spielsachen.", imageUrl: placeholderUrls.chapterIcons.toys, units: [{ order: 1, title: "ball, auto, puppe", lessons: [{ title: "oyuncakları öğrenme", order: 1, xpReward: 20 }] }] },
    { order: 8, isPremium: true, title: "giysiler", description: "Unsere Kleidung.", imageUrl: placeholderUrls.chapterIcons.clothes, units: [{ order: 1, title: "t-shirt, hose, schuhe", lessons: [{ title: "giysileri tanıma", order: 1, xpReward: 20 }] }] },
    { order: 9, isPremium: true, title: "duygular", description: "Wie wir uns fühlen.", imageUrl: placeholderUrls.chapterIcons.feelings, units: [{ order: 1, title: "glücklich, traurig, wütend", lessons: [{ title: "duyguları öğrenme", order: 1, xpReward: 25 }] }] },
    { order: 10, isPremium: true, title: "hava durumu", description: "Wie ist das Wetter?", imageUrl: placeholderUrls.chapterIcons.weather, units: [{ order: 1, title: "sonnig, regnerisch, verschneit", lessons: [{ title: "hava durumunu tanıma", order: 1, xpReward: 25 }] }] },
  ]
};

const defaultMoralLesson = { value: "curiosity", title: "Neugier ist gut", storyText: "Eine neue Sprache zu lernen ist wie die Welt zu entdecken.", displayTiming: "post_lesson" };
const defaultUnitColor = "bg-yellow-500";

// ===========================================
// KAVRAM BANKASI
// ===========================================
function getConceptsForLesson(lessonTitle) {
    const db = { "renkleri tanıma": [{ c: "Rot", d: "Kırmızı" }, { c: "Gelb", d: "Sarı" }, { c: "Blau", d: "Mavi" }], "sayıları öğrenme": [{ c: "Eins", d: "Bir" }, { c: "Zwei", d: "İki" }, { c: "Drei", d: "Üç" }, { c: "Vier", d: "Dört" }, { c: "Fünf", d: "Beş" }], "hayvanları tanıma": [{ c: "Katze", d: "Kedi" }, { c: "Hund", d: "Köpek" }, { c: "Vogel", d: "Kuş" }], "meyveleri öğrenme": [{ c: "Apfel", d: "Elma" }, { c: "Banane", d: "Muz" }, { c: "Erdbeere", d: "Çilek" }], "aile üyeleri": [{ c: "Mutter", d: "Anne" }, { c: "Vater", d: "Baba" }, { c: "Baby", d: "Bebek" }], "yüzümüzün bölümleri": [{ c: "Auge", d: "Göz" }, { c: "Ohr", d: "Kulak" }, { c: "Nase", d: "Burun" }, { c: "Mund", d: "Ağız" }], "oyuncakları öğrenme": [{ c: "Ball", d: "Top" }, { c: "Auto", d: "Araba" }, { c: "Puppe", d: "Oyuncak Bebek" }], "giysileri tanıma": [{ c: "T-Shirt", d: "Tişört" }, { c: "Hose", d: "Pantolon" }, { c: "Schuhe", d: "Ayakkabı" }], "duyguları öğrenme": [{ c: "Glücklich", d: "Mutlu" }, { c: "Traurig", d: "Üzgün" }, { c: "Wütend", d: "Kızgın" }], "hava durumunu tanıma": [{ c: "Sonnig", d: "Güneşli" }, { c: "Regnerisch", d: "Yağmurlu" }, { c: "Verschneit", d: "Karlı" }], default: [{ c: "Hallo", d: "Merhaba" }] };
    return db[lessonTitle.toLowerCase()] || db.default;
}

// ===========================================
// ÇEVİRİ EGZERSİZİ OLMAYAN MOTOR
// ===========================================
function generateExercisesForLesson(lessonTitle) {
    const exercises = [];
    const concepts = getConceptsForLesson(lessonTitle);
    if (!concepts || concepts.length === 0) return [];
    const c1 = concepts[0], c2 = concepts[1 % concepts.length];

    exercises.push({ type: "select", instruction: "Was ist das auf dem Bild?", sourceText: c1.c, correctAnswer: [c1.c], options: generateOptions(c1.c, concepts.map(c => c.c)) });
    exercises.push({ type: "select", instruction: "Welches ist \"${c1.c}\"?", sourceText: c1.c, correctAnswer: [c1.c], options: generateOptions(c1.c, concepts.map(c => c.c)) });
    exercises.push({ type: "listen", instruction: "Wähle das Wort, das du hörst.", sourceText: c1.c, correctAnswer: [c1.c], options: generateOptions(c1.c, concepts.map(c => c.c)), audioUrl: placeholderUrls.audio });

    return exercises.map((e, i) => ({ ...e, order: i + 1 }));
}

function generateOptions(correct, all) { const options = new Set([correct]); const filtered = all.filter(a => a !== correct); while (options.size < 4 && filtered.length > 0) { options.add(filtered.splice(Math.floor(Math.random() * filtered.length), 1)[0]); } return Array.from(options).sort(() => Math.random() - 0.5); }
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }

// ===========================================
// ANA İÇE AKTARMA FONKSİYONU
// ===========================================
async function importData() {
    let session = null;
    try {
        console.log(`🚀 ${programData.programData.nativeName} Programını Veritabanına Aktarma Başlıyor...`);
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB bağlantısı başarılı.");
        session = await mongoose.startSession();
        session.startTransaction();
        console.log("🔄 Transaction başlatıldı.");

        const stats = { chapters: 0, units: 0, lessons: 0, exercises: 0, xp: 0 };

        const languageDoc = new Language(programData.programData);
        await languageDoc.save({ session });
        const languageId = languageDoc._id.toString();
        console.log(`✅ Program oluşturuldu: ${languageDoc.name}\n`);

        for (const chapterData of programData.chapters) {
            const chapterDoc = new Chapter({ languageId, isActive: true, isExpanded: false, contentType: "lesson", moralLesson: defaultMoralLesson, ...chapterData, units: undefined });
            await chapterDoc.save({ session });
            stats.chapters++;
            console.log(`📖 Bölüm ${chapterDoc.order}: ${chapterDoc.title} ${chapterDoc.isPremium ? '(Premium)' : '(Free)'}`);

            for (const unitData of chapterData.units) {
                const unitDoc = new Unit({ languageId, chapterId: chapterDoc._id.toString(), isActive: true, isExpanded: false, imageUrl: chapterDoc.imageUrl, color: defaultUnitColor, ...unitData, isPremium: chapterDoc.isPremium, lessons: undefined });
                await unitDoc.save({ session });
                stats.units++;
                console.log(`  📂 Ünite: ${unitDoc.title}`);

                for (const lessonData of unitData.lessons) {
                    const lessonDoc = new Lesson({ languageId, chapterId: chapterDoc._id.toString(), unitId: unitDoc._id.toString(), isActive: true, isTest: false, imageUrl: unitDoc.imageUrl, ...lessonData, isPremium: chapterDoc.isPremium });
                    await lessonDoc.save({ session });
                    stats.lessons++;
                    stats.xp += lessonData.xpReward;
                    console.log(`    📝 Ders: ${lessonData.title} (${lessonData.xpReward} XP)`);

                    const exercises = generateExercisesForLesson(lessonData.title);
                    for (const exerciseData of exercises) {
                        const newExercise = new Exercise({ languageId, chapterId: chapterDoc._id.toString(), unitId: unitDoc._id.toString(), lessonId: lessonDoc._id.toString(), sourceLanguage: "german", targetLanguage: "turkish", isNewWord: false, isActive: true, neutralAnswerImage: placeholderUrls.programIcon, badAnswerImage: placeholderUrls.programIcon, correctAnswerImage: placeholderUrls.programIcon, ...exerciseData });
                        await newExercise.save({ session });
                        stats.exercises++;
                    }
                    console.log(`      ✅ ${exercises.length} adet egzersiz oluşturuldu.`);
                }
            }
        }

        await session.commitTransaction();
        console.log("\n✅ Transaction başarıyla tamamlandı.\n");
        console.log("═══════════════════════════════════════════════════════");
        console.log("🎉 İŞLEM BAŞARILI! 🎉");
        console.log(`  Bölüm: ${stats.chapters}, Ünite: ${stats.units}, Ders: ${stats.lessons}, Egzersiz: ${stats.exercises}, Toplam XP: ${stats.xp}`);
        console.log("═══════════════════════════════════════════════════════\n");

    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("❌ İŞLEM BAŞARISIZ OLDU!", error);
    } finally {
        if (session) session.endSession();
        await mongoose.disconnect();
        console.log("🔌 MongoDB bağlantısı kapatıldı.");
    }
}

console.log("✅ 'generate-german-4-7-program.js' script'i hazır.");
console.log("İçeriği inceleyip onayladıktan sonra, dosyanın en altındaki 'importData()' satırının yorumunu kaldırıp çalıştırabilirsiniz.");
importData();
