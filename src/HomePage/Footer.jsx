import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  const footerLinks = [
    {
      title: "Company",
      links: [
        { name: "Home", path: "/" },
      ],
    },
    {
      title: "Guidelines",
      links: [
        { name: "FAQs", path: "/faqs" },
        { name: "Community Guidelines", path: "/guidelines" },
      ],
    },
  ];

  return (
    <footer className={styles.footer}>
      {/* Main Footer Section */}
      <div className={styles.mainFooter}>
        <div className={styles.footerContent}>
          {/* Brand Logo */}
          <h2 className={styles.footerBrand}>
            BUDGETBUDDY<span className={styles.brandDot}>.</span>
          </h2>

          {/* Navigation Links */}
          <div className={styles.footerNav}>
            {footerLinks.map((column, index) => (
              <div key={index} className={styles.navColumn}>
                <h3 className={styles.columnTitle}>{column.title}</h3>
                <ul className={styles.navList}>
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link to={link.path} className={styles.footerLink}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;