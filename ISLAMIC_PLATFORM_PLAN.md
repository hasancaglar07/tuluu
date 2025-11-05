# İslami Çocuk Eğitim Platformu Uygulama Planı (Sprint Odaklı)

## 1. Amaç ve Kapsam
- `fikir.txt` vizyonunu (sabır, şükür, yardımlaşma odaklı içerik) mevcut dil öğrenme altyapısına uygulamak.
- Mevcut veri modelleri ve frontend modüllerini genişleterek ileriye dönük kategori, değer puanı ve ebeveyn denetimi özellikleri eklemek.
- Uygulama dört haftalık sprintlere bölünür; her sprint bağımsız olarak deploy edilebilir.
- Doğrulama Noktası 1 ✅: Plan yalnızca var olan dosyaları genişletmeyi hedefler, yeniden yazım veya yeni servis önermez.

## 2. Mimari Durum Özeti
- İçerik akışı `api/app/api/public/lessons/route.ts:24` ve `front/components/modules/hero/learn/index.tsx:34` ile başlıyor; kategori seçimi bu akış üzerine oturtulacak.
- Dil/ünite/ders hiyerarşisi `api/app/api/lessons/route.ts:1` ve Redux katmanında `front/store/lessonsSlice.ts:49` üzerinden ilerliyor; yeni metadata bu yanıtlar içinde taşınacak.
- İlerleme ve gamifikasyon verileri `front/store/progressSlice.ts:40` ve `front/components/modules/Course/Card.tsx:45` üzerinde yönetiliyor; değer puanı göstergeleri bu store’a eklenecek.
- Doğrulama Noktası 2 ✅: Tüm yeni gereksinimler mevcut dosyaların genişletilmesiyle karşılanabiliyor.

## 3. Sprint Bazlı Yol Haritası
### Sprint 1 – Veri Modeli & API Genişletmeleri
1. `api/models/Language.ts:12`  
   - `category` enum: `faith_morality`, `quran_arabic`, `math_logic`, `science_discovery`, `language_learning`, `mental_spiritual`, `personal_social`.  
   - `themeMetadata`: `{ islamicContent: Boolean, ageGroup: enum('kids_4-7','kids_8-12','teens_13-17','all'), moralValues: string[], educationalFocus?: string, difficultyLevel?: enum }`.  
   - Yeni indeks: `LanguageSchema.index({ category: 1, 'themeMetadata.ageGroup': 1 });`
2. `api/models/Chapter.ts:1`  
   - `contentType` enum (`lesson`, `story`, `game`, `meditation`, `quiz`, `activity`).  
   - `moralLesson`: `{ value: enum(...), title?: string, storyText?: string, mediaUrl?: string, displayTiming?: enum }`.  
   - `miniGame`: `{ type: enum('match','quiz','puzzle','story','breathing'), config: Schema.Types.Mixed }`.
3. `api/models/Quest.ts:68`  
   - `type` enum genişlet: `kindness`, `moral_value`, `community_event`.  
   - `requiresApproval` zaten mevcut; `approvalFlow`: `{ approver: enum('parent','teacher'), proofType: enum('photo','text','audio'), gracePeriodHours: number }`.
4. `api/models/UserProgress.ts:63`  
   - `valuePoints`: `{ patience: Number, gratitude: Number, kindness: Number, honesty: Number, sharing: Number, mercy: Number, justice: Number, respect: Number }`.  
   - `dailyLimits`: `{ minutesAllowed: Number, minutesUsed: Number, lastResetAt: Date }`.  
   - `parentalControls`: `{ enabled: Boolean, guardianContact: String }`.
5. API Katmanı  
   - `api/app/api/public/lessons/route.ts:24`: `category`, `ageGroup` query parametreleri; yanıt `languages[].themeMetadata` içermeli.  
   - `api/app/api/lessons/route.ts:30`: Chapter ve Lesson yanıtlarına `moralLesson` ve `miniGame` alanları eklenmeli.  
   - Yeni PATCH endpoint: `api/app/api/progress/valuepoints/route.ts` (mevcut `progress` klasörü altında) → UserProgress güncelleme; `CourseService` yerine aynı repo pattern’i kullanılacak.  
   - Doğrulama Noktası 3 ✅: API değişiklikleri geriye dönük uyumluluğu koruyacak; boş alanlarda default değerler kullanılacak.

