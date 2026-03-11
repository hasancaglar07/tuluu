import styles from "./page.module.css";
import AnimatedBackground from "@/components/AnimatedBackground/AnimatedBackground";
import HeroSection from "@/components/HeroSection/HeroSection";
import FeaturesSection from "@/components/FeaturesSection/FeaturesSection";
import CTASection from "@/components/CTASection/CTASection";
import Footer from "@/components/Footer/Footer";

// Next.js dynamic metadata
export function generateMetadata() {
  return {
    title: `TULU - Dil Öğrenme API'si`,
    description:
      "Oyunlaştırılmış dil öğrenme API'si. XP, seri, ders ve kullanıcı ilerlemesi gibi uç noktalarla kendi uygulamanızı geliştirin.",
    icons: {
      icon: `/logo_.png`,
    },
  };
}

export default function Page() {
  return (
    <div className={styles.container}>
      <AnimatedBackground />

      <main className={styles.main}>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
