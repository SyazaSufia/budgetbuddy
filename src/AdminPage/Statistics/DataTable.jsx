import React from "react";
import styles from "./DataTable.module.css";

const DataTable = ({ data, title, type }) => {
  // Check if there's no data
  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No data available</p>
      </div>
    );
  }

  // Function to format the table headers
  const getHeaders = () => {
    if (type === 'income') {
      return (
        <tr>
          <th>Income Type</th>
          <th>Number of Users</th>
          <th>Percentage</th>
        </tr>
      );
    } else if (type === 'scholarship') {
      return (
        <tr>
          <th>Scholarship Type</th>
          <th>Number of Users</th>
          <th>Percentage</th>
        </tr>
      );
    }
    return null;
  };

  // Calculate total number of users from the dataset
  const totalUsers = data.reduce((sum, item) => sum + item.count, 0);

  // Function to render table rows
  const renderRows = () => {
    return data.map((item, index) => {
      const percentage = ((item.count / totalUsers) * 100).toFixed(2);
      const fieldName = type === 'income' ? 'incomeType' : 'scholarshipType';
      
      return (
        <tr key={index}>
          <td>{item[fieldName] || "Not Specified"}</td>
          <td>{item.count}</td>
          <td>{percentage}%</td>
        </tr>
      );
    });
  };

  return (
    <div className={styles.tableContainer}>
      <h3 className={styles.tableTitle}>{title}</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            {getHeaders()}
          </thead>
          <tbody>
            {renderRows()}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>{totalUsers}</strong></td>
              <td><strong>100%</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DataTable;