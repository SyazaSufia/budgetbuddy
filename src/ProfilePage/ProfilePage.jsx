import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SideBar from "./SideBar";
import InfoSection from "./InfoSection";
import FormField from "./FormField";
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
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [errors, setErrors] = useState({
    age: "",
    email: "",
    phoneNumber: "",
  });

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
      const response = await fetch("http://localhost:8080/get-user-details", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

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

        // Rest of your profile image logic
        let profileImageUrl = "";
        if (userData.id) {
          profileImageUrl = `http://localhost:8080/profile-image/${userData.id}?t=${new Date().getTime()}`;
        } else {
          profileImageUrl = "/default-icon.svg";
        }

        // Set form data with all user details
        setFormData({
          id: userData.id,
          name: userData.name || "",
          age: age.toString(),
          dob, // Now just the YYYY-MM-DD part
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          profileImage: profileImageUrl,
        });
      } else {
        console.error("No user data found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
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
    ];
    const isComplete = requiredFields.every(
      (field) => formData[field] && formData[field].trim() !== ""
    );
    const hasErrors = Object.values(errors).some((err) => err !== "");

    setIsFormComplete(isComplete && !hasErrors);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      handleInputChange("profileImage", imageUrl);
    }
  };

  // Handle sidebar collapse state changes
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create a copy of form data for submission
      const formDataToSubmit = { ...formData };

      // Rest of your image upload code
      if (selectedImage) {
        const imageData = new FormData();
        imageData.append("image", selectedImage);

        try {
          const imageResponse = await fetch("http://localhost:8080/upload", {
            method: "POST",
            credentials: "include",
            body: imageData,
          });

          if (!imageResponse.ok) {
            throw new Error(`Image upload failed: ${imageResponse.status}`);
          }

          const imageResult = await imageResponse.json();
          const imageUrl = `/profile-image/${formData.id}?t=${new Date().getTime()}`;
          formDataToSubmit.profileImage = `http://localhost:8080${imageUrl}`;
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Failed to upload image.");
          return;
        }
      }

      // Now update the profile with the unmodified date
      const response = await fetch("http://localhost:8080/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formDataToSubmit),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setSelectedImage(null);
        fetchUserData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error saving profile.");
    }
  };

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
                <div className={styles.field}>
                  <label className={styles.label}>Profile Image:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.profileImageInput}
                  />
                  {formData.profileImage && (
                    <img
                      src={formData.profileImage}
                      alt="User profile"
                      className={styles.profileImage}
                    />
                  )}
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
                  />
                  {errors.phoneNumber && (
                    <p className={styles.errorText}>{errors.phoneNumber}</p>
                  )}
                </div>
                {/* Empty space to keep layout balanced */}
                <div className={styles.formGroup}></div>
              </div>
            </InfoSection>
          </div>

          <button
            className={styles.saveButton}
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormComplete}
          >
            Save
          </button>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;