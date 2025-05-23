import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./InputDesign.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SideBar } from "../SideBar";
import { ChevronRightIcon, PencilIcon, AlertIcon } from "./Icons";
import { communityAPI } from "../../services/UserApi";

// Import the separated RichTextEditor component
import RichTextEditor from "./RichTextEditor";

// Breadcrumb Component
const Breadcrumb = ({ isEditMode }) => {
  return (
    <nav className={styles.breadcrumbContainer}>
      <div className={styles.breadcrumbItem}>
        <a href="/community" className={styles.breadcrumbLink}>
          Community
        </a>
        <ChevronRightIcon />
      </div>
      <span className={styles.breadcrumbText}>
        {isEditMode ? "Edit Post" : "Add New Post"}
      </span>
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
const PostForm = ({ onSubmit, isSubmitting, initialData, isEditMode }) => {
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setSubject(initialData.subject || "");
      setContent(initialData.content || "");
    }
  }, [initialData]);

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
    if (isEditMode) {
      // If editing, go back to the post detail page
      navigate(`/postdetails/${initialData.postID}`); // Changed from /community/post/
    } else {
      // If creating, go back to community page
      navigate("/community");
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.formContent}>
        <h1 className={styles.formTitle}>
          {isEditMode ? "Edit Post" : "New Post"}
        </h1>

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
            value={content}
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
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Posting..."
              : isEditMode
                ? "Update"
                : "Add"}
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [postId, setPostId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialPostData, setInitialPostData] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Handle sidebar collapse toggle
  const handleSidebarToggle = (isCollapsed) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  // Check if we're in edit mode and fetch post data if needed
  useEffect(() => {
    const checkEditMode = async () => {
      // Parse query parameters
      const queryParams = new URLSearchParams(location.search);
      const editPostId = queryParams.get("edit");

      if (editPostId) {
        setIsEditMode(true);
        setPostId(editPostId);
        setIsLoading(true);

        try {
          // Use communityAPI to fetch the post data for editing
          const data = await communityAPI.getPostById(editPostId);

          if (data.success) {
            // Check if current user is the author
            if (user && user.id === data.data.userID) {
              // Set post data
              setInitialPostData(data.data);
            } else {
              // Not the author, redirect back
              toast.error("You don't have permission to edit this post");
              navigate("/community");
            }
          } else {
            throw new Error(data.error || "Unknown error occurred");
          }
        } catch (err) {
          console.error("Error fetching post for edit:", err);
          setError(err.message || "Error loading post");
          toast.error(err.message || "Error loading post");
          navigate("/community");
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkEditMode();
  }, [location.search, navigate, user]);

  // Handle form submission
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError("");

    try {
      // Determine if creating or updating
      const isUpdate = isEditMode && postId;

      // Log the content before sending to API (for debugging)
      console.log("Submitting content to API:", formData.content);

      let data;
      if (isUpdate) {
        // Update existing post
        data = await communityAPI.updatePost(postId, {
          subject: formData.subject,
          content: formData.content,
        });
      } else {
        // Create new post
        data = await communityAPI.createPost({
          subject: formData.subject,
          content: formData.content,
        });
      }

      if (data.success) {
        // Success message and redirect
        const successMessage = isUpdate
          ? "Post updated successfully!"
          : "Post created successfully!";

        if (isUpdate) {
          // For editing, redirect to the post detail page
          // Use the postId that we got from the URL parameter
          console.log("Redirecting to post:", postId); // Debug log

          // Small delay to ensure the post is updated on the server
          setTimeout(() => {
            navigate(`/postdetails/${postId}`, {
              state: { successMessage }, // Pass success message through navigation state
            });
          }, 100);

          // Display success toast
          toast.success(successMessage, {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          // For new posts, use the returned post ID if available
          const newPostId = data.data?.postID || data.postID;
          if (newPostId) {
            // Redirect to the newly created post
            navigate(`/postdetails/${newPostId}`, {
              state: { successMessage },
            });
          } else {
            // Fallback to community page if no post ID returned
            navigate(
              `/community?toast=success&message=${encodeURIComponent(successMessage)}`
            );
          }

          toast.success(successMessage, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } else {
        // Error handling
        throw new Error(
          data.error ||
            `Failed to ${isUpdate ? "update" : "create"} post. Please try again.`
        );
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} post:`, err);
      const errorMessage =
        err.message ||
        `An error occurred while ${isEditMode ? "updating" : "creating"} your post. Please try again.`;
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
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
          <Breadcrumb isEditMode={isEditMode} />

          {error && (
            <div className={styles.errorAlert}>
              <AlertIcon /> {error}
            </div>
          )}

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading post...</p>
            </div>
          ) : (
            <PostForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              initialData={initialPostData}
              isEditMode={isEditMode}
            />
          )}
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
