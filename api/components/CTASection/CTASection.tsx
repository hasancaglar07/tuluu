import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./CTASection.module.css";

export default function CTASection() {
  return (
    <div className={styles.ctaSection}>
      <div className={styles.ctaContainer}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Start Building Today</h2>
          <p className={styles.ctaDescription}>
            Plug into the API and start creating your own Duolingo-style
            language learning app in minutes.
          </p>
          <div className={styles.ctaButtonContainer}>
            <Link href="/api-docs" className={styles.ctaPrimaryButton}>
              <span>Explore the Docs</span>
              <ArrowRight className={styles.buttonIcon} />
              <div className={styles.buttonGlow}></div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}