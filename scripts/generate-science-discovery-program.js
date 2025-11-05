
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
    programIcon: "https://storage.googleapis.com/gemini-assistant-assets/project_icons/science_discovery.png",
    chapterIcons: {
        universe: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/universe.png",
        living_things: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/living_things.png",
        physics: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/physics.png",
        chemistry: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/chemistry.png",
        technology: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/technology.png",
        earth: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/earth.png",
        human_body: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/human_body.png",
        energy: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/energy.png",
        environment: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/environment.png",
        innovation: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/innovation.png",
    },
    audio: "https://storage.googleapis.com/gemini-assistant-assets/concept_sounds/placeholder.mp3"
};

// ===========================================
// 🚀 BİLİM VE KEŞİF PROGRAMI İÇERİĞİ
// ===========================================
const programData = {
  programData: {
    name: "bilim ve keşif",
    nativeName: "Bilim ve Keşif Dünyası",
    flag: "🔬",
    baseLanguage: "turkish",
    imageUrl: placeholderUrls.programIcon,
    locale: "tr",
    isActive: true,
    category: "science_discovery",
    themeMetadata: {islamicContent: false, ageGroup: "all", moralValues: ["curiosity", "critical_thinking", "innovation"], educationalFocus: "Bilimsel düşünme ve keşfetme becerilerini geliştirme", difficultyLevel: "beginner" },
  },
  chapters: [
    // BÖLÜM 1-5 (FREE)
    { order: 1, isPremium: false, title: "evrenimiz", description: "Gezegenler, yıldızlar ve galaksiler.", imageUrl: placeholderUrls.chapterIcons.universe, units: [{ order: 1, title: "güneş sistemi", lessons: [{ title: "gezegenleri tanıma", order: 1, xpReward: 10 }] }] },
    { order: 2, isPremium: false, title: "canlılar dünyası", description: "Hayvanlar, bitkiler ve yaşam döngüleri.", imageUrl: placeholderUrls.chapterIcons.living_things, units: [{ order: 1, title: "hayvanlar alemi", lessons: [{ title: "memeliler ve kuşlar", order: 1, xpReward: 15 }] }] },
    { order: 3, isPremium: false, title: "fizik kanunları", description: "Hareket, kuvvet ve enerji.", imageUrl: placeholderUrls.chapterIcons.physics, units: [{ order: 1, title: "kuvvet ve hareket", lessons: [{ title: "yerçekimi nedir?", order: 1, xpReward: 15 }] }] },
    { order: 4, isPremium: false, title: "kimya deneyleri", description: "Maddenin halleri ve basit kimyasal reaksiyonlar.", imageUrl: placeholderUrls.chapterIcons.chemistry, units: [{ order: 1, title: "maddenin halleri", lessons: [{ title: "katı, sıvı, gaz", order: 1, xpReward: 15 }] }] },
    { order: 5, isPremium: false, title: "teknoloji ve inovasyon", description: "Günlük hayattaki teknolojik aletler ve icatlar.", imageUrl: placeholderUrls.chapterIcons.technology, units: [{ order: 1, title: "basit makineler", lessons: [{ title: "tekerlek ve kaldıraç", order: 1, xpReward: 20 }] }] },
    // BÖLÜM 6-10 (PREMIUM)
    { order: 6, isPremium: true, title: "dünyamız", description: "Depremler, volkanlar ve iklim değişikliği.", imageUrl: placeholderUrls.chapterIcons.earth, units: [{ order: 1, title: "doğal afetler", lessons: [{ title: "deprem ve tsunamiler", order: 1, xpReward: 25 }] }] },
    { order: 7, isPremium: true, title: "insan vücudu", description: "Organlar, sistemler ve sağlık.", imageUrl: placeholderUrls.chapterIcons.human_body, units: [{ order: 1, title: "iskelet sistemi", lessons: [{ title: "kemiklerimiz", order: 1, xpReward: 25 }] }] },
    { order: 8, isPremium: true, title: "enerji kaynakları", description: "Yenilenebilir ve yenilenemeyen enerji.", imageUrl: placeholderUrls.chapterIcons.energy, units: [{ order: 1, title: "yenilenebilir enerji", lessons: [{ title: "güneş ve rüzgar enerjisi", order: 1, xpReward: 30 }] }] },
    { order: 9, isPremium: true, title: "çevre bilinci", description: "Geri dönüşüm, kirlilik ve sürdürülebilirlik.", imageUrl: placeholderUrls.chapterIcons.environment, units: [{ order: 1, title: "geri dönüşüm", lessons: [{ title: "çöp ayrıştırma", order: 1, xpReward: 30 }] }] },
    { order: 10, isPremium: true, title: "geleceğin bilimleri", description: "Yapay zeka, robotik ve uzay keşifleri.", imageUrl: placeholderUrls.chapterIcons.innovation, units: [{ order: 1, title: "yapay zeka", lessons: [{ title: "robotlar ve algoritmalar", order: 1, xpReward: 35 }] }] },
  ]
};

const defaultMoralLesson = { value: "curiosity", title: "Merak Etmek", storyText: "Bilim, merakla başlar ve keşifle devam eder.", displayTiming: "post_lesson" };
const defaultUnitColor = "bg-blue-500";