### Sprint 2 – Frontend Kategori ve Değer Puanı Deneyimi
1. `front/components/modules/hero/learn/index.tsx:34`  
   - SWR yanıtında `category` bilgisi geldiğinde kartları 7 kategoriye göre grupla.  
   - Yeni mini bileşen `CategoryBadge` için mevcut `components/custom` içerisindeki stil pattern’leri reuse et; ayrı dosya gerekiyorsa `components/custom/category-badge.tsx` (~20 satır) ile sınırlı ve sadece badge render edecek.
2. `front/app/[locale]/(pages)/learn/page.tsx:6`  
   - Query parametreleriyle kategori filtreleme (`?category=faith_morality`).  
   - `LanguagesToLearn` bileşenine `initialCategory` prop geçir.
3. `front/store/lessonsSlice.ts:114`  
   - Thunk sonucunda `chapter.moralLesson`, `chapter.miniGame` alanlarını state’e kaydet.  
   - `lessons.language.themeMetadata` state’i doldur.
4. `front/store/progressSlice.ts:84`  
   - `valuePoints` state alanı ve `updateValuePoints` reducer’ı ekle.  
   - `fetchUserProgress.fulfilled` case’inde yeni alanları hydrate et.
5. `front/components/modules/Course/Card.tsx:45`  
   - `lesson.moralLesson` varsa popover’da ders sonrası mesajı göster; `miniGame` tipine göre ikon değiştir (mevcut `lucide-react` ikonlarından reuse).  
   - `useLocalizedRouter` yönlendirmeyi sürdür.
6. `front/app/[locale]/(pages)/dashboard/page.tsx` (varsa) veya ana panelde  
   - `ValuePointsPanel` bileşeni: `state.progress.valuePoints` gösterimi. Mevcut `Card`/`Stats` componentlerinden birini temel al.
7. Doğrulama Noktası 4 ✅: Tüm UI değişiklikleri mevcut hook’ları (`useLocalizedRouter`, `useIntl`) kullanır; ek stil dosyası eklenmez.

### Sprint 3 – Ebeveyn & İyilik Görevi Akışı
1. `api/app/api/quests/route.ts` içinde  
   - `requiresApproval` quest’ler için approval API (POST `/api/quests/approve`) ekle; `Quest` modelindeki `approvalFlow` meta’yı doğrula.  
   - Kullanıcıya `realWorldAction` durumunu dönen GET filtresi (`?type=kindness&pending=true`).
2. `front/app/[locale]/(pages)/quests/page.tsx` (veya ilgili sayfa)  
   - Pending iyilik görevleri listesi; onay butonu `POST /api/quests/approve`.  
   - `useSWR` ile fetch; mevcut Quest card bileşenini reuse.
3. `front/components/modules/profile/parental-controls.tsx` (mevcut değilse)  
   - Eğer yeni dosya gerekiyorsa önce `front/components/modules/profile` altında benzer component var mı kontrol; yoksa 1 adet ~40 satırlık component ile guardian e-posta kontrolü ekle.
4. `front/store/settingsSlice.ts` veya ilgili store  
   - Parental control state’ini fetch/update eden async thunk (mevcut pattern izlenir).  
   - Günlük limit `dailyLimits` verisini dashboard’da göster.
5. Doğrulama Noktası 5 ✅: Ebeveyn akışı için kullanılan tüm API’ler sprint 1’de genişletilen modellerle uyumlu.

### Sprint 4 – Lokalizasyon, İçerik & Yayın
1. Lokalizasyon  
   - `front/public/locales/tr.json`, `en.json`, `ar.json` içinde yeni anahtarlar: `category.faith_morality`, `valuePoints.patience`, `quests.kindness.approvalNeeded`.  
   - `useIntl` çağrıları bu anahtarlarla eşleştirilir.
