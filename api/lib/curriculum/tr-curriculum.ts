type LanguageCategory =
  | "faith_morality"
  | "quran_arabic"
  | "math_logic"
  | "science_discovery"
  | "language_learning"
  | "mental_spiritual"
  | "personal_social";

type MoralValue =
  | "patience"
  | "gratitude"
  | "kindness"
  | "honesty"
  | "sharing"
  | "mercy"
  | "justice"
  | "respect";

type ThemeAgeGroup = "kids_2-6" | "kids_7-12";

type DifficultyLevel = "beginner" | "intermediate";
type ContentType = "lesson" | "story" | "game" | "meditation" | "quiz" | "activity";
type MiniGameType = "match" | "quiz" | "puzzle" | "story" | "breathing";
type TeachingPhase = "teach" | "practice" | "assess";

type ExerciseType =
  | "education_visual"
  | "education_tip"
  | "select"
  | "arrange"
  | "match";

type ExerciseComponentType =
  | "learning_card"
  | "moral_story"
  | "multiple_choice"
  | "matching_board"
  | "arrange_builder"
  | "puzzle_board"
  | "focus_breathing";

type AgeTrack = {
  key: ThemeAgeGroup;
  label: string;
  difficulty: DifficultyLevel;
  baseXp: number;
  baseValuePoints: number;
};

type AgePedagogyProfile = {
  focus: string;
  competencies: string[];
  topics: string[];
  storySeed: string;
};

type CategoryPlan = {
  key: string;
  title: string;
  flag: string;
  category: LanguageCategory;
  islamicContent: boolean;
  moralValues: MoralValue[];
  contentType: ContentType;
  miniGameType: MiniGameType;
  pedagogicProfiles: Record<ThemeAgeGroup, AgePedagogyProfile>;
};

type LevelDefinition = {
  code: "mekke-1" | "medine-2" | "kudus-3";
  title: string;
  subtitle: string;
  isPremium: boolean;
  progressionWeight: number;
};

type ExerciseBlueprint = {
  type: ExerciseType;
  componentType: ExerciseComponentType;
  moralValue: MoralValue;
  valuePoints: number;
  questionPreview: string;
  instruction: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  correctAnswer: string[];
  options: string[];
  isNewWord: boolean;
  audioUrl: string;
  neutralAnswerImage: string;
  badAnswerImage: string;
  correctAnswerImage: string;
  order: number;
  educationContent?: Record<string, unknown> | null;
};

type LessonBlueprint = {
  title: string;
  description: string;
  isPremium: boolean;
  isTest: boolean;
  isActive: boolean;
  xpReward: number;
  valuePointsReward: number;
  teachingPhase: TeachingPhase;
  moralValue: MoralValue;
  pedagogyFocus: string;
  moralStory: {
    title: string;
    text: string;
    placement: "pre_lesson" | "mid_lesson" | "post_lesson";
  };
  imageUrl: string;
  order: number;
  exercises: ExerciseBlueprint[];
};

type UnitBlueprint = {
  title: string;
  description: string;
  isPremium: boolean;
  isExpanded: boolean;
  imageUrl: string;
  isActive: boolean;
  order: number;
  color: string;
  lessons: LessonBlueprint[];
};

type ChapterBlueprint = {
  title: string;
  description: string;
  isPremium: boolean;
  isExpanded: boolean;
  imageUrl: string;
  order: number;
  isActive: boolean;
  contentType: ContentType;
  moralLesson: {
    value: MoralValue;
    title: string;
    storyText: string;
    displayTiming: "post_lesson";
  };
  miniGame: {
    type: MiniGameType;
    config: Record<string, unknown>;
  };
  units: UnitBlueprint[];
};

export type TrCurriculumProgramBlueprint = {
  key: string;
  locale: "tr";
  language: {
    name: string;
    nativeName: string;
    flag: string;
    baseLanguage: "tr";
    imageUrl: string;
    isActive: true;
    category: LanguageCategory;
    themeMetadata: {
      islamicContent: boolean;
      ageGroup: ThemeAgeGroup;
      moralValues: MoralValue[];
      educationalFocus: string;
      difficultyLevel: DifficultyLevel;
    };
  };
  chapters: ChapterBlueprint[];
};

const PLACEHOLDER_IMAGE = "https://cdn-icons-png.flaticon.com/512/3135/3135755.png";

const AGE_TRACKS: AgeTrack[] = [
  {
    key: "kids_2-6",
    label: "2-6 Yaş",
    difficulty: "beginner",
    baseXp: 16,
    baseValuePoints: 2,
  },
  {
    key: "kids_7-12",
    label: "7-12 Yaş",
    difficulty: "intermediate",
    baseXp: 26,
    baseValuePoints: 4,
  },
];

const LEVELS: LevelDefinition[] = [
  {
    code: "mekke-1",
    title: "Mekke Seviye 1",
    subtitle: "Temel kavramları öğrenme ve güvenli başlangıç",
    isPremium: false,
    progressionWeight: 0,
  },
  {
    code: "medine-2",
    title: "Medine Seviye 2",
    subtitle: "Kavramları günlük yaşama uygulama ve sorumluluk",
    isPremium: false,
    progressionWeight: 1,
  },
  {
    code: "kudus-3",
    title: "Kudüs Seviye 3",
    subtitle: "Ustalık, problem çözme ve değer liderliği",
    isPremium: true,
    progressionWeight: 2,
  },
];

const UNIT_TEMPLATES = [
  "Konu Öğretimi",
  "Rehberli Egzersiz",
  "Ödüllü Test Parkuru",
] as const;

const PHASE_DEFS: Array<{
  phase: TeachingPhase;
  title: string;
  isTest: boolean;
  xpMultiplier: number;
  valuePointMultiplier: number;
}> = [
  {
    phase: "teach",
    title: "Öğretim",
    isTest: false,
    xpMultiplier: 1,
    valuePointMultiplier: 1,
  },
  {
    phase: "practice",
    title: "Alıştırma",
    isTest: false,
    xpMultiplier: 1.35,
    valuePointMultiplier: 1.4,
  },
  {
    phase: "assess",
    title: "Değerlendirme",
    isTest: true,
    xpMultiplier: 1.8,
    valuePointMultiplier: 2,
  },
];

