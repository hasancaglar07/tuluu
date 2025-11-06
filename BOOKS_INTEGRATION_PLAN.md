# 📚 Çocuk Kitapları İçerik Entegrasyon Planı

📌 Bu plan, `scripts/Books` klasöründeki resimli hikaye kitaplarını mevcut TULU öğrenme mimarisine entegre ederken izlenecek adımları tanımlar. Yapı, mevcut `rules.md` yaklaşımına paralel olacak şekilde adım adım ilerler.

---

📋 **1. ADIM: ENVANTER & FORMAT STANDARDİZASYONU**
- Mevcut klasör yapısını ve `manifest.json` formatını doğrula (`scripts/Books/hersey-olabilen-zurafa/manifest.json:1`). Tüm kitaplarda `bookId`, `title`, `totalPages`, `pages[]`, opsiyonel `audio` alanlarının bulunduğundan emin ol.
- Çocuk içeriğine özel meta alanlarını (örn. `displayName`, `ageBadge`, `isPremium`, `xpReward`, `themeColor`, `supportedLocales`) manifestte standartlaştır; eksik alanları import sırasında varsayılana düşür.
- Kapak görsellerinin, sayfa görsellerinin ve opsiyonel ses dosyalarının isimlendirmesini normalize et (örn. `page-001.jpg`, `page-001.mp3`). Eksik dosya tespiti için otomatik kontrol scripti hazırla.
- Doğrulama kontrol noktaları:
  1. Her `pages` girdisi benzersiz `pageNumber` içeriyor.
  2. Görsel dosyasının gerçek dosya sistemi yolu var.
  3. (Varsa) Ses dosyası ile sayfa numarası eşleşiyor.

---

🗂️ **2. ADIM: DOSYA DEPOLAMA & DAĞITIM STRATEJİSİ**
- Kapak ve sayfa görsellerini CDN/Supabase Storage benzeri kalıcı bir ortama yüklemek için toplu upload komutu hazırlansın. Upload sonrası dönen URL’ler manifestteki `imageUrl` alanlarına yazılacak.
- Audio içerikleri için benzer pipeline planla; CDN erişim politikaları çocuk içeriğine uygun (güvenli bağlantı, CORS) olmalı.
- İsteğe bağlı: Kitap başına `metadata.json` saklayarak çeviri veya yaş grubu gibi ek bilgileri birinci elden yönet.
- Kontrol noktası: Her kitap manifestinin üretim ortamındaki dosya URL’leriyle güncellenmesi.

---

🧭 **3. ADIM: VERİ MODELİ & ŞEMA GENİŞLETME**
- `Chapter` modelinin `contentType` alanı halihazırda “story” tipini destekliyor (`api/models/Chapter.ts:47`). Her kitap için yeni bir Chapter kaydı oluşturup `contentType: "story"` olarak işaretle.
- Sayfa bazlı veri saklamak için iki seçenek değerlendir:
  1. **Yeni Koleksiyon:** `StoryBook` ve `StoryPage` şemaları (book meta + page listesi). Chapter/Unit/Lesson kayıtları bu koleksiyonlara referans tutar.
  2. **Alan Genişletme:** `Lesson` şemasına `storyPages: [{ pageNumber, imageUrl, audioUrl }]` gibi yeni bir alan ekle (`api/models/Lesson.ts:14`). Bu durumda `Exercise` modeline dokunmadan kitaplar Lesson seviyesinde temsil edilir.
- Mevcut `Exercise` enumları yalnızca etkileşimli aktiviteleri kapsıyor (`api/models/Exercise.ts:22`); hikaye okumada kullanılmayacak. Ancak ileride anlayış ölçümü için “story_quiz” benzeri yeni tip eklenecekse aynı noktada genişletme planı yap.

---

🛠️ **4. ADIM: İMPORT PIPELINE TASARIMI**
- Mevcut toplu import script’inden yararlan (`scripts/import-iman-ahlak.js:1`). Bu script, Mongo modellerini inline tanımlıyor; benzer yaklaşımı kitaplar için `import-storybooks.js` adıyla klonla ancak tekrarı azaltmak adına model tanımlarını `api/models` üzerinden okumayı tercih et.
- Script akışı:
  1. Manifestleri tara, eksik/bozuk kayıtları raporla.
  2. Gerekliyse Language kaydı oluştur (örn. “Story Library” programı).
  3. Her kitap için Chapter + (tek) Unit + (tek) Lesson + StoryPage dokümanlarını oluştur.
  4. `Lesson` dokümanına manifestten gelen `isPremium` ve `xpReward` değerlerini yaz (model alanları `api/models/Lesson.ts:23`).
  5. İlerleme verisi için `UserProgress` üzerinde “storyCompletedBooks” gibi yeni alan hazırlığının yapılmasını kontrol et.
- Güvenlik: Mongo URI’yi ortam değişkenine taşı (şu an script içinde açıkta, `scripts/import-iman-ahlak.js:3`).
- Kontrol noktası: Script tekrar çalıştığında idempotent davranmalı (kitap varsa güncelle/atla).

---

🌐 **5. ADIM: API KATMANI & ERİŞİM**
- Öğrenme API’si `/api/lessons` mevcut hiyerarşiyi dönüyor (`api/app/api/lessons/route.ts:587`). `contentType === "story"` olan Chapter’lar için ek field’lar (`storyBookId`, `pageCount`) döndür.
- Kitap sayfalarını hızlı yüklemek için yeni uç noktalar planla:
  - `GET /api/stories` → kitap listesi + özet meta
  - `GET /api/stories/{id}` → manifest + CDN URL’leri
  - (Opsiyonel) `POST /api/admin/stories` → panelden içerik ekleme
