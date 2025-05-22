import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { profileAPI } from "../services/api";
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
    scholarshipTitle: "", // Added new field for custom scholarship title
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
    scholarshipTitle: "", // Added new error field
  });

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
      
      // Use the centralized API for fetching user details
      const data = await profileAPI.getUserDetails();

      if (data.user) {
        const userData = data.user;

        // Format the date correctly for HTML date input (YYYY-MM-DD)
        let dob = userData.userDOB || "";
        if (dob) {
          // Extract just the YYYY-MM-DD part if it contains time info
          dob = dob.split('T')[0];
        }

        // Calculate age based on the DOB
        const age = calculateAge(dob);

        // Set default avatar if none is set
        let profileImage = userData.profileImage || "/avatars/Default.svg";
        
        // Handle scholarship type and title
        const predefinedTypes = ["JPA", "MARA", "Yayasan", "Petronas"];
        let scholarshipType = userData.scholarshipType || "";
        let scholarshipTitle = "";
        
        // If scholarshipType is not one of the predefined types and not empty,
        // consider it as a custom scholarship
        if (scholarshipType && !predefinedTypes.includes(scholarshipType)) {
          scholarshipTitle = scholarshipType; // The title is the full value
          scholarshipType = "other";
        }
        
        // The backend now ensures proper capitalization
        const incomeType = userData.incomeType || "";
        
        // Set form data with all user details
        setFormData({
          id: userData.id,
          name: userData.name || "",
          age: age.toString(),
          dob, // Now just the YYYY-MM-DD part
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

    if (field === "age") {
      updatedErrors.age = !/^\d+$/.test(value) ? "Age must be a number" : "";
    }

    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      updatedErrors.email = emailRegex.test(value)
        ? ""
        : "Please enter a valid email address";
    }

    if (field === "phoneNumber") {
      updatedErrors.phoneNumber = !/^\d*$/.test(value)
        ? "Phone number must contain only numbers"
        : "";
    }
    
    if (field === "scholarshipTitle") {
      updatedErrors.scholarshipTitle = value.trim() === "" 
        ? "Scholarship name is required" 
        : "";
    }

    // If the field is DOB, we should also update age
    if (field === "dob") {
      // Calculate age from the date
      const age = calculateAge(value);

      // Update form with both the new DOB and calculated age
      setFormData((prev) => ({
        ...prev,
        [field]: value, // Keep DOB exactly as entered (already in YYYY-MM-DD format)
        age: age.toString(),
      }));
    } else if (field === "incomeType") {
      // If changing income type and it's not "Passive", clear scholarship type and title
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        scholarshipType: value === "Passive" ? prev.scholarshipType : "",
        scholarshipTitle: value === "Passive" ? prev.scholarshipTitle : ""
      }));
    } else if (field === "scholarshipType") {
      // If changing scholarship type and it's not "other", clear scholarship title
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        scholarshipTitle: value === "other" ? prev.scholarshipTitle : ""
      }));
    } else {
      // Handle other fields normally
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    setErrors(updatedErrors);
  };

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
    
    // Add scholarshipType to required fields only if incomeType is Passive
    if (formData.incomeType === "Passive") {
      requiredFields.push("scholarshipType");
      
      // Add scholarshipTitle to required fields only if scholarshipType is other
      if (formData.scholarshipType === "other") {
        requiredFields.push("scholarshipTitle");
      }
    }
    
    const isComplete = requiredFields.every(
      (field) => formData[field] && formData[field].trim() !== ""
    );
    const hasErrors = Object.values(errors).some((err) => err !== "");

    setIsFormComplete(isComplete && !hasErrors);
  };

  // Handle avatar selection
  const handleAvatarSelect = (avatarPath) => {
    handleInputChange("profileImage", avatarPath);
  };

  // Handle sidebar collapse state changes
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      
      // Create a copy of form data for submission
      const formDataToSubmit = { ...formData };
      
      // If "other" is selected, use the scholarshipTitle directly as the scholarshipType value
      if (formData.incomeType === "Passive" && formData.scholarshipType === "other" && formData.scholarshipTitle) {
        formDataToSubmit.scholarshipType = formData.scholarshipTitle.trim();
      }

      console.log("Submitting profile data:", formDataToSubmit);

      // Use the centralized API for updating profile
      await profileAPI.updateProfile(formDataToSubmit);
      
      toast.success("Profile updated successfully!");
      // Reload the user data after successful update
      await fetchUserData();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while fetching user data
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
                  <FormField
                    label="Name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e)}
                    disabled={isSaving}
                  />
                </div>
                <div className={styles.formGroup}>
                  <FormField
                    label="Age"
                    placeholder="Age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e)}
                    readOnly={true}
                    disabled={isSaving}
                  />
                  {errors.age && (
                    <p className={styles.errorText}>{errors.age}</p>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <FormField
                    label="Date of Birth"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange("dob", e)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <FormField
                    label="Email"
                    placeholder="Email address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e)}
                    disabled={isSaving}
                  />
                  {errors.email && (
                    <p className={styles.errorText}>{errors.email}</p>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <FormField
                    label="Phone Number"
                    placeholder="Phone Number"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e)}
                    disabled={isSaving}
                  />
                  {errors.phoneNumber && (
                    <p className={styles.errorText}>{errors.phoneNumber}</p>
                  )}
                </div>
                {/* Empty space to keep layout balanced */}
                <div className={styles.formGroup}></div>
              </div>
            </InfoSection>

            {/* New Financial Information Section */}
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
                    <FormField
                      label="Scholarship Name"
                      placeholder="Enter scholarship name"
                      value={formData.scholarshipTitle}
                      onChange={(e) => handleInputChange("scholarshipTitle", e)}
                      disabled={isSaving}
                    />
                    {errors.scholarshipTitle && (
                      <p className={styles.errorText}>{errors.scholarshipTitle}</p>
                    )}
                  </div>
                )}
                
                {/* Empty div to keep layout balanced if not all fields are shown */}
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
      
      {/* Avatar Selection Modal */}
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