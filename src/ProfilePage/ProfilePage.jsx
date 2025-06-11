import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { profileAPI } from "../services/UserApi";
import SideBar from "./SideBar";
import InfoSection from "./InfoSection";
import FormField from "./FormField";
import AvatarSelectionModal from "./AvatarSelectionModal";
import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    age: "",
    dob: "",
    email: "",
    phoneNumber: "",
    profileImage: "",
    incomeType: "",
    scholarshipType: "",
    scholarshipTitle: "",
  });

  const [isFormComplete, setIsFormComplete] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({
    age: "",
    email: "",
    phoneNumber: "",
    scholarshipTitle: "",
  });

  // Enhanced validation functions
  const validateEmail = (email) => {
    if (!email) return "Email is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address (e.g., user@example.com)";
    }
    return "";
  };

  const validateAge = (age) => {
    if (!age) return "Age is required";
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return "Age must be a number";
    if (ageNum < 1 || ageNum > 150) return "Age must be between 1 and 150";
    return "";
  };

  const validatePhoneNumber = (phone) => {
    if (!phone) return "Phone number should be numbers";
    // Remove any spaces, dashes, or parentheses for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check if it contains only digits after cleaning
    if (!/^\d+$/.test(cleanPhone)) {
      return "Phone number must contain only numbers";
    }
    
    // Check length (Malaysian phone numbers are typically 10-11 digits)
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return "Phone number must be 10-11 digits long";
    }
    
    // Check if it starts with valid Malaysian prefixes
    if (!cleanPhone.startsWith('01') && !cleanPhone.startsWith('60')) {
      return "Please enter a valid Malaysian phone number";
    }
    
    return "";
  };

  // Format phone number for display (add dashes for readability)
  const formatPhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/[\s\-]/g, '');
    if (cleanPhone.length >= 10) {
      return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return cleanPhone;
  };

  // Get avatar name from path
  const getAvatarName = (path) => {
    if (!path) return "";
    const filename = path.split('/').pop();
    return filename.split('.')[0];
  };

  const calculateAge = (dob) => {
    if (!dob) return "";

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      const data = await profileAPI.getUserDetails();

      if (data.user) {
        const userData = data.user;

        let dob = userData.userDOB || "";
        if (dob) {
          dob = dob.split('T')[0];
        }

        const age = calculateAge(dob);
        let profileImage = userData.profileImage || "/avatars/Default.svg";
        
        const predefinedTypes = ["JPA", "MARA", "Yayasan", "Petronas"];
        let scholarshipType = userData.scholarshipType || "";
        let scholarshipTitle = "";
        
        if (scholarshipType && !predefinedTypes.includes(scholarshipType)) {
          scholarshipTitle = scholarshipType;
          scholarshipType = "other";
        }
        
        const incomeType = userData.incomeType || "";
        
        setFormData({
          id: userData.id,
          name: userData.name || "",
          age: age.toString(),
          dob,
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          profileImage: profileImage,
          incomeType: incomeType,
          scholarshipType: scholarshipType,
          scholarshipTitle: scholarshipTitle,
        });
        
        console.log("Loaded user data:", {
          incomeType: incomeType,
          scholarshipType: scholarshipType,
          scholarshipTitle: scholarshipTitle
        });
      } else {
        console.error("No user data found");
        toast.error("Failed to load user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(error.message || "Error loading profile data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    checkFormCompletion();
  }, [formData, errors]);

  const handleInputChange = (field, value) => {
    const updatedErrors = { ...errors };

    // Enhanced validation based on field type
    if (field === "age") {
      // Allow only numeric input
      if (value && !/^\d+$/.test(value)) {
        return; // Don't update if input contains non-numeric characters
      }
      updatedErrors.age = validateAge(value);
    }

    if (field === "email") {
      updatedErrors.email = validateEmail(value);
    }

    if (field === "phoneNumber") {
      // Allow only digits, spaces, and dashes during input
      const filteredValue = value.replace(/[^\d\s\-]/g, '');
      updatedErrors.phoneNumber = validatePhoneNumber(filteredValue);
      
      setFormData(prev => ({
        ...prev,
        [field]: filteredValue
      }));
      setErrors(updatedErrors);
      return;
    }
    
    if (field === "scholarshipTitle") {
      updatedErrors.scholarshipTitle = value.trim() === "" 
        ? "Scholarship name is required" 
        : "";
    }

    // Handle DOB and age calculation
    if (field === "dob") {
      const age = calculateAge(value);
      updatedErrors.age = validateAge(age.toString());

      setFormData((prev) => ({
        ...prev,
        [field]: value,
        age: age.toString(),
      }));
    } else if (field === "incomeType") {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        scholarshipType: value === "Passive" ? prev.scholarshipType : "",
        scholarshipTitle: value === "Passive" ? prev.scholarshipTitle : ""
      }));
    } else if (field === "scholarshipType") {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        scholarshipTitle: value === "other" ? prev.scholarshipTitle : ""
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    setErrors(updatedErrors);
  };

  // Enhanced form completion check
  const checkFormCompletion = () => {
    const requiredFields = [
      "name",
      "age",
      "dob",
      "email",
      "phoneNumber",
      "profileImage",
      "incomeType"
    ];
    
    if (formData.incomeType === "Passive") {
      requiredFields.push("scholarshipType");
      
      if (formData.scholarshipType === "other") {
        requiredFields.push("scholarshipTitle");
      }
    }
    
    const isComplete = requiredFields.every(field => {
      const value = formData[field];
      if (typeof value === 'string') {
        return value && value.trim() !== "";
      }
      return value !== null && value !== undefined && value !== "";
    });

    const hasErrors = Object.values(errors).some(err => err !== "");
    setIsFormComplete(isComplete && !hasErrors);
  };

  const handleAvatarSelect = (avatarPath) => {
    handleInputChange("profileImage", avatarPath);
  };

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation before submission
    const finalErrors = {
      email: validateEmail(formData.email),
      age: validateAge(formData.age),
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
      scholarshipTitle: formData.incomeType === "Passive" && formData.scholarshipType === "other" && !formData.scholarshipTitle.trim() 
        ? "Scholarship name is required" 
        : ""
    };

    const hasErrors = Object.values(finalErrors).some(err => err !== "");
    
    if (hasErrors) {
      setErrors(finalErrors);
      toast.error("Please correct the errors before submitting");
      return;
    }

    try {
      setIsSaving(true);
      
      const formDataToSubmit = { ...formData };
      
      if (formData.incomeType === "Passive" && formData.scholarshipType === "other" && formData.scholarshipTitle) {
        formDataToSubmit.scholarshipType = formData.scholarshipTitle.trim();
      }

      console.log("Submitting profile data:", formDataToSubmit);

      await profileAPI.updateProfile(formDataToSubmit);
      
      toast.success("Profile updated successfully!");
      await fetchUserData();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className={styles.profile}>
        <div className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}>
          <SideBar onToggleCollapse={handleSidebarToggle} />
          <div className={styles.mainContent}>
            <div className={styles.loadingContainer}>
              <p>Loading profile data...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.profile}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div
        className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}
      >
        <SideBar onToggleCollapse={handleSidebarToggle} />
        <div className={styles.mainContent}>
          <header className={styles.headerSection}>
            <h1 className={styles.pageHeader}>
              Hello, {formData.name || "Guest"}!
            </h1>
          </header>
          <div className={styles.contentWrapper}>
            <InfoSection title="Account Information">
              <div className={styles.row}>
                <div className={styles.avatarField}>
                  <div className={styles.avatarLabelContainer}>
                    <label className={styles.label}>Profile Image</label>
                    <span className={styles.labelColon}>:</span>
                  </div>
                  <div className={styles.avatarContentContainer}>
                    <div className={styles.avatarWrapper}>
                      <img
                        src={formData.profileImage || "/avatars/Default.svg"}
                        alt="User profile"
                        className={styles.profileImage}
                      />
                      <button 
                        type="button"
                        className={styles.chooseAvatarButton}
                        onClick={() => setIsAvatarModalOpen(true)}
                        disabled={isSaving}
                      >
                        Choose Your Avatar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </InfoSection>

            <InfoSection title="Personal Information" required>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <div className={styles.fieldContainer}>
                    <div className={styles.labelContainer}>
                      <label className={styles.label}>Name</label>
                      <span className={styles.labelColon}>:</span>
                    </div>
                    <div className={styles.inputContainer}>
                      <input
                        className={styles.select}
                        placeholder="Full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.fieldContainer}>
                    <div className={styles.labelContainer}>
                      <label className={styles.label}>Age</label>
                      <span className={styles.labelColon}>:</span>
                    </div>
                    <div className={styles.inputContainer}>
                      <input
                        className={`${styles.select} ${errors.age ? styles.errorInput : ''}`}
                        type="number"
                        placeholder="Age"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        readOnly={true}
                        disabled={isSaving}
                        min="1"
                        max="150"
                      />
                    </div>
                  </div>
                  {errors.age && (
                    <p className={styles.errorText}>{errors.age}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.fieldContainer}>
                    <div className={styles.labelContainer}>
                      <label className={styles.label}>Date of Birth</label>
                      <span className={styles.labelColon}>:</span>
                    </div>
                    <div className={styles.inputContainer}>
                      <input
                        className={styles.select}
                        type="date"
                        value={formData.dob}
                        onChange={(e) => handleInputChange("dob", e.target.value)}
                        disabled={isSaving}
                        max={new Date().toISOString().split('T')[0]} // Prevent future dates
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <div className={styles.fieldContainer}>
                    <div className={styles.labelContainer}>
                      <label className={styles.label}>Email</label>
                      <span className={styles.labelColon}>:</span>
                    </div>
                    <div className={styles.inputContainer}>
                      <input
                        className={`${styles.select} ${errors.email ? styles.errorInput : ''}`}
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                  {errors.email && (
                    <p className={styles.errorText}>{errors.email}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.fieldContainer}>
                    <div className={styles.labelContainer}>
                      <label className={styles.label}>Phone Number</label>
                      <span className={styles.labelColon}>:</span>
                    </div>
                    <div className={styles.inputContainer}>
                      <input
                        className={`${styles.select} ${errors.phoneNumber ? styles.errorInput : ''}`}
                        type="tel"
                        placeholder="012-345-6789"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        disabled={isSaving}
                        maxLength="12" // Allow for formatted number with dashes
                      />
                    </div>
                  </div>
                  {errors.phoneNumber && (
                    <p className={styles.errorText}>{errors.phoneNumber}</p>
                  )}
                </div>
                <div className={styles.formGroup}></div>
              </div>
            </InfoSection>

            <InfoSection title="Financial Information" required>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <div className={styles.fieldContainer}>
                    <div className={styles.labelContainer}>
                      <label className={styles.label}>Income Type</label>
                      <span className={styles.labelColon}>:</span>
                    </div>
                    <div className={styles.inputContainer}>
                      <select 
                        className={styles.select}
                        value={formData.incomeType}
                        onChange={(e) => handleInputChange("incomeType", e.target.value)}
                        disabled={isSaving}
                      >
                        <option value="">Select Income Type</option>
                        <option value="Active">Active</option>
                        <option value="Passive">Passive</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {formData.incomeType === "Passive" && (
                  <div className={styles.formGroup}>
                    <div className={styles.fieldContainer}>
                      <div className={styles.labelContainer}>
                        <label className={styles.label}>Scholarship Type</label>
                        <span className={styles.labelColon}>:</span>
                      </div>
                      <div className={styles.inputContainer}>
                        <select 
                          className={styles.select}
                          value={formData.scholarshipType}
                          onChange={(e) => handleInputChange("scholarshipType", e.target.value)}
                          disabled={isSaving}
                        >
                          <option value="">Select Scholarship Type</option>
                          <option value="JPA">Jabatan Perkhidmatan Awam (JPA)</option>
                          <option value="MARA">Majlis Amanah Rakyat (MARA)</option>
                          <option value="Yayasan">Yayasan Khazanah</option>
                          <option value="Petronas">Petronas Education</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                {formData.incomeType === "Passive" && formData.scholarshipType === "other" && (
                  <div className={styles.formGroup}>
                    <div className={styles.fieldContainer}>
                      <div className={styles.labelContainer}>
                        <label className={styles.label}>Scholarship Name</label>
                        <span className={styles.labelColon}>:</span>
                      </div>
                      <div className={styles.inputContainer}>
                        <input
                          className={`${styles.select} ${errors.scholarshipTitle ? styles.errorInput : ''}`}
                          type="text"
                          placeholder="Enter scholarship name"
                          value={formData.scholarshipTitle}
                          onChange={(e) => handleInputChange("scholarshipTitle", e.target.value)}
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                    {errors.scholarshipTitle && (
                      <p className={styles.errorText}>{errors.scholarshipTitle}</p>
                    )}
                  </div>
                )}
                
                {!(formData.incomeType === "Passive" && formData.scholarshipType === "other") && 
                 (formData.incomeType !== "Passive" || <div className={styles.formGroup}></div>)}
              </div>
            </InfoSection>
          </div>

          <button
            className={styles.saveButton}
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormComplete || isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      
      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={formData.profileImage}
      />
    </main>
  );
};

export default ProfilePage;