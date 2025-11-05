
import mongoose from 'mongoose';

// GÜVENLİ: MongoDB Bağlantı adresi
const MONGODB_URI = "mongodb+srv://tarfyazilim_db_user:rVJhMF2Xvm0eYXvb@tulu0.ztsglsx.mongodb.net/?appName=tulu0";

// Modelleri import etmek yerine, sadece isimleriyle referans vereceğiz.
// Bu, script'in model tanımlarından bağımsız çalışmasını sağlar.
const Language = mongoose.models.Language || mongoose.model('Language', new mongoose.Schema({}, { strict: false }));
const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', new mongoose.Schema({}, { strict: false }));
const Unit = mongoose.models.Unit || mongoose.model('Unit', new mongoose.Schema({}, { strict: false }));
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', new mongoose.Schema({}, { strict: false }));
const Exercise = mongoose.models.Exercise || mongoose.model('Exercise', new mongoose.Schema({}, { strict: false }));

async function cleanupData() {
  try {
    console.log('🚀 Veritabanı temizlik scripti başlıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı.');

    // 1. Silinecek programı bul (Language modeli üzerinden)
    const programNameToDelete = 'iman & ahlak (4-7 yaş)';
    console.log(`🔍 "${programNameToDelete}" programı aranıyor...`);
    const program = await Language.findOne({ name: programNameToDelete });

    if (!program) {
      console.log('✅ Program bulunamadı. Veritabanı zaten temiz görünüyor.');
      return;
    }

    console.log(`🔥 "${program.name}" programı bulundu (ID: ${program._id}). Silme işlemi başlıyor...`);
    const programId = program._id;

    // 2. Programa bağlı tüm egzersizleri sil
    const exerciseDeletion = await Exercise.deleteMany({ languageId: programId });
    console.log(`  🗑️  ${exerciseDeletion.deletedCount} adet egzersiz silindi.`);

    // 3. Programa bağlı tüm dersleri sil
    const lessonDeletion = await Lesson.deleteMany({ languageId: programId });
    console.log(`  🗑️  ${lessonDeletion.deletedCount} adet ders silindi.`);

    // 4. Programa bağlı tüm üniteleri sil
    const unitDeletion = await Unit.deleteMany({ languageId: programId });
    console.log(`  🗑️  ${unitDeletion.deletedCount} adet ünite silindi.`);

    // 5. Programa bağlı tüm bölümleri sil
    const chapterDeletion = await Chapter.deleteMany({ languageId: programId });
    console.log(`  🗑️  ${chapterDeletion.deletedCount} adet bölüm silindi.`);

    // 6. Programın kendisini sil
    await Language.findByIdAndDelete(programId);
    console.log(`  🗑️  "${program.name}" programı başarıyla silindi.`);

    console.log('\n🎉 TEMİZLİK BAŞARIYLA TAMAMLANDI! 🎉');

  } catch (error) {
    console.error('❌ HATA: Temizlik işlemi sırasında bir sorun oluştu!');
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı.');
  }
}

cleanupData();