const CATEGORY_PLANS: CategoryPlan[] = [
  {
    key: "iman-ahlak",
    title: "İman & Ahlak",
    flag: "🕋",
    category: "faith_morality",
    islamicContent: true,
    moralValues: ["honesty", "patience", "respect"],
    contentType: "lesson",
    miniGameType: "quiz",
    pedagogicProfiles: {
      "kids_2-6": {
        focus:
          "Temel iman kavramlarını sevgi diliyle öğretme, adab davranışlarını günlük hayata adım adım yerleştirme",
        competencies: [
          "doğru-yanlış ayırt etme",
          "iyi davranışı taklit etme",
          "dua-adab rutinleri",
        ],
        topics: [
          "Allah'ı tanıma ve sevme",
          "Peygamber sevgisi",
          "Doğru söz ve dürüstlük",
          "Sözünde durma",
          "Paylaşma ve yardımlaşma",
          "Ahlak-adab kuralları",
          "Sabır oyunu",
          "Şükür alışkanlığı",
          "Günlük iyilik görevi",
        ],
        storySeed: "Kalbi temiz tutan çocuk",
      },
      "kids_7-12": {
        focus:
          "İman esaslarını bilinçli düşünmeyle pekiştirme, ahlaki karar alma ve adab sorumluluğunu güçlendirme",
        competencies: [
          "ahlaki ikilem çözme",
          "davranışın sonucu üzerine düşünme",
          "öz değerlendirme",
        ],
        topics: [
          "İman ve sorumluluk",
          "Emanet bilinci",
          "Dürüstlüğün bedeli",
          "Adaletli karar verme",
          "Öfke yönetimi ve sabır",
          "Gıybetten korunma adabı",
          "Kul hakkı",
          "Merhamet-adalet dengesi",
          "Liderlikte ahlak ve adab",
        ],
        storySeed: "Zor durumda doğruyu seçen öğrenci",
      },
    },
  },
  {
    key: "kuran-arapca",
    title: "Kur'an & Arapça",
    flag: "📖",
    category: "quran_arabic",
    islamicContent: true,
    moralValues: ["respect", "gratitude", "patience"],
    contentType: "lesson",
    miniGameType: "match",
    pedagogicProfiles: {
      "kids_2-6": {
        focus:
          "Kur'an eğitimini harf tanıma, kısa sure farkındalığı ve mushaf adabı ile temelden başlatma",
        competencies: [
          "harf tanıma",
          "harf-kelime eşleştirme",
          "tekrarlı okuma",
        ],
        topics: [
          "Elif-Ba harfleri",
          "Harf şekli eşleştirme",
          "Kısa dua ezberi",
          "Fatiha kelimeleri",
          "Kur'an'a saygı",
          "Tecvide ilk adım",
          "Arapça temel kelimeler",
          "Dua cümleleri",
          "Anlamı hissetme",
        ],
        storySeed: "Mushafı özenle tutan çocuk",
      },
      "kids_7-12": {
        focus:
          "Tecvid, sure-anlam bağı ve temel Arapça kalıplarla Kur'an okumayı bilinçli hale getirme",
        competencies: [
          "mahreç farkındalığı",
          "anlam bağlantısı kurma",
          "tekrarlı ezber planı",
        ],
        topics: [
          "Tecvid uygulaması",
          "Mahreç çalışması",
          "Sure anlam haritası",
          "Arapça kök mantığı",
          "Sarf kalıpları",
          "Ayetten ders çıkarma",
          "Ezber stratejileri",
          "Dua ve zikir dili",
          "Kur'an ile günlük hayat bağlantısı",
        ],
        storySeed: "Düzenli ezber ile ilerleyen öğrenci",
      },
    },
  },
  {
    key: "matematik-mantik",
    title: "Matematik & Mantık",
    flag: "➗",
    category: "math_logic",
    islamicContent: false,
    moralValues: ["patience", "honesty", "justice"],
    contentType: "lesson",
    miniGameType: "puzzle",
    pedagogicProfiles: {
      "kids_2-6": {
        focus:
          "Sayı hissi ve mantık kurma becerisini oyunlaştırılmış etkinlikler ve seviyeli puzzle görevleriyle geliştirme",
        competencies: [
          "örüntü kurma",
          "adım adım düşünme",
          "hata fark etme",
        ],
        topics: [
          "Sayı avı",
          "Toplama oyunu",
          "Çıkarma hikayesi",
          "Şekil bulmacası",
          "Örüntü trenleri",
          "Günlük matematik",
          "Mantık kapısı",
          "Mini puzzle yarışı",
          "Matematik mini görevi",
        ],
        storySeed: "Sabırla tamamlanan bulmaca",
      },
      "kids_7-12": {
        focus:
          "Çok adımlı problem çözme ve stratejik düşünmeyi yarışma formatlı görevler ile güçlendirme",
        competencies: [
          "problem stratejisi seçme",
          "kanıtlayarak çözümleme",
          "zaman yönetimi",
        ],
        topics: [
          "Çok adımlı problemler",
          "Kesir atölyesi",
          "Oran-orantı",
          "Veri grafiği okuma",
          "Mantık bulmacaları",
          "Strateji oyunu",
          "Puzzle ligi",
          "Hız-doğruluk dengesi",
          "Matematik yarışması",
        ],
        storySeed: "Plan yaparak yarış kazanan ekip",
      },
    },
  },
  {
    key: "bilim-kesif",
    title: "Bilim & Keşif",
    flag: "🔬",
    category: "science_discovery",
    islamicContent: false,
    moralValues: ["gratitude", "respect", "mercy"],
    contentType: "activity",
    miniGameType: "quiz",
    pedagogicProfiles: {
      "kids_2-6": {
        focus:
          "Fen-doğa merakını gözlem ve basit deneylerle besleyip neden-sonuç düşünmesini adım adım kurma",
        competencies: [
          "gözlem notu alma",
          "neden-sonuç kurma",
          "soru sorma",
        ],
        topics: [
          "Beş duyu keşfi",
          "Canlı-cansız",
          "Mevsim deneyi",
          "Su döngüsü oyunu",
          "Bitki gözlemi",
          "Hayvan dünyası",
          "Geri dönüşüm kutusu",
          "Gökyüzü takibi",
          "Fen-doğa hikayesi",
        ],
        storySeed: "Doğayı koruyan minik kaşif",
      },
      "kids_7-12": {
        focus:
          "Bilimsel yöntemi hipotez, deney ve raporlama zinciriyle uygulamalı öğreterek keşif becerisini artırma",
        competencies: [
          "hipotez yazma",
          "ölçüm yapma",
          "deney raporu hazırlama",
        ],
        topics: [
          "Bilimsel yöntem",
          "Enerji dönüşümü",
          "Ekosistem dengesi",
          "Basit makineler",
          "Basınç ve kuvvet",
          "Uzay keşfi",
          "Fen deneyi raporu",
          "Doğa koruma projesi",
          "Bilim turnuvası",
        ],
        storySeed: "Deneyde dürüst kalan genç bilimci",
      },
    },
  },
  {
    key: "dil-ogrenimi",
    title: "Dil Öğrenimi",
    flag: "🌍",
    category: "language_learning",
    islamicContent: false,
    moralValues: ["sharing", "honesty", "respect"],
    contentType: "lesson",
    miniGameType: "match",
    pedagogicProfiles: {
      "kids_2-6": {
        focus:
          "Türkçe temeli ve kavram çevirilerini görsel kartlarla öğreterek kısa cümle kurmaya geçiş sağlama",
        competencies: [
          "kelime tanıma",
          "kavram eşleştirme",
          "basit cümle kurma",
        ],
        topics: [
          "Türkçe sesler",
          "Kavram kartları (TR-EN)",
          "Selamlaşma kalıpları",
          "Renkler ve sayılar",
          "Aile kelimeleri",
          "Kitap okuma saati",
          "Kısa hikaye tamamlama",
          "Görselden cümle kurma",
          "Dil oyunu",
        ],
        storySeed: "Yeni arkadaşına güzel konuşan çocuk",
      },
      "kids_7-12": {
        focus:
          "Türkçe okuma-anlama, kavram çevirisi ve diyalog kurma becerilerini görev tabanlı ders akışıyla geliştirme",
        competencies: [
          "metin anlama",
          "doğru çeviri seçme",
          "ifade akıcılığı",
        ],
        topics: [
          "Türkçe okuma-anlama",
          "İngilizce kavram çevirisi",
          "Diyalog kurma",
          "Deyim atölyesi",
          "Metin özetleme",
          "Kitap kulübü",
          "Yazma görevi",
          "Sunum dili",
          "Dil yarışması",
        ],
        storySeed: "Farklı dilleri saygıyla kullanan lider",
      },
    },
  },
  {
    key: "zihinsel-ruhsal-gelisim",
    title: "Zihinsel & Ruhsal Gelişim",
    flag: "🧠",
    category: "mental_spiritual",
    islamicContent: true,
    moralValues: ["patience", "gratitude", "mercy"],
    contentType: "meditation",
    miniGameType: "breathing",
    pedagogicProfiles: {
      "kids_2-6": {
        focus:
          "Duygu düzenleme ve nefes farkındalığını yaşa uygun kısa rutinlerle öğreterek sakin kalma becerisi kazandırma",
        competencies: [
          "duyguyu isimlendirme",
          "nefes ritmi kurma",
          "kendini sakinleştirme",
        ],
        topics: [
          "Duygumu tanıyorum",
          "3 nefes rutini",
          "Şükür molası",
          "Odaklanma oyunu",
          "Sakinleşme köşesi",
          "Şefkat cümleleri",
          "Beden farkındalığı",
          "Uyku öncesi dua",
          "Duygu hikayesi",
        ],
        storySeed: "Nefes alıp sakin kalan çocuk",
      },
      "kids_7-12": {
        focus:
          "Stres yönetimi, odak ve ruhsal dengeyi öz-farkındalık araçlarıyla adım adım geliştirme",
        competencies: [
          "stres tetikleyici analizi",
          "odak döngüsü yönetimi",
          "öz şefkat geliştirme",
        ],
        topics: [
          "Stres haritası",
          "Nefes ve odak protokolü",
          "Düşünce günlüğü",
          "Dijital denge",
          "Öfke yönetimi",
          "Şükür defteri",
          "Öz-şefkat atölyesi",
          "Hedef belirleme",
          "Ruhsal dayanıklılık",
        ],
        storySeed: "Krizde soğukkanlı kalan genç",
      },
    },
  },
  {
    key: "kisisel-sosyal-gelisim",
    title: "Kişisel & Sosyal Gelişim",
    flag: "🤝",
    category: "personal_social",
    islamicContent: false,
    moralValues: ["sharing", "justice", "respect"],
    contentType: "activity",
    miniGameType: "story",
    pedagogicProfiles: {
      "kids_2-6": {
        focus:
          "Sorumluluk, iletişim ve aile destekli günlük aktivite alışkanlığını oyunlaştırılmış görevlerle öğretme",
        competencies: [
          "sıra bekleme",
          "grup içi konuşma",
          "yardım isteme-verme",
        ],
        topics: [
          "Günlük aktivite planı (veli kontrollü)",
          "Arkadaşlık kuralları",
          "Sıra bekleme oyunu",
          "Ev sorumluluğu",
          "Temizlik adabı",
          "Teşekkür-özür",
          "Takım oyunu",
          "Çizgifilmden ders",
          "Mini yarışma",
        ],
        storySeed: "Takımına destek olan minik lider",
      },
      "kids_7-12": {
        focus:
          "İletişim becerisi, toplumsal sorumluluk ve oyun-yarışma yönetimini görev temelli akışta geliştirme",
        competencies: [
          "aktif dinleme",
          "çatışma çözümü",
          "görev dağılımı",
        ],
        topics: [
          "Veli kontrollü görev takibi",
          "Etkili iletişim",
          "Çatışma çözümü",
          "Toplum hizmeti",
          "Zaman yönetimi",
          "Dijital nezaket",
          "Yarışmalar ve oyunlar",
          "Proje sunumu",
          "Sosyal liderlik",
        ],
        storySeed: "Ekip ruhuyla başarıya ulaşan grup",
      },
    },
  },
];

