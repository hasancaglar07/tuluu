import styles from "./page.module.css";
import AnimatedBackground from "@/components/AnimatedBackground/AnimatedBackground";
import HeroSection from "@/components/HeroSection/HeroSection";
import FeaturesSection from "@/components/FeaturesSection/FeaturesSection";
import CTASection from "@/components/CTASection/CTASection";
import Footer from "@/components/Footer/Footer";

// Next.js dynamic metadata
export function generateMetadata() {
  return {
    title: `TULU - Language Learning API`,
    description:
      "Gamified Language Learning API / Build your own Duolingo-style app with endpoints for XP, streaks, lessons, user progress, and more.",
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
