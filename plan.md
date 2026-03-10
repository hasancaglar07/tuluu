# /admin/lessons Yeniden Mimari Planı (Vizyon Revizyonu)

## Hedef
Mevcut TR müfredatı tamamen kaldırılıp, 7 ana kategori için pedagojik olarak güçlü, yaşa göre ayrışmış, "önce öğretim sonra alıştırma/değerlendirme" akışında yeni içerik yapısı kurulacaktır.

## Kapsam
- Eski müfredatın temizlenmesi (TR içerik reset)
- 7 ana kategoriye göre yeni program ağacı
- Yaş segmentleri: `2-6` ve `7-12`
- Seviye yapısı: `Mekke Seviye 1`, `Medine Seviye 2`, `Kudüs Seviye 3`
- Ders başına pedagojik akış, moral değer, değer puanı ve moral story
- Soru/egzersiz bileşeninin admin tarafında açık şekilde işaretlenmesi
- Admin metadata standardlarının veri modeline işlenmesi

## Ana Kategoriler
1. İman & Ahlak
2. Kur'an & Arapça
3. Matematik & Mantık
4. Bilim & Keşif
5. Dil Öğrenimi
6. Zihinsel & Ruhsal Gelişim
7. Kişisel & Sosyal Gelişim

## Uygulama Adımları

### 1) Veri modelini eğitimci düzeyine çıkar
- [x] `Lesson` modeline pedagojik metadata ekle:
  - `teachingPhase` (`teach`, `practice`, `assess`)
  - `moralValue`, `valuePointsReward`
  - `pedagogyFocus`
  - `moralStory` (başlık + metin + konum)
- [x] `Exercise` modeline soru metadata ekle:
  - `componentType` (eşleştirme, dinleme, puzzle, nefes vb. ekran bileşeni)
  - `moralValue`, `valuePoints`
  - `questionPreview`
- [x] İlgili zod doğrulama şemalarını güncelle

### 2) Admin data kontratını genişlet
- [x] `/api/admin/lessons?action=aggregate` yanıtına yeni lesson/exercise metadata alanlarını ekle
- [x] `/api/admin/lessons/[id]` içinden gelen egzersiz detaylarını yeni alanlarla hizala

### 3) Yeni TR müfredat motoru (tamamen baştan)
- [x] `tr-curriculum.ts` dosyasını 7 kategori + 2 yaş segmenti + 3 seviye yapısıyla yeniden yaz
- [x] Her ders için akış şablonu üret:
  - Öğretim ekranı (`education_*`)
  - Rehberli alıştırma (`select`, `arrange`, `match`)
  - Değerlendirme / test
- [x] Her ders ve egzersize `moralValue` + `valuePoints` ata
- [x] Her ders için kısa `moralStory` metni üret
- [x] Yönetim ekibi için seviye/konu tablosu (`curriculumTable`) özeti üret

### 4) Bootstrap ve reset akışı
- [x] Bootstrap endpoint'i TR içerikleri resetleyip yeni müfredatı kuracak şekilde güncelle
- [x] Reset sonrası seed ile tutarlı istatistik döndür

### 5) Admin panel deneyimi
- [x] `ExerciseDialog` içine içerik yöneticisinin zorunlu işaretleyebileceği metadata alanlarını ekle:
  - `componentType`
  - `moralValue`
  - `valuePoints`
  - `questionPreview`
- [x] `LessonDialog` içine pedagojik alanları ekle:
  - `teachingPhase`
  - `moralValue`
  - `valuePointsReward`
  - `pedagogyFocus`
  - `moralStory`
- [x] `/admin/lessons` gönderim payloadlarını yeni alanlarla hizala

### 6) Eski içerikleri temizleyip yeni yapıyı kur
- [x] Mevcut TR müfredatını temizle
- [x] Yeni müfredatı doğrudan veritabanına uygula
- [x] Kurulum sonrası program/bölüm/ünite/ders/egzersiz sayısını doğrula

### 7) Doğrulama ve teslim
- [x] API + Front hedef dosya lint kontrolleri
- [x] Dosya bazlı teknik özet
- [x] Kullanım notu ve doğrulama çıktısı

## Başarı Kriteri
- Çocuk akışında önce öğretim, sonra egzersiz, sonra değerlendirme net görünür.
- Her ders ve egzersiz için değer puanı + ahlaki değer işaretlenmiş olur.
- 7 ana kategori, 2 yaş grubu ve seviye tabanlı müfredat ağaçları üretime hazır olur.
- Sesli egzersizler (`listen`, `education_audio`) pasif kalır, istenirse sonra açılır.
