
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
    programIcon: "https://storage.googleapis.com/gemini-assistant-assets/project_icons/mental_spiritual.png",
    chapterIcons: {
        breathing: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/breathing.png",
        mindfulness: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/mindfulness.png",
        memory: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/memory.png",
        focus: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/focus.png",
        emotions: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/emotions.png",
        stress: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/stress.png",
        positive_thinking: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/positive_thinking.png",
        imagination: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/imagination.png",
        empathy: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/empathy.png",
        gratitude: "https://storage.googleapis.com/gemini-assistant-assets/chapter_icons/gratitude.png",
    },
    audio: "https://storage.googleapis.com/gemini-assistant-assets/concept_sounds/placeholder.mp3"
};

// ===========================================
// 🚀 ZİHİNSEL VE RUHSAL GELİŞİM PROGRAMI İÇERİĞİ
// ===========================================
const programData = {
  programData: {
    name: "zihinsel ve ruhsal gelişim",
    nativeName: "Zihinsel ve Ruhsal Gelişim",
    flag: "🧘",
    baseLanguage: "turkish",
    imageUrl: placeholderUrls.programIcon,
    locale: "tr",
    isActive: true,
    category: "mental_spiritual",
    themeMetadata: {islamicContent: true, ageGroup: "all", moralValues: ["patience", "gratitude", "self_awareness"], educationalFocus: "Zihinsel ve ruhsal dengeyi ve farkındalığı artırma", difficultyLevel: "beginner" },
  },
  chapters: [
    // BÖLÜM 1-5 (FREE)
    { order: 1, isPremium: false, title: "nefes egzersizleri", description: "Doğru nefes alıp vererek sakinleşme teknikleri.", imageUrl: placeholderUrls.chapterIcons.breathing, units: [{ order: 1, title: "diyafram nefesi", lessons: [{ title: "doğru nefes alma", order: 1, xpReward: 10 }] }] },
    { order: 2, isPremium: false, title: "farkındalık (mindfulness)", description: "Anı yaşama ve dikkatini şimdiki zamana odaklama becerisi.", imageUrl: placeholderUrls.chapterIcons.mindfulness, units: [{ order: 1, title: "beş duyu farkındalığı", lessons: [{ title: "görme ve duyma farkındalığı", order: 1, xpReward: 15 }] }] },
    { order: 3, isPremium: false, title: "hafıza teknikleri", description: "Daha kolay hatırlamak için zihinsel araçlar.", imageUrl: placeholderUrls.chapterIcons.memory, units: [{ order: 1, title: "hikayeleştirme tekniği", lessons: [{ title: "hafıza sarayı", order: 1, xpReward: 15 }] }] },
    { order: 4, isPremium: false, title: "odaklanma becerileri", description: "Dikkat süresini artırma ve dağıtıcı unsurları yönetme.", imageUrl: placeholderUrls.chapterIcons.focus, units: [{ order: 1, title: "pomodoro tekniği", lessons: [{ title: "odaklanma pratiği", order: 1, xpReward: 15 }] }] },
    { order: 5, isPremium: false, title: "duygu yönetimi", description: "Duyguları tanıma, anlama ve ifade etme.", imageUrl: placeholderUrls.chapterIcons.emotions, units: [{ order: 1, title: "temel duygular", lessons: [{ title: "duyguları tanıma", order: 1, xpReward: 15 }] }] },
    // BÖLÜM 6-10 (PREMIUM)
    { order: 6, isPremium: true, title: "stres yönetimi", description: "Stresle başa çıkma ve rahatlama yöntemleri.", imageUrl: placeholderUrls.chapterIcons.stress, units: [{ order: 1, title: "basit rahatlama teknikleri", lessons: [{ title: "gevşeme egzersizleri", order: 1, xpReward: 20 }] }] },
    { order: 7, isPremium: true, title: "pozitif düşünce", description: "Olumlu bir bakış açısı geliştirme ve sürdürme.", imageUrl: placeholderUrls.chapterIcons.positive_thinking, units: [{ order: 1, title: "olumlamalar", lessons: [{ title: "pozitif iç konuşma", order: 1, xpReward: 20 }] }] },
    { order: 8, isPremium: true, title: "hayal gücü geliştirme", description: "Yaratıcılığı ve zihinsel canlandırmayı artırma.", imageUrl: placeholderUrls.chapterIcons.imagination, units: [{ order: 1, title: "yönlendirilmiş hayal kurma", lessons: [{ title: "yaratıcı canlandırma", order: 1, xpReward: 20 }] }] },
    { order: 9, isPremium: true, title: "empati ve anlayış", description: "Başkalarının duygularını anlama ve saygı gösterme.", imageUrl: placeholderUrls.chapterIcons.empathy, units: [{ order: 1, title: "aktif dinleme", lessons: [{ title: "empati kurma alıştırmaları", order: 1, xpReward: 25 }] }] },
    { order: 10, isPremium: true, title: "şükür ve minnettarlık", description: "Hayattaki iyi şeylere odaklanma ve teşekkür etme.", imageUrl: placeholderUrls.chapterIcons.gratitude, units: [{ order: 1, title: "şükür günlüğü", lessons: [{ title: "minnettarlık pratiği", order: 1, xpReward: 25 }] }] },
  ]
};

