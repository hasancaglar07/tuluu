📋 1. ADIM: GEREKSİNİMLERİ OKU

kuralları oku, ardından sıralı düşünme kullan ve bir sonraki adıma geç.

DUR. Daha fazla okumadan önce, anladığını teyit et:

1\. Bu bir kod yeniden kullanımı ve konsolidasyon projesidir

2\. Yeni dosyalar oluşturmak kapsamlı gerekçelendirme gerektirir

3\. Her öneri mevcut koda atıfta bulunmalıdır

4\. Bu kuralların ihlali yanıtınızı geçersiz kılar



BAĞLAM: Önceki geliştirici, mevcut kodu görmezden gelip kopyalar oluşturduğu için işten çıkarıldı. Mevcut mimari içinde çalışabildiğinizi kanıtlamalısınız.



ZORUNLU SÜREÇ:

1\. "UYGUNLUK ONAYLANDI: Oluşturma yerine yeniden kullanıma öncelik vereceğim" ile başlayın

2\. Yeni bir şey önermeden ÖNCE mevcut kodu analiz edin

3\. Sağlanan analizden belirli dosyalara referans verin

4\. Yanıtınız boyunca doğrulama kontrol noktaları ekleyin

5\. Uygunluk onayı ile bitirin



KURALLAR (HERHANGİ BİRİNİ İHLAL ETMEK YANITINIZI GEÇERSİZ KILAR):

❌ Kapsamlı yeniden kullanım analizi olmadan yeni dosya yok

❌ Yeniden düzenleme mümkünken yeniden yazma yok

❌ Genel tavsiye yok - belirli uygulamalar sağlayın

❌ Mevcut kod tabanı mimarisini görmezden gelmek yok

✅ Mevcut hizmetleri ve bileşenleri genişletin

✅ Yinelenen kodu birleştirin

✅ Belirli dosya yollarına referans verin

✅ Geçiş stratejileri sağlayın



📚 **LESSON MODÜLÜ KAPSAMI**

- `duolingo-mobile/src/screens/LessonScreen.tsx`: Placeholder metnini kaldır; Expo Router üzerinden gelen `id` parametresiyle dersi yükle, `useCourseStore.fetchLesson` ve `courseService.getLessonPercentage` çağrılarını yeniden kullan. Ders başlığı, ilerleme yüzdesi, kalpler ve görev listesi (challenges) net olarak gösterilmeli.
- `duolingo-mobile/src/components/LessonButton.tsx`: Kilit, tamamlanma ve aktif durumlarını `lesson.completed` değerini temel alarak yeniden hesapla. Kilitli durumlarda gri/kilit ikonu göster, tamamlananlarda onay simgesi, aktif derste progres halkasını ve `START` etiketi koru.
- `duolingo-mobile/src/store/useCourseStore.ts`: Ders ve yüzde state’lerini yöneten setter’ları kullan; yeni yardımcı gerekiyorsa önce mevcut `CourseService` metotlarını genişletme imkanını değerlendir.

🚀 **LEARN EKRANI MANTIK DÜZELTMELERİ**

- `duolingo-mobile/src/screens/LearnScreen.tsx`: Kurs verilerini tek bir `fetchCourseData` akışında topla. `courseService.getUserProgress`, `getUnits`, `getCourseProgress`, `getLessonPercentage` sonuçlarını tutarlı şekilde işle; aktif ders yoksa state’leri sıfırla.
- Refresh senaryosunda `loading`/`refreshing` flag’lerini doğru yönet, hata durumunda kullanıcıya mesaj + “Tekrar Dene” butonu göster.

🧩 **GÖREVLERİ BAĞLAMA & DOĞRULAMA**

- Öğrenme akışı: Learn ekranındaki `LessonButton` `/lesson?id={lessonId}` rotasına gider; LessonScreen bu ID ile store’dan dersi çeker ve görevleri listeler.
- Doğrulama kontrol noktaları: (1) Aktif ders yüzde > 0 ise progres halkası görünür, (2) Kilitli dersler tıklamada navigasyon yapmaz, (3) LessonScreen hata aldığında kullanıcıya bildirilir, (4) Challenge listesi API sırasına göre render edilir.



SON HATIRLATMA: Yeni dosyalar oluşturmayı önerirseniz, mevcut dosyaların neden genişletilemeyeceğini açıklayın. Yeniden yazma önerirseniz, yeniden düzenlemenin neden işe yaramayacağını gerekçelendirin.

🔍 2. ADIM: MEVCUT SİSTEMİ ANALİZ ET

Mevcut kod tabanını analiz edin ve istenen özellik uygulaması için ilgili dosyaları belirleyin.

Ardından 3. Adıma geçin.

🎯 3. ADIM: UYGULAMA PLANI OLUŞTUR

2\. Adımdaki analizinizden yola çıkarak, istenen özellik için ayrıntılı bir uygulama planı oluşturun.

Ardından 4. Adıma geçin.

🔧 4. ADIM: TEKNİK DETAYLARI SAĞLAYIN

Kod değişiklikleri, API değişiklikleri ve entegrasyon noktaları dahil olmak üzere teknik uygulama ayrıntılarını oluşturun.

Ardından 5. Adıma geçin.

✅ 5. ADIM: TESLİMATLARI TAMAMLA

Uygulama planını test stratejileri, dağıtım hususları ve son önerilerle tamamlayın.

🎯 TALİMATLAR

Her adımı sırayla izleyin. Bir sonraki adıma geçmeden önce bir adımı tamamlayın. Bir önceki adımdaki bulguları bir sonraki adıma bilgi vermek için kullanın.

