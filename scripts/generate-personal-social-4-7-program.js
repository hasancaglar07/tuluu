
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
    programIcon: "https://storage.googleapis.com/gemini-assistant-assets/project_icons/personal_social.png",
    chapterIcons: {
        self_awareness: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/self_awareness.png",
        emotions: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/emotions.png",
        friendship: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/friendship.png",
        sharing: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/sharing.png",
        rules: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/rules.png",
        problem_solving: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/problem_solving.png",
        responsibility: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/responsibility.png",
        kindness: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/kindness.png",
        respect: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/respect.png",
        gratitude: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/gratitude.png",
    },
    audio: "https://storage.googleapis.com/gemini-assistant-assets/concept_sounds/placeholder.mp3"
};

// ===========================================
// 🚀 KİŞİSEL VE SOSYAL GELİŞİM (4-7 YAŞ) PROGRAMI İÇERİĞİ
// ===========================================
const programData = {
  programData: {
    name: "kişisel ve sosyal gelişim (4-7 yaş)",
    nativeName: "Kişisel ve Sosyal Gelişim (4-7 Yaş)",
    flag: "🤝",
    baseLanguage: "turkish",
    imageUrl: placeholderUrls.programIcon,
    locale: "tr",
    isActive: true,
    category: "personal_social",
    themeMetadata: {islamicContent: false, ageGroup: "kids_4-7", moralValues: ["kindness", "respect", "sharing"], educationalFocus: "Çocukların kişisel ve sosyal becerilerini geliştirme", difficultyLevel: "beginner" },
  },
  chapters: [
    // BÖLÜM 1-5 (FREE)
    { order: 1, isPremium: false, title: "kendini tanıma", description: "Kendi özelliklerini ve yeteneklerini keşfetme.", imageUrl: placeholderUrls.chapterIcons.self_awareness, units: [{ order: 1, title: "ben kimim?", lessons: [{ title: "adımı ve yaşımı biliyorum", order: 1, xpReward: 10 }] }] },
    { order: 2, isPremium: false, title: "duygularımı anlama", description: "Mutluluk, üzüntü, öfke gibi temel duyguları tanıma.", imageUrl: placeholderUrls.chapterIcons.emotions, units: [{ order: 1, title: "duygularım ve ben", lessons: [{ title: "mutlu ve üzgünüm", order: 1, xpReward: 10 }] }] },
    { order: 3, isPremium: false, title: "arkadaşlık kurma", description: "Yeni arkadaşlar edinme ve onlarla iyi geçinme.", imageUrl: placeholderUrls.chapterIcons.friendship, units: [{ order: 1, title: "arkadaşım ol", lessons: [{ title: "arkadaşlarla oyun", order: 1, xpReward: 15 }] }] },
    { order: 4, isPremium: false, title: "paylaşma ve yardımlaşma", description: "Oyuncakları ve eşyaları paylaşma, başkalarına yardım etme.", imageUrl: placeholderUrls.chapterIcons.sharing, units: [{ order: 1, title: "paylaşmak güzeldir", lessons: [{ title: "oyuncaklarımı paylaşıyorum", order: 1, xpReward: 15 }] }] },
    { order: 5, isPremium: false, title: "kurallara uyma", description: "Evde, okulda ve oyun alanında kurallara uyma.", imageUrl: placeholderUrls.chapterIcons.rules, units: [{ order: 1, title: "kurallar neden var?", lessons: [{ title: "evdeki kurallar", order: 1, xpReward: 15 }] }] },
    // BÖLÜM 6-10 (PREMIUM)
    { order: 6, isPremium: true, title: "problem çözme", description: "Karşılaşılan basit sorunlara çözüm bulma.", imageUrl: placeholderUrls.chapterIcons.problem_solving, units: [{ order: 1, title: "küçük sorunlar, büyük çözümler", lessons: [{ title: "sorunumu çözüyorum", order: 1, xpReward: 20 }] }] },
    { order: 7, isPremium: true, title: "sorumluluk alma", description: "Kendi eşyalarına sahip çıkma ve görevlerini yapma.", imageUrl: placeholderUrls.chapterIcons.responsibility, units: [{ order: 1, title: "benim görevim", lessons: [{ title: "oyuncaklarımı topluyorum", order: 1, xpReward: 20 }] }] },
    { order: 8, isPremium: true, title: "nazik olma", description: "Nazik kelimeler kullanma ve kibar davranma.", imageUrl: placeholderUrls.chapterIcons.kindness, units: [{ order: 1, title: "sihirli kelimeler", lessons: [{ title: "lütfen ve teşekkür ederim", order: 1, xpReward: 20 }] }] },
    { order: 9, isPremium: true, title: "farklılıklara saygı", description: "Herkesin farklı olduğunu anlama ve saygı gösterme.", imageUrl: placeholderUrls.chapterIcons.respect, units: [{ order: 1, title: "hepimiz farklıyız", lessons: [{ title: "farklılıklar güzeldir", order: 1, xpReward: 25 }] }] },
    { order: 10, isPremium: true, title: "teşekkür etme", description: "Yardım edenlere ve iyilik yapanlara teşekkür etme.", imageUrl: placeholderUrls.chapterIcons.gratitude, units: [{ order: 1, title: "teşekkür ederim", lessons: [{ title: "minnettar olmak", order: 1, xpReward: 25 }] }] },
  ]
};

