"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`${styles.heroSection} ${isLoaded ? styles.loaded : ""}`}>
      <div className={styles.heroContent}>
        <div className={styles.badge}>
          <Star className={styles.badgeIcon} />
          <span>Trusted by 10,000+ developers</span>
        </div>

        <h1 className={styles.heroTitle}>
          <span className={styles.titleLine1}>TULU</span>
          <span className={styles.titleLine2}>
            <span className={styles.heroTitleHighlight}>API</span>
          </span>
        </h1>

        <p className={styles.heroDescription}>
          A powerful backend API for building gamified language learning
          platforms—XP, courses, lessons,chapters, units, streaks, quests,
          rewards, and more.
        </p>

        <div className={styles.buttonContainer}>
          <Link href="/api-docs" className={styles.primaryButton}>
            <span>API Documentation</span>
            <ArrowRight className={styles.buttonIcon} />
            <div className={styles.buttonGlow}></div>
          </Link>

          <Link
            href="http://youtube.com/@sylvaincodes593"
            target="blank"
            className={styles.secondaryButton}
          >
            <span>Live Demo</span>
            <div className={styles.buttonShine}></div>
          </Link>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>50+</div>
            <div className={styles.statLabel}>API Endpoints</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>99.9%</div>
            <div className={styles.statLabel}>Uptime</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>10k+</div>
            <div className={styles.statLabel}>Developers</div>
          </div>
        </div>
      </div>
    </div>
  );
}
