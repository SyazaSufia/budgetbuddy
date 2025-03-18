"use client";
import React from "react";
import styles from "./BudgetDetails.module.css";
import Sidebar from "../SideBar";
import BreadcrumbNav from "./BreadCrumbNav";
import CategoryTitle from "./CategoryTitle";
import BudgetProgress from "./BudgetProgress";
import ActionButtons from "./ActionButtons";
import HistorySection from "./HistorySection";

function BudgetDetails() {
  return (
    <section className={styles.container}>
      <Sidebar className={styles.sidebar} />
      <div className={styles.content}>
        <BreadcrumbNav />
        <CategoryTitle title="Category Name" />
        <div className={styles.detailsSection}>
          <BudgetProgress current={750} total={1200} />
          <ActionButtons />
          <HistorySection />
        </div>
      </div>
    </section>
  );
}

export default BudgetDetails;
