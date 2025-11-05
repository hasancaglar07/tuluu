// Bu script sadece MongoDB bağlantısını test etmek için kullanılır.
// Herhangi bir veri OKUMAZ veya YAZMAZ.

import mongoose from 'mongoose';

// Bağlantı adresi (diğer script'lerden alındı)
const MONGODB_URI = "mongodb+srv://tarfyazilim_db_user:rVJhMF2Xvm0eYXvb@tulu0.ztsglsx.mongodb.net/?appName=tulu0";

async function testConnection() {
  console.log('🚀 Veritabanı bağlantısı test ediliyor...');
  console.log('Adres: ' + MONGODB_URI.replace(/:.*@/, ':****@')); // Şifreyi gizle

  try {
    // Bağlantıyı kurmayı dene
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // 5 saniye içinde bağlanamazsa hata ver
    });

    console.log('✅ BAŞARILI: Veritabanı bağlantısı kuruldu.');

  } catch (error) {
    console.error('❌ HATA: Veritabanına bağlanılamadı!');
    console.error('Lütfen aşağıdaki detayları kontrol edin:');
    console.error('1. İnternet bağlantınız aktif mi?');
    console.error('2. MongoDB URI adresi doğru mu?');
    console.error('3. IP adresiniz MongoDB Atlas üzerinde beyaz listede (whitelist) mi?');
    console.error('\nDetaylı Hata:', error.message);

  } finally {
    // Bağlantıyı hemen kapat
    await mongoose.disconnect();
    console.log('🔌 Bağlantı test amacıyla sonlandırıldı.');
  }
}

testConnection();
