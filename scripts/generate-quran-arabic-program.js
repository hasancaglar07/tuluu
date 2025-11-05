
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
    programIcon: "https://storage.googleapis.com/gemini-assistant-assets/project_icons/quran_arabic.png",
    chapterIcons: {
        harfler: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/arabic_letters.png",
        harekeler: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/harakat.png",
        tecvid: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/tajweed.png",
        sureler: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/surah.png",
        dualar: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/dua.png",
    },
    audio: "https://storage.googleapis.com/gemini-assistant-assets/concept_sounds/arabic_placeholder.mp3"
};

// ===========================================
// 🚀 KUR'AN VE ARAPÇA PROGRAMI İÇERİĞİ
// ===========================================
const programData = {
  programData: {
    name: "kur'an & arapça",
    nativeName: "Kur'an ve Arapça Eğitimi",
    flag: "🕋",
    baseLanguage: "turkish",
    imageUrl: placeholderUrls.programIcon,
    locale: "tr",
    isActive: true,
    category: "quran_arabic",
    themeMetadata: { islamicContent: true, ageGroup: "all", moralValues: ["patience", "respect"], educationalFocus: "Kur'an okumayı ve temel Arapça kavramları öğrenme", difficultyLevel: "beginner" },
  },
  chapters: [
    // BÖLÜM 1-5 (FREE)
    {
        order: 1, isPremium: false, title: "harfleri tanıma", description: "Arap alfabesindeki harfleri öğrenme.", imageUrl: placeholderUrls.chapterIcons.harfler, units: [
            { order: 1, title: "1. Grup Harfler", description: "Elif, Be, Te, Se, Cim", lessons: [{ title: "elif ve be harfleri", order: 1, xpReward: 10 }, { title: "te ve se harfleri", order: 2, xpReward: 10 }] }, 
            { order: 2, title: "2. Grup Harfler", description: "Ha, Hı, Dal, Zel, Ra", lessons: [{ title: "cim, ha, hı harfleri", order: 1, xpReward: 15 }] }
        ]
    },
    {
        order: 2, isPremium: false, title: "harekeler", description: "Harflere ses veren işaretler: üstün, esre, ötre.", imageUrl: placeholderUrls.chapterIcons.harekeler, units: [
            { order: 1, title: "üstün (fetha)", description: "Harflere 'e' veya 'a' sesi verir.", lessons: [{ title: "üstün ile okuma", order: 1, xpReward: 10 }] }, 
            { order: 2, title: "esre (kesra)", description: "Harflere 'i' sesi verir.", lessons: [{ title: "esre ile okuma", order: 1, xpReward: 10 }] }, 
            { order: 3, title: "ötre (damma)", description: "Harflere 'u' veya 'ü' sesi verir.", lessons: [{ title: "ötre ile okuma", order: 1, xpReward: 10 }] }
        ]
    },
    {
        order: 3, isPremium: false, title: "cezm ve şedde", description: "Harfleri birleştirme ve vurgulama işaretleri.", imageUrl: placeholderUrls.chapterIcons.harekeler, units: [
            { order: 1, title: "cezm (sükun)", description: "Harfi harekesiz okutur.", lessons: [{ title: "cezm ile okuma", order: 1, xpReward: 15 }] }, 
            { order: 2, title: "şedde (teşdid)", description: "Harfi iki kere okutur.", lessons: [{ title: "şedde ile okuma", order: 1, xpReward: 15 }] }
        ]
    },
    {
        order: 4, isPremium: false, title: "med harfleri", description: "Uzatma harfleri: Elif, Vav, Ye.", imageUrl: placeholderUrls.chapterIcons.tecvid, units: [
            { order: 1, title: "meddi tabii", description: "Doğal uzatma kuralı.", lessons: [{ title: "elif ile uzatma", order: 1, xpReward: 15 }, { title: "vav ile uzatma", order: 2, xpReward: 15 }, { title: "ye ile uzatma", order: 3, xpReward: 15 }] }
        ]
    },
    {
        order: 5, isPremium: false, title: "tenvin", description: "Çift harekeler: iki üstün, iki esre, iki ötre.", imageUrl: placeholderUrls.chapterIcons.harekeler, units: [
            { order: 1, title: "iki üstün (fethaten)", description: "Harfe 'an' veya 'en' sesi verir.", lessons: [{ title: "iki üstün ile okuma", order: 1, xpReward: 20 }] }, 
            { order: 2, title: "iki esre (kesraten)", description: "Harfe 'in' sesi verir.", lessons: [{ title: "iki esre ile okuma", order: 1, xpReward: 20 }] }
        ]
    },
    // BÖLÜM 6-10 (PREMIUM)
    {
        order: 6, isPremium: true, title: "tecvid'e giriş", description: "Kur'an'ı güzel okuma kuralları.", imageUrl: placeholderUrls.chapterIcons.tecvid, units: [
            { order: 1, title: "izhar ve ihfa", description: "Tenvin ve sakin nun kuralları.", lessons: [{ title: "izhar nedir?", order: 1, xpReward: 25 }, { title: "ihfa nedir?", order: 2, xpReward: 25 }] }
        ]
    },
    {
        order: 7, isPremium: true, title: "kısa sureler - 1", description: "Namazda okunan kısa sureleri öğrenme.", imageUrl: placeholderUrls.chapterIcons.sureler, units: [
            { order: 1, title: "fatiha suresi", description: "Namazın ilk suresi.", lessons: [{ title: "fatiha suresi ezber", order: 1, xpReward: 30 }] }, 
            { order: 2, title: "ihlas suresi", description: "Allah'ın birliğini anlatan sure.", lessons: [{ title: "ihlas suresi ezber", order: 1, xpReward: 30 }] }
        ]
    },
    {
        order: 8, isPremium: true, title: "kısa sureler - 2", description: "Sığınma sureleri.", imageUrl: placeholderUrls.chapterIcons.sureler, units: [
            { order: 1, title: "felak suresi", description: "Yaratılmışların şerrinden sığınma.", lessons: [{ title: "felak suresi ezber", order: 1, xpReward: 35 }] }, 
            { order: 2, title: "nas suresi", description: "Vesvesecinin şerrinden sığınma.", lessons: [{ title: "nas suresi ezber", order: 1, xpReward: 35 }] }
        ]
    },
    {
        order: 9, isPremium: true, title: "kısa sureler - 3", description: "Diğer namaz sureleri.", imageUrl: placeholderUrls.chapterIcons.sureler, units: [
            { order: 1, title: "kureyş ve maun sureleri", description: "Kureyş ve Maun surelerini öğrenme.", lessons: [{ title: "kureyş suresi ezber", order: 1, xpReward: 40 }, { title: "maun suresi ezber", order: 2, xpReward: 40 }] }
        ]
    },
    {
        order: 10, isPremium: true, title: "günlük dualar", description: "Yemek ve uyku duaları gibi günlük dualar.", imageUrl: placeholderUrls.chapterIcons.dualar, units: [
            { order: 1, title: "yemek duaları", description: "Yemeğe başlarken ve bitirirken okunacak dualar.", lessons: [{ title: "yemek duası", order: 1, xpReward: 25 }] }, 
            { order: 2, title: "uyku duaları", description: "Uyumadan önce ve uyanınca okunacak dualar.", lessons: [{ title: "uyku duası", order: 1, xpReward: 25 }] }
        ]
    },
  ]
};