const UNIT_COLOR_BY_CATEGORY: Record<LanguageCategory, string> = {
  faith_morality: "bg-[#16a34a]",
  quran_arabic: "bg-[#0f766e]",
  math_logic: "bg-[#1d4ed8]",
  science_discovery: "bg-[#0369a1]",
  language_learning: "bg-[#7c3aed]",
  mental_spiritual: "bg-[#4d7c0f]",
  personal_social: "bg-[#be185d]",
};

const moralCycle = (values: MoralValue[], index: number): MoralValue =>
  values[index % values.length] || "kindness";

const unitTopic = (
  profile: AgePedagogyProfile,
  levelIndex: number,
  unitIndex: number
): string => {
  const idx = levelIndex * UNIT_TEMPLATES.length + unitIndex;
  return profile.topics[idx] || profile.topics[idx % profile.topics.length] || "Temel Konu";
};

const competencyByIndex = (profile: AgePedagogyProfile, index: number): string =>
  profile.competencies[index % profile.competencies.length] || "adım adım öğrenme";

const createShuffledSteps = (steps: string[]) => [...steps].reverse();

const joinSteps = (steps: string[]) => steps.join(" > ");

const buildTopicScenario = (params: {
  category: LanguageCategory;
  topic: string;
  ageTrack: AgeTrack;
}) => {
  const { category, topic, ageTrack } = params;
  const isYounger = ageTrack.key === "kids_2-6";

  switch (category) {
    case "faith_morality":
      return {
        learnNarrative: `${topic} dersinde çocuk, günlük hayatta nasıl adablı davranacağını örnek olaylarla öğrenir.`,
        moralReminder: "Sabır, dürüstlük ve saygı; davranışın kalitesini belirler.",
        teachPrompt: `${topic} için hangi davranış doğrudur?`,
        teachCorrect: "Nazik konuşup doğruyu söylemek",
        teachOptions: [
          "Nazik konuşup doğruyu söylemek",
          "Söz keserek konuşmak",
          "Hata yapınca yalan söylemek",
          "Sorumluluktan kaçmak",
        ],
        matchCorrect: "Sabır:Sırasını bekler",
        matchOptions: [
          "Sabır:Sırasını bekler",
          "Sabır:Öne geçer",
          "Dürüstlük:Yalan söyler",
          "Saygı:Alay eder",
        ],
        practicePrompt: `${topic} dersinden sonra hangi uygulama görevi uygundur?`,
        practiceCorrect: "Bir iyilik yapıp ailemle paylaşmak",
        practiceOptions: [
          "Bir iyilik yapıp ailemle paylaşmak",
          "Kuralları görmezden gelmek",
          "Arkadaşını küçümsemek",
          "Ödevi ertelemek",
        ],
        practiceSteps: ["Durumu fark et", "Doğru adabı seç", "Uygula ve değerlendir"],
        assessPrompt: `${topic} testinde en doğru karar hangisi?`,
        assessCorrect: "Hakkı gözetip adil davranmak",
        assessOptions: [
          "Hakkı gözetip adil davranmak",
          "Kolay olanı seçmek",
          "Başkalarını suçlamak",
          "Sorumluluk almamak",
        ],
        assessSteps: ["Durumu anla", "Ahlaki ilkeyi belirle", "Kararı uygula"],
      };

    case "quran_arabic":
      return {
        learnNarrative: `${topic} dersinde Kur'an adabı, harf bilgisi ve anlam ilişkisi yaşa uygun etkinliklerle öğretilir.`,
        moralReminder: "Kur'an eğitiminde saygı, düzenli tekrar ve sabır birlikte yürür.",
        teachPrompt: `${topic} çalışırken hangi davranış uygundur?`,
        teachCorrect: "Mushafı saygıyla tutup dikkatle okumak",
        teachOptions: [
          "Mushafı saygıyla tutup dikkatle okumak",
          "Dersi aceleyle geçmek",
          "Kuralları karıştırmak",
          "Odaklanmadan okumak",
        ],
        matchCorrect: "Elif:Açık harf",
        matchOptions: [
          "Elif:Açık harf",
          "Elif:Kapalı hece",
          "Tecvid:Hızlı geçiş",
          "Adab:Saygısız tutuş",
        ],
        practicePrompt: `${topic} için en doğru pekiştirme görevi hangisidir?`,
        practiceCorrect: "Harfi tanıyıp örnek kelimede uygulamak",
        practiceOptions: [
          "Harfi tanıyıp örnek kelimede uygulamak",
          "Anlamı atlayıp ezberlemek",
          "Kuralları karıştırmak",
          "Sadece sonuca bakmak",
        ],
        practiceSteps: ["Niyet et", "Harfi/kelimeyi tanı", "Anlamla tekrar et"],
        assessPrompt: `${topic} ödüllü testinde doğru yaklaşım nedir?`,
        assessCorrect: "Tecvide dikkat edip anlamı düşünmek",
        assessOptions: [
          "Tecvide dikkat edip anlamı düşünmek",
          "Harfleri karıştırmak",
          "Kuralları görmezden gelmek",
          "Sadece hızlı okumak",
        ],
        assessSteps: ["Kuralı hatırla", "Doğru okumayı uygula", "Anlamı kontrol et"],
      };

    case "math_logic":
      return {
        learnNarrative: `${topic} dersinde çocuk problemi adım adım çözmeyi ve puzzle mantığıyla düşünmeyi öğrenir.`,
        moralReminder: "Matematikte sabır ve doğruluk, hızdan daha değerlidir.",
        teachPrompt: `${topic} için ilk doğru adım hangisidir?`,
        teachCorrect: "Verilen bilgileri dikkatle belirlemek",
        teachOptions: [
          "Verilen bilgileri dikkatle belirlemek",
          "Sonucu tahmin edip geçmek",
          "Adımları atlamak",
          "Kontrol etmeden bitirmek",
        ],
        matchCorrect: "Toplama:Birleştirme",
        matchOptions: [
          "Toplama:Birleştirme",
          "Toplama:Ayırma",
          "Çıkarma:Biriktirme",
          "Puzzle:Rastgele seçim",
        ],
        practicePrompt: `${topic} uygulamasında en doğru strateji nedir?`,
        practiceCorrect: "Problemi okuyup uygun işlemi seçmek",
        practiceOptions: [
          "Problemi okuyup uygun işlemi seçmek",
          "Veriyi görmeden işlem yapmak",
          "Sadece hızlanmaya odaklanmak",
          "Kontrol adımını atlamak",
        ],
        practiceSteps: ["Problemi oku", "İşlem stratejisini seç", "Cevabı kontrol et"],
        assessPrompt: `${topic} yarışma testinde doğru yaklaşım hangisi?`,
        assessCorrect: "Adımları doğru sırayla yürütmek",
        assessOptions: [
          "Adımları doğru sırayla yürütmek",
          "Rastgele işlem seçmek",
          "Veriyi ihmal etmek",
          "Kontrolü atlamak",
        ],
        assessSteps: ["Analiz et", "Çözümü uygula", "Doğruluğu kanıtla"],
      };

    case "science_discovery":
      return {
        learnNarrative: `${topic} dersinde fen-doğa konusu gözlem ve keşif etkinlikleriyle öğretilir.`,
        moralReminder: "Bilimde dürüst gözlem ve doğaya saygı en temel ilkedir.",
        teachPrompt: `${topic} için bilimsel başlangıç adımı nedir?`,
        teachCorrect: "Önce dikkatli gözlem yapmak",
        teachOptions: [
          "Önce dikkatli gözlem yapmak",
          "Sonucu baştan söylemek",
          "Veri toplamadan karar vermek",
          "Deneyi yarım bırakmak",
        ],
        matchCorrect: "Gözlem:Kanıt toplama",
        matchOptions: [
          "Gözlem:Kanıt toplama",
          "Gözlem:Tahmini sonuç",
          "Deney:Rastgele adım",
          "Doğa:Özensiz kullanım",
        ],
        practicePrompt: `${topic} uygulamasında hangi yöntem doğrudur?`,
        practiceCorrect: "Soru sorup deney sonucunu not etmek",
        practiceOptions: [
          "Soru sorup deney sonucunu not etmek",
          "Not almadan geçmek",
          "Ölçüm yapmadan yorumlamak",
          "Adımları karıştırmak",
        ],
        practiceSteps: ["Soru sor", "Deneyi uygula", "Sonucu kaydet"],
        assessPrompt: `${topic} testinde doğru bilimsel tutum hangisi?`,
        assessCorrect: "Kanıta dayanarak sonuç yazmak",
        assessOptions: [
          "Kanıta dayanarak sonuç yazmak",
          "Tahmine göre karar vermek",
          "Karşılaştırma yapmamak",
          "Doğrulamayı atlamak",
        ],
        assessSteps: ["Hipotez kur", "Kanıtı incele", "Sonucu raporla"],
      };

    case "language_learning":
      return {
        learnNarrative: `${topic} dersinde kelime-kavram ilişkisi, Türkçe okuma ve çeviri odaklı olarak öğretilir.`,
        moralReminder: "Dil öğrenirken saygılı iletişim ve doğru ifade temel değerdir.",
        teachPrompt: `${topic} için en doğru öğrenme davranışı hangisidir?`,
        teachCorrect: "Kelimeyi anlamıyla eşleştirip cümlede kullanmak",
        teachOptions: [
          "Kelimeyi anlamıyla eşleştirip cümlede kullanmak",
          "Anlamı kontrol etmeden ezberlemek",
          "Cümlede rastgele kullanmak",
          "Dersi tekrarsız bırakmak",
        ],
        matchCorrect: "Merhaba:Hello",
        matchOptions: [
          "Merhaba:Hello",
          "Teşekkür:Goodbye",
          "Kitap:Apple",
          "Aile:Blue",
        ],
        practicePrompt: `${topic} egzersizinde doğru görev hangisi?`,
        practiceCorrect: "Kavramı doğru çevirip kısa cümle yazmak",
        practiceOptions: [
          "Kavramı doğru çevirip kısa cümle yazmak",
          "Çeviriyi tahminle işaretlemek",
          "Cümleyi yarım bırakmak",
          "Kelimeleri karıştırmak",
        ],
        practiceSteps: ["Kelimeyi oku", "Anlamı seç", "Cümlede kullan"],
        assessPrompt: `${topic} ödüllü testinde hangi yanıt doğrudur?`,
        assessCorrect: "Anlama uygun çeviriyi seçmek",
        assessOptions: [
          "Anlama uygun çeviriyi seçmek",
          "Benzer ama yanlış çeviri",
          "Eksik çeviri",
          "Bağlam dışı ifade",
        ],
        assessSteps: ["Metni oku", "Kavramı eşleştir", "Cevabı kontrol et"],
      };

    case "mental_spiritual":
      return {
        learnNarrative: `${topic} dersinde çocuk duygusunu fark eder, nefes rutini uygular ve sakin karar verir.`,
        moralReminder: "Odaklanma ve nefes egzersizi, sabır ve merhamet değerlerini güçlendirir.",
        teachPrompt: `${topic} sırasında en doğru adım hangisidir?`,
        teachCorrect: isYounger
          ? "3 sakin nefes alıp duygunu söylemek"
          : "Nefes döngüsüyle duyguyu düzenlemek",
        teachOptions: [
          isYounger
            ? "3 sakin nefes alıp duygunu söylemek"
            : "Nefes döngüsüyle duyguyu düzenlemek",
          "Duyguyu bastırıp devam etmek",
          "Acele karar vermek",
          "Odaklanmadan geçmek",
        ],
        matchCorrect: "Kaygı:Derin nefes",
        matchOptions: [
          "Kaygı:Derin nefes",
          "Öfke:Bağırmak",
          "Üzüntü:İçe kapanmak",
          "Stres:Rastgele tepki",
        ],
        practicePrompt: `${topic} alıştırmasında en etkili yöntem hangisi?`,
        practiceCorrect: "Duyguyu adlandırıp nefes planı uygulamak",
        practiceOptions: [
          "Duyguyu adlandırıp nefes planı uygulamak",
          "Plan yapmadan tepki vermek",
          "Mola vermeden devam etmek",
          "Kendini suçlamak",
        ],
        practiceSteps: ["Duyguyu fark et", "Nefes döngüsünü uygula", "Sakin karar ver"],
        assessPrompt: `${topic} değerlendirmesinde doğru tutum hangisi?`,
        assessCorrect: "Odaklanıp kontrollü tepki vermek",
        assessOptions: [
          "Odaklanıp kontrollü tepki vermek",
          "Düşünmeden tepki vermek",
          "Durumu yok saymak",
          "Süreci yarım bırakmak",
        ],
        assessSteps: ["Durumu değerlendir", "Nefes ile dengele", "Uygun kararı ver"],
      };

    case "personal_social":
      return {
        learnNarrative: `${topic} dersinde çocuk sosyal durumda doğru iletişim ve sorumluluk adımlarını öğrenir.`,
        moralReminder: "Paylaşma, adalet ve saygı sosyal gelişimin temelidir.",
        teachPrompt: `${topic} için hangi davranış doğru sosyal adımdır?`,
        teachCorrect: "Karşısındakini dinleyip sırayla konuşmak",
        teachOptions: [
          "Karşısındakini dinleyip sırayla konuşmak",
          "Söz kesmek",
          "Kuralları yok saymak",
          "Sorumluluktan kaçmak",
        ],
        matchCorrect: "Paylaşma:Sırayla kullanma",
        matchOptions: [
          "Paylaşma:Sırayla kullanma",
          "Adalet:Kendi lehine karar",
          "Saygı:Alay etme",
          "Takım:Tek başına hareket",
        ],
        practicePrompt: `${topic} görevi için en uygun uygulama hangisi?`,
        practiceCorrect: "Aile/ekip planına göre görevi tamamlamak",
        practiceOptions: [
          "Aile/ekip planına göre görevi tamamlamak",
          "Görevi ertelemek",
          "İletişimi kesmek",
          "Kural dışı davranmak",
        ],
        practiceSteps: ["Durumu dinle", "Empati kur", "Çözümü uygula"],
        assessPrompt: `${topic} ödüllü testinde en doğru seçenek hangisi?`,
        assessCorrect: "Sorumluluğu alıp iş birliği yapmak",
        assessOptions: [
          "Sorumluluğu alıp iş birliği yapmak",
          "Suçu başkasına atmak",
          "Ekibi yok saymak",
          "Görevi yarım bırakmak",
        ],
        assessSteps: ["Görevi planla", "İş birliğini uygula", "Sonucu değerlendir"],
      };
  }
};

