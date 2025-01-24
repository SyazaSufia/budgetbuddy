import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import Button from './Button';

const Header = ({ user, onSignOut }) => {
  const location = useLocation();  // Get current location (path)

  // Default navigation links for all users (even guests)
  const allNavLinks = [
    { text: 'Home', path: '/' },
    { text: 'Guidelines', path: '/guidelines' },
    { text: 'FAQs', path: '/faqs' },
  ];

  // Conditionally add the "Appointments" link based on user role (user or medical-staff)
  const userNavLinks = [
    ...allNavLinks,
    { text: 'Appointments', path: user?.role === 'user' ? '/appointment-view' : '/' },
  ];

  const staffNavLinks = [
    { text: 'Appointments', path: '/appointment-view-ms' }
  ];

  // Admin-specific navigation links
  const adminNavLinks = [
    { text: 'Home', path: '/admin-home' },
    { text: 'Event Details', path: '/admin-event' },
    { text: 'Medical Staff', path: '/admin-medical-staff' },
    { text: 'Appointments', path: '/admin-appointment' },
    { text: 'Feedback', path: '/admin-feedback' },
    { text: 'BloodBank', path: '/bloodbank' }
  ];

  // Determine the links to show based on the user role
  const linksToShow =
  user?.role === 'admin'
    ? adminNavLinks
    : user?.role === 'medical-staff'
    ? staffNavLinks
    : user
    ? userNavLinks
    : allNavLinks;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <h1 className={styles.logo}>BUDGETBUDDY.</h1>

          {/* Conditionally render navigation links */}
          <nav className={styles.navigation}>
            {linksToShow.map((link, index) => (
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