- Public learn endpoint’i (`api/app/api/public/lessons/route.ts:22`) story programını kategoriler arasında doğru sınıflandırabilmeli; gerekirse `Language.category` enum’una “story_library” gibi yeni bir değer ekleyip front tipi güncelle (`front/types/index.tsx:9`).
- Lokalizasyon: `api/app/api/public/lessons/route.ts:932` zaten `locale` parametresini alıyor; import sırasında her kitabın `Language.locale` alanını (`api/models/Language.ts:17`) hedef diline göre ayarla ve endpoint’te `locale` filtrelemesini kitap kütüphanesine uygula. Farklı dillerdeki kitaplar için ayrı `Language`/Chapter kayıtları oluştur; `supportedLocales` meta alanı ile hangi dilde gösterileceği kontrol edilsin.
- Rate limiting ve erişim kontrolü: Premium kitaplarsa `User.subscription` durumunu doğrula.
- XP ilerlemesini tetiklemek için okuyucudan gelen “kitap tamamlandı” olayında `Lesson.xpReward` değerini kullanan endpoint (var olan `UserProgress` servisleri) hazır olsun; premium kitaplarda erişim reddi öncesi anlamlı hata döndür.

---

🖥️ **6. ADIM: ÖN YÜZ DENEYİMİ**
- Öğrenme sayfası listelemeleri `public/lessons` sonucunu kullanıyor (`front/components/modules/hero/learn/index.tsx:22`). Story programları için kartta “Story Time” rozeti ve yaş etiketi göster.
- Okuyucu arayüzü:
  - `front/app/[locale]/(pages)/stories` altında kitap kütüphanesi gridi.
  - `front/app/[locale]/(pages)/stories/[bookId]` içinde tam ekran okuyucu (thumbnail şeridi, klavye ok tuşu, ses butonu).
  - Global state tarafında `lessonsSlice` yeni verileri taşımalı; `LessonContent` tipine `storyPages` alanı ekle (`front/types/index.tsx:100`).
- Çocuk dostu deneyim için canlı renk paleti, büyük butonlar, animasyonlu sayfa geçişleri (ör. hafif kaydırma) ve sayfa bazlı audio kontrol paneli (oynat/durdur, otomatik ilerleme, ses seviyesini kapatma) ekle; bu kontroller için mevcut buton bileşenlerini (`front/components/custom`) yeniden kullan.
- Premium kitaplarda kart ve okuyucu girişinde kilit durumu göster; kullanıcı premium değilse modal yönlendirmesi mevcut `Lesson` akışındaki premium guard ile tutarlı olsun (`Lesson` objesinin `isPremium` alanı front’ta tüketiliyor).
- Aile/çocuk modu için `UserState` veya `Settings` store’larında okuma süresi ve ebeveyn kontrollerini göz önünde bulundur (`front/store/lessonsSlice.ts:59`).
- Doğrulama kontrol noktaları:
  1. Kitap kartına tıklayınca SWR + Redux çakışması olmadan veri yüklenmeli.
  2. Hikaye sayfaları lazy-load edilerek performans korunmalı.
  3. Sesli kitap varsa audio player playlist’i sayfa numarasına göre senkron olmalı.
  4. Premium kitap açma adımı kullanıcı rolüne göre doğru uyarı/kilit ekranı gösteriyor.

---

🛡️ **7. ADIM: İZLEME, ANALİTİK & İLERLEME**
- `UserProgress` modeline kitap okuma durumlarını ekle (ör. `{ storyBookId, lastPage, completedAt }`). Bu bilgi `GET /api/lessons` çıktısına dahil edilerek front tarafında rozetler gösterilebilir.
- Learn ekranı yanında “Story progress” metriği sunmak için dashboard bileşenlerini genişlet (`front/components/modules/hero/learn/index.tsx:164`).
- Analytics: Sayfa başına okuma süresi, tekrar edilen kitaplar gibi metrikleri toplayacak event’ler için `api/lib/analytics` benzeri katmana hook ekle.

---

🧪 **8. ADIM: TEST & KALİTE GÜVENCESİ**
- Backend: Jest/Supertest ile `/api/stories` uç noktası, `/api/lessons` story branch’i için regresyon testleri ekle.
- Frontend: Storybook veya Playwright ile okuyucu arayüzüne smoke test yaz; responsive davranışı ve keyboard navigation’ı doğrula.
- İçerik QA: Script çıktılarını Mongo üzerinde doğrulayan ve görsel linklerini `HEAD` isteğiyle kontrol eden otomatik QA adımı ekle.

---

🚀 **9. ADIM: DAĞITIM & SONRAKİ ADIMLAR**
- Pipeline’ı staging ortamında çalıştır, gerçek kullanıcı datası olmayan dummy kitaplarla validasyonu yap.
- CDN’de versiyonlama stratejisi belirle (örn. `/books/{bookId}/v1/`). Yeni sürüm yüklendiğinde manifestte sürüm alanı güncelle.
- Özellik bayrağı ile (LaunchDarkly/Config) sınırlı kullanıcı grubuna açıp geri bildirim topla. Başarılı testlerden sonra tam yayına al.
- Uzun vadeli geliştirmeler:
  1. Hikaye sonrası anlayış ölçen mini-quiz entegrasyonu.
  2. Seslendirilen kitaplar için otomatik TTS pipeline’ı.
  3. Ebeveyn panelinde okuma raporları.

---

✅ **TESLİM KONTROL LİSTESİ**
- [ ] Tüm kitap manifestleri ve medya dosyaları doğrulandı.
- [ ] Mongo şema güncellemeleri ve script’ler lokal/staging üzerinde test edildi.
- [ ] API ve frontend entegrasyonu için regresyon testleri yeşil.
- [ ] Dağıtım dokümantasyonu ve geri dönüş planı hazır.