// ===========================================
// KAVRAM BANKASI
// ===========================================
function getConceptsForLesson(lessonTitle) {
    const db = { "gezegenleri tanıma": [{ c: "Güneş", d: "Sistemimizin merkezi yıldızı" }, { c: "Mars", d: "Kızıl gezegen" }, { c: "Dünya", d: "Yaşadığımız gezegen" }], "memeliler ve kuşlar": [{ c: "Aslan", d: "Memeli bir hayvan" }, { c: "Kartal", d: "Uçan bir kuş" }], "yerçekimi nedir?": [{ c: "Yerçekimi", d: "Cisimleri yere çeken kuvvet" }, { c: "Kuvvet", d: "Cisimlerin hareketini değiştiren etki" }], "katı, sıvı, gaz": [{ c: "Katı", d: "Belirli şekli olan madde" }, { c: "Sıvı", d: "Akışkan madde" }, { c: "Gaz", d: "Belirli şekli olmayan madde" }], "tekerlek ve kaldıraç": [{ c: "Tekerlek", d: "Dönerek hareketi kolaylaştıran basit makine" }, { c: "Kaldıraç", d: "Yük kaldırmaya yarayan basit makine" }], "deprem ve tsunamiler": [{ c: "Deprem", d: "Yerin sarsılması" }, { c: "Tsunami", d: "Dev deniz dalgası" }], "kemiklerimiz": [{ c: "Kemik", d: "Vücudumuza destek sağlayan yapı" }, { c: "İskelet", d: "Tüm kemiklerin birleşimi" }], "güneş ve rüzgar enerjisi": [{ c: "Güneş Enerjisi", d: "Güneşten elde edilen enerji" }, { c: "Rüzgar Enerjisi", d: "Rüzgardan elde edilen enerji" }], "çöp ayrıştırma": [{ c: "Geri Dönüşüm", d: "Atıkları yeniden kullanma" }, { c: "Çevre", d: "Yaşadığımız doğal ortam" }], "robotlar ve algoritmalar": [{ c: "Robot", d: "Otomatik görev yapan makine" }, { c: "Algoritma", d: "Bir problemi çözmek için adım adım talimatlar" }], default: [{ c: "Bilim", d: "Evreni anlama çabası" }] };
    return db[lessonTitle.toLowerCase()] || db.default;
}

// ===========================================
// PREMIUM EGZERSİZ MOTORU (Match ve Speak içerir)
// ===========================================
function generateExercisesForLesson(lessonTitle) {
    const exercises = [];
    const concepts = getConceptsForLesson(lessonTitle);
    if (!concepts || concepts.length === 0) return [];
    const c1 = concepts[0], c2 = concepts[1 % concepts.length];

    // 1. Select (Kavramın tanımını seçme)
    exercises.push({ type: "select", instruction: `"${c1.c}" kavramının tanımı hangisidir?`, sourceText: c1.c, correctAnswer: [c1.d], options: generateOptions(c1.d, concepts.map(c => c.d)) });
    
    // 2. Match (Kavram ve Tanım Eşleştirme)
    if (concepts.length >= 2) {
        const matchPairs = concepts.slice(0, 2).map(con => ({ left: con.c, right: con.d }));
        exercises.push({ type: "match", instruction: "Kavramları tanımlarıyla eşleştirin.", sourceText: JSON.stringify(matchPairs), correctAnswer: matchPairs.map(p => `${p.left}:${p.right}`), options: shuffleArray([...matchPairs.map(p => p.left), ...matchPairs.map(p => p.right)]) });
    }

    // 3. Listen (Duyduğunu seçme)
    exercises.push({ type: "listen", instruction: `Duyduğunuz kavramı seçin.`, sourceText: c1.c, correctAnswer: [c1.c], options: generateOptions(c1.c, concepts.map(c => c.c)), audioUrl: placeholderUrls.audio });

    // 4. Speak (Kavramı tekrar etme)
    exercises.push({ type: "speak", instruction: `"${c2.c}" kavramını tekrar edin.`, sourceText: c2.c, correctAnswer: [c2.c], options: [], audioUrl: placeholderUrls.audio });

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
                    const lessonDoc = new Lesson({ languageId, chapterId: chapterDoc._id.toString(), unitId: unitDoc._id.toString(), isActive: true, isTest: false, imageUrl: unitData.imageUrl, ...lessonData, isPremium: chapterDoc.isPremium });
                    await lessonDoc.save({ session });
                    stats.lessons++;
                    stats.xp += lessonData.xpReward;
                    console.log(`    📝 Ders: ${lessonData.title} (${lessonData.xpReward} XP)`);

                    const exercises = generateExercisesForLesson(lessonData.title);
                    for (const exerciseData of exercises) {
                        const newExercise = new Exercise({ languageId, chapterId: chapterDoc._id.toString(), unitId: unitDoc._id.toString(), lessonId: lessonDoc._id.toString(), sourceLanguage: "turkish", targetLanguage: "turkish", isNewWord: false, isActive: true, neutralAnswerImage: placeholderUrls.programIcon, badAnswerImage: placeholderUrls.programIcon, correctAnswerImage: placeholderUrls.programIcon, ...exerciseData });
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

console.log("✅ 'generate-science-discovery-program.js' script'i hazır.");
console.log("İçeriği inceleyip onayladıktan sonra, dosyanın en altındaki 'importData()' satırının yorumunu kaldırıp çalıştırabilirsiniz.");
importData();
