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
        const age = calculateAge(userData.userDOB);
        const dob = userData.userDOB?.split("T")[0] || ""; // format YYYY-MM-DD
        let profileImageUrl = "";

        // Always use the profile-image endpoint to get the blob image
        if (userData.id) {
          // Add timestamp to prevent caching
          profileImageUrl = `http://localhost:8080/profile-image/${userData.id}?t=${new Date().getTime()}`;
        } else {
          profileImageUrl = "/default-icon.svg"; // Use default if no user id
        }

        setFormData({
          id: userData.id,
          name: userData.name || "",
          age: age.toString(),
          dob,
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

    setErrors(updatedErrors);
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      // First handle image upload if there's a new image
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

          // Use the endpoint that serves blob images with cache busting
          const imageUrl = `/profile-image/${formData.id}?t=${new Date().getTime()}`;

          // Update profileImage in formData with the blob endpoint URL
          setFormData((prev) => ({
            ...prev,
            profileImage: `http://localhost:8080${imageUrl}`,
          }));

          // No need to call update-profile-picture separately
          // The /upload endpoint already updates the database
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Failed to upload image.");
          return; // Stop if image upload fails
        }
      }

      // Now update the full profile
      const response = await fetch("http://localhost:8080/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        // Clear the selectedImage since it's been uploaded
        setSelectedImage(null);
        // Refresh user data
        fetchUserData();
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error saving profile.");
    }
  };

  return (
    <main className={styles.profile}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
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