const toTeachingExercises = (params: {
  category: LanguageCategory;
  categoryTitle: string;
  topic: string;
  lessonTitle: string;
  moralValue: MoralValue;
  baseValuePoints: number;
  ageTrack: AgeTrack;
}): ExerciseBlueprint[] => {
  const { category, categoryTitle, topic, lessonTitle, moralValue, baseValuePoints, ageTrack } =
    params;
  const scenario = buildTopicScenario({ category, topic, ageTrack });

  return [
    {
      type: "education_visual",
      componentType: "learning_card",
      moralValue,
      valuePoints: baseValuePoints,
      questionPreview: `${topic} öğretim kartı`,
      instruction: "",
      sourceText: "",
      sourceLanguage: "tr",
      targetLanguage: "tr",
      correctAnswer: [],
      options: [],
      isNewWord: false,
      audioUrl: "",
      neutralAnswerImage: PLACEHOLDER_IMAGE,
      badAnswerImage: PLACEHOLDER_IMAGE,
      correctAnswerImage: PLACEHOLDER_IMAGE,
      order: 1,
      educationContent: {
        title: lessonTitle,
        imageUrl: PLACEHOLDER_IMAGE,
        description: `${categoryTitle} kapsamında ${scenario.learnNarrative}`,
      },
    },
    {
      type: "education_tip",
      componentType: "moral_story",
      moralValue,
      valuePoints: baseValuePoints + 1,
      questionPreview: `${topic} değer çıkarımı`,
      instruction: "",
      sourceText: "",
      sourceLanguage: "tr",
      targetLanguage: "tr",
      correctAnswer: [],
      options: [],
      isNewWord: false,
      audioUrl: "",
      neutralAnswerImage: PLACEHOLDER_IMAGE,
      badAnswerImage: PLACEHOLDER_IMAGE,
      correctAnswerImage: PLACEHOLDER_IMAGE,
      order: 2,
      educationContent: {
        tipType: "important",
        title: "Ders Çıkarımı",
        content: scenario.moralReminder,
      },
    },
    {
      type: "select",
      componentType: "multiple_choice",
      moralValue,
      valuePoints: baseValuePoints + 2,
      questionPreview: `${topic} doğru yaklaşım`,
      instruction: scenario.teachPrompt,
      sourceText: topic,
      sourceLanguage: "tr",
      targetLanguage: "tr",
      correctAnswer: [scenario.teachCorrect],
      options: scenario.teachOptions,
      isNewWord: false,
      audioUrl: "",
      neutralAnswerImage: PLACEHOLDER_IMAGE,
      badAnswerImage: PLACEHOLDER_IMAGE,
      correctAnswerImage: PLACEHOLDER_IMAGE,
      order: 3,
    },
    {
      type: "match",
      componentType: "matching_board",
      moralValue,
      valuePoints: baseValuePoints + 3,
      questionPreview: `${topic} eşleştirme`,
      instruction: "Kavram ve sonucu doğru eşleştir.",
      sourceText: `${topic} eşleştirme`,
      sourceLanguage: "tr",
      targetLanguage: "tr",
      correctAnswer: [scenario.matchCorrect],
      options: scenario.matchOptions,
      isNewWord: false,
      audioUrl: "",
      neutralAnswerImage: PLACEHOLDER_IMAGE,
      badAnswerImage: PLACEHOLDER_IMAGE,
      correctAnswerImage: PLACEHOLDER_IMAGE,
      order: 4,
    },
  ];
};

