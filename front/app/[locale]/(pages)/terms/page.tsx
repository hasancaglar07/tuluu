import HeaderPage from "@/components/modules/header/page";
import Container from "@/components/custom/container";
import { LocaleLink } from "@/components/custom/locale-link";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderPage />

      <Container className="py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Kullanım Koşulları
          </h1>

          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <p className="text-gray-600">Son Güncelleme: 1 Mayıs 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p>
              TULU'ya hoş geldiniz! Bu Kullanım Koşulları (Koşullar), TULU uygulaması 
              ve web sitesine (Hizmet) erişiminizi ve kullanımınızı düzenler. Lütfen 
              Hizmetimizi kullanmadan önce bu Koşulları dikkatlice okuyun.
            </p>

            <div className="space-y-10 mt-10">
              <h4>Koşulların Kabulü</h4>
              <p>
                Hizmetimize erişerek veya kullanarak, bu Koşullara bağlı kalmayı kabul 
                edersiniz. Koşulların herhangi bir kısmına katılmıyorsanız, Hizmete 
                erişemezsiniz.
              </p>

              <h4>Koşullarda Değişiklikler</h4>
              <p>
                Bu Koşulları herhangi bir zamanda değiştirme veya değiştirme hakkını 
                saklı tutarız. Bir değişiklik önemliyse, yeni koşulların yürürlüğe 
                girmesinden en az 30 gün önce bildirimde bulunacağız. Önemli bir 
                değişikliğin ne olduğu tamamen kendi takdirimize bağlı olarak belirlenecektir.
              </p>

              <h4>Hesap Kaydı</h4>
              <p>
                Hizmetimizin belirli özelliklerini kullanmak için bir hesap açmanız 
                gerekir. Kayıt işlemi sırasında doğru, güncel ve eksiksiz bilgiler 
                sağlamalı ve hesap bilgilerinizi güncel tutmalısınız.
              </p>
              <p>
                Hizmete erişmek için kullandığınız şifreyi korumak ve şifreniz altındaki 
                tüm faaliyetler veya eylemlerden sorumlusunuz. Şifrenizi herhangi bir 
                üçüncü tarafa ifşa etmemeyi kabul edersiniz.
              </p>

              <h4>Kullanıcı İçeriği</h4>
              <p>
                Hizmetimiz, belirli bilgileri, metinleri, grafikleri veya diğer materyalleri 
                (İçerik) göndermenize, bağlantı vermenize, saklamanıza, paylaşmanıza ve 
                başka şekillerde kullanılabilir hale getirmenize olanak tanır. Hizmet 
                üzerinde veya aracılığıyla yayınladığınız İçerikten, yasallığı, 
                güvenilirliği ve uygunluğu dahil olmak üzere siz sorumlusunuz.
              </p>
              <p>
                Hizmet üzerinde veya aracılığıyla İçerik göndererek, şunları beyan ve 
                garanti edersiniz: (i) İçerik sizindir ve/veya onu kullanma hakkına ve 
                bu Koşullarda belirtildiği şekilde bize haklar ve lisans verme hakkına 
                sahipsiniz ve (ii) İçeriğinizin Hizmet üzerinde veya aracılığıyla 
                yayınlanması, herhangi bir kişi veya kuruluşun gizlilik haklarını, 
                tanıtım haklarını, telif haklarını, sözleşme haklarını veya diğer 
                haklarını ihlal etmez.
              </p>

              <h4>Abonelikler ve Ödemeler</h4>
              <p>
                Hizmetin bazı bölümleri abonelik bazında faturalandırılır (Abonelik(ler)). 
                Yinelenen ve periyodik bir temelde (Fatura Döngüsü) önceden faturalandırılacaksınız. 
                Fatura döngüleri, Abonelik satın alırken seçtiğiniz abonelik planı türüne 
                bağlı olarak aylık veya yıllık bazda belirlenir.
              </p>
              <p>
                Her Fatura Döngüsünün sonunda, siz veya biz iptal etmediğimiz sürece 
                Aboneliğiniz tamamen aynı koşullar altında otomatik olarak yenilenecektir. 
                Abonelik yenilemenizi çevrimiçi hesap yönetimi sayfanız üzerinden veya 
                müşteri destek ekibimizle iletişime geçerek iptal edebilirsiniz.
              </p>

              <h4>Ücretsiz Deneme</h4>
              <p>
                Kendi takdirimize bağlı olarak, sınırlı bir süre için ücretsiz deneme 
                içeren bir Abonelik sunabiliriz (Ücretsiz Deneme). Ücretsiz Denemeye 
                kaydolmak için fatura bilgilerinizi girmeniz gerekebilir.
              </p>
              <p>
                Ücretsiz Denemeye kaydolurken fatura bilgilerinizi girerseniz, Ücretsiz 
                Deneme süresi dolana kadar sizden ücret alınmayacaktır. Ücretsiz Deneme 
                süresinin son gününde, Aboneliğinizi iptal etmediğiniz sürece, seçtiğiniz 
                Abonelik türü için geçerli abonelik ücreti otomatik olarak tahsil edilecektir.
              </p>

              <h4>Fikri Mülkiyet</h4>
              <p>
                Hizmet ve orijinal içeriği (kullanıcılar tarafından sağlanan İçerik 
                hariç), özellikleri ve işlevselliği, TULU ve lisans verenlerinin münhasır 
                mülkiyetidir ve öyle kalacaktır. Hizmet, hem Amerika Birleşik Devletleri 
                hem de yabancı ülkelerin telif hakkı, ticari marka ve diğer yasalarıyla 
                korunmaktadır. Ticari markalarımız ve ticari kıyafetlerimiz, TULU'nun 
                önceden yazılı izni olmadan herhangi bir ürün veya hizmetle bağlantılı 
                olarak kullanılamaz.
              </p>

              <h4>Hesap Sonlandırma</h4>
              <p>
                Kendi takdirimize bağlı olarak, önceden bildirimde bulunmaksızın veya 
                sorumluluk kabul etmeksizin, herhangi bir nedenle ve sınırlama olmaksızın, 
                Koşulların ihlali dahil ancak bununla sınırlı olmamak üzere, hesabınızı 
                derhal sonlandırabilir veya askıya alabilir ve Hizmete erişimi engelleyebiliriz.
              </p>
              <p>
                Hesabınızı sonlandırmak isterseniz, Hizmeti kullanmayı bırakabilir veya 
                hesabınızı sonlandırmak istediğinizi bize bildirebilirsiniz.
              </p>

              <h4>Sorumluluk Sınırlaması</h4>
              <p>
                Hiçbir durumda TULU, direktörleri, çalışanları, ortakları, temsilcileri, 
                tedarikçileri veya bağlı kuruluşları, (i) Hizmete erişiminiz veya 
                kullanımınız ya da Hizmete erişememe veya kullanamama; (ii) Hizmet 
                üzerindeki herhangi bir üçüncü tarafın davranışı veya içeriği; (iii) 
                Hizmetten elde edilen herhangi bir içerik; ve (iv) garanti, sözleşme, 
                haksız fiil (ihmal dahil) veya başka herhangi bir yasal teoriye dayalı 
                olsun, böyle bir hasarın olasılığı hakkında bilgilendirilmiş olup olmadığımıza 
                bakılmaksızın, iletimlerinizin veya içeriğinizin yetkisiz erişimi, kullanımı 
                veya değiştirilmesinden kaynaklanan kar kaybı, veri, kullanım, iyi niyet 
                veya diğer maddi olmayan kayıplar dahil ancak bunlarla sınırlı olmamak üzere 
                dolaylı, arızi, özel, sonuç olarak ortaya çıkan veya cezai zararlardan 
                sorumlu tutulamaz.
              </p>

              <h4>Geçerli Hukuk</h4>
              <p>
                Bu Koşullar, kanun ihtilafı hükümlerine bakılmaksızın, Amerika Birleşik 
                Devletleri Kaliforniya Eyaleti yasalarına göre yönetilecek ve yorumlanacaktır.
              </p>

              <h4>Bize Ulaşın</h4>
              <p>
                Bu Koşullar hakkında herhangi bir sorunuz varsa, lütfen bizimle iletişime geçin:
              </p>
              <p>
                <strong>E-posta:</strong> legal@tulu.com
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
              <Link
                href="https://tulukitap.com/"
                target="_blank"
                className="hover:underline"
              >
                Tulu Kitap
              </Link>
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

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: `Kullanım Koşulları - TULU`,
    description: `TULU kullanım koşulları ve hizmet şartları`,
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
