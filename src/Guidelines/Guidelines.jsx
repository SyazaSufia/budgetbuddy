import React from 'react';
import ProgramInfo from './ProgramInfo';
import styles from './Guidelines.module.css';

function Guidelines() {
  return (
    <div className={styles.background}>
      <main className={styles.mainContent}>
        <ProgramInfo />
      </main>
    </div>
  );
}

export default Guidelines;