import React from 'react';
import styles from './FeatureCard.module.css';

const FeatureCard = ({ title, description, imageSrc, imageAlt, isReversed }) => {
  return (
    <div className={`${styles.featureCard} ${isReversed ? styles.reversed : ''}`}>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
      <img src={imageSrc} alt={imageAlt} className={styles.image} />
    </div>
  );
};

export default FeatureCard;