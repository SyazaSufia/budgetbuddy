import React from 'react';
import Sidebar from './SideBar';
import BudgetCard from './BudgetCard';
import styles from './Budget.module.css';

const mockBudgets = [
  {
    id: 1,
    title: "Title",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    id: 2,
    title: "Title",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    id: 3,
    title: "Title",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    id: 4,
    title: "Title",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    id: 5,
    title: "Title",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    id: 6,
    title: "Title",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  }
];

function BudgetLayout() {
  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.mainContent}>
          <h1 className={styles.welcomeText}>Hello, Syaza!</h1>
          <section className={styles.budgetGrid}>
            {mockBudgets.map(budget => (
              <BudgetCard
                key={budget.id}
                title={budget.title}
                description={budget.description}
              />
            ))}
            <BudgetCard isCreateNew />
          </section>
        </main>
      </div>
    </div>
  );
}

export default BudgetLayout;