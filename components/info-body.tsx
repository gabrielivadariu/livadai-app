"use client";

import { InfoItem } from "@/lib/info-content";
import styles from "@/app/(app)/legal.module.css";

const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

type Props = {
  items: InfoItem[];
  linkEmails?: boolean;
};

export default function InfoBody({ items, linkEmails = false }: Props) {
  return (
    <div className={styles.stack}>
      {items.map((item, index) => {
        const className =
          item.type === "section" ? styles.section : item.type === "step" ? styles.step : styles.body;
        if (linkEmails) {
          const match = item.text.match(emailRegex);
          if (match) {
            const email = match[0];
            return (
              <a key={`${item.type}-${index}`} className={`${className} ${styles.emailLink}`} href={`mailto:${email}`}>
                {item.text}
              </a>
            );
          }
        }
        return (
          <p key={`${item.type}-${index}`} className={className}>
            {item.text}
          </p>
        );
      })}
    </div>
  );
}