const toPracticeExercises = (params: {
  category: LanguageCategory;
  topic: string;
  moralValue: MoralValue;
  baseValuePoints: number;
  ageTrack: AgeTrack;
}): ExerciseBlueprint[] => {
  const { category, topic, moralValue, baseValuePoints, ageTrack } = params;
  const scenario = buildTopicScenario({ category, topic, ageTrack });
  const isMath = category === "math_logic";
  const isMental = category === "mental_spiritual";

  return [
    {
      type: "education_tip",
      componentType: isMental ? "focus_breathing" : "learning_card",
      moralValue,
      valuePoints: baseValuePoints,
      questionPreview: `${topic} rehberli tekrar`,
      instruction: "",
      sourceText: "",
      sourceLanguage: "tr",
      targetLanguage: "tr",
      correctAnswer: [],
      options: [],
      isNewWord: false,
      audioUrl: "",
      neutralAnswerImage: PLACEHOLDER_IMAGE,
      badAnswerImage: PLACEHOLDER_IMAGE,
      correctAnswerImage: PLACEHOLDER_IMAGE,
      order: 1,
      educationContent: {
        tipType: "practice",
        title: "Rehberli Alıştırma",
        content: scenario.practicePrompt,
      },
    },
    {
      type: "arrange",
      componentType: isMath ? "puzzle_board" : "arrange_builder",
      moralValue,
      valuePoints: baseValuePoints + 2,
      questionPreview: `${topic} adım sıralama`,
      instruction: "Adımları doğru sıraya yerleştir.",
      sourceText: `${topic} adımları`,
      sourceLanguage: "tr",
      targetLanguage: "tr",
      correctAnswer: [joinSteps(scenario.practiceSteps)],
      options: createShuffledSteps(scenario.practiceSteps),
      isNewWord: false,
      audioUrl: "",
      neutralAnswerImage: PLACEHOLDER_IMAGE,
      badAnswerImage: PLACEHOLDER_IMAGE,
      correctAnswerImage: PLACEHOLDER_IMAGE,
      order: 2,
    },
    {
      type: "select",
      componentType: "multiple_choice",
      moralValue,
      valuePoints: baseValuePoints + 3,
      questionPreview: `${topic} uygulama sorusu`,
      instruction: scenario.practicePrompt,
      sourceText: `${topic} uygulama`,
      sourceLanguage: "tr",
      targetLanguage: "tr",
      correctAnswer: [scenario.practiceCorrect],
      options: scenario.practiceOptions,
      isNewWord: false,
      audioUrl: "",
      neutralAnswerImage: PLACEHOLDER_IMAGE,
      badAnswerImage: PLACEHOLDER_IMAGE,
      correctAnswerImage: PLACEHOLDER_IMAGE,
      order: 3,
    },
    {
      type: "match",
      componentType: "matching_board",
      moralValue,
      valuePoints: baseValuePoints + 3,
      questionPreview: `${topic} görev eşleştirme`,
      instruction: "Doğru görevi doğru sonuçla eşleştir.",
      sourceText: `${topic} görev`,
      sourceLanguage: "tr",
      targetLanguage: "tr",
      correctAnswer: [scenario.matchCorrect],
      options: scenario.matchOptions,
      isNewWord: false,
      audioUrl: "",
      neutralAnswerImage: PLACEHOLDER_IMAGE,
      badAnswerImage: PLACEHOLDER_IMAGE,
      correctAnswerImage: PLACEHOLDER_IMAGE,
      order: 4,
    },
  ];
};

