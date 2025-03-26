import React from "react";
import styles from "./InputDesign.module.css";
import SidebarNav from "../SideBar"; // Import SidebarNav component
import { ChevronRight, Link2, Minus, Bold, Italic, Underline, Strikethrough, List, ListOrdered, AlignCenter, AlignLeft, AlignRight, Indent, Outdent, Edit } from "lucide-react";

// Icons with black color
const ChevronRightIcon = () => <ChevronRight size={20} color="black" />;
const LinkIcon = () => <Link2 size={24} color="black" />;
const HorizontalLineIcon = () => <Minus size={24} color="black" />;
const BoldIcon = () => <Bold size={24} color="black" />;
const ItalicIcon = () => <Italic size={24} color="black" />;
const UnderlineIcon = () => <Underline size={24} color="black" />;
const StrikethroughIcon = () => <Strikethrough size={24} color="black" />;
const BulletListIcon = () => <List size={24} color="black" />;
const NumberedListIcon = () => <ListOrdered size={24} color="black" />;
const AlignCenterIcon = () => <AlignCenter size={24} color="black" />;
const AlignLeftIcon = () => <AlignLeft size={24} color="black" />;
const AlignRightIcon = () => <AlignRight size={24} color="black" />;
const IndentIncreaseIcon = () => <Indent size={24} color="black" />;
const IndentDecreaseIcon = () => <Outdent size={24} color="black" />;
const PencilIcon = () => <Edit size={16} color="black" />;

export {
  ChevronRightIcon,
  LinkIcon,
  HorizontalLineIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  BulletListIcon,
  NumberedListIcon,
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  IndentIncreaseIcon,
  IndentDecreaseIcon,
  PencilIcon,
};

// Breadcrumb Component
const Breadcrumb = () => {
  return (
    <nav className={styles.breadcrumbContainer}>
      <div className={styles.breadcrumbItem}>
        <a href="#" className={styles.breadcrumbLink}>
          Community
        </a>
        <ChevronRightIcon />
      </div>
      <span className={styles.breadcrumbText}>Add New Post</span>
    </nav>
  );
};

// Form Field Component
const FormField = ({ label, placeholder, required, isTextarea = false }) => {
  return (
    <div className={styles.fieldContainer}>
      <div className={styles.fieldLabelContainer}>
        <label className={styles.fieldLabel}>{label}</label>
        {required && <span className={styles.requiredMark}>*</span>}
      </div>
      {!isTextarea ? (
        <div className={styles.inputWrapper}>
          <div className={styles.inputField}>
            <div className={styles.inputContent}>
              <input
                type="text"
                placeholder={placeholder}
                className={styles.inputPlaceholder}
                required={required}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// Rich Text Editor Toolbar Component
const RichTextToolbar = () => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarGroup}>
        <button className={styles.headingButton} aria-label="Heading">
          H
        </button>
        <button aria-label="Link">
          <LinkIcon />
        </button>
        <button aria-label="Horizontal Line">
          <HorizontalLineIcon />
        </button>
      </div>
      <div className={styles.toolbarGroup}>
        <button aria-label="Bold">
          <BoldIcon />
        </button>
        <button aria-label="Italic">
          <ItalicIcon />
        </button>
        <button aria-label="Underline">
          <UnderlineIcon />
        </button>
        <button aria-label="Strikethrough">
          <StrikethroughIcon />
        </button>
      </div>
      <div className={styles.toolbarGroup}>
        <button aria-label="Bullet List">
          <BulletListIcon />
        </button>
        <button aria-label="Numbered List">
          <NumberedListIcon />
        </button>
      </div>
      <div className={styles.toolbarGroup}>
        <button aria-label="Align Center">
          <AlignCenterIcon />
        </button>
        <button aria-label="Align Left">
          <AlignLeftIcon />
        </button>
        <button aria-label="Align Right">
          <AlignRightIcon />
        </button>
        <button aria-label="Increase Indent">
          <IndentIncreaseIcon />
        </button>
        <button aria-label="Decrease Indent">
          <IndentDecreaseIcon />
        </button>
      </div>
    </div>
  );
};

// Rich Text Editor Component
const RichTextEditor = ({ placeholder }) => {
  return (
    <div className={styles.editorContainer}>
      <RichTextToolbar />
      <div className={styles.editorField}>
        <textarea
          className={styles.editorPlaceholder}
          placeholder={placeholder}
        ></textarea>
        <div className={styles.editorActions}>
          <button aria-label="Edit">
            <PencilIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

// Action Buttons Component
const ActionButtons = () => {
  return (
    <div className={styles.formActions}>
      <button className={styles.cancelButton}>Cancel</button>
      <button className={styles.addButton} disabled>
        Add
      </button>
    </div>
  );
};

// Post Form Component
const PostForm = () => {
  return (
    <section className={styles.formContainer}>
      <div className={styles.formContent}>
        <h1 className={styles.formTitle}>New Post</h1>

        <FormField
          label="Subject"
          placeholder="Enter a subject"
          required={true}
        />

        <div className={styles.fieldContainer}>
          <div className={styles.fieldLabelContainer}>
            <label className={styles.fieldLabel}>Content</label>
            <span className={styles.requiredMark}>*</span>
          </div>
          <RichTextEditor placeholder="Add a message here" />
        </div>

        <ActionButtons />
      </div>
    </section>
  );
};

// Main Component
function InputDesign({ user }) {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <SidebarNav /> {/* Sidebar added */}
        <div className={styles.main}>
          <header className={styles.headerContainer}>
            <h2 className={styles.greeting}>Hello, {user?.name || "Guest"}!</h2>
          </header>
          <div className={styles.mainContent}>
            <Breadcrumb />
            <PostForm />
          </div>
        </div>
      </div>
    </main>
  );
}

export default InputDesign;
