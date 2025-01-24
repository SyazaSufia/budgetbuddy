import React from 'react';
import styles from './FeatureSection.module.css';
import FeatureCard from './FeatureCard';

const FeatureSection = () => {
  const features = [
    {
      title: "Track Your Income and Expenses, Anytime, Anywhere",
      description: "Keep an eye on every Ringgit that comes in, from allowances to part-time jobs. Record expenses as you go – whether it’s a meal at the campus café, transportation costs, or study materials – so you’re always aware of where your money goes.",
      imageSrc: "/Home-TrackIncome.svg",
      imageAlt: "Track Income and Expenses illustration"
    },
    {
      title: "Set and Achieve Your Financial Goals",
      description: "Take control of your finances by setting personalized budget goals. Whether it's saving for a specific milestone or managing your daily expenses, our intuitive tools help you track your progress, stay focused, and reach your financial targets with ease.",
      imageSrc: "/Home-Goals.svg",
      imageAlt: "Financial Goals illustration"
    },
    {
      title: "Visualize Your Financial Journey",
      description: "Our easy-to-read charts and graphs help you understand your spending patterns ata glance. With visual insights, you can track progress, find areas to save, and set financial goal for the semester or year.",
      imageSrc: "/Home-Visual.svg",
      imageAlt: "Visualization illustration"
    },
    {
      title: "Join the Community Forum",
      description: "Connect with like-minded individuals to share financial tips, discuss challenges, and exchange ideas. Engage in meaningful conversations, seek advice, and learn from others’ experiences to make smarter financial decisions together.",
      imageSrc: "/Home-Community.svg",
      imageAlt: "Community Forum illustration"
    }
  ];

  return (
    <section className={styles.featureSection}>
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} isReversed={index % 2 !== 0} />
      ))}
    </section>
  );
};

export default FeatureSection;