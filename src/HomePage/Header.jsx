import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import Button from './Button';

const Header = ({ user, onSignOut }) => {
  const location = useLocation();  // Get current location (path)

  // Default navigation links for all users (even guests)
  const navLinks = [
    { text: 'Home', path: '/' },
    { text: 'Guidelines', path: '/guidelines' },
    { text: 'FAQs', path: '/faqs' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <h1 className={styles.logo}>BUDGETBUDDY.</h1>

          {/* Render navigation links */}
          <nav className={styles.navigation}>
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className={location.pathname === link.path ? styles.activeLink : ''}
              >
                {link.text}
              </Link>
            ))}
          </nav>
        </div>

        {/* Render user greeting and sign-out button if user is signed in */}
        {user ? (
          <div className={styles.userSection}>
            <span className={styles.userName}>Hi, {user.name}!</span>
            <Button text="Sign Out" variant="secondary" onClick={onSignOut} />
          </div>
        ) : (
          <div className={styles.buttonGroup}>
            <Link to="/sign-in">
              <Button text="Sign In" variant="primary" />
            </Link>
            <Link to="/sign-up">
              <Button text="Sign Up" variant="secondary" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
