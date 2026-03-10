import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://tarfyazilim_db_user:rVJhMF2Xvm0eYXvb@tulu0.ztsglsx.mongodb.net/?appName=tulu0";

// ===========================================
// Model References
// ===========================================
const Language = mongoose.models.Language || mongoose.model('Language', new mongoose.Schema({}, { strict: false }));
const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', new mongoose.Schema({}, { strict: false }));
const Unit = mongoose.models.Unit || mongoose.model('Unit', new mongoose.Schema({}, { strict: false }));
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', new mongoose.Schema({}, { strict: false }));
const Exercise = mongoose.models.Exercise || mongoose.model('Exercise', new mongoose.Schema({}, { strict: false }));

// ===========================================
// Placeholder Asset URLs
// ===========================================
const placeholderUrls = {
    programIcon: "/images/lessons/math-4-7/program-icon.png",
    chapterIcons: {
        sayilar: "/images/lessons/math-4-7/unit1/chapter-icon.png",
        sekiller: "/images/lessons/math-4-7/unit2/chapter-icon.png",
        islemler: "/images/lessons/math-4-7/unit3/chapter-icon.png",
        zaman_mekan: "/images/lessons/math-4-7/unit4/chapter-icon.png",
        mantik: "/images/lessons/math-4-7/unit5/chapter-icon.png",
    },
    images: {
        // Unit 1
        rakam_1: "/images/lessons/math-4-7/unit1/number_1.png",
        rakam_2: "/images/lessons/math-4-7/unit1/number_2.png",
        elma: "/images/lessons/math-4-7/unit1/apples_3.png",
        armut: "/images/lessons/math-4-7/unit1/pears_2.png",
        // Unit 2
        kare: "/images/lessons/math-4-7/unit2/shape_square.png",
        ucgen: "/images/lessons/math-4-7/unit2/shape_triangle.png",
        daire: "/images/lessons/math-4-7/unit2/shape_circle.png",
    },
    audio: {
        // This will be handled by the user, but paths are structured for consistency.
        bir: "/sounds/lessons/math-4-7/unit1/number_1.mp3",
        iki: "/sounds/lessons/math-4-7/unit1/number_2.mp3",
        uc: "/sounds/lessons/math-4-7/unit1/number_3.mp3",
        say_bakalim: "/sounds/lessons/math-4-7/instructions/say_bakalim.mp3",
        bu_nedir: "/sounds/lessons/math-4-7/instructions/bu_nedir.mp3",
        placeholder: "/sounds/lessons/placeholder.mp3",
    },
    video: {
        sayilar_sarkisi: "/videos/lessons/math-4-7/unit1/numbers_song.mp4",
    }
};

// ===========================================
// MATH & LOGIC PROGRAM (4-7 AGE GROUP, TURKISH)
// ===========================================
const programData = {
  programData: {
    name: "matematik & mantık (4-7 yaş)",
    nativeName: "Matematik & Mantık",
    flag: "🧠",
    baseLanguage: "turkish",
    imageUrl: placeholderUrls.programIcon,
    locale: "tr",
    isActive: true,
    category: "math_logic",
    themeMetadata: {islamicContent: false, ageGroup: "kids_4-7", moralValues: ["patience"], educationalFocus: "Temel matematiksel ve mantıksal düşünme becerileri", difficultyLevel: "beginner" },
  },
  units: [
    // Ünite 1: Sayıları Tanıyalım
    {
      order: 1, isPremium: false, title: "Sayıları Tanıyalım", description: "1'den 10'a kadar rakamları ve saymayı öğrenelim.", imageUrl: placeholderUrls.chapterIcons.sayilar, 
      lessons: [
        { title: "Rakamlar (1-5)", order: 1, xpReward: 10, concepts: [{c: "bir", d: "1"}, {c: "iki", d: "2"}, {c: "üç", d: "3"}, {c: "dört", d: "4"}, {c: "beş", d: "5"}] },
        { title: "Rakamlar (6-10)", order: 2, xpReward: 10, concepts: [{c: "altı", d: "6"}, {c: "yedi", d: "7"}, {c: "sekiz", d: "8"}, {c: "dokuz", d: "9"}, {c: "on", d: "10"}] },
        { title: "Hadi Sayalım!", order: 3, xpReward: 15, concepts: [{c: "sayma", d: "nesneleri saymak"}, {c: "adet", d: "nesne sayısı"}] },
        { title: "Eşleştirelim", order: 4, xpReward: 15, concepts: [{c: "eşleştirme", d: "aynı olanları bulma"}, {c: "aynı", d: "birbirinin benzeri"}] },
        { title: "Sıraya Dizelim", order: 5, xpReward: 15, concepts: [{c: "sıralama", d: "küçükten büyüğe dizme"}, {c: "en küçük", d: "en az olan"}] },
      ] 
    },
    // Ünite 2: Şekiller Dünyası
    {
      order: 2, isPremium: false, title: "Şekiller Dünyası", description: "Temel geometrik şekilleri ve desenleri keşfedelim.", imageUrl: placeholderUrls.chapterIcons.sekiller, 
      lessons: [
        { title: "Kare ve Daire", order: 1, xpReward: 10, concepts: [{c: "kare", d: "dört kenarı eşit şekil"}, {c: "daire", d: "yuvarlak şekil"}] },
        { title: "Üçgen ve Dikdörtgen", order: 2, xpReward: 10, concepts: [{c: "üçgen", d: "üç kenarlı şekil"}, {c: "dikdörtgen", d: "karşılıklı kenarları eşit şekil"}] },
        { title: "Şekilleri Gruplayalım", order: 3, xpReward: 15, concepts: [{c: "gruplama", d: "benzerleri bir araya getirme"}, {c: "renk", d: "kırmızı, mavi, sarı"}] },
        { title: "Desenleri Tamamlayalım", order: 4, xpReward: 15, concepts: [{c: "desen", d: "tekrarlayan sıra"}, {c: "sıra", d: "diziliş"}] },
        { title: "Büyük ve Küçük", order: 5, xpReward: 15, concepts: [{c: "büyük", d: "daha fazla yer kaplayan"}, {c: "küçük", d: "daha az yer kaplayan"}] },
      ] 
    },
    // Ünite 3: Basit İşlemler
    {
      order: 3, isPremium: true, title: "Basit İşlemler", description: "Toplama ve çıkarma ile tanışalım.", imageUrl: placeholderUrls.chapterIcons.islemler, 
      lessons: [
        { title: "Toplama Yapalım (+1)", order: 1, xpReward: 20, concepts: [{c: "toplama", d: "ekleme, artırma"}, {c: "artı", d: "+ işareti"}] },
        { title: "Çıkarma Yapalım (-1)", order: 2, xpReward: 20, concepts: [{c: "çıkarma", d: "eksiltme, azaltma"}, {c: "eksi", d: "- işareti"}] },
        { title: "Nesnelerle Toplama", order: 3, xpReward: 25, concepts: [{c: "toplam", d: "hepsi bir arada"}, {c: "kaç tane", d: "sonucu bulma"}] },
        { title: "Nesnelerle Çıkarma", order: 4, xpReward: 25, concepts: [{c: "kalan", d: "geriye ne kaldı"}, {c: "fark", d: "aradaki sayı"}] },
        { title: "Problem Zamanı", order: 5, xpReward: 30, concepts: [{c: "problem", d: "çözülmesi gereken durum"}, {c: "çözüm", d: "doğru cevap"}] },
      ] 
    },
    // Ünite 4: Zaman ve Mekan
    {
      order: 4, isPremium: true, title: "Zaman ve Mekan", description: "Zaman ve yer kavramlarını öğrenelim.", imageUrl: placeholderUrls.chapterIcons.zaman_mekan, 
      lessons: [
        { title: "Sabah, Öğle, Akşam", order: 1, xpReward: 20, concepts: [{c: "sabah", d: "güneş doğunca"}, {c: "akşam", d: "güneş batınca"}] },
        { title: "Önce ve Sonra", order: 2, xpReward: 20, concepts: [{c: "önce", d: "daha erken olan"}, {c: "sonra", d: "daha geç olan"}] },
        { title: "İçinde ve Dışında", order: 3, xpReward: 25, concepts: [{c: "içinde", d: "bir şeyin iç kısmı"}, {c: "dışında", d: "bir şeyin dış kısmı"}] },
        { title: "Sağ ve Sol", order: 4, xpReward: 25, concepts: [{c: "sağ", d: "yazı yazdığımız el"}, {c: "sol", d: "diğer el"}] },
        { title: "Uzak ve Yakın", order: 5, xpReward: 25, concepts: [{c: "uzak", d: "gidilmesi zaman alan yer"}, {c: "yakın", d: "hemen ulaşılabilen yer"}] },
      ] 
    },
    // Ünite 5: Mantık Yürütme
    {
      order: 5, isPremium: true, title: "Mantık Yürütme", description: "Gözlem ve mantık becerilerimizi geliştirelim.", imageUrl: placeholderUrls.chapterIcons.mantik, 
      lessons: [
        { title: "Benzer Olanları Grupla", order: 1, xpReward: 20, concepts: [{c: "benzer", d: "ortak özelliği olan"}, {c: "kategori", d: "aynı türdekiler"}] },
        { title: "Farklı Olanı Bul", order: 2, xpReward: 20, concepts: [{c: "farklı", d: "diğerlerine benzemeyen"}, {c: "tek olan", d: "eşsiz"}] },
        { title: "Olayları Sırala", order: 3, xpReward: 25, concepts: [{c: "olay sırası", d: "hangisi önce oldu"}, {c: "mantıklı sıra", d: "doğru akış"}] },
        { title: "Parçadan Bütüne", order: 4, xpReward: 25, concepts: [{c: "parça", d: "bir bütünün kısmı"}, {c: "bütün", d: "tamamı"}] },
        { title: "Neden-Sonuç İlişkisi", order: 5, xpReward: 30, concepts: [{c: "neden", d: "bir olayın sebebi"}, {c: "sonuç", d: "olaydan sonra olan"}] },
      ] 
    },
  ]
};