const defaultMoralLesson = { value: "kindness", title: "İyilik Yapmak", storyText: "İyilik yapmak, hem bize hem de başkalarına iyi hissettirir.", displayTiming: "post_lesson" };
const defaultUnitColor = "bg-pink-500";

// ===========================================
// KAVRAM BANKASI
// ===========================================
function getConceptsForLesson(lessonTitle) {
    const db = { "adımı ve yaşımı biliyorum": [{ c: "Adım", d: "Benim ismim" }, { c: "Yaşım", d: "Doğduğumdan beri geçen süre" }], "mutlu ve üzgünüm": [{ c: "Mutlu", d: "Sevinçli hissetmek" }, { c: "Üzgün", d: "Kederli hissetmek" }], "arkadaşlarla oyun": [{ c: "Arkadaş", d: "Birlikte vakit geçirmeyi sevdiğim kişi" }, { c: "Oyun", d: "Eğlenmek için yapılan aktivite" }], "oyuncaklarımı paylaşıyorum": [{ c: "Paylaşmak", d: "Sahip olduklarını başkalarıyla bölüşmek" }, { c: "Yardımlaşmak", d: "Birbirine destek olmak" }], "evdeki kurallar": [{ c: "Kural", d: "Yapılması veya yapılmaması gereken şey" }, { c: "Ev", d: "Yaşadığımız yer" }], "sorunumu çözüyorum": [{ c: "Sorun", d: "Çözülmesi gereken zorluk" }, { c: "Çözüm", d: "Sorunu ortadan kaldırma yolu" }], "oyuncaklarımı topluyorum": [{ c: "Sorumluluk", d: "Yapılması gereken görev" }, { c: "Toplamak", d: "Dağınık şeyleri bir araya getirmek" }], "lütfen ve teşekkür ederim": [{ c: "Lütfen", d: "Rica ederken kullanılan kelime" }, { c: "Teşekkür Ederim", d: "Minnettarlığı ifade eden kelime" }], "farklılıklar güzeldir": [{ c: "Farklılık", d: "Benzemeyen özellik" }, { c: "Saygı", d: "Başkalarına değer vermek" }], "minnettar olmak": [{ c: "Minnettar", d: "Şükran duyan" }, { c: "Teşekkür", d: "İyiliğe karşılık verilen söz" }], default: [{ c: "Merhaba", d: "Selamlaşma" }] };
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

    exercises.push({ type: "select", instruction: `"${c1.c}" kavramının tanımı hangisidir?`, sourceText: c1.c, correctAnswer: [c1.d], options: generateOptions(c1.d, concepts.map(c => c.d)) });
    exercises.push({ type: "select", instruction: `Aşağıdaki tanımlardan hangisi "${c2.c}" kavramına aittir?`, sourceText: c2.c, correctAnswer: [c2.d], options: generateOptions(c2.d, concepts.map(c => c.d)) });
    exercises.push({ type: "listen", instruction: `Duyduğunuz kavramı seçin.`, sourceText: c1.c, correctAnswer: [c1.c], options: generateOptions(c1.c, concepts.map(c => c.c)), audioUrl: placeholderUrls.audio });

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

console.log("✅ 'generate-personal-social-4-7-program.js' script'i hazır.");
console.log("İçeriği inceleyip onayladıktan sonra, dosyanın en altındaki 'importData()' satırının yorumunu kaldırıp çalıştırabilirsiniz.");
importData();
