import React, { useState } from 'react';
import styles from './Income.module.css';
import { AddIncomeModal } from './AddModal';
import { DeleteModal } from './DeleteModal';

const initialIncomeItems = [
  { id: 1, title: 'Title', date: '15-11-2024', amount: '260.00' },
  { id: 2, title: 'Title', date: '15-11-2024', amount: '260.00' },
  { id: 3, title: 'Title', date: '15-11-2024', amount: '260.00' },
  { id: 4, title: 'Title', date: '15-11-2024', amount: '260.00' }
];

export default function IncomeList() {
  const [incomeItems, setIncomeItems] = useState(initialIncomeItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState(null);

  const handleDeleteClick = (id) => {
    setSelectedIncomeId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIncomeItems((prevItems) => prevItems.filter(item => item.id !== selectedIncomeId));
    setIsDeleteModalOpen(false);
    setSelectedIncomeId(null);
  };

  return (
    <section className={styles.incomeLists}>
      <h2 className={styles.title}>All Income</h2>
      <div className={styles.content4}>
        {incomeItems.map((item) => (
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
                  <img loading="lazy" src="/edit-icon.svg" alt="Edit" />
                </button>
                <button
                  className={styles.iconButton}
                  aria-label="Delete income"
                  onClick={() => handleDeleteClick(item.id)}
                >
                  <img loading="lazy" src="/delete-icon.svg" alt="Delete" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button className={styles.addIncomeButton} onClick={() => setIsModalOpen(true)}>
        <img loading="lazy" src="/add-icon.svg" alt="Add" />
        <span>Add Income</span>
      </button>

      {isModalOpen && <AddIncomeModal onClose={() => setIsModalOpen(false)} />}
      {isDeleteModalOpen && (
        <DeleteModal
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </section>
  );
}