const defaultMoralLesson = { value: "self_awareness", title: "Kendini Tanıma", storyText: "Kendini tanımak, en büyük bilgeliktir.", displayTiming: "post_lesson" };
const defaultUnitColor = "bg-purple-500";

// ===========================================
// KAVRAM BANKASI
// ===========================================
function getConceptsForLesson(lessonTitle) {
    const db = { "doğru nefes alma": [{ c: "Diyafram Nefesi", d: "Karnı şişirerek alınan derin nefes" }, { c: "Sakinleşme", d: "Zihni ve bedeni rahatlatma durumu" }], "görme ve duyma farkındalığı": [{ c: "Farkındalık", d: "Anı yargılamadan gözlemleme" }, { c: "Odaklanma", d: "Dikkati tek bir noktaya toplama" }], "hafıza sarayı": [{ c: "Hafıza Sarayı", d: "Bilgileri zihinsel bir mekanda saklama tekniği" }, { c: "Canlandırma", d: "Zihinde bir şeyi görselleştirme" }], "odaklanma pratiği": [{ c: "Pomodoro", d: "Kısa çalışma ve mola periyotları" }, { c: "Dikkat", d: "Zihinsel enerjiyi bir şeye yöneltme" }], "duyguları tanıma": [{ c: "Mutluluk", d: "İyi hissetme hali" }, { c: "Üzüntü", d: "Kederli hissetme hali" }, { c: "Öfke", d: "Kızgınlık hissi" }], "gevşeme egzersizleri": [{ c: "Gevşeme", d: "Kas gerginliğini azaltma" }, { c: "Rahatlama", d: "Stresten arınma hali" }], "pozitif iç konuşma": [{ c: "Olumlama", d: "Pozitif ifadeleri tekrarlama" }, { c: "İyimserlik", d: "Olaylara olumlu bakma eğilimi" }], "yaratıcı canlandırma": [{ c: "Hayal Gücü", d: "Zihinde yeni fikirler yaratma yetisi" }, { c: "Yaratıcılık", d: "Özgün bir şeyler üretme becerisi" }], "empati kurma alıştırmaları": [{ c: "Empati", d: "Kendini başkasının yerine koyma" }, { c: "Anlayış", d: "Bir durumu veya kişiyi kavrama" }], "minnettarlık pratiği": [{ c: "Şükür", d: "Sahip olunanlara teşekkür etme" }, { c: "Minnettarlık", d: "Derin bir teşekkür ve takdir duygusu" }], default: [{ c: "Zihin", d: "Düşünme ve anlama yetisi" }] };
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

    exercises.push({ type: "select", instruction: "\"" + c1.c + "\" kavramının tanımı nedir?", sourceText: c1.c, correctAnswer: [c1.d], options: generateOptions(c1.d, concepts.map(c => c.d)) });
    exercises.push({ type: "select", instruction: "Aşağıdaki tanımlardan hangisi \"" + c2.c + "\" kavramına aittir?", sourceText: c2.c, correctAnswer: [c2.d], options: generateOptions(c2.d, concepts.map(c => c.d)) });
    exercises.push({ type: "listen", instruction: "Duyduğunuz kavramı seçin.", sourceText: c1.c, correctAnswer: [c1.c], options: generateOptions(c1.c, concepts.map(c => c.c)), audioUrl: placeholderUrls.audio });

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

console.log("✅ 'generate-mental-spiritual-program.js' script'i hazır.");
console.log("İçeriği inceleyip onayladıktan sonra, dosyanın en altındaki 'importData()' satırının yorumunu kaldırıp çalıştırabilirsiniz.");
importData();
