import React from 'react';
import styles from './SocialLinks.module.css';

const SocialLinks = () => {
  const socialIcons = [
    {
      src: "https://cdn.builder.io/api/v1/image/assets/TEMP/6a8bf9ba49dca51ec14f86a1e34aae1e1718c1aefb9bff1115f184ed43c0caf6?apiKey=c78782b587ef483eb6a7cfa02a7de9d2&",
      alt: "Website",
      link: "https://pusatsejahtera.usm.my"
    },
    {
      src: "https://cdn.builder.io/api/v1/image/assets/TEMP/9130dd78f2b01c23e90ad299cd143875b254c0cb25f4922cbb678a4337eb5f84?apiKey=c78782b587ef483eb6a7cfa02a7de9d2&",
      alt: "Facebook",
      link: "https://www.facebook.com/pusatsejahterausm"
    },
    {
      src: "https://cdn.builder.io/api/v1/image/assets/TEMP/59494772a59e69a7ecdca2d68e2c0af589ddb82a1ce2fb16ebbec7b2e415975b?apiKey=c78782b587ef483eb6a7cfa02a7de9d2&",
      alt: "Instagram",
      link: "https://www.instagram.com/pusatsejahteraofficial/"
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