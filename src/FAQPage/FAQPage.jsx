import React from 'react';
import styles from './FAQPage.module.css';
import FAQAccordion from './FAQAccordion';

const FAQPage = () => {
  const faqData = [
    {
      question: "What is BudgetBuddy?",
      answer: "BudgetBuddy is a personal budgeting website designed to help students in Malaysia manage their finances, track income and expenses, set financial goals, and visualize spending trends."
    },
    {
      question: "Who is BudgetBuddy for?",
      answer: "BudgetBuddy is tailored for students in Malaysia. However, anyone interested in using a simple, free, and direct financial management tools can use it."
    },
    {
      question: "How does BudgetBuddy help me manage my finances?",
      answer: "BudgetBuddy lets you log your income and expenses, categorize transactions, set financial goals, and view detailed visualizations to understand your spending patterns."
    },
    {
      question: "Is BudgetBuddy free to use?",
      answer: "Yes, BudgetBuddy is a free tool designed to help students manage their finances without extra costs."
    },
    {
      question: "Can I access BudgetBuddy on my phone?",
      answer: "Yes, BudgetBuddy is accessible through a web browser on both desktop and mobile devices for easy access anywhere."
    },
    {
      question: "What kind of visualizations does BudgetBuddy offer?",
      answer: "BudgetBuddy provides charts and graphs that show your spending trends, helping you easily analyze where your money goes each month."
    },
    {
      question: "Do I need to create an account to use BudgetBuddy?",
      answer: "Yes, creating an account allows you to save your data securely and access it anytime."
    }
  ];

  return (
    <div className={styles.faqPage}>
      <main className={styles.mainContent}>
        <section className={styles.faqSection}>
          {faqData.map((faq, index) => (
            <FAQAccordion key={index} question={faq.question} answer={faq.answer} />
          ))}
        </section>
      </main>
    </div>
  );
};

export default FAQPage;