// ===========================================
// Activity Generation Engine
// ===========================================
function generateActivitiesForLesson(lesson) {
    const activities = [];
    const concepts = lesson.concepts || [];
    if (concepts.length === 0) return [];

    const c1 = concepts[0];
    const c2 = concepts[1 % concepts.length];
    const c3 = concepts[2 % concepts.length];

    // 1. Education Activity: Image Intro
    activities.push({
        type: "education_image_intro",
        instruction: `Yeni kavramları öğrenelim: ${c1.c} ve ${c2.c}.`,
        educationContent: {
            title: `İşte ${lesson.title}!`,
            subtitle: "Hadi bu kelimeleri öğrenelim.",
            cards: [
                { imageUrl: placeholderUrls.images.rakam_1, text: c1.c, audioUrl: placeholderUrls.audio.bir },
                { imageUrl: placeholderUrls.images.rakam_2, text: c2.c, audioUrl: placeholderUrls.audio.iki },
                { imageUrl: placeholderUrls.images.elma, text: c3.c, audioUrl: placeholderUrls.audio.uc },
            ],
            showContinueButton: true,
        }
    });

    // 2. Education Activity: Visual Explanation
    activities.push({
        type: "education_visual",
        instruction: `${c1.c} kavramını görselle öğrenelim.`,
        educationContent: {
            title: `Bu bir "${c1.c}"`,
            imageUrl: placeholderUrls.images.rakam_1,
            description: `Bu resimde bir adet "${c1.c}" görüyorsun. Sayısı ${c1.d}'dir.`,
            narrationAudioUrl: placeholderUrls.audio.bir,
        }
    });

    // 3. Education Activity: Video
    activities.push({
        type: "education_video",
        instruction: "Sayılar şarkısını izleyelim ve birlikte söyleyelim!",
        educationContent: {
            title: "Sayılar Şarkısı",
            videoUrl: placeholderUrls.video.sayilar_sarkisi,
            coverImageUrl: placeholderUrls.images.rakam_1,
        }
    });

    // 4. Education Activity: Audio
    activities.push({
        type: "education_audio",
        instruction: "Duyduğun sesi dikkatlice dinle ve tekrar et.",
        educationContent: {
            title: "Dinle ve Tekrar Et",
            instructionText: `Şimdi "${c2.c}" sesini duyacaksın.`,
            audioUrl: placeholderUrls.audio.iki,
            contentText: c2.c,
        }
    });

    // 5. Education Activity: Tip
    activities.push({
        type: "education_tip",
        instruction: "İpucu zamanı!",
        educationContent: {
            tipType: "note",
            title: "Unutma!",
            content: `Sayıları sayarken her nesneyi sadece bir kere saymalıyız.`,
            sampleAudioUrl: placeholderUrls.audio.placeholder,
        }
    });

    // 6. Exercise: Select
    activities.push({
        type: "select",
        instruction: `Resimde kaç tane elma var?`,
        sourceText: "elma",
        correctAnswer: ["3"],
        options: ["1", "3", "5", "2"],
        neutralAnswerImage: placeholderUrls.images.elma,
    });

    // 7. Exercise: Arrange
    activities.push({
        type: "arrange",
        instruction: `Rakamları doğru sıraya diz.`,
        sourceText: "1 3 2",
        correctAnswer: ["1 2 3"],
        options: ["1", "2", "3"],
    });

    // 8. Exercise: Listen
    activities.push({
        type: "listen",
        instruction: `Duyduğun rakamı seç.`,
        sourceText: "iki",
        correctAnswer: ["2"],
        options: ["1", "2", "3", "4"],
        audioUrl: placeholderUrls.audio.iki,
    });

    // 9. Exercise: Speak
    activities.push({
        type: "speak",
        instruction: `Bu rakamı sesli olarak söyle: "${c1.d}"`,
        sourceText: c1.c,
        correctAnswer: [c1.c],
    });

    // 10. Exercise: Translate (adapted for math)
    activities.push({
        type: "translate",
        instruction: `"${c2.c}" kelimesinin rakam karşılığı nedir?`,
        sourceText: c2.c,
        correctAnswer: [c2.d],
        options: ["1", "2", "3", "4"],
    });
    
    // 11. Exercise: Select Image
    activities.push({
        type: "select",
        instruction: `Hangisi "kare"?`,
        sourceText: "kare",
        correctAnswer: [placeholderUrls.images.kare],
        // This is a simplified representation. The UI would need to handle image options.
        options: [placeholderUrls.images.kare, placeholderUrls.images.daire, placeholderUrls.images.ucgen],
    });

    return activities.map((act, i) => ({ ...act, order: i + 1 }));
}


