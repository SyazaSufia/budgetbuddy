import React from "react";
import styles from "./ProgramInfo.module.css";

function ProgramInfo() {
  return (
    <section className={styles.programInfo}>
      <div className="container">
        <div className="header">
          <div className="header-content">
            <div className="logo">
              <div className="bar bar-black"></div>
              <div className="bar bar-green"></div>
            </div>
            <h1 className="title">Community Content Guidelines</h1>
          </div>
        </div>
        <div className="content">
          <div className="guidelines">
            <div className="guideline">
              <h2 className="guideline-title">Be Respectful</h2>
              <p className="guideline-description">
                Treat all members with kindness and respect. Avoid offensive
                language, personal attacks, or discriminatory remarks.
              </p>
            </div>
            <div className="guideline">
              <h2 className="guideline-title">Stay On-Topic</h2>
              <p className="guideline-description">
                Keep discussions relevant to financial management and the
                platform’s purpose. Off-topic posts may be removed.
              </p>
            </div>
            <div className="guideline">
              <h2 className="guideline-title">Protect Personal Information</h2>
              <p className="guideline-description">
                Do not share sensitive or private information about yourself or
                others.
              </p>
            </div>
            <div className="guideline">
              <h2 className="guideline-title">No Spam or Self-Promotion</h2>
              <p className="guideline-description">
                Avoid posting irrelevant links, advertisements, or
                self-promotional content without permission from admins.
              </p>
            </div>
            <div className="guideline">
              <h2 className="guideline-title">Encourage Constructive Feedback</h2>
              <p className="guideline-description">
                Share your thoughts and advice in a helpful and positive way to
                build a supportive community.
              </p>
            </div>
            <div className="guideline">
              <h2 className="guideline-title">Avoid Financial Misguidance</h2>
              <p className="guideline-description">
                Share accurate, honest, and reliable financial advice.
                Misleading information can harm others.
              </p>
            </div>
            <div className="guideline">
              <h2 className="guideline-title">Respect Privacy and Anonymity</h2>
              <p className="guideline-description">
                Do not expose or discuss another user’s identity or financial
                situation without their consent.
              </p>
            </div>
            <div className="guideline">
              <h2 className="guideline-title">Celebrate Diversity</h2>
              <p className="guideline-description">
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
