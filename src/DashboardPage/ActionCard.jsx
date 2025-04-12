import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

export const ActionCard = ({ icon, title, description, variant }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (variant === 'income') {
      navigate('/income');
    } else if (variant === 'expense') {
      navigate('/expense');
    }
  };

  return (
    <article 
      className={`${styles.actionCard} ${styles[variant]}`} 
      onClick={handleClick}
    >
      <div className={styles.actionIcon}>
        <img loading="lazy" src={icon} alt="" className={styles.actionImg} />
      </div>
      <div className={styles.actionText}>
        <h3 className={styles.actionTitle}>{title}</h3>
        <p className={styles.actionDescription}>{description}</p>
      </div>
    </article>
  );
};

export default ActionCard;