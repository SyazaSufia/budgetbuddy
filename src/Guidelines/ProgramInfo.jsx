import React from "react";
import styles from "./ProgramInfo.module.css";

function ProgramInfo() {
  return (
    <section className={styles.programInfo}>
      <div class="container">
        <div class="header">
          <div class="header-content">
            <div class="logo">
              <div class="bar bar-black"></div>
              <div class="bar bar-green"></div>
            </div>
            <h1 class="title">Community Content Guidelines</h1>
          </div>
        </div>
        <div class="content">
          <div class="guidelines">
            <div class="guideline">
              <h2 class="guideline-title">Be Respectful</h2>
              <p class="guideline-description">
                Treat all members with kindness and respect. Avoid offensive
                language, personal attacks, or discriminatory remarks.
              </p>
            </div>
            <div class="guideline">
              <h2 class="guideline-title">Stay On-Topic</h2>
              <p class="guideline-description">
                Keep discussions relevant to financial management and the
                platform’s purpose. Off-topic posts may be removed.
              </p>
            </div>
            <div class="guideline">
              <h2 class="guideline-title">Protect Personal Information</h2>
              <p class="guideline-description">
                Do not share sensitive or private information about yourself or
                others.
              </p>
            </div>
            <div class="guideline">
              <h2 class="guideline-title">No Spam or Self-Promotion</h2>
              <p class="guideline-description">
                Avoid posting irrelevant links, advertisements, or
                self-promotional content without permission from admins.
              </p>
            </div>
            <div class="guideline">
              <h2 class="guideline-title">Encourage Constructive Feedback</h2>
              <p class="guideline-description">
                Share your thoughts and advice in a helpful and positive way to
                build a supportive community.
              </p>
            </div>
            <div class="guideline">
              <h2 class="guideline-title">Avoid Financial Misguidance</h2>
              <p class="guideline-description">
                Share accurate, honest, and reliable financial advice.
                Misleading information can harm others.
              </p>
            </div>
            <div class="guideline">
              <h2 class="guideline-title">Respect Privacy and Anonymity</h2>
              <p class="guideline-description">
                Do not expose or discuss another user’s identity or financial
                situation without their consent.
              </p>
            </div>
            <div class="guideline">
              <h2 class="guideline-title">Celebrate Diversity</h2>
              <p class="guideline-description">
                Embrace the diverse financial experiences and backgrounds of all
                members to foster inclusive discussions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProgramInfo;
