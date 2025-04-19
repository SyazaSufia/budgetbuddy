import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./InputDesign.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SideBar } from "../SideBar";
import { ChevronRightIcon, PencilIcon, AlertIcon } from "./Icons";

// Import the separated RichTextEditor component
import RichTextEditor from "./RichTextEditor";

// Breadcrumb Component
const Breadcrumb = () => {
  return (
    <nav className={styles.breadcrumbContainer}>
      <div className={styles.breadcrumbItem}>
        <a href="/community" className={styles.breadcrumbLink}>
          Community
        </a>
        <ChevronRightIcon />
      </div>
      <span className={styles.breadcrumbText}>Add New Post</span>
    </nav>
  );
};

// Form Field Component
const FormField = ({
  label,
  placeholder,
  required,
  value,
  onChange,
  error,
}) => {
  return (
    <div className={styles.fieldContainer}>
      <div className={styles.fieldLabelContainer}>
        <label className={styles.fieldLabel}>{label}</label>
        {required && <span className={styles.requiredMark}>*</span>}
      </div>
      <div className={styles.inputWrapper}>
        <div className={styles.inputField}>
          <div className={styles.inputContent}>
            <input
              type="text"
              placeholder={placeholder}
              className={styles.inputPlaceholder}
              required={required}
              value={value}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
      {error && (
        <div className={styles.errorMessage}>
          <AlertIcon /> {error}
        </div>
      )}
    </div>
  );
};

// PostForm Component
const PostForm = ({ onSubmit, isSubmitting }) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Check form validity whenever subject or content changes
  useEffect(() => {
    const subjectValid = subject.trim() !== "";
    const contentValid =
      content.trim() !== "" && content !== "<br>" && content !== "<p></p>";
    setIsFormValid(subjectValid && contentValid);
  }, [subject, content]);

  const validateForm = () => {
    const newErrors = {};
    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!content.trim() || content === "<br>" || content === "<p></p>") {
      newErrors.content = "Content is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit({ subject, content });
    }
  };

  const handleCancel = () => {
    navigate("/community");
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.formContent}>
        <h1 className={styles.formTitle}>New Post</h1>

        <FormField
          label="Subject"
          placeholder="Enter a subject"
          required={true}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          error={errors.subject}
        />

        <div className={styles.fieldContainer}>
          <div className={styles.fieldLabelContainer}>
            <label className={styles.fieldLabel}>Content</label>
            <span className={styles.requiredMark}>*</span>
          </div>
          <RichTextEditor
            placeholder="Add a message here"
            onChange={setContent}
            error={errors.content}
          />
        </div>

        <div className={styles.formActions}>
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={isSubmitting}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`${styles.addButton} ${isFormValid ? styles.addButtonActive : ""}`}
            disabled={isSubmitting || !isFormValid}
            type="submit"
          >
            {isSubmitting ? "Posting..." : "Add"}
          </button>
        </div>
      </div>
    </form>
  );
};

// Main Component
function InputDesign({ user }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle sidebar collapse toggle
  const handleSidebarToggle = (isCollapsed) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError("");

    try {
      // Call the API endpoint to create a new post using fetch
      const response = await fetch("http://localhost:8080/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: formData.subject,
          content: formData.content,
        }),
        credentials: "include", // Include session cookies
      });

      const data = await response.json();

      if (response.ok && data.success) {
        navigate(`/community?toast=success&message=Post created successfully!`);
      } else {
        setError(data.error || "Failed to create post. Please try again.");
        toast.error(data.error || "Failed to create post. Please try again.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      console.error("Error creating post:", err);
      const errorMessage =
        "An error occurred while creating your post. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      <SideBar onToggleCollapse={handleSidebarToggle} />
      <div
        className={`${styles.content} ${isSidebarCollapsed ? styles.expandedContent : ""}`}
      >
        <header className={styles.headerContainer}>
          <h2 className={styles.greeting}>Hello, {user?.name || "Guest"}!</h2>
        </header>
        <div className={styles.mainContent}>
          <Breadcrumb />

          {error && (
            <div className={styles.errorAlert}>
              <AlertIcon /> {error}
            </div>
          )}

          <PostForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
      {/* Explicitly configure the ToastContainer */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </main>
  );
}

export default InputDesign;