const toAssessExercises = (params: {
  category: LanguageCategory;
  topic: string;
  moralValue: MoralValue;
  baseValuePoints: number;
  ageTrack: AgeTrack;
}): ExerciseBlueprint[] => {
  const { category, topic, moralValue, baseValuePoints, ageTrack } = params;
  const scenario = buildTopicScenario({ category, topic, ageTrack });
  const isMath = category === "math_logic";

  return [
    {
      type: "education_tip",
      componentType: "moral_story",
      moralValue,
      valuePoints: baseValuePoints,
      questionPreview: `${topic} test hatırlatması`,
      instruction: "",
      sourceText: "",
      sourceLanguage: "tr",
      targetLanguage: "tr",
      correctAnswer: [],
      options: [],
      isNewWord: false,
      audioUrl: "",
      neutralAnswerImage: PLACEHOLDER_IMAGE,
      badAnswerImage: PLACEHOLDER_IMAGE,
      correctAnswerImage: PLACEHOLDER_IMAGE,
      order: 1,
      educationContent: {
        tipType: "reward",
        title: "Ödüllü Test",
        content:
          "Bu testten kazanacağın XP ve Değer Puanı, Tulu Kitap ödül havuzuna katkı sağlar.",
      },
    },
    {
      type: "select",
      componentType: "multiple_choice",
      moralValue,
      valuePoints: baseValuePoints + 3,
      questionPreview: `${topic} seviye sorusu`,
      instruction: scenario.assessPrompt,
      sourceText: `${topic} test`,
      sourceLanguage: "tr",
      targetLanguage: "tr",
      correctAnswer: [scenario.assessCorrect],
      options: scenario.assessOptions,
      isNewWord: false,
      audioUrl: "",
      neutralAnswerImage: PLACEHOLDER_IMAGE,
      badAnswerImage: PLACEHOLDER_IMAGE,
      correctAnswerImage: PLACEHOLDER_IMAGE,
      order: 2,
    },
    {
      type: "match",
      componentType: "matching_board",
      moralValue,
      valuePoints: baseValuePoints + 4,
      questionPreview: `${topic} final eşleştirme`,
      instruction: "Değer-kavram ilişkisinde doğru eşleşmeyi bul.",
      sourceText: `${topic} final eşleştirme`,
      sourceLanguage: "tr",
      targetLanguage: "tr",
      correctAnswer: [scenario.matchCorrect],
      options: scenario.matchOptions,
      isNewWord: false,
      audioUrl: "",
      neutralAnswerImage: PLACEHOLDER_IMAGE,
      badAnswerImage: PLACEHOLDER_IMAGE,
      correctAnswerImage: PLACEHOLDER_IMAGE,
      order: 3,
    },
    {
      type: "arrange",
      componentType: isMath ? "puzzle_board" : "arrange_builder",
      moralValue,
      valuePoints: baseValuePoints + 5,
      questionPreview: `${topic} final adımlar`,
      instruction: "Çözüm adımlarını doğru sırala.",
      sourceText: `${topic} final akış`,
      sourceLanguage: "tr",
      targetLanguage: "tr",
      correctAnswer: [joinSteps(scenario.assessSteps)],
      options: createShuffledSteps(scenario.assessSteps),
      isNewWord: false,
      audioUrl: "",
      neutralAnswerImage: PLACEHOLDER_IMAGE,
      badAnswerImage: PLACEHOLDER_IMAGE,
      correctAnswerImage: PLACEHOLDER_IMAGE,
      order: 4,
    },
  ];
};

