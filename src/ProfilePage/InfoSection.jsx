import React from 'react';
import styles from './InfoSection.module.css';

export function InfoSection({ title, required, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {required && <span className={styles.required}>*</span>}
      </div>
      <div className={styles.sectionContent}>
        {children}
      </div>
    </section>
  );
}

export default InfoSection;