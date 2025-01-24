import React, { useState } from 'react';
import styles from './FAQAccordion.module.css';

const FAQAccordion = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.faqAccordion}>
      <button
        className={styles.accordionHeader}
        onClick={toggleAccordion}
        aria-expanded={isOpen}
      >
        <span className={styles.question}>{question}</span>
        <span className={styles.toggleIcon}>
          {isOpen ? (
            <svg 
              className={isOpen ? styles.openIcon : styles.closedIcon}
              width="20" 
              height="20" 
              viewBox="0 0 24 24"
              >
              <path d="M19 13H5v-2h14v2z"></path>
            </svg>
          ) : (
            <svg 
              className={isOpen ? styles.openIcon : styles.closedIcon}
              width="20" 
              height="20" 
              viewBox="0 0 24 24">
              <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
            </svg>
          )}
        </span>
      </button>
      {isOpen && (
        <div className={styles.accordionContent}>
          <p className={styles.answer}>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default FAQAccordion;
