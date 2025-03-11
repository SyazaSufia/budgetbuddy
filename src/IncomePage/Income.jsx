import React from 'react';
import styles from './Income.module.css';
import SidebarNav from './SideBar';
import IncomeList from './IncomeList';
import TimeFilter from './TimeFilter';

export default function IncomeLayout({ user }) {
  return (
    <main className={styles.incomeDefault}>
      <div className={styles.content}>
        <SidebarNav />
        <section className={styles.main}>
          <header className={styles.headerSection}>
            <h1 className={styles.pageHeader}>
              Hello, {user ? user.name : 'Guest'}!
            </h1>
            <TimeFilter />
          </header>
          
          <section className={styles.content3}>
            <form className={styles.totalIncome}>
              <label htmlFor="totalIncome" className={styles.labelM}>
                Total Income
              </label>
              <div className={styles.inputC}>
                <div className={styles.inputM}>
                  <input 
                    id="totalIncome"
                    type="text" 
                    className={styles.placeholder}
                    value="RM 2,000"
                    readOnly
                    aria-label="Total Income Amount"
                  />
                </div>
              </div>
            </form>
            
            <IncomeList />
          </section>
        </section>
      </div>
    </main>
  );
}
