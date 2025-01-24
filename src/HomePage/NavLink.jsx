import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './NavLink.module.css';

const NavLink = ({ text, path, isDropdown }) => {
  const location = useLocation();

  // Determine if the current path matches the link's path
  const isActive = location.pathname === path;

  const linkClass = `${styles.navLink} ${isActive ? styles.active : ''} ${isDropdown ? styles.dropdown : ''}`;

  return (
    <Link to={path} className={linkClass}>
      {text}
      {isDropdown && <span className={styles.dropdownIcon}>▼</span>}
    </Link>
  );
};

export default NavLink;
