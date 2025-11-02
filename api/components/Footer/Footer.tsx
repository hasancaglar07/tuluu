import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.text}>
          Made by
          <Link href="https://www.youtube.com/@sylvaincodes593" target="_blank">
            SylvainCodes
          </Link>
        </p>
        <p className={styles.copyright}>© 2025. All rights reserved.</p>
      </div>
    </footer>
  );
}