const defaultMoralLesson = { value: "respect", title: "Kur'an'a Saygı", storyText: "Kur'an okumak ve öğrenmek, Allah'ın kelamına gösterilen en büyük saygıdır.", displayTiming: "post_lesson" };
const defaultUnitColor = "bg-teal-500";

// ===========================================
// KAVRAM BANKASI
// ===========================================
function getConceptsForLesson(lessonTitle) {
    const db = { "elif ve be harfleri": [{ c: "ا", d: "Elif" }, { c: "ب", d: "Be" }], "te ve se harfleri": [{ c: "ت", d: "Te" }, { c: "ث", d: "Se" }], "cim, ha, hı harfleri": [{ c: "ج", d: "Cim" }, { c: "ح", d: "Ha" }, { c: "خ", d: "Hı" }], "üstün ile okuma": [{ c: "بَ", d: "be" }, { c: "تَ", d: "te" }], "esre ile okuma": [{ c: "بِ", d: "bi" }, { c: "تِ", d: "ti" }], "ötre ile okuma": [{ c: "بُ", d: "bu" }, { c: "تُ", d: "tu" }], "cezm ile okuma": [{ c: "أَبْ", d: "eb" }, { c: "أَتْ", d: "et" }], "şedde ile okuma": [{ c: "رَبِّ", d: "rabbi" }, { c: "حَقُّ", d: "hakku" }], "elif ile uzatma": [{ c: "بَا", d: "baa" }, { c: "تَا", d: "taa" }], "vav ile uzatma": [{ c: "بُو", d: "buu" }, { c: "تُو", d: "tuu" }], "ye ile uzatma": [{ c: "بِي", d: "bii" }, { c: "تِي", d: "tii" }], "iki üstün ile okuma": [{ c: "بًا", d: "ben" }, { c: "تًا", d: "ten" }], "iki esre ile okuma": [{ c: "بٍ", d: "bin" }, { c: "تٍ", d: "tin" }], "izhar nedir?": [{ c: "إظهار", d: "Açıkça okumak" }], "ihfa nedir?": [{ c: "إخفاء", d: "Gizleyerek okumak" }], "fatiha suresi ezber": [{ c: "ٱلْحَمْدُ لِلَّهِ", d: "Elhamdu lillahi" }], "ihlas suresi ezber": [{ c: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", d: "Kul huvallahu ehad" }], "felak suresi ezber": [{ c: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ", d: "Kul e'ûzu birabbil felak" }], "nas suresi ezber": [{ c: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", d: "Kul e'ûzu birabbin nâs" }], "kureyş suresi ezber": [{ c: "لِإِيلَافِ قُرَيْشٍ", d: "Liîlâfi kureyş" }], "maun suresi ezber": [{ c: "أَرَأَيْتَ ٱلَّذِي يُكَذِّبُ بِٱلدِّينِ", d: "Eraeytellezî yukezzibu biddîn" }], "yemek duası": [{ c: "بِسْمِ اللهِ", d: "Bismillah" }], "uyku duası": [{ c: "بِاسْمِكَ اللهم", d: "Bismikellahümme" }], default: [{ c: "قرآن", d: "Kur'an" }] };
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

    // 1. Harf/Kelime Seçme
    exercises.push({ type: "select", instruction: `Doğru harfi veya kelimeyi seçin: "${c1.d}"`, sourceText: c1.d, correctAnswer: [c1.c], options: generateOptions(c1.c, concepts.map(c => c.c)) });
    
    // 2. Anlam Seçme
    exercises.push({ type: "select", instruction: `"${c1.c}" ifadesinin anlamı nedir?`, sourceText: c1.c, correctAnswer: [c1.d], options: generateOptions(c1.d, concepts.map(c => c.d)) });

    // 3. Dinle ve Seç
    exercises.push({ type: "listen", instruction: `Duyduğunuz sesi seçin.`, sourceText: c1.c, correctAnswer: [c1.c], options: generateOptions(c1.c, concepts.map(c => c.c)), audioUrl: placeholderUrls.audio });

    // 4. Sıralama (Eğer sure veya dua ise)
    if (lessonTitle.includes("ezber") || lessonTitle.includes("duası")) {
        const words = c1.c.split(' ');
        if (words.length > 1) {
            exercises.push({ type: "arrange", instruction: "Kelimeleri doğru sıraya dizerek ayeti/duayı oluşturun.", sourceText: c1.c, correctAnswer: words, options: shuffleArray([...words]) });
        }
    }

    return exercises.map((e, i) => ({ ...e, order: i + 1 }));
}

function generateOptions(correct, all) {
    const options = new Set([correct]);
    const filtered = all.filter(a => a !== correct);
    while (options.size < 4 && filtered.length > 0) { options.add(filtered.splice(Math.floor(Math.random() * filtered.length), 1)[0]); }
    return Array.from(options).sort(() => Math.random() - 0.5);
}

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
                    console.log(`    📝 Ders: ${lessonDoc.title} (${lessonData.xpReward} XP)`);

                    const exercises = generateExercisesForLesson(lessonData.title);
                    for (const exerciseData of exercises) {
                        const newExercise = new Exercise({ languageId, chapterId: chapterDoc._id.toString(), unitId: unitDoc._id.toString(), lessonId: lessonDoc._id.toString(), sourceLanguage: "arabic", targetLanguage: "turkish", isNewWord: false, isActive: true, neutralAnswerImage: placeholderUrls.programIcon, badAnswerImage: placeholderUrls.programIcon, correctAnswerImage: placeholderUrls.programIcon, ...exerciseData });
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

console.log("✅ 'generate-quran-arabic-program.js' script'i hazır.");
console.log("İçeriği inceleyip onayladıktan sonra, dosyanın en altındaki 'importData()' satırının yorumunu kaldırıp çalıştırabilirsiniz.");
importData();