const createLessonExercises = (params: {
  category: LanguageCategory;
  categoryTitle: string;
  topic: string;
  lessonTitle: string;
  phase: TeachingPhase;
  moralValue: MoralValue;
  ageTrack: AgeTrack;
  level: LevelDefinition;
}): ExerciseBlueprint[] => {
  const { category, categoryTitle, topic, lessonTitle, phase, moralValue, ageTrack, level } = params;
  const baseValuePoints =
    ageTrack.baseValuePoints + level.progressionWeight * 2 + (phase === "assess" ? 3 : phase === "practice" ? 2 : 1);

  if (phase === "teach") {
    return toTeachingExercises({
      category,
      categoryTitle,
      topic,
      lessonTitle,
      moralValue,
      baseValuePoints,
      ageTrack,
    });
  }

  if (phase === "practice") {
    return toPracticeExercises({
      category,
      topic,
      moralValue,
      baseValuePoints,
      ageTrack,
    });
  }

  return toAssessExercises({
    category,
    topic,
    moralValue,
    baseValuePoints,
    ageTrack,
  });
};

const buildMoralStory = (params: {
  profile: AgePedagogyProfile;
  level: LevelDefinition;
  topic: string;
  moralValue: MoralValue;
}): { title: string; text: string; placement: "post_lesson" } => {
  const { profile, level, topic, moralValue } = params;
  return {
    title: `${level.title} - Ders Çıkarımı`,
    text: `${profile.storySeed}: ${topic} dersinde ${moralValue} değerini uygulayan çocuk, önce doğru davranışı seçer sonra çevresine örnek olur. Ders sonunda bir gerçek yaşam senaryosu yaz ve nasıl uygulayacağını planla.`,
    placement: "post_lesson",
  };
};

const toXpReward = (params: {
  ageTrack: AgeTrack;
  level: LevelDefinition;
  phaseMultiplier: number;
  lessonOrder: number;
}) => {
  const { ageTrack, level, phaseMultiplier, lessonOrder } = params;
  const raw = ageTrack.baseXp + level.progressionWeight * 9 + lessonOrder * 3;
  return Math.round(raw * phaseMultiplier);
};

