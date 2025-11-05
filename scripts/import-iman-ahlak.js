import mongoose from 'mongoose';

// MongoDB Connection URI
const MONGODB_URI = "mongodb+srv://tarfyazilim_db_user:rVJhMF2Xvm0eYXvb@tulu0.ztsglsx.mongodb.net/?appName=tulu0";

// ============================================
// MODEL DEFINITIONS (matching api/models)
// ============================================

const LanguageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nativeName: { type: String, required: true, trim: true },
  flag: { type: String, required: true, trim: true },
  baseLanguage: { type: String, required: true, trim: true, lowercase: true },
  imageUrl: { type: String, default: "" },
  locale: { type: String, default: "tr" },
  isActive: { type: Boolean, default: true },
  category: {
    type: String,
    enum: ["faith_morality", "quran_arabic", "math_logic", "science_discovery", "language_learning", "mental_spiritual", "personal_social"],
    default: "faith_morality"
  },
  themeMetadata: {
    islamicContent: { type: Boolean, default: false },
    ageGroup: { type: String, enum: ["kids_4-7", "kids_8-12", "teens_13-17", "all"], default: "kids_8-12" },
    moralValues: { type: [String], default: [] },
    educationalFocus: { type: String, trim: true },
    difficultyLevel: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" }
  }
}, { timestamps: true });

const ChapterSchema = new mongoose.Schema({
  languageId: { type: String, required: true, ref: "Language" },
  title: { type: String, required: true, trim: true, lowercase: true },
  description: { type: String, required: true, lowercase: true, trim: true },
  isPremium: { type: Boolean, default: false },
  isExpanded: { type: Boolean, default: false },
  imageUrl: { type: String, default: "" },
  order: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  contentType: { type: String, enum: ["lesson", "story", "game", "meditation", "quiz", "activity"], default: "lesson" },
  moralLesson: {
    value: { type: String, enum: ["patience", "gratitude", "kindness", "honesty", "sharing", "mercy", "justice", "respect"], default: "kindness" },
    title: { type: String, trim: true },
    storyText: { type: String, trim: true },
    mediaUrl: { type: String, trim: true },
    displayTiming: { type: String, enum: ["pre_lesson", "mid_lesson", "post_lesson"], default: "post_lesson" }
  },
  miniGame: {
    type: { type: String, enum: ["match", "quiz", "puzzle", "story", "breathing"], default: "quiz" },
    config: { type: mongoose.Schema.Types.Mixed, default: {} }
  }
}, { timestamps: true });

