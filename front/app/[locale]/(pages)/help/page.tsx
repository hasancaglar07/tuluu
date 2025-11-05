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
  //   CardDescription,
  //   CardFooter,
  //   CardHeader,
  //   CardTitle,
} from "@/components/ui/card";
import {
  ChevronRight,
  HelpCircle,
  Book,
  Settings,
  Users,
  //   FileText,
  //   Search,
  //   CreditCard,
  //   Shield,
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

          {/* <div className="relative mb-12">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search for help..."
              className="pl-10 py-6 text-lg rounded-full shadow-sm border-gray-200 focus:border-blue-500"
            />
          </div> */}

          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Getting Started</span>
                </CardTitle>
                <CardDescription>New to TULU? Start here</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <LocaleLink
                      href="/help/getting-started/account-setup"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      Account Setup <ChevronRight className="h-4 w-4 ml-1" />
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/help/getting-started/first-lesson"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      Your First Lesson{" "}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/help/getting-started/navigation"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      Navigating the App{" "}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </LocaleLink>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  View All Guides
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span>Subscription & Billing</span>
                </CardTitle>
                <CardDescription>Manage your subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <LocaleLink
                      href="/help/billing/plans"
                      className="text-green-600 hover:underline flex items-center"
                    >
                      Subscription Plans{" "}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/help/billing/payment-methods"
                      className="text-green-600 hover:underline flex items-center"
                    >
                      Payment Methods <ChevronRight className="h-4 w-4 ml-1" />
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/help/billing/cancel"
                      className="text-green-600 hover:underline flex items-center"
                    >
                      Cancellation <ChevronRight className="h-4 w-4 ml-1" />
                    </LocaleLink>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-green-200 text-green-600 hover:bg-green-50"
                >
                  Billing FAQ
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span>Account & Security</span>
                </CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <LocaleLink
                      href="/help/account/password-reset"
                      className="text-purple-600 hover:underline flex items-center"
                    >
                      Password Reset <ChevronRight className="h-4 w-4 ml-1" />
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/help/account/profile"
                      className="text-purple-600 hover:underline flex items-center"
                    >
                      Profile Settings <ChevronRight className="h-4 w-4 ml-1" />
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/help/account/privacy"
                      className="text-purple-600 hover:underline flex items-center"
                    >
                      Privacy Settings <ChevronRight className="h-4 w-4 ml-1" />
                    </LocaleLink>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Security Guide
                </Button>
              </CardFooter>
            </Card>
          </div> */}

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
                          <li>-Öğrenme Dili- seçeneğini seçin</li>
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
                          <li>-Şifremi Unuttum- seçeneğine tıklayın</li>
                          <li>
                            Hesabınızla ilişkili e-posta adresini girin
                          </li>
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
                          <li>
                            Sınırsız kalpler (öğrenmeye devam etmek için bekleme yok)
                          </li>
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
                          <li>-Abonelik- seçeneğini seçin</li>
                          <li>-Aboneliği İptal Et- seçeneğine tıklayın</li>
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
                  Tüm SSS'leri Görüntüle
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
                          TULU'nun temellerini öğrenin ve dil yolculuğunuza başlayın
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
                      <div className="bg-[#58cc02] h-32 flex items-center justify-center">
                        <Settings className="h-16 w-16 text-white" />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2">
                          Troubleshooting Guide
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Solutions for common technical issues and problems
                        </p>
                        <div className="flex items-center text-[#58cc02] font-medium">
                          Read guide <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </LocaleLink>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <LocaleLink href="/help/mobile-app" className="block">
                      <div className="bg-[#8549ba] h-32 flex items-center justify-center">
                        <svg
                          className="h-16 w-16 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="5"
                            y="2"
                            width="14"
                            height="20"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <line
                            x1="12"
                            y1="18"
                            x2="12.01"
                            y2="18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2">
                          Mobile App Guide
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Learn how to use the TULU mobile app effectively
                        </p>
                        <div className="flex items-center text-[#8549ba] font-medium">
                          Read guide <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </LocaleLink>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <LocaleLink href="/help/learning-path" className="block">
                      <div className="bg-[#ff9600] h-32 flex items-center justify-center">
                        <svg
                          className="h-16 w-16 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <polyline
                            points="22 4 12 14.01 9 11.01"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2">
                          Learning Path Guide
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Understand how to progress through your language
                          journey
                        </p>
                        <div className="flex items-center text-[#ff9600] font-medium">
                          Read guide <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                    </LocaleLink>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-8 rounded-lg">
                    <h2 className="text-2xl font-bold mb-6">
                      Contact Our Support Team
                    </h2>
                    <p className="mb-6">
                      Can&apos;t find what you&nbsp;re looking for? Our support
                      team is here to help. Please fill out the form below and
                      we&apos;ll get back to you as soon as possible.
                    </p>

                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="name" className="block font-medium">
                            Your Name
                          </label>
                          <Input id="name" placeholder="John Doe" required />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="email" className="block font-medium">
                            Email Address
                          </label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="subject" className="block font-medium">
                          Subject
                        </label>
                        <Input
                          id="subject"
                          placeholder="What is your question about?"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="block font-medium">
                          Message
                        </label>
                        <textarea
                          id="message"
                          className="w-full min-h-[150px] p-3 border rounded-md"
                          placeholder="Please describe your issue in detail..."
                          required
                        ></textarea>
                      </div>

                      <Button
                        type="submit"
                        className="bg-[#58cc02] hover:bg-[#46a302] text-white font-bold"
                      >
                        Submit Request
                      </Button>
                    </form>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    Other Ways to Reach Us
                  </h3>

                  <div className="space-y-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <h4 className="font-semibold">Email Support</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          For general inquiries and support
                        </p>
                        <a
                          href="mailto:support@tulu.com"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          support@tulu.com
                        </a>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <h4 className="font-semibold">Phone Support</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Available Monday-Friday, 9am-5pm PT
                        </p>
                        <a
                          href="tel:+18005551234"
                          className="text-green-600 hover:underline text-sm"
                        >
                          +1 (800) 555-1234
                        </a>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-purple-100 p-2 rounded-full">
                            <MessageCircle className="h-5 w-5 text-purple-600" />
                          </div>
                          <h4 className="font-semibold">Live Chat</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Chat with our support team in real-time
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-purple-600 border-purple-200"
                        >
                          Start Chat
                        </Button>
                      </CardContent>
                    </Card>

                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Support Hours</h4>
                      <div className="text-sm space-y-1">
                        <p>Monday - Friday: 9am - 6pm PT</p>
                        <p>Weekend: 10am - 4pm PT</p>
                        <p>Holidays: Limited support</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="community" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Community Forums</h3>
                  <p className="mb-4">
                    Join our community forums to connect with other learners,
                    share tips, and get help from experienced users.
                  </p>

                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-2">
                        Popular Forum Categories
                      </h4>
                      <ul className="space-y-2">
                        <li>
                          <LocaleLink
                            href="/community/beginners"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            Beginners Corner{" "}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </LocaleLink>
                        </li>
                        <li>
                          <LocaleLink
                            href="/community/grammar"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            Grammar Questions{" "}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </LocaleLink>
                        </li>
                        <li>
                          <LocaleLink
                            href="/community/vocabulary"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            Vocabulary Building{" "}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </LocaleLink>
                        </li>
                        <li>
                          <LocaleLink
                            href="/community/study-groups"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            Study Groups{" "}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </LocaleLink>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Visit Community Forums
                  </Button>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Learning Resources</h3>
                  <p className="mb-4">
                    Explore additional resources to enhance your language
                    learning journey.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Book className="h-5 w-5 text-amber-600" />
                          <h4 className="font-semibold">Learning Blog</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Tips and strategies from language experts
                        </p>
                        <LocaleLink
                          href="/blog"
                          className="text-amber-600 hover:underline text-sm flex items-center"
                        >
                          Read articles{" "}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </LocaleLink>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Video className="h-5 w-5 text-cyan-600" />
                          <h4 className="font-semibold">Video Tutorials</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Visual guides to help you learn faster
                        </p>
                        <LocaleLink
                          href="/tutorials"
                          className="text-cyan-600 hover:underline text-sm flex items-center"
                        >
                          Watch videos <ChevronRight className="h-3 w-3 ml-1" />
                        </LocaleLink>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-5 w-5 text-rose-600" />
                          <h4 className="font-semibold">Language Partners</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Find someone to practice with
                        </p>
                        <LocaleLink
                          href="/partners"
                          className="text-rose-600 hover:underline text-sm flex items-center"
                        >
                          Find partners{" "}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </LocaleLink>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Headphones className="h-5 w-5 text-emerald-600" />
                          <h4 className="font-semibold">Podcasts</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Listen and learn on the go
                        </p>
                        <LocaleLink
                          href="/podcasts"
                          className="text-emerald-600 hover:underline text-sm flex items-center"
                        >
                          Listen now <ChevronRight className="h-3 w-3 ml-1" />
                        </LocaleLink>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-2">
                        Join Our Social Media Community
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Follow us on social media for daily language tips,
                        challenges, and to connect with other learners.
                      </p>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="flex-1">
                          Facebook
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Twitter
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Instagram
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="bg-[#f7f7f7] p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              If you couldn&apos;t find what you&nbsp;re looking for, our
              support team is ready to assist you. We&apos;re committed to
              providing you with the best learning experience possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-[#1cb0f6] hover:bg-[#0a9fd9] text-white font-bold"
              >
                <LocaleLink href="https://www.patreon.com/messages/?mode=campaign&tab=chats">
                  Contact Support
                </LocaleLink>
              </Button>
              <Button asChild variant="outline">
                <LocaleLink href="https://www.patreon.com/messages/?mode=campaign&tab=chats">
                  Visit Community Forum
                </LocaleLink>
              </Button>
            </div>
          </div>
        </div>
      </Container>

      <footer className="bg-gray-100 py-8 mt-12">
        <Container>
          <div className="text-center text-gray-600">
            <p>© {new Date().getFullYear()} TULU. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <LocaleLink href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </LocaleLink>
              <LocaleLink href="/terms" className="hover:underline">
                Terms of Service
              </LocaleLink>
              <LocaleLink href="/about" className="hover:underline">
                About Us
              </LocaleLink>
              <LocaleLink href="/contact" className="hover:underline">
                Contact Us
              </LocaleLink>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
