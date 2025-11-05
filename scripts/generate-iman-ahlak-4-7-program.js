
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
    programIcon: "https://storage.googleapis.com/gemini-assistant-assets/project_icons/faith_morality.png",
    chapterIcons: {
        allah: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/allah.png",
        prophet: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/prophet.png",
        quran: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/quran.png",
        angels: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/angels.png",
        prayer: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/prayer.png",
        zakat: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/zakat.png",
        manners: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/manners.png",
        sharing: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/sharing.png",
        honesty: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/honesty.png",
        gratitude: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/gratitude.png",
    },
    audio: "https://storage.googleapis.com/gemini-assistant-assets/concept_sounds/placeholder.mp3"
};

// ===========================================
// 🚀 İMAN & AHLAK (4-7 YAŞ) PROGRAMI İÇERİĞİ
// ===========================================
const programData = {
  programData: {
    name: "iman & ahlak (4-7 yaş)",
    nativeName: "İman ve Ahlak Eğitimi (4-7 Yaş)",
    flag: "🕌",
    baseLanguage: "turkish",
    imageUrl: placeholderUrls.programIcon,
    locale: "tr",
    isActive: true,
    category: "faith_morality",
    themeMetadata: { islamicContent: true, ageGroup: "kids_4-7", moralValues: ["patience", "gratitude", "kindness"], educationalFocus: "Temel İslami değerleri ve ahlakı öğretme", difficultyLevel: "beginner" },
  },
  chapters: [
    // BÖLÜM 1-5 (FREE)
    { order: 1, isPremium: false, title: "allah'ı tanıyorum", description: "Allah'ın varlığını ve birliğini öğreniyorum.", imageUrl: placeholderUrls.chapterIcons.allah, units: [{ order: 1, title: "allah birdir", lessons: [{ title: "allah'ın isimleri", order: 1, xpReward: 10 }] }] },
    { order: 2, isPremium: false, title: "peygamberimi seviyorum", description: "Peygamber Efendimiz Hz. Muhammed'i tanıyorum.", imageUrl: placeholderUrls.chapterIcons.prophet, units: [{ order: 1, title: "peygamber kimdir?", lessons: [{ title: "hz. muhammed'in adı", order: 1, xpReward: 10 }] }] },
    { order: 3, isPremium: false, title: "kitabım kur'an", description: "Kur'an-ı Kerim'i ve önemini öğreniyorum.", imageUrl: placeholderUrls.chapterIcons.quran, units: [{ order: 1, title: "kur'an nedir?", lessons: [{ title: "kur'an allah'ın kitabı", order: 1, xpReward: 15 }] }] },
    { order: 4, isPremium: false, title: "melekler ve ben", description: "Melekleri ve görevlerini öğreniyorum.", imageUrl: placeholderUrls.chapterIcons.angels, units: [{ order: 1, title: "melekler kimdir?", lessons: [{ title: "meleklerin isimleri", order: 1, xpReward: 15 }] }] },
    { order: 5, isPremium: false, title: "namaz öğreniyorum", description: "Namazın önemini ve nasıl kılındığını öğreniyorum.", imageUrl: placeholderUrls.chapterIcons.prayer, units: [{ order: 1, title: "namaz neden önemli?", lessons: [{ title: "namazın vakitleri", order: 1, xpReward: 15 }] }] },
    // BÖLÜM 6-10 (PREMIUM)
    { order: 6, isPremium: true, title: "oruç ve zekat", description: "Oruç ve zekatın temel kavramlarını öğreniyorum.", imageUrl: placeholderUrls.chapterIcons.zakat, units: [{ order: 1, title: "oruç nedir?", lessons: [{ title: "ramazan ayı", order: 1, xpReward: 20 }] }] },
    { order: 7, isPremium: true, title: "güzel ahlakım", description: "İyi davranışlar ve güzel sözler.", imageUrl: placeholderUrls.chapterIcons.manners, units: [{ order: 1, title: "doğruluk ve dürüstlük", lessons: [{ title: "yalan söylememek", order: 1, xpReward: 20 }] }] },
    { order: 8, isPremium: true, title: "paylaşma ve yardımlaşma", description: "Başkalarına yardım etmenin önemini öğreniyorum.", imageUrl: placeholderUrls.chapterIcons.sharing, units: [{ order: 1, title: "paylaşmak güzeldir", lessons: [{ title: "yardımsever olmak", order: 1, xpReward: 20 }] }] },
    { order: 9, isPremium: true, title: "doğruluk ve dürüstlük", description: "Her zaman doğruyu söylemek ve dürüst olmak.", imageUrl: placeholderUrls.chapterIcons.honesty, units: [{ order: 1, title: "dürüstlük nedir?", lessons: [{ title: "sözünde durmak", order: 1, xpReward: 25 }] }] },
    { order: 10, isPremium: true, title: "şükür ve sabır", description: "Allah'ın verdiği nimetlere şükretmek ve sabırlı olmak.", imageUrl: placeholderUrls.chapterIcons.gratitude, units: [{ order: 1, title: "şükür nedir?", lessons: [{ title: "sabırlı olmak", order: 1, xpReward: 25 }] }] },
  ]
};

const defaultMoralLesson = { value: "kindness", title: "İyilik Yapmak", storyText: "İyilik yapmak, hem bize hem de başkalarına iyi hissettirir.", displayTiming: "post_lesson" };
const defaultUnitColor = "bg-emerald-500";

// ===========================================
// KAVRAM BANKASI
// ===========================================
function getConceptsForLesson(lessonTitle) {
    const db = { "allah'ın isimleri": [{ c: "Allah", d: "Yaratıcı" }, { c: "Rahman", d: "Çok merhametli" }], "hz. muhammed'in adı": [{ c: "Muhammed", d: "Peygamberimizin adı" }, { c: "Resul", d: "Allah'ın elçisi" }], "kur'an allah'ın kitabı": [{ c: "Kur'an", d: "Allah'ın son kitabı" }, { c: "Ayet", d: "Kur'an'dan bir cümle" }], "meleklerin isimleri": [{ c: "Cebrail", d: "Vahiy meleği" }, { c: "Mikail", d: "Doğa olayları meleği" }], "namazın vakitleri": [{ c: "Sabah", d: "Güneş doğmadan kılınan namaz" }, { c: "Öğle", d: "Güneş tepedeyken kılınan namaz" }], "ramazan ayı": [{ c: "Oruç", d: "Ramazan ayında tutulan ibadet" }, { c: "Ramazan", d: "Oruç tutulan ay" }], "yalan söylememek": [{ c: "Doğruluk", d: "Her zaman doğruyu söylemek" }, { c: "Dürüstlük", d: "Yalan söylememek" }], "yardımsever olmak": [{ c: "Paylaşmak", d: "Sahip olduklarını başkalarıyla bölüşmek" }, { c: "Yardımsever", d: "Başkalarına yardım etmeyi seven" }], "sözünde durmak": [{ c: "Dürüstlük", d: "Sözünü tutmak" }, { c: "Söz", d: "Verilen vaat" }], "sabırlı olmak": [{ c: "Şükür", d: "Nimetlere teşekkür etmek" }, { c: "Sabır", d: "Zorluklara dayanmak" }], default: [{ c: "İman", d: "Allah'a inanmak" }] };
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

console.log("✅ 'generate-iman-ahlak-4-7-program.js' script'i hazır.");
console.log("İçeriği inceleyip onayladıktan sonra, dosyanın en altındaki 'importData()' satırının yorumunu kaldırıp çalıştırabilirsiniz.");
importData();