export function buildTrCurriculumBlueprint(): TrCurriculumProgramBlueprint[] {
  const blueprint: TrCurriculumProgramBlueprint[] = [];

  for (const ageTrack of AGE_TRACKS) {
    for (const categoryPlan of CATEGORY_PLANS) {
      const profile = categoryPlan.pedagogicProfiles[ageTrack.key];
      const color = UNIT_COLOR_BY_CATEGORY[categoryPlan.category] ?? "bg-[#2563eb]";

      const chapters: ChapterBlueprint[] = LEVELS.map((level, levelIndex) => {
        const chapterMoralValue = moralCycle(categoryPlan.moralValues, levelIndex);

        const units: UnitBlueprint[] = UNIT_TEMPLATES.map((unitTemplate, unitIndex) => {
          const topic = unitTopic(profile, levelIndex, unitIndex);
          const competency = competencyByIndex(profile, levelIndex + unitIndex);

          const lessons: LessonBlueprint[] = PHASE_DEFS.map((phaseDef, lessonIndex) => {
            const lessonOrder = lessonIndex + 1;
            const moralValue = moralCycle(
              categoryPlan.moralValues,
              levelIndex * 7 + unitIndex * 3 + lessonIndex
            );

            const lessonTitle = `${phaseDef.title}: ${topic}`;
            const xpReward = toXpReward({
              ageTrack,
              level,
              phaseMultiplier: phaseDef.xpMultiplier,
              lessonOrder,
            });

            const valuePointsReward = Math.round(
              (ageTrack.baseValuePoints + level.progressionWeight + lessonOrder) *
                phaseDef.valuePointMultiplier
            );

            return {
              title: lessonTitle,
              description: `${level.title} içinde ${topic} konusu için ${phaseDef.title.toLowerCase()} odaklı ders akışı.`,
              isPremium: level.isPremium,
              isTest: phaseDef.isTest,
              isActive: true,
              xpReward,
              valuePointsReward,
              teachingPhase: phaseDef.phase,
              moralValue,
              pedagogyFocus: `${profile.focus}. Yetkinlik odağı: ${competency}.`,
              moralStory: buildMoralStory({
                profile,
                level,
                topic,
                moralValue,
              }),
              imageUrl: PLACEHOLDER_IMAGE,
              order: lessonOrder,
              exercises: createLessonExercises({
                category: categoryPlan.category,
                categoryTitle: categoryPlan.title,
                topic,
                lessonTitle,
                phase: phaseDef.phase,
                moralValue,
                ageTrack,
                level,
              }),
            };
          });

          return {
            title: `${unitTemplate}: ${topic}`,
            description: `${topic} için öğretim-akış uygulaması. Yetkinlik: ${competency}.`,
            isPremium: level.isPremium,
            isExpanded: false,
            imageUrl: PLACEHOLDER_IMAGE,
            isActive: true,
            order: unitIndex + 1,
            color,
            lessons,
          };
        });

        return {
          title: level.title,
          description: `${ageTrack.label} için ${categoryPlan.title}. ${level.subtitle}.`,
          isPremium: level.isPremium,
          isExpanded: false,
          imageUrl: PLACEHOLDER_IMAGE,
          order: levelIndex + 1,
          isActive: true,
          contentType: categoryPlan.contentType,
          moralLesson: {
            value: chapterMoralValue,
            title: `${level.title} Değer Hikayesi`,
            storyText: `${categoryPlan.title} derslerinde ${chapterMoralValue} değeri bu seviyenin temel davranış standardıdır.`,
            displayTiming: "post_lesson",
          },
          miniGame: {
            type: categoryPlan.miniGameType,
            config: {
              levelCode: level.code,
              levelTitle: level.title,
              rewardCurrency: "value_points",
              rewardTarget: "tulu_kitap",
              pedagogicGoal: profile.focus,
              componentSet: [
                "learning_card",
                "multiple_choice",
                "matching_board",
                categoryPlan.category === "math_logic" ? "puzzle_board" : "arrange_builder",
                categoryPlan.category === "mental_spiritual" ? "focus_breathing" : null,
              ].filter(Boolean),
            },
          },
          units,
        };
      });

      blueprint.push({
        key: `${categoryPlan.key}-${ageTrack.key}`,
        locale: "tr",
        language: {
          name: `${categoryPlan.title} (${ageTrack.label})`,
          nativeName: `${categoryPlan.title} (${ageTrack.label})`,
          flag: categoryPlan.flag,
          baseLanguage: "tr",
          imageUrl: PLACEHOLDER_IMAGE,
          isActive: true,
          category: categoryPlan.category,
          themeMetadata: {
            islamicContent: categoryPlan.islamicContent,
            ageGroup: ageTrack.key,
            moralValues: categoryPlan.moralValues,
            educationalFocus: profile.focus,
            difficultyLevel: ageTrack.difficulty,
          },
        },
        chapters,
      });
    }
  }

  return blueprint;
}

export function summarizeTrCurriculumBlueprint() {
  const programs = buildTrCurriculumBlueprint();

  const summary = programs.reduce(
    (acc, program) => {
      acc.programs += 1;
      acc.chapters += program.chapters.length;

      for (const chapter of program.chapters) {
        acc.units += chapter.units.length;

        for (const unit of chapter.units) {
          acc.lessons += unit.lessons.length;

          for (const lesson of unit.lessons) {
            acc.exercises += lesson.exercises.length;
          }
        }
      }

      return acc;
    },
    {
      programs: 0,
      chapters: 0,
      units: 0,
      lessons: 0,
      exercises: 0,
    }
  );

  const curriculumTable = programs.flatMap((program) =>
    program.chapters.map((chapter) => ({
      program: program.language.name,
      category: program.language.category,
      ageGroup: program.language.themeMetadata.ageGroup,
      level: chapter.title,
      pedagogicFocus: program.language.themeMetadata.educationalFocus,
      unitTopics: chapter.units.map((unit) => unit.title),
      moralValues: program.language.themeMetadata.moralValues,
      lessonFlow: "Öğretim -> Alıştırma -> Değerlendirme",
      components: [
        "learning_card",
        "moral_story",
        "multiple_choice",
        "matching_board",
        program.language.category === "math_logic" ? "puzzle_board" : "arrange_builder",
        program.language.category === "mental_spiritual" ? "focus_breathing" : null,
      ].filter(Boolean),
    }))
  );

  return {
    locale: "tr",
    ageTracks: AGE_TRACKS.map((track) => ({
      key: track.key,
      label: track.label,
      difficulty: track.difficulty,
    })),
    counts: summary,
    catalog: CATEGORY_PLANS.map((item) => ({
      key: item.key,
      title: item.title,
      category: item.category,
      contentType: item.contentType,
      miniGameType: item.miniGameType,
      pedagogicFocusKids26: item.pedagogicProfiles["kids_2-6"].focus,
      pedagogicFocusKids712: item.pedagogicProfiles["kids_7-12"].focus,
    })),
    curriculumTable,
  };
}