2. İçerik Seed & Migration  
   - `api/actions` veya `api/scripts` altında mevcut seed script incelenir; kategori ve moralLesson sahte verileri eklenir. Yeni script gerekirse 1 dosya ile sınırlı ve mevcut script fonksiyonlarını çağırır.  
   - Migration sırasında `Language.themeMetadata` boşsa default set eden komut dosyası çalıştırılır (idempotent).
3. Test & CI  
   - Backend: Jest veya mevcut test runner ile Language/Quest/UserProgress model testleri.  
   - Frontend: `front` içinde `npm run test` ile store reducer ve bileşen snapshot testleri.  
   - E2E: Mevcut Playwright/Cypress setup varsa yeni senaryo ekle; yoksa manuel test planı.
4. Release  
   - Staging deploy → kullanıcı testi → Production.  
   - Rollback stratejisi: migration öncesi backup, feature flag ile yeni kategorileri opsiyonel aç.
5. Doğrulama Noktası 6 ✅: Lokalizasyon ve release süreçleri mevcut pipeline’ları kullanır; yeni araç eklenmez.

## 4. Test Stratejisi (Sprint Bazlı)
- Sprint 1: Model validation testleri; `/api/public/lessons` integration testi (kategori filtresi).  
- Sprint 2: UI smoke testi (`learn` sayfası kategori seçimi), Redux reducer unit testi.  
- Sprint 3: Approval flow integration testi (quest onayı), guardian ayarları API testi.  
- Sprint 4: Regresyon testi + performans ölçümleri.  
- Doğrulama Noktası 7 ✅: Her sprint teslimatı test senaryosu ile eşleştirildi.

## 5. Riskler ve Azaltım
- **Migration Riskleri:** Default değerler yanlış ayarlanırsa eski kayıtlar bozulur → Migration scriptlerini dry-run modunda çalıştır.  
- **Veri Tutarlılığı:** `valuePoints` güncellemesi yarış koşullarında yanlış hesaplanabilir → Atomic update için Mongo `$inc` kullan.  
- **UI Karmaşıklığı:** Kategori kartları çok kalabalık olabilir → Mobilde accordion düzenine geç (mevcut Tailwind sınıfları ile).  
- **Ebeveyn Onayı Gecikmesi:** Görev akışı tıkanır → `approvalFlow.gracePeriodHours` ile otomatik kapanış belirle.
- Doğrulama Noktası 8 ✅: Her risk için mevcut mimari ile uyumlu mitigasyon önerildi.

## 6. Başarı Ölçütleri
- Sprint 2 sonunda kullanıcılar `learn` ekranında kategori bazlı seçim yapabiliyor.  
- Sprint 3 sonunda en az bir `kindness` görevi veli onayıyla tamamlanmış veride görülüyor.  
- Sprint 4 sonunda değer puanı göstergesi dashboard’da yer alıyor ve lokalizasyonlar güncel.  
- Doğrulama Noktası 9 ✅: Ölçütler doğrudan geliştirilecek özelliklere bağlı, başka sisteme ihtiyaç duymuyor.

## 7. Sonraki Adımlar
1. Sprint 1 için task kartlarını aç ve `Language`, `Chapter`, `Quest`, `UserProgress` modellerinde alan ekleme işini eşle.  
2. Migration script’ini hazırlayıp QA ortamında veri kopyası üzerinde dene.  
3. Frontend kategori UI tasarımını mevcut component kütüphanesi ile prototiple.  
4. Ebeveyn onay süreci için API contract’ı QA ile paylaşıp test senaryolarını netleştir.  
5. Release öncesi Sentry/DataDog alarmlarını yeni alanlarla güncelle.
- Doğrulama Noktası 10 ✅: Adımlar mevcut araçlarla uygulanabilir; yeni teknoloji girişi gerekmiyor.

