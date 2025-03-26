import React from "react";
import styles from "./Main.module.css";

function RichTextEditor({ value, onChange, placeholder }) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.div2}>
      <div className={styles.basestatus3}>
        <div className={styles.base2} />
      </div>
      <div className={styles.div3}>
        <div className={styles.header}>
          <div className={styles.section1}>
            <span className={styles.h}>H</span>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/3f60efa1b548db2010028969b2e642eeb8beccfc?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="Heading format"
              className={styles.img3}
            />
            <div className={styles.horizontal1}>
              <div className={styles.vector} />
            </div>
          </div>
          <div className={styles.section2}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/b4151195704defd190063d34732f813cef868362?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="Bold"
              className={styles.img4}
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/33241003d86553e4cbc3bfc5f6f77a630af3ea9b?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="Italic"
              className={styles.img5}
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/99c4596c7278d4030a896903b8f5c4fa1e55128e?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="Underline"
              className={styles.img6}
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/0d47bbec2038ee00ae5f3d2b057714587b77c86e?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="Strikethrough"
              className={styles.img7}
            />
          </div>
          <div className={styles.section3}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/ff0e965f0221691597c39e3e28c10f5c795ff6c4?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="Bullet list"
              className={styles.img8}
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/56af1db4873769e2335b5d7ff626ad9893788855?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="Numbered list"
              className={styles.img9}
            />
          </div>
          <div className={styles.section4}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/63f4398dfa34d128f8e10cd801218866cd2ea979?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="Link"
              className={styles.img10}
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/50fab5c3d985744fc65a44e6bb360af9fbc6bf8e?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="Image"
              className={styles.img11}
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/151a1ce1cfab03602d6aa1ff629935aab54d0144?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="Code"
              className={styles.img12}
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/c8b58ceff079e4e3909aa1d94c6a9ccc440a4519?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="Quote"
              className={styles.img13}
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/ae683bc4a3148281ef6c7c0c1544043fbd07f96c?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="More options"
              className={styles.img14}
            />
          </div>
        </div>
        <div className={styles.content2}>
          <textarea
            className={styles.placeholder}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            aria-label="Reply text editor"
          />
          <div className={styles.scrollbaricon}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/40d76ba8a54e21cd799d4f4ab3eab857a88e66cf?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="Scrollbar"
              className={styles.img15}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RichTextEditor;