// ===========================================
// Main Import Function
// ===========================================
async function importData() {
    let session = null;
    try {
        console.log(`🚀 Matematik & Mantık (4-7 Yaş) Programını Veritabanına Aktarma Başlıyor...`);
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB bağlantısı başarılı.");
        session = await mongoose.startSession();
        session.startTransaction();
        console.log("🔄 Transaction başlatıldı.");

        const stats = { units: 0, lessons: 0, activities: 0, xp: 0 };

        // Check if program exists
        let languageDoc = await Language.findOne({ name: programData.programData.name });
        if (languageDoc) {
            console.log(`⚠️ Program "${programData.programData.name}" zaten mevcut. İçerik güncellenecek.`);
        } else {
            languageDoc = new Language(programData.programData);
            await languageDoc.save({ session });
            console.log(`✅ Program oluşturuldu: ${languageDoc.name}\n`);
        }
        const languageId = languageDoc._id.toString();

        // Using Chapter as a proxy for Unit as per user's file structure
        const chapterName = "Matematik ve Mantık Programı (4-7 Yaş)";
        let chapterDoc = await Chapter.findOne({ title: chapterName, languageId: languageId });
        if (!chapterDoc) {
            chapterDoc = new Chapter({
                languageId, 
                isActive: true, 
                isExpanded: true, 
                contentType: "lesson", 
                title: chapterName,
                description: "4-7 yaş arası çocuklar için temel matematik ve mantık becerileri.",
                order: 1,
                isPremium: false,
                imageUrl: placeholderUrls.programIcon
            });
            await chapterDoc.save({ session });
            console.log(`📖 Ana Bölüm oluşturuldu: ${chapterDoc.title}`);
        }
        const chapterId = chapterDoc._id.toString();

        for (const unitData of programData.units) {
            // Delete existing units and lessons to prevent duplication
            const existingUnit = await Unit.findOne({ title: unitData.title, chapterId: chapterId });
            if (existingUnit) {
                await Lesson.deleteMany({ unitId: existingUnit._id }, { session });
                await Unit.deleteOne({ _id: existingUnit._id }, { session });
                console.log(`🧹 Mevcut ünite temizlendi: ${unitData.title}`);
            }

            const unitDoc = new Unit({
                languageId, 
                chapterId, 
                isActive: true, 
                isExpanded: false, 
                ...unitData, 
                lessons: undefined // lessons will be saved separately
            });
            await unitDoc.save({ session });
            stats.units++;
            console.log(`  📂 Ünite: ${unitDoc.title} ${unitDoc.isPremium ? '(Premium)' : ''}`);

            for (const lessonData of unitData.lessons) {
                const lessonDoc = new Lesson({
                    languageId, 
                    chapterId, 
                    unitId: unitDoc._id.toString(), 
                    isActive: true, 
                    isTest: false, 
                    imageUrl: unitDoc.imageUrl, 
                    ...lessonData,
                    isPremium: unitDoc.isPremium,
                    concepts: undefined // concepts are for generation only
                });
                await lessonDoc.save({ session });
                stats.lessons++;
                stats.xp += lessonData.xpReward;
                console.log(`    📝 Ders: ${lessonDoc.title} (${lessonDoc.xpReward} XP)`);

                const activities = generateActivitiesForLesson(lessonData);
                for (const activityData of activities) {
                    const newExercise = new Exercise({
                        languageId, 
                        chapterId, 
                        unitId: unitDoc._id.toString(), 
                        lessonId: lessonDoc._id.toString(), 
                        sourceLanguage: "turkish", 
                        targetLanguage: "turkish", 
                        isNewWord: false, 
                        isActive: true, 
                        neutralAnswerImage: placeholderUrls.programIcon,
                        badAnswerImage: placeholderUrls.programIcon,
                        correctAnswerImage: placeholderUrls.programIcon,
                        ...activityData 
                    });
                    await newExercise.save({ session });
                    stats.activities++;
                }
                console.log(`      ✅ ${activities.length} adet aktivite (eğitim + egzersiz) oluşturuldu.`);
            }
        }

        await session.commitTransaction();
        console.log("\n✅ Transaction başarıyla tamamlandı.\n");
        console.log("═══════════════════════════════════════════════════════");
        console.log("🎉 İŞLEM BAŞARILI! 🎉");
        console.log(`  Ünite: ${stats.units}, Ders: ${stats.lessons}, Aktivite: ${stats.activities}, Toplam XP: ${stats.xp}`);
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

console.log("✅ 'generate-math-logic-program-tr-4-7.js' betiği oluşturuldu.");
console.log("Çalıştırmak için 'importData()' fonksiyonu çağrılıyor.");
importData();
