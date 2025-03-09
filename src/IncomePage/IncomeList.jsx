import React from 'react';
import styles from './Income.module.css';

const incomeItems = [
  { id: 1, title: 'Title', date: '15-11-2024', amount: '260.00' },
  { id: 2, title: 'Title', date: '15-11-2024', amount: '260.00' },
  { id: 3, title: 'Title', date: '15-11-2024', amount: '260.00' },
  { id: 4, title: 'Title', date: '15-11-2024', amount: '260.00' }
];

export default function IncomeList() {
  return (
    <section className={styles.incomeLists}>
      <h2 className={styles.title}>All Income</h2>
      <div className={styles.content4}>
        {incomeItems.map((item, index) => (
          <article key={item.id} className={styles.incomeLists2}>
            <div className={styles.content5}>
              <h3 className={styles.title2}>{item.title}</h3>
              <div className={styles.leftContent}>
                <time className={styles.date}>{item.date}</time>
                <div className={styles.amount}>
                  <span className={styles.currency}>RM</span>
                  <span className={styles.amount}>{item.amount}</span>
                </div>
              </div>
              <div className={styles.icons}>
                <button className={styles.iconButton} aria-label="Edit income">
                  <img loading="lazy" src="/edit-icon.svg" alt=""/>
                </button>
                <button className={styles.iconButton} aria-label="Delete income">
                  <img loading="lazy" src="/delete-icon.svg" alt=""/>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      <button className={styles.addIncomeButton}>
        <img loading="lazy" src="/add-icon.svg" alt=""/>
        <span>Add Income</span>
      </button>
    </section>
  );
}