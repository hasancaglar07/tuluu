import HeaderPage from "@/components/modules/header/page";
import Container from "@/components/custom/container";
import { LocaleLink } from "@/components/custom/locale-link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderPage />

      <Container className="py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Gizlilik Politikası
          </h1>

          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <p className="text-gray-600">Son Güncelleme: 1 Mayıs 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p>
              TULU'da gizliliğinizi ciddiye alıyoruz. Bu Gizlilik Politikası, 
              dil öğrenme uygulamamızı ve web sitemizi kullandığınızda bilgilerinizi 
              nasıl topladığımızı, kullandığımızı, ifşa ettiğimizi ve koruduğumuzu açıklar.
            </p>

            <div className="space-y-8 mt-10">
              <h4>Topladığımız Bilgiler</h4>
              <p>
                Aşağıdaki durumlarda doğrudan bize sağladığınız bilgileri topluyoruz:
              </p>
              <ul>
                <li>Hesap oluşturduğunuzda</li>
                <li>Profilinizi tamamladığınızda</li>
                <li>Dil öğrenme özelliklerimizi kullandığınızda</li>
                <li>Testlere veya sınavlara katıldığınızda</li>
                <li>Satın alma yaptığınızda</li>
                <li>Müşteri desteğiyle iletişime geçtiğinizde</li>
                <li>Anketlere veya promosyonlara yanıt verdiğinizde</li>
              </ul>

              <p>Bu bilgiler şunları içerebilir:</p>
              <ul>
                <li>Ad, e-posta adresi ve şifre</li>
                <li>Profil bilgileri (profil resmi gibi)</li>
                <li>Dil tercihleri ve öğrenme hedefleri</li>
                <li>
                  Ödeme bilgileri (ödeme sağlayıcılarımız tarafından işlenir)
                </li>
                <li>İlerleme ve performans verileriniz</li>
                <li>Cihaz bilgileri ve kullanım verileri</li>
              </ul>

              <h4>Bilgilerinizi Nasıl Kullanıyoruz</h4>
              <p>Topladığımız bilgileri şu amaçlarla kullanıyoruz:</p>
              <ul>
                <li>Hizmetlerimizi sağlamak, sürdürmek ve geliştirmek</li>
                <li>Hesabınızı oluşturmak ve yönetmek</li>
                <li>İşlemleri gerçekleştirmek</li>
                <li>
                  İlerlemenizi takip etmek ve öğrenme deneyiminizi kişiselleştirmek
                </li>
                <li>
                  Size teknik bildirimler, güncellemeler ve destek mesajları göndermek
                </li>
                <li>Yorumlarınıza ve sorularınıza yanıt vermek</li>
                <li>Yeni özellikler ve hizmetler geliştirmek</li>
                <li>Kullanım modellerini izlemek ve analiz etmek</li>
                <li>
                  Dolandırıcılık ve diğer yasadışı faaliyetlere karşı korumak, 
                  tanımlamak ve önlemek
                </li>
              </ul>

              <h4>Bilgilerinizi Paylaşma</h4>
              <p>Bilgilerinizi şu kişilerle paylaşabiliriz:</p>
              <ul>
                <li>Bizim adımıza hizmet sunan hizmet sağlayıcılar</li>
                <li>
                  Ortak markalı hizmetler veya promosyonlar sunduğumuz iş ortakları
                </li>
                <li>
                  Diğer kullanıcılar (lider tabloları gibi, ancak kullanıcı adı 
                  ve puanla sınırlı)
                </li>
                <li>
                  Yasal süreçlere yanıt olarak veya haklarımızı korumak için 
                  gerekli olduğuna inandığımızda
                </li>
                <li>Birleşme, satış veya devralma ile bağlantılı olarak</li>
              </ul>

              <h4>Seçenekleriniz</h4>
              <p>Bilgilerinizi ve gizlilik tercihlerinizi şu yollarla yönetebilirsiniz:</p>
              <ul>
                <li>Hesap profilinizi güncelleme</li>
                <li>Bildirim ayarlarını düzenleme</li>
                <li>Promosyon iletişimlerinden çıkma</li>
                <li>Hesabınızın silinmesini talep etme</li>
              </ul>

              <h4>Veri Güvenliği</h4>
              <p>
                Kişisel bilgilerinizi korumak için uygun teknik ve organizasyonel 
                önlemler uyguluyoruz. Ancak, İnternet üzerinden iletim veya elektronik 
                depolama yöntemi %100 güvenli değildir, bu nedenle mutlak güvenliği 
                garanti edemeyiz.
              </p>

              <h4>Çocukların Gizliliği</h4>
              <p>
                Hizmetlerimiz 13 yaşın altındaki çocuklara yönelik değildir. 13 yaşın 
                altındaki bir çocuktan kişisel bilgi topladığımızı öğrenirsek, bu bilgiyi 
                mümkün olan en kısa sürede sileriz. 13 yaşın altındaki bir çocuğun bize 
                kişisel bilgi verdiğine inanıyorsanız, lütfen bizimle iletişime geçin.
              </p>

              <h4>Uluslararası Veri Transferleri</h4>
              <p>
                Bilgileriniz, ikamet ettiğiniz ülke dışındaki ülkelere aktarılabilir 
                ve işlenebilir. Bu ülkelerin veri koruma yasaları, ülkenizin yasalarından 
                farklı olabilir.
              </p>

              <h4>Politikadaki Değişiklikler</h4>
              <p>
                Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Yeni Gizlilik 
                Politikasını bu sayfada yayınlayarak ve &quot;Son Güncelleme&quot; 
                tarihini güncelleyerek sizi değişikliklerden haberdar edeceğiz.
              </p>

              <h4>Bize Ulaşın</h4>
              <p>
                Bu Gizlilik Politikası hakkında herhangi bir sorunuz varsa, 
                lütfen bizimle iletişime geçin:
              </p>
              <p>
                <strong>E-posta:</strong> privacy@tulu.com
                <br />
                <strong>Adres:</strong> 123 Language Lane, San Francisco, CA
                94103
              </p>
            </div>
          </div>
        </div>
      </Container>

      <footer className="bg-gray-100 py-8 mt-12">
        <Container>
          <div className="text-center text-gray-600">
            <p>© {new Date().getFullYear()} TULU. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-4">
              <LocaleLink href="/terms" className="hover:underline">
                Kullanım Koşulları
              </LocaleLink>
              <LocaleLink
                href="https://www.patreon.com/messages/8b25e025c56c4d47a903cd9b02049c63?mode=campaign&tab=chats"
                className="hover:underline"
              >
                Bize Ulaşın
              </LocaleLink>
              <LocaleLink href="/about" className="hover:underline">
                Hakkımızda
              </LocaleLink>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
