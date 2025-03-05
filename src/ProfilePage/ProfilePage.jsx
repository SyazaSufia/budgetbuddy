import React, { useState } from 'react';
import SideBar from './SideBar';
import InfoSection from './InfoSection';
import FormField from './FormField';
import styles from './ProfilePage.module.css';

const universities = [
  'Universiti Malaya (UM)',
  'Universiti Kebangsaan Malaysia (UKM)',
  'Universiti Putra Malaysia (UPM)',
  'Universiti Sains Malaysia (USM)',
  'Universiti Teknologi Malaysia (UTM)'
];

const yearsOfStudy = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    age: '',
    email: '',
    phoneNumber: '',
    university: '',
    course: '',
    yearOfStudy: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updatedForm = { ...prev, [field]: value };
      return updatedForm;
    });
  };

  const isFormComplete = Object.values(formData).every(value => value.trim() !== '');

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
              </div>
            </InfoSection>

            <InfoSection title="Personal Information" required>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <FormField label="Name" placeholder="Full name" onChange={(e) => handleInputChange('name', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <FormField label="Username" placeholder="Username" onChange={(e) => handleInputChange('username', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <FormField label="Age" placeholder="Age" type="number" onChange={(e) => handleInputChange('age', e.target.value)} />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <FormField label="Email" placeholder="Email address" type="email" onChange={(e) => handleInputChange('email', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <FormField label="Phone Number" placeholder="Phone Number" type="tel" onChange={(e) => handleInputChange('phoneNumber', e.target.value)} />
                </div>
                <div className={styles.formGroup}></div>
              </div>
            </InfoSection>

            <InfoSection title="Academic Information" required>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <FormField label="University Name" type="select" placeholder="University Name" onChange={(e) => handleInputChange('university', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <FormField label="Course" placeholder="Course Name" onChange={(e) => handleInputChange('course', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <FormField label="Year of Study" type="select" placeholder="Year of Study" onChange={(e) => handleInputChange('yearOfStudy', e.target.value)} />
                </div>
              </div>
            </InfoSection>
          </div>

          <button 
            className={styles.saveButton}
            type="submit"
            disabled={!isFormComplete}
          >
            Save
          </button>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;