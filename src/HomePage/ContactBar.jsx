import React from 'react';
import styles from './ContactBar.module.css';
import SocialLinks from './SocialLinks';

const ContactBar = () => {
  return (
    <div className={styles.contactBar}>
      <div className={styles.container}>
        <div className={styles.contactInfo}>
          <span className={styles.phoneNumber}>Phone Number: 04-653 4900</span>
          <span className={styles.divider}></span>
          <span className={styles.email}>Email: Info@budgetbuddy.space</span>
        </div>
        <SocialLinks />
      </div>
    </div>
  );
};

export default ContactBar;