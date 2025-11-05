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
    programIcon: "https://storage.googleapis.com/gemini-assistant-assets/project_icons/math_logic.png",
    chapterIcons: {
        default: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/default.png",
        sayilar: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/numbers.png",
        islemler: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/operations.png",
        zaman: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/time.png",
        geometri: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/geometry.png",
        kesirler: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/fractions.png",
        olculer: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/measure.png",
        veri: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/data.png",
    },
    audio: "https://storage.googleapis.com/gemini-assistant-assets/concept_sounds/placeholder.mp3"
};

// ===========================================
// 🚀 NİHAİ MATEMATİK PROGRAMI İÇERİĞİ
// ===========================================
const programData = {
  programData: {
    name: "matematik & mantık",
    nativeName: "Kapsamlı Matematik ve Mantık Eğitimi",
    flag: "🧠",
    baseLanguage: "turkish",
    imageUrl: placeholderUrls.programIcon,
    locale: "tr",
    isActive: true,
    category: "math_logic",
    themeMetadata: { islamicContent: false, ageGroup: "kids_8-12", moralValues: ["patience", "honesty"], educationalFocus: "Kapsamlı matematiksel ve mantıksal düşünme becerileri", difficultyLevel: "beginner" },
  },
  chapters: [
    { order: 1, isPremium: false, title: "sayıları tanıyalım", description: "Sayıların dünyasına giriş, rakamlar ve 100'e kadar sayma.", imageUrl: placeholderUrls.chapterIcons.sayilar, units: [{ order: 1, title: "rakamlar (0-9)", description: "0-9 arası rakamları öğrenme.", lessons: [{ title: "rakamları tanıma", order: 1, xpReward: 10 }, { title: "rakamlarla sayma", order: 2, xpReward: 10 }] }, { order: 2, title: "sayılar (10-20)", description: "10-20 arası sayılar ve onluk kavramı.", lessons: [{ title: "onluk ve birlik", order: 1, xpReward: 15 }] }] },
    { order: 2, isPremium: false, title: "toplama işlemi", description: "Temel ve eldeli toplama işlemleri.", imageUrl: placeholderUrls.chapterIcons.islemler, units: [{ order: 1, title: "basit toplama", description: "Eldesiz toplama alıştırmaları.", lessons: [{ title: "toplama nedir?", order: 1, xpReward: 10 }] }, { order: 2, title: "eldeli toplama", description: "Onlukları aşan toplama işlemleri.", lessons: [{ title: "elde nedir?", order: 1, xpReward: 15 }] }] },
    { order: 3, isPremium: false, title: "çıkarma işlemi", description: "Temel ve onluk bozarak çıkarma.", imageUrl: placeholderUrls.chapterIcons.islemler, units: [{ order: 1, title: "basit çıkarma", description: "Onluk bozmayan çıkarma alıştırmaları.", lessons: [{ title: "çıkarma nedir?", order: 1, xpReward: 10 }] }, { order: 2, title: "onluk bozarak çıkarma", description: "Büyük sayıdan küçük sayıyı çıkarma.", lessons: [{ title: "onluk bozma nedir?", order: 1, xpReward: 15 }] }] },
    { order: 4, isPremium: false, title: "zaman ve takvim", description: "Saati, günleri, ayları öğrenme.", imageUrl: placeholderUrls.chapterIcons.zaman, units: [{ order: 1, title: "saatler", description: "Analog ve dijital saatleri okuma.", lessons: [{ title: "tam saatler", order: 1, xpReward: 15 }, { title: "yarım saatler", order: 2, xpReward: 15 }] }, { order: 2, title: "takvim", description: "Günler, haftalar ve aylar.", lessons: [{ title: "haftanın günleri", order: 1, xpReward: 10 }] }] },
    { order: 5, isPremium: false, title: "geometrik şekiller", description: "2D ve 3D şekilleri tanıma.", imageUrl: placeholderUrls.chapterIcons.geometri, units: [{ order: 1, title: "iki boyutlu şekiller", description: "Kare, üçgen, daire ve dikdörtgen.", lessons: [{ title: "kare ve dikdörtgen", order: 1, xpReward: 10 }, { title: "üçgen ve daire", order: 2, xpReward: 10 }] }, { order: 2, title: "üç boyutlu cisimler", description: "Küp, küre, silindir ve koni.", lessons: [{ title: "küp ve küre", order: 1, xpReward: 15 }] }] },
    { order: 6, isPremium: true, title: "çarpma işlemi", description: "Çarpım tablosu ve çarpma problemleri.", imageUrl: placeholderUrls.chapterIcons.islemler, units: [{ order: 1, title: "çarpım tablosu", description: "1'den 10'a kadar çarpım tablosu.", lessons: [{ title: "çarpım tablosu (1-5)", order: 1, xpReward: 25 }, { title: "çarpım tablosu (6-10)", order: 2, xpReward: 30 }] }] },
    { order: 7, isPremium: true, title: "bölme işlemi", description: "Kalanlı ve kalansız bölme.", imageUrl: placeholderUrls.chapterIcons.islemler, units: [{ order: 1, title: "kalansız bölme", description: "Adil paylaştırma alıştırmaları.", lessons: [{ title: "bölme nedir?", order: 1, xpReward: 25 }] }, { order: 2, title: "kalanlı bölme", description: "Paylaştırma sonrası artanları bulma.", lessons: [{ title: "kalan nedir?", order: 1, xpReward: 25 }] }] },
    { order: 8, isPremium: true, title: "kesirler", description: "Bütün, yarım, çeyrek ve kesir problemleri.", imageUrl: placeholderUrls.chapterIcons.kesirler, units: [{ order: 1, title: "kesirlere giriş", description: "Bir bütünün parçalarını anlama.", lessons: [{ title: "bütün, yarım, çeyrek", order: 1, xpReward: 30 }, { title: "kesirleri okuma ve yazma", order: 2, xpReward: 30 }] }] },
    { order: 9, isPremium: true, title: "ölçüler", description: "Uzunluk, ağırlık ve sıvı ölçüleri.", imageUrl: placeholderUrls.chapterIcons.olculer, units: [{ order: 1, title: "uzunluk ölçüleri", description: "Metre ve santimetre.", lessons: [{ title: "metre ve santimetre", order: 1, xpReward: 30 }] }, { order: 2, title: "ağırlık ölçüleri", description: "Kilogram ve gram.", lessons: [{ title: "kilogram ve gram", order: 1, xpReward: 30 }] }] },
    { order: 10, isPremium: true, title: "veri ve grafikler", description: "Tablo ve grafikleri okuma, veri toplama.", imageUrl: placeholderUrls.chapterIcons.veri, units: [{ order: 1, title: "tablo okuma", description: "Çetele ve sıklık tabloları.", lessons: [{ title: "çetele tablosu", order: 1, xpReward: 40 }] }, { order: 2, title: "grafikler", description: "Nesne ve şekil grafikleri.", lessons: [{ title: "nesne grafiği", order: 1, xpReward: 45 }] }] },
  ]
};

