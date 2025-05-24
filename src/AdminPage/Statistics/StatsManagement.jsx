import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import DataTable from "./DataTable";
import StatsSummaryCard from "./StatsSummaryCard";
import { adminAPI } from "../../services/AdminApi";
import styles from "./StatsPage.module.css";

// Color palette for charts
const COLORS = {
  income: [
    "#8884d8",
    "#83a6ed",
    "#8dd1e1",
    "#82ca9d",
    "#a4de6c",
    "#d0ed57",
    "#ffc658",
  ],
  scholarship: [
    "#FF8042",
    "#FF6565",
    "#FFB344",
    "#83a6ed",
    "#8884d8",
    "#82ca9d",
    "#a4de6c",
  ],
};

const StatsManagement = () => {
  const [stats, setStats] = useState({
    incomeStats: [],
    scholarshipStats: [],
    totalUsers: 0,
    loading: true,
    error: null,
  });
  const [chartType, setChartType] = useState({
    income: "bar",
    scholarship: "bar",
  });
  const [showTables, setShowTables] = useState(false);

  // References for chart components to enable export functionality
  const incomeChartRef = useRef(null);
  const scholarshipChartRef = useRef(null);

  // Fetch stats using the admin API
  const fetchStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));

      // Use the admin API to fetch dashboard stats
      const data = await adminAPI.stats.getDashboardStats();

      if (data && data.success) {
        setStats({
          incomeStats: data.data?.incomeStats || [],
          scholarshipStats: data.data?.scholarshipStats || [],
          totalUsers: data.data?.totalUsers || 0,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(data?.message || "Failed to fetch statistics");
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to load statistics. Please try again later.",
      }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStats();
  }, []);

  // Format the income data for charts
  const formatIncomeData = () => {
    if (!stats.incomeStats || stats.incomeStats.length === 0) return [];

    return stats.incomeStats.map((item) => ({
      name: item.incomeType || "Not Specified",
      value: item.count,
      count: item.count,
    }));
  };

  // Format the scholarship data for charts
  const formatScholarshipData = () => {
    if (!stats.scholarshipStats || stats.scholarshipStats.length === 0)
      return [];

    return stats.scholarshipStats.map((item) => ({
      name: item.scholarshipType || "Not Specified",
      value: item.count,
      count: item.count,
    }));
  };

  // Toggle chart type between bar and pie
  const toggleChartType = (chartName) => {
    setChartType((prev) => ({
      ...prev,
      [chartName]: prev[chartName] === "bar" ? "pie" : "bar",
    }));
  };

  // Toggle between charts and tables
  const toggleView = () => {
    setShowTables((prev) => !prev);
  };

  // Refresh data
  const handleRefresh = () => {
    fetchStats();
  };

  // Export data as CSV
  const exportAsCSV = (dataType) => {
    const data =
      dataType === "income" ? stats.incomeStats : stats.scholarshipStats;
    const headers =
      dataType === "income"
        ? ["Income Type", "Count"]
        : ["Scholarship Type", "Count"];

    const csvRows = [];
    csvRows.push(headers.join(","));

    data.forEach((item) => {
      const values =
        dataType === "income"
          ? [item.incomeType || "Not Specified", item.count]
          : [item.scholarshipType || "Not Specified", item.count];
      csvRows.push(values.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.download = `${dataType}_statistics.csv`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Display loading message
  if (stats.loading) {
    return <div className={styles.loadingMessage}>Loading statistics...</div>;
  }

  // Display error message
  if (stats.error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <h2>Unable to Load Statistics</h2>
          <p>{stats.error}</p>
          <button onClick={handleRefresh} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render the income chart based on the selected chart type
  const renderIncomeChart = () => {
    const data = formatIncomeData();

    if (data.length === 0) {
      return (
        <div className={styles.noDataMessage}>
          No income distribution data available
        </div>
      );
    }

    if (chartType.income === "bar") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            ref={incomeChartRef}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} Users`, "Count"]} />
            <Legend />
            <Bar dataKey="count" name="Users" fill={COLORS.income[0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart ref={incomeChartRef}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS.income[index % COLORS.income.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} Users`, "Count"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
  };

  // Render the scholarship chart based on the selected chart type
  const renderScholarshipChart = () => {
    const data = formatScholarshipData();

    if (data.length === 0) {
      return (
        <div className={styles.noDataMessage}>
          No scholarship distribution data available
        </div>
      );
    }

    if (chartType.scholarship === "bar") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            ref={scholarshipChartRef}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} Users`, "Count"]} />
            <Legend />
            <Bar dataKey="count" name="Users" fill={COLORS.scholarship[0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart ref={scholarshipChartRef}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#FF8042"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS.scholarship[index % COLORS.scholarship.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} Users`, "Count"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
  };

  // Calculate summary statistics 
  const getMostCommonIncomeType = () => {
    if (!stats.incomeStats || stats.incomeStats.length === 0) return "N/A";
    return stats.incomeStats[0].incomeType;
  };

  const getMostCommonScholarshipType = () => {
    if (!stats.scholarshipStats || stats.scholarshipStats.length === 0) return "N/A";
    return stats.scholarshipStats[0].scholarshipType;
  };

  // Get percentage for most common types
  const getMostCommonIncomePercentage = () => {
    if (!stats.incomeStats || stats.incomeStats.length === 0) return 0;
    const totalCount = stats.incomeStats.reduce((sum, item) => sum + item.count, 0);
    return totalCount > 0 ? Math.round((stats.incomeStats[0].count / totalCount) * 100) : 0;
  };

  const getMostCommonScholarshipPercentage = () => {
    if (!stats.scholarshipStats || stats.scholarshipStats.length === 0) return 0;
    const totalCount = stats.scholarshipStats.reduce((sum, item) => sum + item.count, 0);
    return totalCount > 0 ? Math.round((stats.scholarshipStats[0].count / totalCount) * 100) : 0;
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h1 className={styles.heading}>User Statistics Dashboard</h1>
        <div className={styles.dataSourceToggle}>
          <button
            onClick={handleRefresh}
            className={styles.toggleButton}
            disabled={stats.loading}
          >
            {stats.loading ? "Refreshing..." : "Refresh Data"}
          </button>
          <button
            onClick={toggleView}
            className={styles.toggleButton}
          >
            {showTables ? "Show Charts" : "Show Tables"}
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className={styles.summaryCardsContainer}>
        <StatsSummaryCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon="👥" 
          color="#8884d8" 
        />
        <StatsSummaryCard 
          title="Most Common Income" 
          value={getMostCommonIncomeType()}
          percentage={getMostCommonIncomePercentage()}
          icon="💼" 
          color="#82ca9d" 
        />
        <StatsSummaryCard 
          title="Most Common Scholarship" 
          value={getMostCommonScholarshipType()} 
          percentage={getMostCommonScholarshipPercentage()}
          icon="🎓" 
          color="#FF8042" 
        />
      </div>

      <div className={styles.statsContainer}>
        {/* Income Type Section */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h2 className={styles.statTitle}>Income Type Distribution</h2>
            <div className={styles.statActions}>
              {!showTables && (
                <button
                  onClick={() => toggleChartType("income")}
                  className={styles.toggleButton}
                >
                  {chartType.income === "bar"
                    ? "Switch to Pie Chart"
                    : "Switch to Bar Chart"}
                </button>
              )}
              <button
                onClick={() => exportAsCSV("income")}
                className={styles.exportButton}
                disabled={!stats.incomeStats || stats.incomeStats.length === 0}
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className={styles.chartContainer}>
            {showTables ? (
              <DataTable data={stats.incomeStats} title="Income Distribution" type="income" />
            ) : (
              renderIncomeChart()
            )}
          </div>
        </div>

        {/* Scholarship Type Section */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h2 className={styles.statTitle}>Scholarship Type Distribution</h2>
            <div className={styles.statActions}>
              {!showTables && (
                <button
                  onClick={() => toggleChartType("scholarship")}
                  className={styles.toggleButton}
                >
                  {chartType.scholarship === "bar"
                    ? "Switch to Pie Chart"
                    : "Switch to Bar Chart"}
                </button>
              )}
              <button
                onClick={() => exportAsCSV("scholarship")}
                className={styles.exportButton}
                disabled={!stats.scholarshipStats || stats.scholarshipStats.length === 0}
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className={styles.chartContainer}>
            {showTables ? (
              <DataTable data={stats.scholarshipStats} title="Scholarship Distribution" type="scholarship" />
            ) : (
              renderScholarshipChart()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsManagement;