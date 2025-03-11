import React from 'react';
//import { DashboardCard } from './DashboardCard';
//import { ActionCard } from './ActionCard';
//import { ExpenseCategory } from './ExpenseCategory';
import { SideBar } from './SideBar';
//import styles from './Dashboard.module.css';

const sidebarItems = [
  { icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/f50d6c2ce3c706718ebe1acbe973c79b0c262613186aae61bfdc4bc907d9643a?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0', label: 'Dashboard', isActive: true },
  { icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/3b72dcf3c9e9ca651b6227945825656ab7e8f453dba77548b0fcc32e4fe67a33?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0', label: 'Personal', isActive: false },
  { icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/df65a8a30fbb3c29123c26e3a4dc30ec55739201bae0803cd3e70adadc648540?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0', label: 'Income', isActive: false },
  { icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/be66759a114ea14ecd2bc3061710ad97ba5dfddc7ae49e471e20aefee28f5de5?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0', label: 'Expenses', isActive: false },
  { icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/a77e3d2e5ab491d9dac797a7e0adfdf2315ce3cbe3abd8ac22005dea47ca715e?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0', label: 'Budget', isActive: false },
  { icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/0664de7072594b8b2c40afc21c7c63adafae92c5920b93a7250dc93e840ab4f8?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0', label: 'Sign Out', isActive: false }
];

const dashboardCards = [
  { icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/e24267a263fda7ef4e34517587e906aadbb5c2c22ee16a5f58aaef4733e6158a?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0', title: 'Balance', amount: '350.00' },
  { icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/feea5f4c28489ff920eecd94a5400837adfbb6c33e637bd23b91d51a0f7eff54?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0', title: 'Income', amount: '1,000.00' },
  { icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/ad34be4918fc5de9adb0068e5229a3519a91f364bf432a90a5ad107fedbe5e83?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0', title: 'Expense', amount: '650.00' }
];

const actionCards = [
  {
    icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/67ca3f80e6c1d7162cb85a04849becfef05508c573206ddede23d8bfb3971a2f?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0',
    title: 'Add income',
    description: 'Create an income manually',
    variant: 'income'
  },
  {
    icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/651093ac6af4c598bbb9139586f52278d613b6e26477b0f97499ed62cad79693?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0',
    title: 'Add expenses',
    description: 'Create an expense manually',
    variant: 'expense'
  }
];

const expenseCategories = [
  { color: '#9E77ED', category: 'Food', percentage: '41.35', amount: '236.00' },
  { color: '#F04438', category: 'Shopping', percentage: '21.51', amount: '236.00' },
  { color: '#0BA5EC', category: 'Transportation', percentage: '13.47', amount: '236.00' },
  { color: '#17B26A', category: 'School', percentage: '3.35', amount: '236.00' },
  { color: '#4E5BA6', category: 'Entertainment', percentage: '9.97', amount: '236.00' }
];

export const Dashboard = () => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.content}>
        <nav className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            <header className={styles.brand}>
              <div className={styles.logo}>
                <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/623677dbc686bde3d57b2e0efa1e002a20d3fc5825db14e10120ec9e37969fdb?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0" alt="" className={styles.logoImg} />
                <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/7197da27cb98425cd4753d93b474d03fd83dddee6dc7174ee41915960a83bdce?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0" alt="" className={styles.logoImg} />
              </div>
              <h1 className={styles.brandName}>
                BUDGETBUDDY
                <span className={styles.brandDot}>.</span>
              </h1>
            </header>
            
            <div className={styles.sidebarMenu} role="menu">
              {sidebarItems.map((item, index) => (
                <SideBar key={index} {...item} />
              ))}
            </div>
          </div>
          
          <button className={styles.collapseButton} tabIndex="0">
            <span>Collapse</span>
            <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/be5ee1c31e7eba1ab31a153b93b584870b40c663a9c37464fab21e0716e2cf54?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0" alt="" className={styles.collapseIcon} />
          </button>
        </nav>

        <main className={styles.mainContent}>
          <header className={styles.pageHeader}>
            <h2 className={styles.welcomeText}>Hello, Syaza!</h2>
            <div className={styles.periodSelector}>
              <div className={styles.periodButtons}>
                <button className={`${styles.periodButton} ${styles.active}`}>This month</button>
                <button className={styles.periodButton}>Last month</button>
                <button className={styles.periodButton}>This year</button>
                <button className={styles.periodButton}>Last 12 months</button>
              </div>
            </div>
          </header>

          <section className={styles.cardSection}>
            {dashboardCards.map((card, index) => (
              <DashboardCard key={index} {...card} />
            ))}
          </section>

          <section className={styles.actionSection}>
            {actionCards.map((card, index) => (
              <ActionCard key={index} {...card} />
            ))}
          </section>

          <section className={styles.expenseSection}>
            <div className={styles.expenseChart}>
              <h3 className={styles.expenseTitle}>Expenses by category</h3>
              <div className={styles.chartContent}>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/a8a7083ea4de0185899b23b95d6bdbf16d892c0a726407f054cf2c1966b5b6f3?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0"
                  alt="Expense distribution pie chart"
                  className={styles.chartImage}
                />
                <div className={styles.expenseList}>
                  {expenseCategories.map((category, index) => (
                    <ExpenseCategory key={index} {...category} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;