const UnitSchema = new mongoose.Schema({
  chapterId: { type: String, required: true, ref: "Chapter", trim: true },
  languageId: { type: String, required: true, ref: "Language", trim: true },
  title: { type: String, required: true, trim: true, lowercase: true },
  description: { type: String, required: true, trim: true, lowercase: true },
  isPremium: { type: Boolean, default: false },
  isExpanded: { type: Boolean, default: false },
  imageUrl: { type: String, default: "" },
  order: { type: Number, default: 1 },
  color: { type: String, default: "bg-[#ff2dbd]" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const LessonSchema = new mongoose.Schema({
  unitId: { type: String, required: true, ref: "Unit", trim: true },
  chapterId: { type: String, required: true, ref: "Chapter", trim: true },
  languageId: { type: String, required: true, ref: "Language", trim: true },
  title: { type: String, required: true, trim: true, lowercase: true },
  description: { type: String, required: true, trim: true, lowercase: true },
  isPremium: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  xpReward: { type: Number, default: 10, min: 1 },
  imageUrl: { type: String, default: "" },
  order: { type: Number, default: 1 },
  isTest: { type: Boolean, default: false }
}, { timestamps: true });

const ExerciseSchema = new mongoose.Schema({
  lessonId: { type: String, required: true, ref: "Lesson" },
  unitId: { type: String, required: true, ref: "Unit" },
  chapterId: { type: String, required: true, ref: "Chapter" },
  languageId: { type: String, required: true, ref: "Language" },
  type: { type: String, enum: ["translate", "select", "arrange", "match", "listen", "speak"], required: true, trim: true },
  instruction: { type: String, required: true, trim: true, lowercase: true },
  sourceText: { type: String, required: true, trim: true, lowercase: true },
  sourceLanguage: { type: String, required: true, trim: true, lowercase: true },
  targetLanguage: { type: String, required: true, trim: true, lowercase: true },
  correctAnswer: { type: [String], required: true },
  options: { type: [String], default: [] },
  isNewWord: { type: Boolean, default: false },
  audioUrl: { type: String, trim: true, default: "" },
  neutralAnswerImage: { type: String, default: "https://cdn-icons-png.flaticon.com/128/14853/14853363.png" },
  badAnswerImage: { type: String, default: "https://cdn-icons-png.flaticon.com/128/2461/2461878.png" },
  correctAnswerImage: { type: String, default: "https://cdn-icons-png.flaticon.com/128/10851/10851297.png" },
  order: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Models
const Language = mongoose.models.Language || mongoose.model('Language', LanguageSchema);
const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema);
const Unit = mongoose.models.Unit || mongoose.model('Unit', UnitSchema);
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
const Exercise = mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema);

// ============================================
// İMAN & AHLAK PROGRAM DATA (10 BÖLÜM)
// ============================================

const imanAhlakData = {
  programData: {
    name: "iman & ahlak",
    nativeName: "iman ve ahlak eğitimi",
    flag: "🕋",
    baseLanguage: "turkish",
    locale: "tr",
    category: "faith_morality",
    themeMetadata: {
      islamicContent: true,
      ageGroup: "kids_8-12",
      moralValues: ["patience", "gratitude", "kindness", "honesty", "sharing", "mercy", "justice", "respect"],
      educationalFocus: "islami değerler ve ahlak eğitimi",
      difficultyLevel: "beginner"
    }
  },

  chapters: [
    // ============================================
    // BÖLÜM 1: ALLAH'I TANIMAK (12 ders, 156 egzersiz)
    // ============================================
    {
      title: "allah'ı tanımak",
      description: "allah'ın varlığını ve güzel isimlerini öğreniyoruz",
      order: 1,
      isPremium: false,
      moralLesson: {
        value: "honesty",
        title: "dürüstlük",
        storyText: "allah her şeyi bilir, o'na karşı hep dürüst olmalıyız",
        displayTiming: "post_lesson"
      },
      units: [
        {
          title: "allah birdir",
          description: "tevhid inancı",
          order: 1,
          color: "bg-[#10b981]",
          isPremium: false,
          lessons: [
            { title: "tevhid nedir?", description: "allah'ın birliğini öğreniyoruz", order: 1, xpReward: 10 },
            { title: "allah'ın varlığı", description: "her şeyi yaratan allah", order: 2, xpReward: 10 },
            { title: "allah tektir", description: "allah'ın benzeri yoktur", order: 3, xpReward: 10 },
            { title: "allah'a ortak koşmamak", description: "şirk nedir öğreniyoruz", order: 4, xpReward: 10 }
          ]
        },
        {
          title: "allah'ın güzel isimleri",
          description: "esma-ül hüsna",
          order: 2,
          color: "bg-[#059669]",
          isPremium: false,
          lessons: [
            { title: "er-rahman (çok merhametli)", description: "allah'ın merhameti sonsuz", order: 1, xpReward: 10 },
            { title: "er-rahim (merhamet edici)", description: "allah bizi çok sever", order: 2, xpReward: 10 },
            { title: "el-kerim (cömert)", description: "allah sınırsız cömerttir", order: 3, xpReward: 10 },
            { title: "el-afüv (affedici)", description: "allah günahları affeder", order: 4, xpReward: 10 }
          ]
        },
        {
          title: "allah her şeyi görür ve bilir",
          description: "allah'ın sıfatları",
          order: 3,
          color: "bg-[#047857]",
          isPremium: false,
          lessons: [
            { title: "allah her yerdedir", description: "allah'tan hiçbir şey gizlenemez", order: 1, xpReward: 10 },
            { title: "allah her şeyi bilir", description: "allah alimdir", order: 2, xpReward: 10 },
            { title: "allah her şeyi görür", description: "allah basirdir", order: 3, xpReward: 10 },
            { title: "allah her şeyi duyar", description: "allah semidir", order: 4, xpReward: 10 }
          ]
        }
      ]
    },

    // ============================================
    // BÖLÜM 2: PEYGAMBERLER (13 ders, 169 egzersiz)
    // ============================================
    {
      title: "peygamberler",
      description: "allah'ın elçilerini tanıyoruz",
      order: 2,
      isPremium: false,
      moralLesson: {
        value: "respect",
        title: "saygı",
        storyText: "peygamberlere saygı göstermek imanın gereğidir",
        displayTiming: "post_lesson"
      },
      units: [
        {
          title: "peygamberlik",
          description: "peygamberler kimlerdir",
          order: 1,
          color: "bg-[#3b82f6]",
          isPremium: false,
          lessons: [
            { title: "peygamber nedir?", description: "allah'ın elçileri", order: 1, xpReward: 10 },
            { title: "ilk peygamber hz. adem", description: "insanlığın babası", order: 2, xpReward: 10 },
            { title: "peygamberlerin görevleri", description: "allah'ın mesajını iletmek", order: 3, xpReward: 10 },
            { title: "peygamberlere iman", description: "tüm peygamberlere inanırız", order: 4, xpReward: 10 }
          ]
        },
        {
          title: "hz. muhammed",
          description: "son peygamber",
          order: 2,
          color: "bg-[#2563eb]",
          isPremium: false,
          lessons: [
            { title: "hz. muhammed'in doğumu", description: "mekke'de dünyaya geldi", order: 1, xpReward: 10 },
            { title: "hz. muhammed'in çocukluğu", description: "emin ve sadık lakabı", order: 2, xpReward: 10 },
            { title: "ilk vahiy", description: "hira mağarasında", order: 3, xpReward: 10 },
            { title: "hz. muhammed'in ahlakı", description: "en güzel örnek", order: 4, xpReward: 10 },
            { title: "hz. muhammed'i sevmek", description: "onun yolunda yürümek", order: 5, xpReward: 10 }
          ]
        },
        {
          title: "diğer peygamberler",
          description: "büyük peygamberler",
          order: 3,
          color: "bg-[#1d4ed8]",
          isPremium: false,
          lessons: [
            { title: "hz. nuh ve gemi", description: "büyük tufan", order: 1, xpReward: 10 },
            { title: "hz. ibrahim ve tevhid", description: "ateşe atılan peygamber", order: 2, xpReward: 10 },
            { title: "hz. musa ve firavun", description: "denizi ikiye bölen mucize", order: 3, xpReward: 10 },
            { title: "hz. isa'nın mucizeleri", description: "allah'ın izniyle mucizeler", order: 4, xpReward: 10 }
          ]
        }
      ]
    },

    // ============================================
    // BÖLÜM 3: MELEKLER VE KİTAPLAR (12 ders, 156 egzersiz)
    // ============================================
    {
      title: "melekler ve kitaplar",
      description: "görünmeyen varlıklar ve ilahi kitaplar",
      order: 3,
      isPremium: false,
      moralLesson: {
        value: "respect",
        title: "saygı",
        storyText: "meleklere ve kutsal kitaplara saygı gösteririz",
        displayTiming: "post_lesson"
      },
      units: [
        {
          title: "meleklere iman",
          description: "nurdan yaratılan varlıklar",
          order: 1,
          color: "bg-[#8b5cf6]",
          isPremium: false,
          lessons: [
            { title: "melekler kimlerdir?", description: "allah'ın nurdan yarattığı varlıklar", order: 1, xpReward: 12 },
            { title: "cebrail (as)", description: "vahiy meleği", order: 2, xpReward: 12 },
            { title: "mikail (as)", description: "rızık meleği", order: 3, xpReward: 12 },
            { title: "azrail (as) ve israfil (as)", description: "can alan ve sur üfleyen melekler", order: 4, xpReward: 12 }
          ]
        },
        {
          title: "ilahi kitaplar",
          description: "allah'ın gönderdiği kitaplar",
          order: 2,
          color: "bg-[#7c3aed]",
          isPremium: false,
          lessons: [
            { title: "ilahi kitaplar nelerdir?", description: "allah'ın gönderdiği dört kitap", order: 1, xpReward: 12 },
            { title: "tevrat", description: "hz. musa'ya gönderilen kitap", order: 2, xpReward: 12 },
            { title: "zebur", description: "hz. davud'a gönderilen kitap", order: 3, xpReward: 12 },
            { title: "incil", description: "hz. isa'ya gönderilen kitap", order: 4, xpReward: 12 }
          ]
        },
        {
          title: "kur'an-ı kerim",
          description: "son ilahi kitap",
          order: 3,
          color: "bg-[#6d28d9]",
          isPremium: false,
          lessons: [
            { title: "kur'an nedir?", description: "allah'ın son kitabı", order: 1, xpReward: 12 },
            { title: "kur'an'ın özellikleri", description: "hiç değişmemiş kutsal kitap", order: 2, xpReward: 12 },
            { title: "kur'an okumak", description: "kur'an okumak sevaptır", order: 3, xpReward: 12 },
            { title: "kur'an'a saygı", description: "kur'an'a nasıl davranılır", order: 4, xpReward: 12 }
          ]
        }
      ]
    },

    // ============================================
    // BÖLÜM 4: AHİRET İNANCI (12 ders, 156 egzersiz)
    // ============================================
    {
      title: "ahiret inancı",
      description: "ölüm sonrası hayat",
      order: 4,
      isPremium: false,
      moralLesson: {
        value: "respect",
        title: "sorumluluk",
        storyText: "ahirete iman sorumluluklarımızı hatırlatır",
        displayTiming: "post_lesson"
      },
      units: [
        {
          title: "ölüm ve kabir",
          description: "dünya hayatının sonu",
          order: 1,
          color: "bg-[#f59e0b]",
          isPremium: false,
          lessons: [
            { title: "ölüm nedir?", description: "herkes ölümü tadacak", order: 1, xpReward: 12 },
            { title: "kabir hayatı", description: "berzah alemi", order: 2, xpReward: 12 },
            { title: "kabir sorgusu", description: "münker ve nekir melekleri", order: 3, xpReward: 12 },
            { title: "ölüme hazırlık", description: "iyi işler yapmak", order: 4, xpReward: 12 }
          ]
        },
        {
          title: "kıyamet",
          description: "dünyanın sonu",
          order: 2,
          color: "bg-[#d97706]",
          isPremium: false,
          lessons: [
            { title: "kıyamet günü", description: "büyük gün", order: 1, xpReward: 12 },
            { title: "sura üfürülmesi", description: "israfil (as) sura üfler", order: 2, xpReward: 12 },
            { title: "diriliş", description: "herkes yeniden diriltilecek", order: 3, xpReward: 12 },
            { title: "mahşer", description: "herkes toplanacak", order: 4, xpReward: 12 }
          ]
        },
        {
          title: "cennet ve cehennem",
          description: "sonsuz hayat yerleri",
          order: 3,
          color: "bg-[#c2410c]",
          isPremium: false,
          lessons: [
            { title: "hesap günü", description: "amellerin tartılması", order: 1, xpReward: 12 },
            { title: "cennet nimetleri", description: "iyi insanların yeri", order: 2, xpReward: 12 },
            { title: "cehennem azabı", description: "kötü insanların yeri", order: 3, xpReward: 12 },
            { title: "cennete giden yol", description: "iyi insan olmak", order: 4, xpReward: 12 }
          ]
        }
      ]
    },

    // ============================================
    // BÖLÜM 5: NAMAZ İBADETİ (13 ders, 169 egzersiz)
    // ============================================
    {
      title: "namaz ibadeti",
      description: "en önemli ibadet",
      order: 5,
      isPremium: false,
      moralLesson: {
        value: "respect",
        title: "disiplin",
        storyText: "namaz bize disiplin ve sorumluluk öğretir",
        displayTiming: "post_lesson"
      },
      units: [
        {
          title: "abdest",
          description: "namazın şartı temizlik",
          order: 1,
          color: "bg-[#06b6d4]",
          isPremium: false,
          lessons: [
            { title: "abdest nedir?", description: "bedensel temizlik", order: 1, xpReward: 12 },
            { title: "abdest nasıl alınır?", description: "abdest adımları", order: 2, xpReward: 12 },
            { title: "abdest duası", description: "bismillah ile başlamak", order: 3, xpReward: 12 },
            { title: "abdestin bozulması", description: "abdest ne zaman bozulur", order: 4, xpReward: 12 }
          ]
        },
        {
          title: "namaz öğreniyorum",
          description: "namaz nasıl kılınır",
          order: 2,
          color: "bg-[#0891b2]",
          isPremium: false,
          lessons: [
            { title: "namaz nedir?", description: "allah'a ibadet", order: 1, xpReward: 12 },
            { title: "5 vakit namaz", description: "sabah, öğle, ikindi, akşam, yatsı", order: 2, xpReward: 12 },
            { title: "namaz kılmak", description: "namaz adımları", order: 3, xpReward: 12 },
            { title: "namaz rak'atleri", description: "her vaktin rak'at sayısı", order: 4, xpReward: 12 },
            { title: "camide namaz", description: "cemaatle namaz", order: 5, xpReward: 12 }
          ]
        },
        {
          title: "namaz duaları",
          description: "namazda okunanlar",
          order: 3,
          color: "bg-[#0e7490]",
          isPremium: false,
          lessons: [
            { title: "fatiha suresi", description: "namazın temel suresi", order: 1, xpReward: 12 },
            { title: "ihlas suresi", description: "tevhid suresi", order: 2, xpReward: 12 },
            { title: "teşehhüd duası", description: "oturuşta okunan dua", order: 3, xpReward: 12 },
            { title: "salli barik duaları", description: "son oturuşta okunanlar", order: 4, xpReward: 12 }
          ]
        }
      ]
    },

    // ============================================
    // BÖLÜM 6: ORUÇ VE ZEKAT (12 ders, 156 egzersiz) - PREMIUM
    // ============================================
    {
      title: "oruç ve zekat",
      description: "mali ve bedeni ibadetler",
      order: 6,
      isPremium: true,
      moralLesson: {
        value: "sharing",
        title: "paylaşım",
        storyText: "zekat vermek paylaşmayı öğretir",
        displayTiming: "post_lesson"
      },
      units: [
        {
          title: "oruç ibadeti",
          description: "ramazan orucunu öğreniyoruz",
          order: 1,
          color: "bg-[#ec4899]",
          isPremium: true,
          lessons: [
            { title: "oruç nedir?", description: "yemeden içmeden kalmak", order: 1, xpReward: 15 },
            { title: "ramazan ayı", description: "mübarek ay", order: 2, xpReward: 15 },
            { title: "sahur ve iftar", description: "oruç açmak ve tutmak", order: 3, xpReward: 15 },
            { title: "orucun faydaları", description: "sabır ve şükür öğrenmek", order: 4, xpReward: 15 }
          ]
        },
        {
          title: "zekat ibadeti",
          description: "fakirlere yardım",
          order: 2,
          color: "bg-[#db2777]",
          isPremium: true,
          lessons: [
            { title: "zekat nedir?", description: "maldan allah için vermek", order: 1, xpReward: 15 },
            { title: "zekat kime verilir?", description: "muhtaç insanlara", order: 2, xpReward: 15 },
            { title: "sadaka", description: "gönüllü yardım", order: 3, xpReward: 15 },
            { title: "yardımlaşmanın önemi", description: "paylaşmak güzeldir", order: 4, xpReward: 15 }
          ]
        },
        {
          title: "hac ibadeti",
          description: "kabe ziyareti",
          order: 3,
          color: "bg-[#be185d]",
          isPremium: true,
          lessons: [
            { title: "hac nedir?", description: "kabe'yi ziyaret", order: 1, xpReward: 15 },
            { title: "kabe", description: "allah'ın evi", order: 2, xpReward: 15 },
            { title: "umre", description: "küçük hac", order: 3, xpReward: 15 },
            { title: "hac ibadeti adımları", description: "tavaf ve sa'y", order: 4, xpReward: 15 }
          ]
        }
      ]
    },

    // ============================================
    // BÖLÜM 7: SABIR VE ŞÜKÜR (13 ders, 169 egzersiz) - PREMIUM
    // ============================================
    {
      title: "sabır ve şükür",
      description: "ahlaki değerler",
      order: 7,
      isPremium: true,
      moralLesson: {
        value: "patience",
        title: "sabır",
        storyText: "sabırlı olmak müslümanın özelliğidir",
        displayTiming: "post_lesson"
      },
      units: [
        {
          title: "sabırlı olmak",
          description: "zorlukları güzellikle karşılamak",
          order: 1,
          color: "bg-[#14b8a6]",
          isPremium: true,
          lessons: [
            { title: "sabır nedir?", description: "zorluklara dayanmak", order: 1, xpReward: 15 },
            { title: "sabırlı peygamberler", description: "hz. eyyub'un sabrı", order: 2, xpReward: 15 },
            { title: "sabırın mükafatı", description: "allah sabırlıları sever", order: 3, xpReward: 15 },
            { title: "günlük hayatta sabır", description: "sabırlı olmayı öğrenmek", order: 4, xpReward: 15 },
            { title: "öfkeyi kontrol etmek", description: "sabrın bir parçası", order: 5, xpReward: 15 }
          ]
        },
        {
          title: "şükreden müslüman",
          description: "nimetlere şükretmek",
          order: 2,
          color: "bg-[#0d9488]",
          isPremium: true,
          lessons: [
            { title: "şükür nedir?", description: "nimetlere teşekkür etmek", order: 1, xpReward: 15 },
            { title: "allah'ın nimetleri", description: "sayısız nimetler", order: 2, xpReward: 15 },
            { title: "şükretmenin yolları", description: "dil, kalp ve amelle şükür", order: 3, xpReward: 15 },
            { title: "elhamdülillah demek", description: "her durumda şükretmek", order: 4, xpReward: 15 }
          ]
        },
        {
          title: "hikayelerle öğreniyorum",
          description: "sabır ve şükür hikayeleri",
          order: 3,
          color: "bg-[#0f766e]",
          isPremium: true,
          lessons: [
            { title: "hz. eyyub'un sabrı", description: "hastalığa sabır", order: 1, xpReward: 15 },
            { title: "fakir adamın şükrü", description: "azla kanaat", order: 2, xpReward: 15 },
            { title: "hz. ömer'in adaleti", description: "sabır ve hikmet", order: 3, xpReward: 15 },
            { title: "karınca ve süleyman (as)", description: "küçük varlıklar da şükreder", order: 4, xpReward: 15 }
          ]
        }
      ]
    },

    // ============================================
    // BÖLÜM 8: DOĞRULUK VE GÜVEN (12 ders, 156 egzersiz) - PREMIUM
    // ============================================
    {
      title: "doğruluk ve güven",
      description: "dürüst ve güvenilir olmak",
      order: 8,
      isPremium: true,
      moralLesson: {
        value: "honesty",
        title: "dürüstlük",
        storyText: "doğru sözlü olmak müslümanın şiarıdır",
        displayTiming: "post_lesson"
      },
      units: [
        {
          title: "doğru sözlü olmak",
          description: "her zaman doğruyu söylemek",
          order: 1,
          color: "bg-[#f97316]",
          isPremium: true,
          lessons: [
            { title: "doğruluk nedir?", description: "hep doğru konuşmak", order: 1, xpReward: 15 },
            { title: "yalan söylemenin zararları", description: "yalan kötü bir hastalıktır", order: 2, xpReward: 15 },
            { title: "hz. muhammed'in dürüstlüğü", description: "emin ve sadık", order: 3, xpReward: 15 },
            { title: "şaka da bile yalan yok", description: "her zaman dürüst olmak", order: 4, xpReward: 15 }
          ]
        },
        {
          title: "güvenilir olmak",
          description: "emanete sahip çıkmak",
          order: 2,
          color: "bg-[#ea580c]",
          isPremium: true,
          lessons: [
            { title: "güven nedir?", description: "insanların bize inanması", order: 1, xpReward: 15 },
            { title: "emanet nedir?", description: "başkasının malına sahip çıkmak", order: 2, xpReward: 15 },
            { title: "sır saklamak", description: "arkadaşın sırrını korumak", order: 3, xpReward: 15 },
            { title: "söz vermek", description: "verdiğin sözde durmak", order: 4, xpReward: 15 }
          ]
        },
        {
          title: "toplumda güven",
          description: "birbirimize güvenmek",
          order: 3,
          color: "bg-[#c2410c]",
          isPremium: true,
          lessons: [
            { title: "komşuluk hakları", description: "komşuya güvenilir olmak", order: 1, xpReward: 15 },
            { title: "ticaret ahlakı", description: "alış verişte dürüstlük", order: 2, xpReward: 15 },
            { title: "okul ve arkadaşlık", description: "arkadaşlarına güvenilir ol", order: 3, xpReward: 15 },
            { title: "aile içinde güven", description: "ailene karşı sorumlu ol", order: 4, xpReward: 15 }
          ]
        }
      ]
    },

    // ============================================
    // BÖLÜM 9: MERHAMET VE ADALET (13 ders, 169 egzersiz) - PREMIUM
    // ============================================
    {
      title: "merhamet ve adalet",
      description: "şefkatli ve adaletli olmak",
      order: 9,
      isPremium: true,
      moralLesson: {
        value: "mercy",
        title: "merhamet",
        storyText: "merhamet etmeyen merhamet görmez",
        displayTiming: "post_lesson"
      },
      units: [
        {
          title: "merhamet",
          description: "tüm canlılara şefkat",
          order: 1,
          color: "bg-[#a855f7]",
          isPremium: true,
          lessons: [
            { title: "merhamet nedir?", description: "şefkatli olmak", order: 1, xpReward: 20 },
            { title: "hz. muhammed'in merhameti", description: "âlemlere rahmet", order: 2, xpReward: 20 },
            { title: "hayvanlara merhamet", description: "tüm canlıları korumak", order: 3, xpReward: 20 },
            { title: "yaşlılara saygı", description: "büyüklere hürmet", order: 4, xpReward: 20 },
            { title: "küçüklere şefkat", description: "çocuklara sevgiyle yaklaşmak", order: 5, xpReward: 20 }
          ]
        },
        {
          title: "adalet",
          description: "herkese hakkını vermek",
          order: 2,
          color: "bg-[#9333ea]",
          isPremium: true,
          lessons: [
            { title: "adalet nedir?", description: "hak ve hukuk", order: 1, xpReward: 20 },
            { title: "hz. ömer'in adaleti", description: "adaletin timsali", order: 2, xpReward: 20 },
            { title: "haksızlığa karşı durmak", description: "zulme ses çıkarmak", order: 3, xpReward: 20 },
            { title: "eşitlik", description: "herkes eşittir", order: 4, xpReward: 20 }
          ]
        },
        {
          title: "merhamet ve adalet dengesi",
          description: "iki önemli değer",
          order: 3,
          color: "bg-[#7e22ce]",
          isPremium: true,
          lessons: [
            { title: "affetmek ve hak vermek", description: "merhamet ve adalet birlikte", order: 1, xpReward: 20 },
            { title: "anne babaya iyilik", description: "en büyük hak", order: 2, xpReward: 20 },
            { title: "arkadaşlıkta denge", description: "hem merhametli hem adaletli", order: 3, xpReward: 20 },
            { title: "örnek müslüman", description: "merhamet ve adaletle yaşamak", order: 4, xpReward: 20 }
          ]
        }
      ]
    },

    // ============================================
    // BÖLÜM 10: HAYATA TAŞIYORUM (12 ders, 156 egzersiz) - PREMIUM
    // ============================================
    {
      title: "hayata taşıyorum",
      description: "öğrendiklerimizi yaşamak",
      order: 10,
      isPremium: true,
      moralLesson: {
        value: "respect",
        title: "uygulama",
        storyText: "bildiğimizi yaşamaya çalışırız",
        displayTiming: "post_lesson"
      },
      units: [
        {
          title: "ailede islam ahlakı",
          description: "evde güzel davranışlar",
          order: 1,
          color: "bg-[#22c55e]",
          isPremium: true,
          lessons: [
            { title: "anne babaya saygı", description: "onların kalbini hoş tutmak", order: 1, xpReward: 20 },
            { title: "kardeşlerle iyi geçinmek", description: "sevgi ve paylaşım", order: 2, xpReward: 20 },
            { title: "ev işlerine yardım", description: "sorumluluk almak", order: 3, xpReward: 20 },
            { title: "aile içinde dua", description: "birlikte ibadet", order: 4, xpReward: 20 }
          ]
        },
        {
          title: "okulda islam ahlakı",
          description: "okulda güzel davranışlar",
          order: 2,
          color: "bg-[#16a34a]",
          isPremium: true,
          lessons: [
            { title: "öğretmene saygı", description: "ilim öğrenmek", order: 1, xpReward: 20 },
            { title: "arkadaşlara yardım", description: "dayanışma", order: 2, xpReward: 20 },
            { title: "dürüst öğrenci", description: "kopya çekmemek", order: 3, xpReward: 20 },
            { title: "okulu temiz tutmak", description: "çevreye saygı", order: 4, xpReward: 20 }
          ]
        },
        {
          title: "toplumda iyi insan olmak",
          description: "her yerde güzel ahlak",
          order: 3,
          color: "bg-[#15803d]",
          isPremium: true,
          lessons: [
            { title: "komşuluk hakkı", description: "komşularla iyi geçinmek", order: 1, xpReward: 20 },
            { title: "toplumda yardımlaşma", description: "birbirimize destek olmak", order: 2, xpReward: 20 },
            { title: "çevreyi korumak", description: "doğaya saygı", order: 3, xpReward: 20 },
            { title: "güzel insan olmak", description: "her yerde iyi örnek", order: 4, xpReward: 20 }
          ]
        }
      ]
    }
  ]
};

// ============================================
// HELPER FUNCTIONS - EXERCISE GENERATORS
// ============================================

function generateExercisesForLesson(lessonTitle, lessonOrder, chapterIndex, unitIndex) {
  const exercises = [];
  let order = 1;

  // Bölüm 1-2: 6 translate + 4 select + 2 match + 1 listen = 13
  // Bölüm 3-5: 4 translate + 4 select + 3 arrange + 2 match = 13
  // Bölüm 6-8: 3 translate + 3 select + 4 arrange + 2 match + 1 speak = 13
  // Bölüm 9-10: 2 translate + 2 select + 5 arrange + 3 match + 1 speak = 13

  const chapterNum = chapterIndex + 1;

  // Get word pairs for this lesson
  const words = getWordPairsForLesson(lessonTitle, chapterNum, lessonOrder);

  if (chapterNum <= 2) {
    // BÖLÜM 1-2: Beginner
    // 6 translate
    for (let i = 0; i < 6; i++) {
      exercises.push({
        type: "translate",
        instruction: i % 2 === 0 ? "türkçe'den arapça'ya çevir" : "arapça'dan türkçe'ye çevir",
        sourceText: i % 2 === 0 ? words[i % words.length].turkish : words[i % words.length].arabic,
        sourceLanguage: i % 2 === 0 ? "turkish" : "arabic",
        targetLanguage: i % 2 === 0 ? "arabic" : "turkish",
        correctAnswer: [i % 2 === 0 ? words[i % words.length].arabic : words[i % words.length].turkish],
        options: generateOptions(i % 2 === 0 ? words[i % words.length].arabic : words[i % words.length].turkish, "word"),
        order: order++,
        isNewWord: i === 0,
        audioUrl: ""
      });
    }

    // 4 select
    for (let i = 0; i < 4; i++) {
      exercises.push({
        type: "select",
        instruction: `${words[i % words.length].turkish} ne anlama gelir?`,
        sourceText: words[i % words.length].turkish,
        sourceLanguage: "turkish",
        targetLanguage: "turkish",
        correctAnswer: [words[i % words.length].meaning],
        options: generateOptions(words[i % words.length].meaning, "meaning"),
        order: order++,
        isNewWord: false,
        audioUrl: ""
      });
    }

    // 2 match
    for (let i = 0; i < 2; i++) {
      const word1 = words[i * 2 % words.length];
      const word2 = words[(i * 2 + 1) % words.length];
      exercises.push({
        type: "match",
        instruction: "kelimeleri eşleştir",
        sourceText: `${word1.turkish}:${word1.meaning}, ${word2.turkish}:${word2.meaning}`,
        sourceLanguage: "turkish",
        targetLanguage: "turkish",
        correctAnswer: [`${word1.turkish}:${word1.meaning}`, `${word2.turkish}:${word2.meaning}`],
        options: [word1.turkish, word1.meaning, word2.turkish, word2.meaning],
        order: order++,
        isNewWord: false,
        audioUrl: ""
      });
    }

    // 1 listen
    exercises.push({
      type: "listen",
      instruction: "dinle ve yaz",
      sourceText: words[0].arabic,
      sourceLanguage: "arabic",
      targetLanguage: "turkish",
      correctAnswer: [words[0].turkish],
      options: [],
      order: order++,
      isNewWord: false,
      audioUrl: ""
    });

  } else if (chapterNum <= 5) {
    // BÖLÜM 3-5: Intermediate
    // 4 translate
    for (let i = 0; i < 4; i++) {
      exercises.push({
        type: "translate",
        instruction: i % 2 === 0 ? "türkçe'den arapça'ya çevir" : "arapça'dan türkçe'ye çevir",
        sourceText: i % 2 === 0 ? words[i % words.length].turkish : words[i % words.length].arabic,
        sourceLanguage: i % 2 === 0 ? "turkish" : "arabic",
        targetLanguage: i % 2 === 0 ? "arabic" : "turkish",
        correctAnswer: [i % 2 === 0 ? words[i % words.length].arabic : words[i % words.length].turkish],
        options: generateOptions(i % 2 === 0 ? words[i % words.length].arabic : words[i % words.length].turkish, "word"),
        order: order++,
        isNewWord: i === 0,
        audioUrl: ""
      });
    }

    // 4 select
    for (let i = 0; i < 4; i++) {
      exercises.push({
        type: "select",
        instruction: `${words[i % words.length].turkish} ne anlama gelir?`,
        sourceText: words[i % words.length].turkish,
        sourceLanguage: "turkish",
        targetLanguage: "turkish",
        correctAnswer: [words[i % words.length].meaning],
        options: generateOptions(words[i % words.length].meaning, "meaning"),
        order: order++,
        isNewWord: false,
        audioUrl: ""
      });
    }

    // 3 arrange
    for (let i = 0; i < 3; i++) {
      const sentence = words[i % words.length].sentence;
      const wordsArray = sentence.split(' ');
      exercises.push({
        type: "arrange",
        instruction: "kelimeleri doğru sıraya koy",
        sourceText: sentence,
        sourceLanguage: "turkish",
        targetLanguage: "turkish",
        correctAnswer: wordsArray,
        options: shuffleArray([...wordsArray]),
        order: order++,
        isNewWord: false,
        audioUrl: ""
      });
    }

    // 2 match
    for (let i = 0; i < 2; i++) {
      const word1 = words[i * 2 % words.length];
      const word2 = words[(i * 2 + 1) % words.length];
      exercises.push({
        type: "match",
        instruction: "kelimeleri eşleştir",
        sourceText: `${word1.turkish}:${word1.meaning}, ${word2.turkish}:${word2.meaning}`,
        sourceLanguage: "turkish",
        targetLanguage: "turkish",
        correctAnswer: [`${word1.turkish}:${word1.meaning}`, `${word2.turkish}:${word2.meaning}`],
        options: [word1.turkish, word1.meaning, word2.turkish, word2.meaning],
        order: order++,
        isNewWord: false,
        audioUrl: ""
      });
    }

  } else if (chapterNum <= 8) {
    // BÖLÜM 6-8: Advanced
    // 3 translate
    for (let i = 0; i < 3; i++) {
      exercises.push({
        type: "translate",
        instruction: i % 2 === 0 ? "türkçe'den arapça'ya çevir" : "arapça'dan türkçe'ye çevir",
        sourceText: i % 2 === 0 ? words[i % words.length].turkish : words[i % words.length].arabic,
        sourceLanguage: i % 2 === 0 ? "turkish" : "arabic",
        targetLanguage: i % 2 === 0 ? "arabic" : "turkish",
        correctAnswer: [i % 2 === 0 ? words[i % words.length].arabic : words[i % words.length].turkish],
        options: generateOptions(i % 2 === 0 ? words[i % words.length].arabic : words[i % words.length].turkish, "word"),
        order: order++,
        isNewWord: i === 0,
        audioUrl: ""
      });
    }

    // 3 select
    for (let i = 0; i < 3; i++) {
      exercises.push({
        type: "select",
        instruction: `${words[i % words.length].turkish} ne anlama gelir?`,
        sourceText: words[i % words.length].turkish,
        sourceLanguage: "turkish",
        targetLanguage: "turkish",
        correctAnswer: [words[i % words.length].meaning],
        options: generateOptions(words[i % words.length].meaning, "meaning"),
        order: order++,
        isNewWord: false,
        audioUrl: ""
      });
    }

    // 4 arrange
    for (let i = 0; i < 4; i++) {
      const sentence = words[i % words.length].sentence;
      const wordsArray = sentence.split(' ');
      exercises.push({
        type: "arrange",
        instruction: "kelimeleri doğru sıraya koy",
        sourceText: sentence,
        sourceLanguage: "turkish",
        targetLanguage: "turkish",
        correctAnswer: wordsArray,
        options: shuffleArray([...wordsArray]),
        order: order++,
        isNewWord: false,
        audioUrl: ""
      });
    }

    // 2 match
    for (let i = 0; i < 2; i++) {
      const word1 = words[i * 2 % words.length];
      const word2 = words[(i * 2 + 1) % words.length];
      exercises.push({
        type: "match",
        instruction: "kelimeleri eşleştir",
        sourceText: `${word1.turkish}:${word1.meaning}, ${word2.turkish}:${word2.meaning}`,
        sourceLanguage: "turkish",
        targetLanguage: "turkish",
        correctAnswer: [`${word1.turkish}:${word1.meaning}`, `${word2.turkish}:${word2.meaning}`],
        options: [word1.turkish, word1.meaning, word2.turkish, word2.meaning],
        order: order++,
        isNewWord: false,
        audioUrl: ""
      });
    }

    // 1 speak
    exercises.push({
      type: "speak",
      instruction: `söyle: ${words[0].turkish}`,
      sourceText: words[0].turkish,
      sourceLanguage: "turkish",
      targetLanguage: "arabic",
      correctAnswer: [words[0].arabic],
      options: [],
      order: order++,
      isNewWord: false,
      audioUrl: ""
    });

  } else {
    // BÖLÜM 9-10: Expert
    // 2 translate
    for (let i = 0; i < 2; i++) {
      exercises.push({
        type: "translate",
        instruction: i % 2 === 0 ? "türkçe'den arapça'ya çevir" : "arapça'dan türkçe'ye çevir",
        sourceText: i % 2 === 0 ? words[i % words.length].turkish : words[i % words.length].arabic,
        sourceLanguage: i % 2 === 0 ? "turkish" : "arabic",
        targetLanguage: i % 2 === 0 ? "arabic" : "turkish",
        correctAnswer: [i % 2 === 0 ? words[i % words.length].arabic : words[i % words.length].turkish],
        options: generateOptions(i % 2 === 0 ? words[i % words.length].arabic : words[i % words.length].turkish, "word"),
        order: order++,
        isNewWord: i === 0,
        audioUrl: ""
      });
    }

    // 2 select
    for (let i = 0; i < 2; i++) {
      exercises.push({
        type: "select",
        instruction: `${words[i % words.length].turkish} ne anlama gelir?`,
        sourceText: words[i % words.length].turkish,
        sourceLanguage: "turkish",
        targetLanguage: "turkish",
        correctAnswer: [words[i % words.length].meaning],
        options: generateOptions(words[i % words.length].meaning, "meaning"),
        order: order++,
        isNewWord: false,
        audioUrl: ""
      });
    }

    // 5 arrange
    for (let i = 0; i < 5; i++) {
      const sentence = words[i % words.length].sentence;
      const wordsArray = sentence.split(' ');
      exercises.push({
        type: "arrange",
        instruction: "kelimeleri doğru sıraya koy",
        sourceText: sentence,
        sourceLanguage: "turkish",
        targetLanguage: "turkish",
        correctAnswer: wordsArray,
        options: shuffleArray([...wordsArray]),
        order: order++,
        isNewWord: false,
        audioUrl: ""
      });
    }

    // 3 match
    for (let i = 0; i < 3; i++) {
      const word1 = words[i * 2 % words.length];
      const word2 = words[(i * 2 + 1) % words.length];
      exercises.push({
        type: "match",
        instruction: "kelimeleri eşleştir",
        sourceText: `${word1.turkish}:${word1.meaning}, ${word2.turkish}:${word2.meaning}`,
        sourceLanguage: "turkish",
        targetLanguage: "turkish",
        correctAnswer: [`${word1.turkish}:${word1.meaning}`, `${word2.turkish}:${word2.meaning}`],
        options: [word1.turkish, word1.meaning, word2.turkish, word2.meaning],
        order: order++,
        isNewWord: false,
        audioUrl: ""
      });
    }

    // 1 speak
    exercises.push({
      type: "speak",
      instruction: `söyle: ${words[0].turkish}`,
      sourceText: words[0].turkish,
      sourceLanguage: "turkish",
      targetLanguage: "arabic",
      correctAnswer: [words[0].arabic],
      options: [],
      order: order++,
      isNewWord: false,
      audioUrl: ""
    });
  }

  return exercises;
}

function getWordPairsForLesson(lessonTitle, chapterNum, lessonOrder) {
  // Bu fonksiyon her ders için ilgili kelime çiftlerini döndürür
  const wordDatabase = {
    // ============================================
    // BÖLÜM 1: ALLAH'I TANIMAK
    // ============================================
    
    // Ünite 1: Allah Birdir
    "tevhid nedir?": [
      { turkish: "tevhid", arabic: "توحيد", meaning: "allah'ın birliğine inanmak", sentence: "tevhid iman temelidir" },
      { turkish: "vahid", arabic: "واحد", meaning: "bir", sentence: "allah vahiddir" },
      { turkish: "ehad", arabic: "أحد", meaning: "tek", sentence: "allah ehaddir" },
      { turkish: "şirk", arabic: "شرك", meaning: "allah'a ortak koşmak", sentence: "şirk büyük günahtır" },
      { turkish: "iman", arabic: "إيمان", meaning: "inanmak", sentence: "iman kalple tasdiktir" }
    ],
    "allah'ın varlığı": [
      { turkish: "yaratıcı", arabic: "خالق", meaning: "yaratan", sentence: "allah her şeyin yaratıcısıdır" },
      { turkish: "kadır", arabic: "قادر", meaning: "güç sahibi", sentence: "allah her şeye kadirdir" },
      { turkish: "evvel", arabic: "الأول", meaning: "başlangıcı olmayan", sentence: "allah evveldir" },
      { turkish: "ahir", arabic: "الآخر", meaning: "sonu olmayan", sentence: "allah ahirdir" },
      { turkish: "baki", arabic: "الباقي", meaning: "ebedi", sentence: "allah bakidir" }
    ],
    "allah tektir": [
      { turkish: "tek", arabic: "واحد", meaning: "bir", sentence: "allah tektir" },
      { turkish: "benzeri yok", arabic: "لَيْسَ كَمِثْلِهِ", meaning: "benzersiz", sentence: "allah'ın benzeri yoktur" },
      { turkish: "ortak yok", arabic: "لا شريك له", meaning: "ortaksız", sentence: "allah'ın ortağı yoktur" },
      { turkish: "fert", arabic: "فرد", meaning: "biricik", sentence: "allah ferttir" },
      { turkish: "samed", arabic: "صمد", meaning: "hiçbir şeye muhtaç olmayan", sentence: "allah sameddir" }
    ],
    "allah'a ortak koşmamak": [
      { turkish: "şirk", arabic: "شرك", meaning: "allah'a ortak koşmak", sentence: "şirk büyük günahtır" },
      { turkish: "tevhid", arabic: "توحيد", meaning: "birlik", sentence: "tevhid esastır" },
      { turkish: "ibadet", arabic: "عبادة", meaning: "kulluk", sentence: "ibadet sadece allah'adır" },
      { turkish: "dua", arabic: "دعاء", meaning: "yakarış", sentence: "dua sadece allah'a edilir" },
      { turkish: "şükür", arabic: "شكر", meaning: "teşekkür", sentence: "şükür sadece allah'a" }
    ],
    
    // Ünite 2: Allah'ın Güzel İsimleri
    "er-rahman (çok merhametli)": [
      { turkish: "rahman", arabic: "الرَّحْمَٰن", meaning: "çok merhametli", sentence: "allah rahman ismiyle anılır" },
      { turkish: "merhamet", arabic: "رحمة", meaning: "şefkat", sentence: "allah'ın merhameti sonsuzdur" },
      { turkish: "rahmet", arabic: "رحمة", meaning: "bağışlama", sentence: "rahmet allah'tan gelir" },
      { turkish: "şefkat", arabic: "رأفة", meaning: "acıma duygusu", sentence: "şefkat güzel bir duygudur" },
      { turkish: "muhtaç", arabic: "محتاج", meaning: "ihtiyacı olan", sentence: "herkes allah'a muhtaçtır" }
    ],
    "er-rahim (merhamet edici)": [
      { turkish: "rahim", arabic: "الرَّحِيم", meaning: "merhamet edici", sentence: "allah rahim ismiyle anılır" },
      { turkish: "affedici", arabic: "غفور", meaning: "bağışlayan", sentence: "allah affedicidir" },
      { turkish: "bağışlama", arabic: "مغفرة", meaning: "affetme", sentence: "bağışlama allah'tandır" },
      { turkish: "tevbe", arabic: "توبة", meaning: "pişmanlık", sentence: "tevbe etmek önemlidir" },
      { turkish: "istiğfar", arabic: "استغفار", meaning: "af dilemek", sentence: "istiğfar yapmak gerekir" }
    ],
    "el-kerim (cömert)": [
      { turkish: "kerim", arabic: "الكَرِيم", meaning: "cömert", sentence: "allah kerimdir" },
      { turkish: "cömertlik", arabic: "كرم", meaning: "eli açıklık", sentence: "cömertlik güzel bir haslet" },
      { turkish: "vermek", arabic: "إعطاء", meaning: "bağışlamak", sentence: "vermek güzel bir şeydir" },
      { turkish: "nimet", arabic: "نعمة", meaning: "iyilik", sentence: "nimetler allah'tandır" },
      { turkish: "rızık", arabic: "رزق", meaning: "geçim", sentence: "rızık allah'tan gelir" }
    ],
    "el-afüv (affedici)": [
      { turkish: "afüv", arabic: "العَفُوّ", meaning: "çok affedici", sentence: "allah afüvdür" },
      { turkish: "affetmek", arabic: "عفو", meaning: "bağışlamak", sentence: "affetmek güzeldir" },
      { turkish: "günah", arabic: "ذنب", meaning: "suç", sentence: "günahlardan kaçınmalıyız" },
      { turkish: "pişmanlık", arabic: "ندم", meaning: "üzülmek", sentence: "pişmanlık önemlidir" },
      { turkish: "tövbe", arabic: "توبة", meaning: "af dilemek", sentence: "tövbe etmeliyiz" }
    ],
    
    // Ünite 3: Allah Her Şeyi Görür ve Bilir
    "allah her yerdedir": [
      { turkish: "her yer", arabic: "كل مكان", meaning: "bütün yerler", sentence: "allah her yerdedir" },
      { turkish: "gizli", arabic: "سر", meaning: "saklı", sentence: "gizli hiçbir şey yoktur" },
      { turkish: "açık", arabic: "علن", meaning: "görünür", sentence: "her şey allah'a açıktır" },
      { turkish: "görmek", arabic: "رؤية", meaning: "bakmak", sentence: "allah her şeyi görür" },
      { turkish: "bilmek", arabic: "علم", meaning: "haberdar olmak", sentence: "allah her şeyi bilir" }
    ],
    "allah her şeyi bilir": [
      { turkish: "alim", arabic: "عَلِيم", meaning: "her şeyi bilen", sentence: "allah alimdir" },
      { turkish: "ilim", arabic: "علم", meaning: "bilgi", sentence: "ilim allah'tandır" },
      { turkish: "haberdar", arabic: "خبير", meaning: "bilen", sentence: "allah haberdardır" },
      { turkish: "akıl", arabic: "عقل", meaning: "düşünme", sentence: "akıl allah'ın nimeti" },
      { turkish: "hikmet", arabic: "حكمة", meaning: "bilgelik", sentence: "hikmet önemlidir" }
    ],
    "allah her şeyi görür": [
      { turkish: "basir", arabic: "بَصِير", meaning: "her şeyi gören", sentence: "allah basirdir" },
      { turkish: "görme", arabic: "بصر", meaning: "bakma", sentence: "görme allah'ın nimeti" },
      { turkish: "göz", arabic: "عين", meaning: "bakış", sentence: "gözlerimiz allah'ın nimeti" },
      { turkish: "gözetlemek", arabic: "رقابة", meaning: "korumak", sentence: "allah gözetler" },
      { turkish: "korumak", arabic: "حفظ", meaning: "saklamak", sentence: "allah korur" }
    ],
    "allah her şeyi duyar": [
      { turkish: "semi", arabic: "سَمِيع", meaning: "her şeyi duyan", sentence: "allah semidir" },
      { turkish: "duymak", arabic: "سمع", meaning: "işitmek", sentence: "duymak allah'ın nimeti" },
      { turkish: "kulak", arabic: "أذن", meaning: "işitme organı", sentence: "kulak nimettir" },
      { turkish: "dua", arabic: "دعاء", meaning: "yakarış", sentence: "allah duaları duyar" },
      { turkish: "cevap", arabic: "إجابة", meaning: "karşılık", sentence: "allah dualara cevap verir" }
    ],
    // ============================================
    // BÖLÜM 2: PEYGAMBERLER
    // ============================================
    
    // Ünite 1: Peygamberlik
    "peygamber nedir?": [
      { turkish: "peygamber", arabic: "نَبِيّ", meaning: "allah'ın elçisi", sentence: "peygamberler allah'ın elçisidir" },
      { turkish: "resul", arabic: "رَسُول", meaning: "elçi", sentence: "resuller vahiy getirdi" },
      { turkish: "vahiy", arabic: "وَحْي", meaning: "ilahi mesaj", sentence: "vahiy allah'tan gelir" },
      { turkish: "elçi", arabic: "رَسُول", meaning: "mesaj getiren", sentence: "elçiler mesaj getirir" },
      { turkish: "kitap", arabic: "كِتَاب", meaning: "ilahi yazı", sentence: "kitaplar vahiyle geldi" }
    ],
    "ilk peygamber hz. adem": [
      { turkish: "adem", arabic: "آدَم", meaning: "ilk insan", sentence: "hz adem ilk peygamberdir" },
      { turkish: "havva", arabic: "حَوَّاء", meaning: "ilk kadın", sentence: "havva adem'in eşidir" },
      { turkish: "cennet", arabic: "جَنَّة", meaning: "sonsuz mutluluk yeri", sentence: "cennet mükafat yeridir" },
      { turkish: "şeytan", arabic: "شَيْطَان", meaning: "kötülüğün kaynağı", sentence: "şeytandan allah'a sığınırız" },
      { turkish: "tövbe", arabic: "تَوْبَة", meaning: "af dilemek", sentence: "tövbe etmek önemlidir" }
    ],
    "peygamberlerin görevleri": [
      { turkish: "görev", arabic: "مُهِمَّة", meaning: "iş", sentence: "görevlerimizi yapmalıyız" },
      { turkish: "tebliğ", arabic: "تَبْلِيغ", meaning: "duyurmak", sentence: "tebliğ peygamberlerin görevidir" },
      { turkish: "hak", arabic: "حَقّ", meaning: "doğru", sentence: "hak yolu göstermek" },
      { turkish: "hidayet", arabic: "هِدَايَة", meaning: "doğru yol", sentence: "hidayet allah'tandır" },
      { turkish: "uyarmak", arabic: "إِنْذَار", meaning: "haber vermek", sentence: "peygamberler uyarır" }
    ],
    "peygamberlere iman": [
      { turkish: "iman", arabic: "إِيمَان", meaning: "inanmak", sentence: "iman etmek gerekir" },
      { turkish: "inanmak", arabic: "آمَنَ", meaning: "tasdik etmek", sentence: "peygamberlere inanırız" },
      { turkish: "saygı", arabic: "اِحْتِرَام", meaning: "hürmet", sentence: "saygı göstermeliyiz" },
      { turkish: "sevgi", arabic: "مَحَبَّة", meaning: "muhabbet", sentence: "sevgi ile anmalıyız" },
      { turkish: "örnek", arabic: "قُدْوَة", meaning: "model", sentence: "peygamberler örnektir" }
    ],
    
    // Ünite 2: Hz. Muhammed
    "hz. muhammed'in doğumu": [
      { turkish: "mekke", arabic: "مَكَّة", meaning: "kutsal şehir", sentence: "mekke'de doğdu" },
      { turkish: "doğum", arabic: "مَوْلِد", meaning: "dünyaya gelme", sentence: "doğum mübarek bir gündür" },
      { turkish: "yetim", arabic: "يَتِيم", meaning: "öksüz", sentence: "yetime iyilik edelim" },
      { turkish: "büyümek", arabic: "نَمَا", meaning: "gelişmek", sentence: "güzel ahlakla büyüdü" },
      { turkish: "kutlu", arabic: "مُبَارَك", meaning: "bereketli", sentence: "kutlu bir gündü" }
    ],
    "hz. muhammed'in çocukluğu": [
      { turkish: "emin", arabic: "أَمِين", meaning: "güvenilir", sentence: "emin lakabı vardı" },
      { turkish: "sadık", arabic: "صَادِق", meaning: "doğru sözlü", sentence: "sadık bir insandı" },
      { turkish: "dürüst", arabic: "صَادِق", meaning: "doğru", sentence: "dürüstlük önemlidir" },
      { turkish: "çoban", arabic: "رَاعِي", meaning: "sürü bekçisi", sentence: "çobanlık yaptı" },
      { turkish: "güven", arabic: "أَمَانَة", meaning: "emanet", sentence: "güven kazandı" }
    ],
    "ilk vahiy": [
      { turkish: "hira", arabic: "حِرَاء", meaning: "mağara ismi", sentence: "hira mağarasında vahiy geldi" },
      { turkish: "cebrail", arabic: "جِبْرِيل", meaning: "vahiy meleği", sentence: "cebrail vahiy getirdi" },
      { turkish: "oku", arabic: "اِقْرَأ", meaning: "okumak", sentence: "oku ilk emirdi" },
      { turkish: "kalem", arabic: "قَلَم", meaning: "yazı aleti", sentence: "kalemle öğretiriz" },
      { turkish: "ilim", arabic: "عِلْم", meaning: "bilgi", sentence: "ilim öğrenmek önemlidir" }
    ],
    "hz. muhammed'in ahlakı": [
      { turkish: "ahlak", arabic: "أَخْلَاق", meaning: "karakter", sentence: "güzel ahlak önemlidir" },
      { turkish: "merhametli", arabic: "رَحِيم", meaning: "şefkatli", sentence: "çok merhametliydi" },
      { turkish: "adil", arabic: "عَادِل", meaning: "adaletli", sentence: "herkese adildi" },
      { turkish: "sabırlı", arabic: "صَابِر", meaning: "dayanıklı", sentence: "çok sabırlıydı" },
      { turkish: "alçakgönüllü", arabic: "مُتَوَاضِع", meaning: "tevazu sahibi", sentence: "alçakgönüllüydü" }
    ],
    "hz. muhammed'i sevmek": [
      { turkish: "sevmek", arabic: "حُبّ", meaning: "muhabbet etmek", sentence: "peygamberi sevmeliyiz" },
      { turkish: "izlemek", arabic: "اِتِّبَاع", meaning: "takip etmek", sentence: "yolunu izlemeliyiz" },
      { turkish: "sünnet", arabic: "سُنَّة", meaning: "yol", sentence: "sünnetine uymalıyız" },
      { turkish: "örnek", arabic: "قُدْوَة", meaning: "model", sentence: "en güzel örnektir" },
      { turkish: "salat", arabic: "صَلَاة", meaning: "dua", sentence: "ona salavat getiririz" }
    ],
    
    // Ünite 3: Diğer Peygamberler
    "hz. nuh ve gemi": [
      { turkish: "nuh", arabic: "نُوح", meaning: "peygamber ismi", sentence: "hz nuh gemi yaptı" },
      { turkish: "gemi", arabic: "سَفِينَة", meaning: "tekne", sentence: "büyük gemi yaptı" },
      { turkish: "tufan", arabic: "طُوفَان", meaning: "sel", sentence: "büyük tufan oldu" },
      { turkish: "kurtulmak", arabic: "نَجَاة", meaning: "iman edenler kurtuldu", sentence: "kurtulmak önemlidir" },
      { turkish: "davet", arabic: "دَعْوَة", meaning: "çağrı", sentence: "insanları hidayete davet etti" }
    ],
    "hz. ibrahim ve tevhid": [
      { turkish: "ibrahim", arabic: "إِبْرَاهِيم", meaning: "peygamber ismi", sentence: "hz ibrahim tevhid öğretti" },
      { turkish: "halilullah", arabic: "خَلِيل الله", meaning: "allah'ın dostu", sentence: "halilullah lakabı vardı" },
      { turkish: "ateş", arabic: "نَار", meaning: "alev", sentence: "ateşe atıldı" },
      { turkish: "mucize", arabic: "مُعْجِزَة", meaning: "olağanüstü olay", sentence: "mucize ile kurtuldu" },
      { turkish: "kabe", arabic: "كَعْبَة", meaning: "allah'ın evi", sentence: "kabe'yi inşa etti" }
    ],
    "hz. musa ve firavun": [
      { turkish: "musa", arabic: "مُوسَى", meaning: "peygamber ismi", sentence: "hz musa kelimullah" },
      { turkish: "firavun", arabic: "فِرْعَوْن", meaning: "zalim kral", sentence: "firavun zalimdi" },
      { turkish: "asa", arabic: "عَصَا", meaning: "değnek", sentence: "asası mucize oldu" },
      { turkish: "deniz", arabic: "بَحْر", meaning: "su", sentence: "deniz ikiye ayrıldı" },
      { turkish: "harun", arabic: "هَارُون", meaning: "musa'nın kardeşi", sentence: "harun yardımcıydı" }
    ],
    "hz. isa'nın mucizeleri": [
      { turkish: "isa", arabic: "عِيسَى", meaning: "peygamber ismi", sentence: "hz isa mesih" },
      { turkish: "meryem", arabic: "مَرْيَم", meaning: "isa'nın annesi", sentence: "meryem güzel bir hanımdı" },
      { turkish: "mucize", arabic: "مُعْجِزَة", meaning: "fevkalade olay", sentence: "mucizeler gösterdi" },
      { turkish: "şifa", arabic: "شِفَاء", meaning: "iyileşme", sentence: "hastaları iyileştirdi" },
      { turkish: "incil", arabic: "إِنْجِيل", meaning: "kutsal kitap", sentence: "incil ona verildi" }
    ],
    
    // ============================================
    // BÖLÜM 3: MELEKLER VE KİTAPLAR
    // ============================================
    
    // Ünite 1: Meleklere İman
    "melekler kimlerdir?": [
      { turkish: "melek", arabic: "مَلَك", meaning: "nurdan yaratılan varlık", sentence: "melekler nurdan yaratıldı" },
      { turkish: "nur", arabic: "نُور", meaning: "ışık", sentence: "nur temiz ışıktır" },
      { turkish: "itaat", arabic: "طَاعَة", meaning: "uyma", sentence: "melekler itaat eder" },
      { turkish: "ibadet", arabic: "عِبَادَة", meaning: "kulluk", sentence: "melekler ibadet eder" },
      { turkish: "görünmez", arabic: "غَيْب", meaning: "gizli", sentence: "melekler görünmezdir" }
    ],
    "cebrail (as)": [
      { turkish: "cebrail", arabic: "جِبْرِيل", meaning: "vahiy meleği", sentence: "cebrail vahiy getirir" },
      { turkish: "vahiy", arabic: "وَحْي", meaning: "ilahi mesaj", sentence: "vahiy allah'tan gelir" },
      { turkish: "elçi", arabic: "رَسُول", meaning: "mesajcı", sentence: "cebrail elçidir" },
      { turkish: "peygamber", arabic: "نَبِيّ", meaning: "allah'ın seçtiği", sentence: "peygamberlere vahiy gelir" },
      { turkish: "güçlü", arabic: "قَوِيّ", meaning: "kuvvetli", sentence: "cebrail çok güçlüdür" }
    ],
    "mikail (as)": [
      { turkish: "mikail", arabic: "مِيكَائِيل", meaning: "rızık meleği", sentence: "mikail rızık dağıtır" },
      { turkish: "rızık", arabic: "رِزْق", meaning: "geçim", sentence: "rızık allah'tandır" },
      { turkish: "yağmur", arabic: "مَطَر", meaning: "su", sentence: "yağmur nimet verir" },
      { turkish: "bereket", arabic: "بَرَكَة", meaning: "bolluk", sentence: "bereket güzeldir" },
      { turkish: "nimet", arabic: "نِعْمَة", meaning: "iyilik", sentence: "nimetler çoktur" }
    ],
    "azrail (as) ve israfil (as)": [
      { turkish: "azrail", arabic: "عَزْرَائِيل", meaning: "can alan melek", sentence: "azrail can alır" },
      { turkish: "israfil", arabic: "إِسْرَافِيل", meaning: "sura üfleyen melek", sentence: "israfil sura üfler" },
      { turkish: "ölüm", arabic: "مَوْت", meaning: "vefat", sentence: "ölüm haktır" },
      { turkish: "sur", arabic: "صُور", meaning: "borazan", sentence: "sura üfürülecek" },
      { turkish: "kıyamet", arabic: "قِيَامَة", meaning: "ahiret günü", sentence: "kıyamet kopacak" }
    ],
    
    // Ünite 2: İlahi Kitaplar
    "ilahi kitaplar nelerdir?": [
      { turkish: "kitap", arabic: "كِتَاب", meaning: "allah'ın sözü", sentence: "kitaplar allah'tandır" },
      { turkish: "vahiy", arabic: "وَحْي", meaning: "ilahi mesaj", sentence: "vahiy ile geldi" },
      { turkish: "hidayet", arabic: "هِدَايَة", meaning: "doğru yol", sentence: "hidayet kaynağıdır" },
      { turkish: "rehber", arabic: "دَلِيل", meaning: "kılavuz", sentence: "kitaplar rehberdir" },
      { turkish: "hak", arabic: "حَقّ", meaning: "gerçek", sentence: "hak yolu gösterir" }
    ],
    "tevrat": [
      { turkish: "tevrat", arabic: "تَوْرَاة", meaning: "musa'ya verilen kitap", sentence: "tevrat musa'ya verildi" },
      { turkish: "musa", arabic: "مُوسَى", meaning: "peygamber", sentence: "musa kelimullahtır" },
      { turkish: "beni israil", arabic: "بَنِي إِسْرَائِيل", meaning: "yahudi kavmi", sentence: "beni israile gönderildi" },
      { turkish: "on emir", arabic: "عَشَرَة أَوَامِر", meaning: "temel kurallar", sentence: "on emir vardı" },
      { turkish: "levha", arabic: "لَوْح", meaning: "yazı taşı", sentence: "levhalara yazıldı" }
    ],
    "zebur": [
      { turkish: "zebur", arabic: "زَبُور", meaning: "davud'a verilen kitap", sentence: "zebur davud'a verildi" },
      { turkish: "davud", arabic: "دَاوُد", meaning: "peygamber", sentence: "davud kral peygamberdi" },
      { turkish: "ilahi", arabic: "تَرْنِيمَة", meaning: "övgü", sentence: "ilahiler içerirdi" },
      { turkish: "mezmur", arabic: "مَزْمُور", meaning: "dua", sentence: "mezmurlar vardı" },
      { turkish: "hamd", arabic: "حَمْد", meaning: "övme", sentence: "hamd etmek güzeldir" }
    ],
    "incil": [
      { turkish: "incil", arabic: "إِنْجِيل", meaning: "isa'ya verilen kitap", sentence: "incil isa'ya verildi" },
      { turkish: "isa", arabic: "عِيسَى", meaning: "peygamber", sentence: "isa mesih peygamberdir" },
      { turkish: "müjde", arabic: "بِشَارَة", meaning: "iyi haber", sentence: "müjde taşıyordu" },
      { turkish: "sevgi", arabic: "مَحَبَّة", meaning: "muhabbet", sentence: "sevgiyi öğretir" },
      { turkish: "barış", arabic: "سَلَام", meaning: "huzur", sentence: "barışı savunur" }
    ],
    
    // Ünite 3: Kur'an-ı Kerim
    "kur'an nedir?": [
      { turkish: "kuran", arabic: "قُرْآن", meaning: "son ilahi kitap", sentence: "kuran son kitaptır" },
      { turkish: "muhammed", arabic: "مُحَمَّد", meaning: "son peygamber", sentence: "muhammed'e verildi" },
      { turkish: "arapça", arabic: "عَرَبِيّ", meaning: "arap dili", sentence: "arapça olarak indirildi" },
      { turkish: "ayetler", arabic: "آيَات", meaning: "cümleler", sentence: "ayetlerden oluşur" },
      { turkish: "sureler", arabic: "سُوَر", meaning: "bölümler", sentence: "sureler vardır" }
    ],
    "kur'an'ın özellikleri": [
      { turkish: "korunmuş", arabic: "مَحْفُوظ", meaning: "değişmemiş", sentence: "kuran korunmuştur" },
      { turkish: "mucize", arabic: "مُعْجِزَة", meaning: "eşsiz", sentence: "kuran mucizedir" },
      { turkish: "ebedi", arabic: "أَبَدِيّ", meaning: "sonsuza dek", sentence: "ebedi kitaptır" },
      { turkish: "eksiksiz", arabic: "كَامِل", meaning: "tam", sentence: "eksiksiz bir kitaptır" },
      { turkish: "ışık", arabic: "نُور", meaning: "hidayet kaynağı", sentence: "kuran ışıktır" }
    ],
    "kur'an okumak": [
      { turkish: "okumak", arabic: "قِرَاءَة", meaning: "tilawet", sentence: "kuran okumak sevaptır" },
      { turkish: "sevap", arabic: "ثَوَاب", meaning: "mükafat", sentence: "sevap kazanırız" },
      { turkish: "tilawet", arabic: "تِلَاوَة", meaning: "güzel okumak", sentence: "tilawet önemlidir" },
      { turkish: "tecvid", arabic: "تَجْوِيد", meaning: "düzgün okuma", sentence: "tecvid kuralları vardır" },
      { turkish: "hafız", arabic: "حَافِظ", meaning: "ezberleyen", sentence: "hafızlar kuranı ezberler" }
    ],
    "kur'an'a saygı": [
      { turkish: "saygı", arabic: "اِحْتِرَام", meaning: "hürmet", sentence: "saygı göstermeliyiz" },
      { turkish: "temiz", arabic: "طَاهِر", meaning: "pak", sentence: "temiz olmalıyız" },
      { turkish: "abdest", arabic: "وُضُوء", meaning: "taharet", sentence: "abdestli olmalıyız" },
      { turkish: "yüksek yer", arabic: "مَكَان عَالٍ", meaning: "temiz yer", sentence: "yüksek yere koymalıyız" },
      { turkish: "öpme", arabic: "تَقْبِيل", meaning: "sevgi gösterme", sentence: "öpüp başımıza koyarız" }
    ],
    
    // Genel kelimeler
    default: [
      { turkish: "allah", arabic: "الله", meaning: "yaratıcı", sentence: "allah her şeyi bilir" },
      { turkish: "rahman", arabic: "رحمن", meaning: "çok merhametli", sentence: "allah rahmandir" },
      { turkish: "rahim", arabic: "رحيم", meaning: "merhamet edici", sentence: "allah rahimdir" },
      { turkish: "malik", arabic: "ملك", meaning: "malik", sentence: "allah herşeyin sahibidir" },
      { turkish: "hakim", arabic: "حكيم", meaning: "hikmet sahibi", sentence: "allah hakimdir" }
    ]
  };

  // Ders başlığını normalize et
  const normalizedTitle = lessonTitle.toLowerCase();

  // İlgili kelimeleri bul, yoksa default kullan
  return wordDatabase[normalizedTitle] || wordDatabase.default;
}

function generateOptions(correctAnswer, type) {
  // type: "word" veya "meaning"
  const wordOptions = {
    word: [
      "الله", "محمد", "إيمان", "صلاة", "زكاة", "صوم", "حج", "قرآن",
      "الرحمن", "الرحيم", "الملك", "القدوس", "السلام", "المؤمن", "الكريم", "العليم"
    
    // ============================================
    // BÖLÜM 4: AHİRET İNANCI
    // ============================================
    
    // Ünite 1: Ölüm ve Kabir
    "ölüm nedir?": [
      { turkish: "ölüm", arabic: "مَوْت", meaning: "ruh bedeni terkeder", sentence: "ölüm haktır" },
      { turkish: "ecel", arabic: "أَجَل", meaning: "vade", sentence: "eceli gelen ölür" },
      { turkish: "dünya", arabic: "دُنْيَا", meaning: "geçici hayat", sentence: "dünya fanıdır" },
      { turkish: "ahiret", arabic: "آخِرَة", meaning: "sonsuz hayat", sentence: "ahiret bakidir" },
      { turkish: "geçici", arabic: "زَائِل", meaning: "süresiz", sentence: "dünya geçicidir" }
    ],
    "kabir hayatı": [
      { turkish: "kabir", arabic: "قَبْر", meaning: "mezar", sentence: "kabir hayatı vardır" },
      { turkish: "berzah", arabic: "بَرْزَخ", meaning: "ara alem", sentence: "berzah alemi vardır" },
      { turkish: "beklemek", arabic: "اِنْتِظَار", meaning: "durma", sentence: "kıyameti bekleriz" },
      { turkish: "azap", arabic: "عَذَاب", meaning: "ceza", sentence: "azap veya nimet" },
      { turkish: "nimet", arabic: "نِعْمَة", meaning: "iyilik", sentence: "nimet olabilir" }
    ],
    "kabir sorgusu": [
      { turkish: "münker", arabic: "مُنْكَر", meaning: "soru soran melek", sentence: "münker melektir" },
      { turkish: "nekir", arabic: "نَكِير", meaning: "soru soran melek", sentence: "nekir melektir" },
      { turkish: "sorgu", arabic: "سُؤَال", meaning: "soru", sentence: "sorgu olacaktır" },
      { turkish: "cevap", arabic: "جَوَاب", meaning: "karşılık", sentence: "cevap vermeliyiz" },
      { turkish: "amel", arabic: "عَمَل", meaning: "iş", sentence: "amellerimiz sorulur" }
    ],
    "ölüme hazırlık": [
      { turkish: "hazırlık", arabic: "اِسْتِعْدَاد", meaning: "hazır olma", sentence: "hazırlık yapmalıyız" },
      { turkish: "iyi iş", arabic: "عَمَل صَالِح", meaning: "salih amel", sentence: "iyi işler yapmalıyız" },
      { turkish: "tövbe", arabic: "تَوْبَة", meaning: "af dileme", sentence: "tövbe etmeliyiz" },
      { turkish: "istiğfar", arabic: "اِسْتِغْفَار", meaning: "bağışlanma", sentence: "istiğfar etmeliyiz" },
      { turkish: "hesap", arabic: "حِسَاب", meaning: "sorgu", sentence: "hesap vereceğiz" }
    ],
    
    // Ünite 2: Kıyamet
    "kıyamet günü": [
      { turkish: "kıyamet", arabic: "قِيَامَة", meaning: "ahiret günü", sentence: "kıyamet kopacak" },
      { turkish: "büyük gün", arabic: "يَوْم عَظِيم", meaning: "önemli gün", sentence: "büyük gün gelecek" },
      { turkish: "son gün", arabic: "يَوْم الآخِرَة", meaning: "ahir zaman", sentence: "son gün yakındır" },
      { turkish: "korku", arabic: "خَوْف", meaning: "endişe", sentence: "o gün korkulu bir gündür" },
      { turkish: "hesap", arabic: "حِسَاب", meaning: "sorgu", sentence: "hesap günü gelecek" }
    ],
    "sura üfürülmesi": [
      { turkish: "sur", arabic: "صُور", meaning: "borazan", sentence: "sura üfürülecek" },
      { turkish: "israfil", arabic: "إِسْرَافِيل", meaning: "sur üfleyen melek", sentence: "israfil üfürecek" },
      { turkish: "üfürmek", arabic: "نَفْخ", meaning: "üflemek", sentence: "sura üfürülür" },
      { turkish: "ses", arabic: "صَوْت", meaning: "seda", sentence: "büyük ses duyulur" },
      { turkish: "uyanmak", arabic: "قِيَام", meaning: "kalkmak", sentence: "herkes uyanacak" }
    ],
    "diriliş": [
      { turkish: "diriliş", arabic: "بَعْث", meaning: "tekrar dirilmek", sentence: "diriliş olacak" },
      { turkish: "ba's", arabic: "بَعْث", meaning: "yeniden yaratılış", sentence: "ba's günü gelecek" },
      { turkish: "dirilmek", arabic: "قِيَام", meaning: "hayat bulmak", sentence: "herkes dirilecek" },
      { turkish: "tekrar", arabic: "إِعَادَة", meaning: "yeniden", sentence: "tekrar yaratılacağız" },
      { turkish: "bedeni", arabic: "جَسَد", meaning: "vücut", sentence: "bedenimiz dirilecek" }
    ],
    "mahşer": [
      { turkish: "mahşer", arabic: "مَحْشَر", meaning: "toplanma yeri", sentence: "mahşerde toplanacağız" },
      { turkish: "toplanmak", arabic: "حَشْر", meaning: "bir araya gelmek", sentence: "herkes toplanacak" },
      { turkish: "meydan", arabic: "سَاحَة", meaning: "alan", sentence: "büyük meydandır" },
      { turkish: "beklemek", arabic: "اِنْتِظَار", meaning: "durma", sentence: "hesabı bekleyeceğiz" },
      { turkish: "adalet", arabic: "عَدْل", meaning: "hakkaniyet", sentence: "adalet tecelli edecek" }
    ],
    
    // Ünite 3: Cennet ve Cehennem
    "hesap günü": [
      { turkish: "hesap", arabic: "حِسَاب", meaning: "sorgulama", sentence: "hesap günü gelecek" },
      { turkish: "amel", arabic: "عَمَل", meaning: "iş", sentence: "ameller sorulacak" },
      { turkish: "tartı", arabic: "مِيزَان", meaning: "terazi", sentence: "ameller tartılacak" },
      { turkish: "iyi", arabic: "خَيْر", meaning: "hayır", sentence: "iyi işlerimiz sayılacak" },
      { turkish: "kötü", arabic: "شَرّ", meaning: "günah", sentence: "kötü işlerimiz görülecek" }
    ],
    "cennet nimetleri": [
      { turkish: "cennet", arabic: "جَنَّة", meaning: "sonsuz mutluluk yeri", sentence: "cennet güzeldir" },
      { turkish: "nimet", arabic: "نِعْمَة", meaning: "iyilik", sentence: "nimetler boldur" },
      { turkish: "huzur", arabic: "سَلَام", meaning: "rahatlık", sentence: "huzur içinde yaşanır" },
      { turkish: "sonsuz", arabic: "أَبَد", meaning: "ebedi", sentence: "sonsuz hayattır" },
      { turkish: "mutluluk", arabic: "سَعَادَة", meaning: "sevinç", sentence: "mutluluk süreklidir" }
    ],
    "cehennem azabı": [
      { turkish: "cehennem", arabic: "جَهَنَّم", meaning: "ceza yeri", sentence: "cehennem kötü yerdir" },
      { turkish: "azap", arabic: "عَذَاب", meaning: "işkence", sentence: "azap vardır" },
      { turkish: "ateş", arabic: "نَار", meaning: "alev", sentence: "ateş yakar" },
      { turkish: "elem", arabic: "أَلَم", meaning: "acı", sentence: "elem çekilir" },
      { turkish: "kötülük", arabic: "سَيِّئَة", meaning: "günah", sentence: "kötülük cezalandırılır" }
    ],
    "cennete giden yol": [
      { turkish: "iman", arabic: "إِيمَان", meaning: "inanmak", sentence: "iman etmek gerekir" },
      { turkish: "ibadet", arabic: "عِبَادَة", meaning: "kulluk", sentence: "ibadet etmeliyiz" },
      { turkish: "iyi amel", arabic: "عَمَل صَالِح", meaning: "güzel iş", sentence: "iyi amel yapmalıyız" },
      { turkish: "dürüstlük", arabic: "صِدْق", meaning: "doğruluk", sentence: "dürüst olmalıyız" },
      { turkish: "yardım", arabic: "مُسَاعَدَة", meaning: "destek", sentence: "yardımlaşmalıyız" }
    ],
    
    // ============================================
    // BÖLÜM 5: NAMAZ İBADETİ
    // ============================================
    
    // Ünite 1: Abdest
    "abdest nedir?": [
      { turkish: "abdest", arabic: "وُضُوء", meaning: "bedensel temizlik", sentence: "abdest almalıyız" },
      { turkish: "temizlik", arabic: "طَهَارَة", meaning: "paklık", sentence: "temizlik önemlidir" },
      { turkish: "su", arabic: "مَاء", meaning: "temiz su", sentence: "su ile temizleniriz" },
      { turkish: "taharet", arabic: "طَهَارَة", meaning: "arınma", sentence: "taharet şarttır" },
      { turkish: "pak", arabic: "طَاهِر", meaning: "temiz", sentence: "pak olmalıyız" }
    ],
    "abdest nasıl alınır?": [
      { turkish: "adım", arabic: "خُطْوَة", meaning: "aşama", sentence: "adımları bilmeliyiz" },
      { turkish: "yıkamak", arabic: "غَسْل", meaning: "temizlemek", sentence: "organları yıkamalıyız" },
      { turkish: "el", arabic: "يَد", meaning: "kol", sentence: "eller yıkanır" },
      { turkish: "yüz", arabic: "وَجْه", meaning: "çehre", sentence: "yüz yıkanır" },
      { turkish: "ayak", arabic: "قَدَم", meaning: "bacak", sentence: "ayaklar yıkanır" }
    ],
    "abdest duası": [
      { turkish: "bismillah", arabic: "بِسْمِ الله", meaning: "allah'ın adıyla", sentence: "bismillah deriz" },
      { turkish: "dua", arabic: "دُعَاء", meaning: "yakarış", sentence: "dua ederiz" },
      { turkish: "başlamak", arabic: "بَدْء", meaning: "başlangıç", sentence: "duayla başlarız" },
      { turkish: "niyet", arabic: "نِيَّة", meaning: "kasd", sentence: "niyet ederiz" },
      { turkish: "kelime", arabic: "كَلِمَة", meaning: "söz", sentence: "kelimeleri söyleriz" }
    ],
    "abdestin bozulması": [
      { turkish: "bozmak", arabic: "نَقْض", meaning: "geçersiz kılmak", sentence: "abdest bozulabilir" },
      { turkish: "sebep", arabic: "سَبَب", meaning: "neden", sentence: "sebepleri bilmeliyiz" },
      { turkish: "tuvalet", arabic: "دَوْرَة المِيَاه", meaning: "hela", sentence: "tuvaletten sonra bozulur" },
      { turkish: "uyumak", arabic: "نَوْم", meaning: "rükü", sentence: "uyumak abdesti bozar" },
      { turkish: "yenilemek", arabic: "تَجْدِيد", meaning: "tekrarlamak", sentence: "yeniden almalıyız" }
    ],
    
    // Ünite 2: Namaz Öğreniyorum
    "namaz nedir?": [
      { turkish: "namaz", arabic: "صَلَاة", meaning: "allah'a ibadet", sentence: "namaz önemlidir" },
      { turkish: "ibadet", arabic: "عِبَادَة", meaning: "kulluk", sentence: "ibadet etmeliyiz" },
      { turkish: "farz", arabic: "فَرْض", meaning: "zorunlu", sentence: "namaz farzdır" },
      { turkish: "rükün", arabic: "رُكْن", meaning: "temel", sentence: "rükünlerini bilmeliyiz" },
      { turkish: "kılmak", arabic: "إِقَامَة", meaning: "yerine getirmek", sentence: "namaz kılmalıyız" }
    ],
    "5 vakit namaz": [
      { turkish: "sabah", arabic: "فَجْر", meaning: "tan vakti", sentence: "sabah namazı vardır" },
      { turkish: "öğle", arabic: "ظُهْر", meaning: "gündüz", sentence: "öğle namazı vardır" },
      { turkish: "ikindi", arabic: "عَصْر", meaning: "öğleden sonra", sentence: "ikindi namazı vardır" },
      { turkish: "akşam", arabic: "مَغْرِب", meaning: "güneş batımı", sentence: "akşam namazı vardır" },
      { turkish: "yatsı", arabic: "عِشَاء", meaning: "gece", sentence: "yatsı namazı vardır" }
    ],
    
    // Genel kelimeler
    default: [
      { turkish: "allah", arabic: "الله", meaning: "yaratıcı", sentence: "allah her şeyi bilir" },
      { turkish: "rahman", arabic: "رحمن", meaning: "çok merhametli", sentence: "allah rahmandir" },
      { turkish: "rahim", arabic: "رحيم", meaning: "merhamet edici", sentence: "allah rahimdir" },
      { turkish: "malik", arabic: "ملك", meaning: "malik", sentence: "allah herşeyin sahibidir" },
      { turkish: "hakim", arabic: "حكيم", meaning: "hikmet sahibi", sentence: "allah hakimdir" }
    ]
  };

  // Ders başlığını normalize et
  const normalizedTitle = lessonTitle.toLowerCase();

  // İlgili kelimeleri bul, yoksa default kullan
  return wordDatabase[normalizedTitle] || wordDatabase.default;
}

function generateOptions(correctAnswer, type) {
  // type: "word" veya "meaning"
  const wordOptions = {
    word: [
      "الله", "محمد", "إيمان", "صلاة", "زكاة", "صوم", "حج", "قرآن",
      "الرحمن", "الرحيم", "الملك", "القدوس", "السلام", "المؤمن", "الكريم", "العليم"
    ],
    meaning: [
      "allah", "peygamber", "melek", "kitap", "ahiret", "kader", "ibadet", "dua",
      "sabır", "şükür", "iman", "islam", "ihsan", "tevhid", "hidayet", "rahmet"
    ]
  };

  const optionPool = type === "word" ? wordOptions.word : wordOptions.meaning;
  const filtered = optionPool.filter(opt => opt !== correctAnswer);

  // 4 yanlış seçenek + 1 doğru = 5 seçenek
  const randomOptions = [];
  for (let i = 0; i < 4 && i < filtered.length; i++) {
    randomOptions.push(filtered[Math.floor(Math.random() * filtered.length)]);
  }

  randomOptions.push(correctAnswer);
  return shuffleArray(randomOptions);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================
// MAIN IMPORT FUNCTION
// ============================================

async function importData() {
  let session = null;

  try {
    console.log('🚀 İman & Ahlak Programı Import Başlıyor...\n');

    // MongoDB bağlantısı
    console.log('📡 MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // Transaction başlat
    session = await mongoose.startSession();
    session.startTransaction();
    console.log('🔄 Transaction başlatıldı\n');

    // İstatistikler
    const stats = {
      totalChapters: 0,
      totalUnits: 0,
      totalLessons: 0,
      totalExercises: 0,
      totalXP: 0
    };

    // 1. LANGUAGE (Program) oluştur
    console.log('📚 Program oluşturuluyor...');
    const languageDoc = new Language(imanAhlakData.programData);
    await languageDoc.save({ session });
    const languageId = languageDoc._id.toString();
    console.log(`✅ Program oluşturuldu: ${languageDoc.name} (ID: ${languageId})\n`);

    // 2. CHAPTERS, UNITS, LESSONS, EXERCISES
    for (let chapterIndex = 0; chapterIndex < imanAhlakData.chapters.length; chapterIndex++) {
      const chapterData = imanAhlakData.chapters[chapterIndex];

      console.log(`📖 Bölüm ${chapterData.order}: ${chapterData.title}`);

      // Chapter oluştur
      const chapterDoc = new Chapter({
        languageId,
        ...chapterData,
        units: undefined // units'i çıkar
      });
      await chapterDoc.save({ session });
      const chapterId = chapterDoc._id.toString();
      stats.totalChapters++;

      console.log(`   ✅ Bölüm oluşturuldu (ID: ${chapterId})`);

      // UNITS
      for (const unitData of chapterData.units) {
        const unitDoc = new Unit({
          chapterId,
          languageId,
          ...unitData,
          lessons: undefined
        });
        await unitDoc.save({ session });
        const unitId = unitDoc._id.toString();
        stats.totalUnits++;

        console.log(`   📂 Ünite: ${unitData.title} (${unitData.lessons.length} ders)`);

        // LESSONS
        for (const lessonData of unitData.lessons) {
          const lessonDoc = new Lesson({
            unitId,
            chapterId,
            languageId,
            ...lessonData,
            isPremium: chapterData.isPremium
          });
          await lessonDoc.save({ session });
          const lessonId = lessonDoc._id.toString();
          stats.totalLessons++;
          stats.totalXP += lessonData.xpReward;

          console.log(`      📝 Ders: ${lessonData.title} (${lessonData.xpReward} XP)`);

          // EXERCISES - Generate programmatically
          const exercises = generateExercisesForLesson(
            lessonData.title,
            lessonData.order,
            chapterIndex,
            unitData.order - 1
          );

          for (const exerciseData of exercises) {
            const exerciseDoc = new Exercise({
              lessonId,
              unitId,
              chapterId,
              languageId,
              ...exerciseData
            });
            await exerciseDoc.save({ session });
            stats.totalExercises++;
          }

          console.log(`         ✅ ${exercises.length} egzersiz eklendi`);
        }
      }

      console.log();
    }

    // Transaction commit
    await session.commitTransaction();
    console.log('✅ Transaction commit edildi\n');

    // BAŞARILI SONUÇ
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 İMPORT BAŞARILI! 🎉');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📚 Program: iman & ahlak (ID: ${languageId})`);
    console.log(`📖 Bölüm: ${stats.totalChapters}`);
    console.log(`📂 Ünite: ${stats.totalUnits}`);
    console.log(`📝 Ders: ${stats.totalLessons}`);
    console.log(`🎯 Egzersiz: ${stats.totalExercises}`);
    console.log(`⭐ Toplam XP: ${stats.totalXP}`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    // Hata durumunda rollback
    if (session) {
      await session.abortTransaction();
      console.log('❌ Transaction geri alındı (rollback)\n');
    }

    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ HATA OLUŞTU!');
    console.error('═══════════════════════════════════════════════════════');
    console.error(error);
    console.error('═══════════════════════════════════════════════════════\n');

  } finally {
    if (session) {
      session.endSession();
    }
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

// RUN
importData();
