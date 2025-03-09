import React from 'react';
import styles from './AddModal.module.css';

export const AddIncomeModal = () => {
  return (
    <section className={styles.modal}>
      <h2 className={styles.modalTitle}>Add Income</h2>
      <form>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Title:
          </label>
          <input
            id="title"
            type="text"
            className={styles.input}
            placeholder="Title"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="amount" className={styles.label}>
            Amount:
          </label>
          <input
            id="amount"
            type="number"
            className={styles.input}
            placeholder="RM 0.00"
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Add
        </button>
      </form>
    </section>
  );
};