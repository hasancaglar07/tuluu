import {
  Shield,
  Server,
  Code,
  Languages,
  Zap,
  Globe,
  Users,
} from "lucide-react";
import styles from "./FeaturesSection.module.css";

const features = [
  {
    icon: Languages,
    title: "Language Modules & Lessons",
    description:
      "Easily create, organize, and deliver structured lessons, units, and vocabulary—complete with full localization support for a global audience.",
  },
  {
    icon: Shield,
    title: "Authentication & Roles",
    description:
      "Robust user management powered by Clerk RBAC, JWT authentication, and role guards to ensure secure access for admins and users alike.",
  },
  {
    icon: Globe,
    title: "Multi Translations",
    description:
      "Seamlessly handle multiple languages using powerful translation APIs for user interfaces, lessons, and notifications.",
  },
  {
    icon: Server,
    title: "Scalable & Secure",
    description:
      "Built on Next.js API routes with strict security measures: Content Security Policy (CSP), CORS, HSTS, CSRF protection, server-side validation via Zod, and XSS prevention.",
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description:
      "Comprehensive Swagger documentation, clean RESTful endpoints, and real-time webhook support to simplify development and integration.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Join thousands of developers building the future of language learning with our active community.",
  },
];

export default function FeaturesSection() {
  return (
    <div className={styles.featuresSection}>
      <div className={styles.featuresContainer}>
        <div className={styles.featuresHeader}>
          <div className={styles.sectionBadge}>
            <Zap className={styles.badgeIcon} />
            <span>Features</span>
          </div>
          <h2 className={styles.featuresTitle}>
            Everything you need to build your own Duolingo
          </h2>
          <p className={styles.featuresDescription}>
            The TULU API provides all the endpoints you need to power a
            full-featured language learning experience.
          </p>
        </div>

        <div className={styles.featuresList}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureItem}>
              <div className={styles.featureIconContainer}>
                <feature.icon className={styles.featureIcon} />
                <div className={styles.iconGlow}></div>
              </div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
