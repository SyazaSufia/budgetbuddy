import React, { useState } from 'react';
import styles from './AvatarSelectionModal.module.css';

const AvatarSelectionModal = ({ isOpen, onClose, onSelect, currentAvatar }) => {
  // Define avatars with names
  const avatars = [
    { path: '/avatars/Aidan.svg', name: 'Aidan' },
    { path: '/avatars/Arjun.svg', name: 'Arjun' },
    { path: '/avatars/Darren.svg', name: 'Darren' },
    { path: '/avatars/Ethan.svg', name: 'Ethan' },
    { path: '/avatars/Faiz.svg', name: 'Faiz' },
    { path: '/avatars/Mark.svg', name: 'Mark' },
    { path: '/avatars/Rishi.svg', name: 'Rishi' },
    { path: '/avatars/Ryan.svg', name: 'Ryan' },
    { path: '/avatars/Ming.svg', name: 'Ming' },
    { path: '/avatars/Aisha.svg', name: 'Aisha' },
    { path: '/avatars/Deepa.svg', name: 'Deepa' },
    { path: '/avatars/Emily.svg', name: 'Emily' },
    { path: '/avatars/Hana.svg', name: 'Hana' },
    { path: '/avatars/Kavita.svg', name: 'Kavita' },
    { path: '/avatars/Lily.svg', name: 'Lily' },
    { path: '/avatars/Ling.svg', name: 'Ling' },
    { path: '/avatars/Mia.svg', name: 'Mia' },
    { path: '/avatars/Rui.svg', name: 'Rui' },
    { path: '/avatars/Shalini.svg', name: 'Shalini' },
    { path: '/avatars/Tara.svg', name: 'Tara' },
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');

  const handleSelect = () => {
    onSelect(selectedAvatar);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Choose Your Avatar</h2>
        </div>
        
        <div className={styles.avatarGrid}>
          {avatars.map((avatar, index) => (
            <div 
              key={index}
              className={`${styles.avatarItem} ${selectedAvatar === avatar.path ? styles.selected : ''}`}
              onClick={() => setSelectedAvatar(avatar.path)}
            >
              <img src={avatar.path} alt={`${avatar.name} avatar`} />
              <span className={styles.avatarName}>{avatar.name}</span>
            </div>
          ))}
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={styles.cancelButton} 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className={styles.selectButton} 
            onClick={handleSelect}
            disabled={!selectedAvatar}
          >
            Select Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectionModal;