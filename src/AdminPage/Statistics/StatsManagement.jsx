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
import styles from "./StatsPage.module.css";

// More varied color palette for charts
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

// Mock data for development when API is not available
const MOCK_DATA = {
  incomeStats: [
    { incomeType: "Employment", count: 65 },
    { incomeType: "Self-employed", count: 42 },
    { incomeType: "Government Support", count: 30 },
    { incomeType: "Family Support", count: 25 },
    { incomeType: "Retirement", count: 18 },
    { incomeType: "Investments", count: 12 },
    { incomeType: "Other", count: 8 },
  ],
  scholarshipStats: [
    { scholarshipType: "Need-based", count: 48 },
    { scholarshipType: "Merit-based", count: 35 },
    { scholarshipType: "Athletic", count: 22 },
    { scholarshipType: "Community Service", count: 18 },
    { scholarshipType: "Diversity", count: 15 },
    { scholarshipType: "None", count: 62 },
  ],
  totalUsers: 200,
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
  const [useMockData, setUseMockData] = useState(false);
  const [showTables, setShowTables] = useState(false);

  // References for chart components to enable export functionality
  const incomeChartRef = useRef(null);
  const scholarshipChartRef = useRef(null);

  // API base URL from environment variable
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Fetch stats
  const fetchStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true }));

      // If mock data is enabled, use that instead of API call
      if (useMockData) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setStats({
          incomeStats: MOCK_DATA.incomeStats,
          scholarshipStats: MOCK_DATA.scholarshipStats,
          totalUsers: MOCK_DATA.totalUsers,
          loading: false,
          error: null,
        });
        return;
      }

      // Log the API URL for debugging
      const endpoint = `${API_URL}/admin/stats/all`;
      console.log(`Fetching from: ${endpoint}`);

      // Simplify headers to avoid CORS issues
      const headers = {
        "Content-Type": "application/json",
      };

      try {
        console.log("Attempting to fetch from primary endpoint...");
        const response = await fetch(endpoint, {
          method: "GET",
          headers,
          credentials: "include", // Include cookies if using session-based auth
        });

        if (!response.ok) {
          console.log(`Primary endpoint returned status: ${response.status}`);
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Received data from primary endpoint:", data);

        if (data.success) {
          setStats({
            incomeStats: data.data.incomeStats,
            scholarshipStats: data.data.scholarshipStats,
            totalUsers: data.data.totalUsers,
            loading: false,
            error: null,
          });
          return;
        } else {
          console.error("API returned success:false", data);
          throw new Error(
            data.message || "API returned an unsuccessful response"
          );
        }
      } catch (initialError) {
        console.log("Primary endpoint failed, trying test endpoint...");

        try {
          // Try the test endpoint without authentication
          const testEndpoint = `${API_URL}/admin/stats/all-test`;
          console.log(`Trying test endpoint: ${testEndpoint}`);
          
          const testResponse = await fetch(testEndpoint, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!testResponse.ok) {
            console.log(`Test endpoint returned status: ${testResponse.status}`);
            throw new Error(
              `Test API request failed with status ${testResponse.status}`
            );
          }

          const testData = await testResponse.json();
          console.log("Received data from test endpoint:", testData);

          if (testData.success) {
            setStats({
              incomeStats: testData.data.incomeStats,
              scholarshipStats: testData.data.scholarshipStats,
              totalUsers: testData.data.totalUsers,
              loading: false,
              error: null,
            });
            return;
          } else {
            throw new Error(
              testData.message ||
                "API test endpoint returned an unsuccessful response"
            );
          }
        } catch (testError) {
          console.error("Both endpoints failed:", testError);
          throw testError; // Re-throw to be caught by the outer catch
        }
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);

      // If any error occurs, fall back to mock data
      console.warn("API error, falling back to mock data");
      setUseMockData(true);
      setStats({
        incomeStats: MOCK_DATA.incomeStats,
        scholarshipStats: MOCK_DATA.scholarshipStats,
        totalUsers: MOCK_DATA.totalUsers,
        loading: false,
        error: null,
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    console.log("Component mounted, fetching stats...");
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

  // Toggle between mock data and API data
  const toggleMockData = () => {
    setUseMockData((prev) => !prev);
    // Re-fetch with the new setting
    setTimeout(fetchStats, 0);
  };

  // Toggle between charts and tables
  const toggleView = () => {
    setShowTables((prev) => !prev);
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

  // Render the income chart based on the selected chart type
  const renderIncomeChart = () => {
    const data = formatIncomeData();

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
            onClick={toggleMockData}
            className={`${styles.toggleButton} ${useMockData ? styles.mockEnabled : styles.mockDisabled}`}
          >
            {useMockData ? "Using Mock Data" : "Using API Data"}
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
      
      {/* Debug Info (only in development) */}
      {import.meta.env.DEV && (
        <div className={styles.debugInfo}>
          <h3>Debug Information</h3>
          <p>API URL: {API_URL}</p>
          <p>Using Mock Data: {useMockData ? "Yes" : "No"}</p>
          <p>Data Loading: {stats.loading ? "Yes" : "No"}</p>
          <p>Income Stats Count: {stats.incomeStats?.length || 0}</p>
          <p>Scholarship Stats Count: {stats.scholarshipStats?.length || 0}</p>
          {stats.error && <p>Error: {stats.error.toString()}</p>}
        </div>
      )}
    </div>
  );
};

export default StatsManagement;