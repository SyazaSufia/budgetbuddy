import React from 'react';
import styles from './SocialLinks.module.css';

const SocialLinks = () => {
  const socialIcons = [
    {
      src: "/Facebook-icon.svg",
      alt: "Facebook"
    },
    {
      src: "/Instagram-icon.svg",
      alt: "Instagram"
    },
    {
      src: "/Twitter-icon.svg",
      alt: "Twitter"
    },
    {
      src: "/LinkedIn-icon.svg",
      alt: "LinkedIn"
    }
  ];

  return (
    <div className={styles.socialLinks}>
      {socialIcons.map((icon, index) => (
        <a
          href={icon.link}
          key={index}
          className={styles.socialLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={icon.src} alt={icon.alt} className={styles.socialIcon} />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;