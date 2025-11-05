import HeaderPage from "@/components/modules/header/page";
import Container from "@/components/custom/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ChevronRight,
  HelpCircle,
  Book,
  Settings,
  Users,
  Headphones,
  Mail,
  Phone,
  MessageCircle,
  Video,
} from "lucide-react";
import type { Metadata } from "next";
import { LocaleLink } from "@/components/custom/locale-link";

export const metadata: Metadata = {
  title: "Yardım & Destek | TULU",
  description:
    "TULU ile ilgili yardım alın. Sık sorulan soruların cevaplarını bulun veya destek ekibimizle iletişime geçin.",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderPage />

      <Container className="py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">
            Yardım & Destek Merkezi
          </h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Sık sorulan soruların cevaplarını bulun, bilgi bankamıza göz atın veya
            kişiselleştirilmiş yardım için destek ekibimizle iletişime geçin.
          </p>

          <Tabs defaultValue="faq" className="mb-12">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="faq">Sık Sorulan Sorular</TabsTrigger>
              <TabsTrigger value="guides">Kullanıcı Rehberleri</TabsTrigger>
              <TabsTrigger value="contact">Destek İletişim</TabsTrigger>
              <TabsTrigger value="community">Topluluk</TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Öğrenme & İlerleme
                  </h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Seriler nasıl çalışır?</AccordionTrigger>
                      <AccordionContent>
                        <p>
                          Seriler, art arda kaç gün en az bir ders tamamladığınızı takip eder. 
                          Serinizi korumak için her gün en az bir ders tamamlamanız gerekir. 
                          Bir gün kaçırırsanız, seriniz sıfırlanır. Bir günlük hareketsizlik 
                          için serinizi korumak amacıyla mağazadan Seri Dondurma öğesi kullanabilirsiniz.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>
                        Mücevherler nedir ve nasıl kazanırım?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p>
                          Mücevherler TULU&apos;nun sanal para birimidir. Mücevherleri 
                          şu yollarla kazanabilirsiniz:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                          <li>Dersleri tamamlayarak</li>
                          <li>Mükemmel puanlar alarak</li>
                          <li>Görevleri ve başarıları tamamlayarak</li>
                          <li>Serinizi koruyarak</li>
                          <li>Seviye atlayarak</li>
                        </ul>
                        <p className="mt-2">
                          Mücevherleri mağazadan Seri Dondurma, bonus dersler ve 
                          karakter özelleştirmeleri gibi öğeleri satın almak için kullanabilirsiniz.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                      <AccordionTrigger>
                        Öğrendiğim dili nasıl değiştirebilirim?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p>Öğrenme dilinizi değiştirmek için:</p>
                        <ol className="list-decimal pl-5 space-y-2 mt-2">
                          <li>Profil ayarlarınıza gidin</li>
                          <li>&quot;Öğrenme Dili&quot; seçeneğini seçin</li>
                          <li>Listeden yeni dilinizi seçin</li>
                          <li>Seçiminizi onaylayın</li>
                        </ol>
                        <p className="mt-2">
                          Dilinizi değiştirdiğinizde yeni dil kursunun başından 
                          başlayacağınızı, ancak önceki dillerdeki ilerlemenizin 
                          kaydedileceğini unutmayın.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Hesap & Abonelik
                  </h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-4">
                      <AccordionTrigger>
                        Şifremi nasıl sıfırlarım?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-2">Şifrenizi sıfırlamak için:</p>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Giriş ekranına gidin</li>
                          <li>&quot;Şifremi Unuttum&quot; seçeneğine tıklayın</li>
                          <li>Hesabınızla ilişkili e-posta adresini girin</li>
                          <li>Şifre sıfırlama bağlantısı için e-postanızı kontrol edin</li>
                          <li>Yeni bir şifre oluşturmak için bağlantıyı takip edin</li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5">
                      <AccordionTrigger>
                        Ücretsiz ve premium hesaplar arasındaki fark nedir?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p>
                          Ücretsiz hesaplar size temel derslere ve özelliklere erişim 
                          sağlarken, Premium hesaplar şunları sunar:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                          <li>Sınırsız kalpler (öğrenmeye devam etmek için bekleme yok)</li>
                          <li>Reklamsız deneyim</li>
                          <li>Çevrimdışı dersler</li>
                          <li>İlerleme testleri</li>
                          <li>Ustalık testleri</li>
                          <li>Sınırsız beceri testi atlamaları</li>
                          <li>Kişiselleştirilmiş öğrenme planı</li>
                        </ul>
                        <p className="mt-2">
                          Premium abonelikler aylık veya yıllık planlar halinde 
                          sunulmaktadır ve yıllık plan önemli tasarruf sağlar.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-6">
                      <AccordionTrigger>
                        Aboneliğimi nasıl iptal ederim?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p>Aboneliğinizi iptal etmek için:</p>
                        <ol className="list-decimal pl-5 space-y-2 mt-2">
                          <li>Profil ayarlarınıza gidin</li>
                          <li>&quot;Abonelik&quot; seçeneğini seçin</li>
                          <li>&quot;Aboneliği İptal Et&quot; seçeneğine tıklayın</li>
                          <li>İptal onayı için yönergeleri takip edin</li>
                        </ol>
                        <p className="mt-2">
                          Premium özellikleriniz mevcut fatura döneminizin sonuna kadar 
                          aktif kalacaktır. Bundan sonra, hesabınız ücretsiz bir hesaba 
                          dönüşecektir, ancak tüm ilerlemeniz kaydedilecektir.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Tüm SSS&apos;leri Görüntüle
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="guides" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <LocaleLink href="/help/getting-started" className="block">
                      <div className="bg-[#1cb0f6] h-32 flex items-center justify-center">
                        <HelpCircle className="h-16 w-16 text-white" />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2">
                          Başlangıç Rehberi
                        </h3>
                        <p className="text-gray-600 mb-4">
                          TULU&apos;nun temellerini öğrenin ve dil yolculuğunuza başlayın
                        </p>
                        <div className="flex items-center text-[#1cb0f6] font-medium">
                          Rehberi oku <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </LocaleLink>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <LocaleLink href="/help/practice-tips" className="block">
                      <div className="bg-[#ff4b4b] h-32 flex items-center justify-center">
                        <Book className="h-16 w-16 text-white" />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2">
                          Etkili Pratik İpuçları
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Öğrenmenizi ve hafızanızı en üst düzeye çıkaracak stratejiler
                        </p>
                        <div className="flex items-center text-[#ff4b4b] font-medium">
                          Rehberi oku <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </LocaleLink>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <LocaleLink href="/help/premium-features" className="block">
                      <div className="bg-[#ffc800] h-32 flex items-center justify-center">
                        <svg
                          className="h-16 w-16 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2">
                          Premium Özellikler Rehberi
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Premium aboneliğin tüm avantajlarını keşfedin
                        </p>
                        <div className="flex items-center text-[#ffc800] font-medium">
                          Rehberi oku <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </LocaleLink>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <LocaleLink href="/help/troubleshooting" className="block">
                      <div className="bg-[#58cc