const defaultMoralLesson = { value: "patience", title: "Sabırla Öğrenmek", storyText: "Her yeni bilgi, sabırla atılan bir adımdır.", displayTiming: "post_lesson" };
const defaultUnitColor = "bg-gray-500";

// ===========================================
// KAVRAM BANKASI
// ===========================================
function getConceptsForLesson(lessonTitle) {
    const db = { "rakamları tanıma": [{ c: "bir", d: "1 sayısı" }, { c: "iki", d: "2 sayısı" }], "rakamlarla sayma": [{ c: "üç", d: "3 sayısı" }, { c: "dört", d: "4 sayısı" }], "onluk ve birlik": [{ c: "onluk", d: "10 tane birlik grubu" }, { c: "birlik", d: "Tek başına olanlar" }], "toplama nedir?": [{ c: "toplama", d: "Bir araya getirme" }, { c: "artı", d: "+ işareti" }], "elde nedir?": [{ c: "elde", d: "Onu aşan kısım" }], "çıkarma nedir?": [{ c: "çıkarma", d: "Farkı bulma" }], "onluk bozma nedir?": [{ c: "onluk bozma", d: "Soldaki basamaktan 10 almak" }], "tam saatler": [{ c: "saat", d: "Zaman birimi" }], "yarım saatler": [{ c: "buçuk", d: "Yarım saat" }], "haftanın günleri": [{ c: "pazartesi", d: "Haftanın ilk günü" }], "kare ve dikdörtgen": [{ c: "kare", d: "4 kenarı eşit dörtgen" }], "üçgen ve daire": [{ c: "üçgen", d: "3 kenarlı şekil" }], "küp ve küre": [{ c: "küp", d: "6 kare yüzden oluşan cisim" }], "çarpım tablosu (1-5)": [{ c: "çarpma", d: "Tekrarlı toplama" }], "çarpım tablosu (6-10)": [{ c: "yedi kere sekiz", d: "56" }], "bölme nedir?": [{ c: "bölme", d: "Adil paylaştırma" }], "kalan nedir?": [{ c: "kalan", d: "Bölme sonunda artan sayı" }], "bütün, yarım, çeyrek": [{ c: "bütün", d: "Tamamı" }], "kesirleri okuma ve yazma": [{ c: "pay", d: "Kesir çizgisinin üstündeki sayı" }], "metre ve santimetre": [{ c: "metre", d: "Temel uzunluk ölçüsü" }], "kilogram ve gram": [{ c: "kilogram", d: "Temel ağırlık ölçüsü" }], "çetele tablosu": [{ c: "çetele", d: "Verileri çizgilerle gösterme" }], "nesne grafiği": [{ c: "grafik", d: "Verileri şekillerle gösterme" }], default: [{ c: "matematik", d: "sayı bilimi" }] };
    return db[lessonTitle.toLowerCase()] || db.default;
}

