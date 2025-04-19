import React, { useState, useRef, useEffect } from "react";
import styles from "./RichTextEditor.module.css";
import {
  Link2,
  Minus,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Indent,
  Outdent,
  AlertCircle,
  Smile,
} from "lucide-react";

// Icons with black color
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
const SmileIcon = () => <Smile size={24} color="black" />;
const AlertIcon = () => <AlertCircle size={16} color="red" />;

// Rich Text Editor Component
const RichTextEditor = ({ placeholder, onChange, value, error }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  // Common emojis for quick access
  const commonEmojis = [
    // Smileys & Emotion
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😜", "😝",
    "🤔", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
    "😔", "😞", "😟", "😢", "😭", "😤", "😠", "😡", "🤬", "😳",

    // Gestures
    "👍", "👎", "👏", "🙌", "👋", "🙏", "🤝", "✌️", "🤞", "👌",
    "🤙", "💪", "🖐️", "✋", "🖖", "🫶", "🫵", "👊", "🤛", "🤜",

    // Symbols & Objects
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
    "💯", "✅", "❌", "⚠️", "❗", "❓", "🔔", "🔕", "💡", "🔥",

    // Food & Celebration
    "🎂", "🍰", "🍕", "🍔", "🍟", "🍣", "🍩", "🍪", "🍫", "🍿",
    "🎉", "🥳", "🎈", "🎊", "🎁", "🧁", "🍭", "🍎", "🍉", "🍇",

    // Animals & Nature
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
    "🌞", "🌝", "🌚", "🌧️", "⛈️", "❄️", "🌈", "🔥", "💧", "🌊",

    // Money-related
    "💰", "💸", "💳", "🪙", "🏦", "📈", "📉", "🧾", "🪪", "🤑",

    // Student/School-related
    "🎓", "📚", "📖", "📝", "✏️", "📒", "📓", "📔", "📅", "🧑‍🎓",
    "🏫", "📎", "📌", "📐", "📏", "📊", "📋", "🔍", "🖊️", "💼"
  ];

  // Handle formatting commands
  const handleFormat = (command, value = null) => {
    if (!editorRef.current) return;

    document.execCommand(command, false, value);
    editorRef.current.focus();

    // Update content
    if (onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    // Set initial content if provided
    if (value && editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle specialized commands
  const handleSpecialCommand = (command) => {
    if (!editorRef.current) return;

    switch (command) {
      case "heading":
        document.execCommand("formatBlock", false, "<h2>");
        break;
      case "horizontalLine":
        document.execCommand("insertHorizontalRule", false, null);
        break;
      case "link":
        const url = prompt("Enter the URL:", "http://");
        if (url) document.execCommand("createLink", false, url);
        break;
      case "emoji":
        setShowEmojiPicker(!showEmojiPicker);
        break;
      default:
        break;
    }
    editorRef.current.focus();

    // Update content
    if (onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Insert emoji at cursor position
  const insertEmoji = (emoji) => {
    if (!editorRef.current) return;

    // Focus on editor
    editorRef.current.focus();

    // Insert emoji at cursor position
    document.execCommand("insertText", false, emoji);

    // Update content
    if (onChange) {
      onChange(editorRef.current.innerHTML);
    }

    // Close emoji picker
    setShowEmojiPicker(false);
  };

  // Handle content changes
  const handleContentChange = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            className={styles.headingButton}
            aria-label="Heading"
            onClick={() => handleSpecialCommand("heading")}
            type="button"
          >
            H
          </button>
          <button
            aria-label="Link"
            onClick={() => handleSpecialCommand("link")}
            type="button"
          >
            <LinkIcon />
          </button>
          <button
            aria-label="Horizontal Line"
            onClick={() => handleSpecialCommand("horizontalLine")}
            type="button"
          >
            <HorizontalLineIcon />
          </button>
        </div>
        <div className={styles.toolbarGroup}>
          <button
            aria-label="Bold"
            onClick={() => handleFormat("bold")}
            type="button"
          >
            <BoldIcon />
          </button>
          <button
            aria-label="Italic"
            onClick={() => handleFormat("italic")}
            type="button"
          >
            <ItalicIcon />
          </button>
          <button
            aria-label="Underline"
            onClick={() => handleFormat("underline")}
            type="button"
          >
            <UnderlineIcon />
          </button>
          <button
            aria-label="Strikethrough"
            onClick={() => handleFormat("strikeThrough")}
            type="button"
          >
            <StrikethroughIcon />
          </button>
        </div>
        <div className={styles.toolbarGroup}>
          <button
            aria-label="Bullet List"
            onClick={() => handleFormat("insertUnorderedList")}
            type="button"
          >
            <BulletListIcon />
          </button>
          <button
            aria-label="Numbered List"
            onClick={() => handleFormat("insertOrderedList")}
            type="button"
          >
            <NumberedListIcon />
          </button>
        </div>
        <div className={styles.toolbarGroup}>
          <button
            aria-label="Align Left"
            onClick={() => handleFormat("justifyLeft")}
            type="button"
          >
            <AlignLeftIcon />
          </button>
          <button
            aria-label="Align Center"
            onClick={() => handleFormat("justifyCenter")}
            type="button"
          >
            <AlignCenterIcon />
          </button>
          <button
            aria-label="Align Right"
            onClick={() => handleFormat("justifyRight")}
            type="button"
          >
            <AlignRightIcon />
          </button>
          <button
            aria-label="Increase Indent"
            onClick={() => handleFormat("indent")}
            type="button"
          >
            <IndentIncreaseIcon />
          </button>
          <button
            aria-label="Decrease Indent"
            onClick={() => handleFormat("outdent")}
            type="button"
          >
            <IndentDecreaseIcon />
          </button>
        </div>
        {/* Emoji button section */}
        <div className={styles.toolbarGroup}>
          <div style={{ position: 'relative' }}>
            <button
              ref={emojiButtonRef}
              aria-label="Emoji"
              onClick={() => handleSpecialCommand("emoji")}
              type="button"
            >
              <SmileIcon />
            </button>
            
            {/* Emoji Picker Panel */}
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className={styles.emojiPicker}>
                <div className={styles.emojiGrid}>
                  {commonEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      className={styles.emojiButton}
                      onClick={() => insertEmoji(emoji)}
                      type="button"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.editorField}>
        <div
          ref={editorRef}
          className={styles.editorPlaceholder}
          contentEditable
          data-placeholder={placeholder}
          onInput={handleContentChange}
        />
      </div>
      {error && (
        <div className={styles.errorMessage}>
          <AlertIcon /> {error}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;