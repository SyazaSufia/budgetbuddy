import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SideBar from "./SideBar";
import InfoSection from "./InfoSection";
import FormField from "./FormField";
import styles from "./ProfilePage.module.css";

const universities = [
  "Universiti Malaya (UM)",
  "Universiti Kebangsaan Malaysia (UKM)",
  "Universiti Putra Malaysia (UPM)",
  "Universiti Sains Malaysia (USM)",
  "Universiti Teknologi Malaysia (UTM)",
];

const yearsOfStudy = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Postgraduate",
];

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    age: "",
    email: "",
    phoneNumber: "",
    university: "",
    course: "",
    yearOfStudy: "",
    profileImage: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [errors, setErrors] = useState({
    age: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    // Fetch user data from the backend
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
          let profileImageUrl = '';

          // Fetch the profile image blob if it exists
          if (userData.profileImage) {
            const imageResponse = await fetch(`http://localhost:8080/profile-image/${userData.id}`);
            if (imageResponse.ok) {
              const imageBlob = await imageResponse.blob();
              profileImageUrl = URL.createObjectURL(imageBlob);
            }
          }

          const updatedFormData = {
            id: userData.id,
            name: userData.name,
            age: age.toString(),
            email: userData.email,
            phoneNumber: userData.phoneNumber || "",
            university: userData.university || "",
            course: userData.course || "",
            yearOfStudy: userData.yearOfStudy || "",
            profileImage: profileImageUrl,
          };

          setFormData(updatedFormData);
        } else {
          console.error("No user data found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Check form completion whenever formData or errors change
  useEffect(() => {
    checkFormCompletion();
  }, [formData, errors]);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleInputChange = (field, value) => {
    let updatedErrors = { ...errors };

    if (field === "age") {
      updatedErrors.age = !/^\d+$/.test(value) ? "Age must be a number" : "";
    }

    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      updatedErrors.email = emailRegex.test(value) ? "" : "Please enter a valid email address";
    }

    if (field === "phoneNumber") {
      updatedErrors.phoneNumber = !/^\d*$/.test(value) ? "Phone number must contain only numbers" : "";
    }

    setErrors(updatedErrors);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const checkFormCompletion = () => {
    const requiredFields = ["name", "age", "email", "phoneNumber", "university", "course", "yearOfStudy", "profileImage"];
    const isComplete = requiredFields.every((field) => formData[field] && formData[field].trim() !== "");
    const hasErrors = Object.values(errors).some((err) => err !== "");
    
    setIsFormComplete(isComplete && !hasErrors);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create a URL for the image preview
      const imageUrl = URL.createObjectURL(file);
      handleInputChange("profileImage", imageUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = formData.profileImage;
  
    if (selectedImage) {
      const imageData = new FormData();
      imageData.append("image", selectedImage);
  
      try {
        const response = await fetch("http://localhost:8080/upload", {
          method: "POST",
          credentials: "include",
          body: imageData,
        });
        const data = await response.json();
        imageUrl = data.imageUrl;
        handleInputChange("profileImage", `http://localhost:8080${imageUrl}`);
  
        // Update profile picture URL in the database
        await fetch("http://localhost:8080/update-profile-picture", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ id: formData.id, profileImage: imageUrl }),
        });
  
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image.");
      }
    }
  
    // Save other form data
    try {
      const response = await fetch("http://localhost:8080/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        toast.success("Profile updated successfully!");
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
      <div className={styles.content}>
        <SideBar />
        <div className={styles.mainContent}>
        <header className={styles.headerSection}>
            <h1 className={styles.pageHeader}>Hello, {formData.name || 'Guest'}!</h1>
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
                  {errors.age && <p className={styles.errorText}>{errors.age}</p>}
                </div>
                <div className={styles.formGroup}>
                  <FormField
                    label="Email"
                    placeholder="Email address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e)}
                  />
                  {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                </div>
                <div className={styles.formGroup}>
                  <FormField
                    label="Phone Number"
                    placeholder="Phone Number"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e)}
                  />
                  {errors.phoneNumber && <p className={styles.errorText}>{errors.phoneNumber}</p>}
                </div>
              </div>
            </InfoSection>

            <InfoSection title="Academic Information" required>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <FormField
                    label="University Name"
                    type="select"
                    placeholder="Select your university"
                    options={universities}
                    value={formData.university}
                    onChange={(e) => handleInputChange("university", e)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <FormField
                    label="Course"
                    placeholder="Course Name"
                    value={formData.course}
                    onChange={(e) => handleInputChange("course", e)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <FormField
                    label="Year of Study"
                    type="select"
                    placeholder="Select your year of study"
                    options={yearsOfStudy}
                    value={formData.yearOfStudy}
                    onChange={(e) => handleInputChange("yearOfStudy", e)}
                  />
                </div>
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