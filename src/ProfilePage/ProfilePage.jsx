import React from 'react';
import SideBar from './SideBar';
import InfoSection from './InfoSection';
import FormField from './FormField';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  return (
    <main className={styles.profile}>
      <div className={styles.content}>
        <SideBar />
        <div className={styles.mainContent}>
          <div className={styles.contentWrapper}>
            <InfoSection title="Account Information">
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Profile Image:</label>
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/190302b558048d193c9098f2b965722789bfd4bc188b926ea4ba98cba82e1f01?placeholderIfAbsent=true&apiKey=f57fde44dc854af1bb149ad964888ac0"
                    alt="User profile"
                    className={styles.profileImage}
                  />
                </div>
                <FormField
                  label="Creation Date"
                  type="select"
                  placeholder="Select"
                />
              </div>
            </InfoSection>

            <InfoSection title="Personal Information" required>
              <div className={styles.row}>
                <FormField label="Name" placeholder="Full name" />
                <FormField label="Username" placeholder="Username" />
                <FormField label="Age" placeholder="Age" type="number" />
              </div>
              <div className={`${styles.row} ${styles.rowSpaced}`}>
                <FormField label="Email" placeholder="Email address" type="email" />
                <FormField label="Phone Number" placeholder="Phone Number" type="tel" />
              </div>
            </InfoSection>

            <InfoSection title="Academic Information" required>
              <div className={styles.row}>
                <FormField
                  label="University Name"
                  type="select"
                  placeholder="University Name"
                />
                <FormField label="Course" placeholder="Course Name" />
                <FormField
                  label="Year of Study"
                  type="select"
                  placeholder="Year of Study"
                />
              </div>
            </InfoSection>
          </div>
          
          <button 
            className={styles.saveButton}
            type="submit"
            disabled
          >
            Save
          </button>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;