// ===========================================
// UYUMLU EGZERSİZ OLUŞTURMA MOTORU
// ===========================================
function generateExercisesForLesson(lessonTitle) {
    const exercises = [];
    const concepts = getConceptsForLesson(lessonTitle);
    if (!concepts || concepts.length === 0) return [];
    const c1 = concepts[0], c2 = concepts[1 % concepts.length];
    exercises.push({ type: "select", instruction: `"${c1.c}" kavramının tanımı hangisidir?`, sourceText: c1.c, correctAnswer: [c1.d], options: generateOptions(c1.d, concepts.map(c => c.d)) });
    exercises.push({ type: "translate", instruction: `"${c2.d}" tanımı hangi kavrama aittir?`, sourceText: c2.d, correctAnswer: [c2.c], options: [] });
    exercises.push({ type: "listen", instruction: `Duyduğun kavram hangisidir?`, sourceText: c1.c, correctAnswer: [c1.c], options: generateOptions(c1.c, concepts.map(c => c.c)), audioUrl: placeholderUrls.audio });
    return exercises.map((e, i) => ({ ...e, order: i + 1 }));
}

function generateOptions(correct, all) {
    const options = new Set([correct]);
    const filtered = all.filter(a => a !== correct);
    while (options.size < 4 && filtered.length > 0) { options.add(filtered.splice(Math.floor(Math.random() * filtered.length), 1)[0]); }
    return Array.from(options).sort(() => Math.random() - 0.5);
}

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
                    console.log(`    📝 Ders: ${lessonDoc.title} (${lessonDoc.xpReward} XP)`);

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

console.log("✅ 'generate-math-program-v2.js' script'i NİHAİ ve TAM içerikle güncellendi.");
console.log("Çalıştırmak için en alttaki 'importData()' satırının yorumunu kaldırın.");
importData();
