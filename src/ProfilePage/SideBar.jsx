import React from 'react';
import styles from './SideBar.module.css';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/e241a8dab1f833b2821ad6ecfa9e4b23993cabeadffca36ce5874ecfb53d3f91?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0' },
  { id: 'personal', label: 'Personal', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/963a326ca41bb95d5d837b86e4206d44a8e7a7bea5c67ea020e6363e08ec9b82?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0', active: true },
  { id: 'income', label: 'Income', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/bba2e443cbe30473fb65d208d1c86b7205bafbfadeb10c70b8966a75a48fcc46?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0' },
  { id: 'expenses', label: 'Expenses', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/d4fa6c4a11cda45e24e4b0532813870101b98414663398a6f6e2e5e25b8b879e?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0' },
  { id: 'budget', label: 'Budget', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/38276d56a28861e37b45c2ae2ccac4a4613d8c4b8da51f23e2ecac3890228b9c?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0' },
  { id: 'signout', label: 'Sign Out', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/afb8b8ef1eca70dd93d4c651336d90859042016c6f0d1afa35bb38a6c5c60c57?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0' }
];

export function SideBar() {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/aa70394c53d90984059bd7d624a6cc61ca871ce78d9486e878b458297af9ec7c?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0"
              className={styles.logoImage}
              alt="BudgetBuddy primary logo"
            />
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/9743ef369f584b3552cb5254de5d932e008647f98db132bb0a3cc579ebbbfded?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0"
              className={styles.logoImageSecondary}
              alt="BudgetBuddy secondary logo"
            />
          </div>
          <div className={styles.brandName}>
            BUDGETBUDDY<span className={styles.brandNameHighlight}>.</span>
          </div>
        </div>
        <div className={styles.menuList}>
          {menuItems.map(item => (
            <div
              key={item.id}
              className={`${styles.menuItem} ${item.active ? styles.menuItemActive : ''}`}
              role="button"
              tabIndex={0}
            >
              <img
                loading="lazy"
                src={item.icon}
                className={styles.menuIcon}
                alt={`${item.label} icon`}
              />
              <div>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div 
        className={styles.collapseButton}
        role="button"
        tabIndex={0}
      >
        <div className={styles.collapseText}>Collapse</div>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/be5ee1c31e7eba1ab31a153b93b584870b40c663a9c37464fab21e0716e2cf54?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0"
          className={styles.collapseIcon}
          alt="Collapse sidebar"
        />
      </div>
    </nav>
  );
}

export default SideBar;