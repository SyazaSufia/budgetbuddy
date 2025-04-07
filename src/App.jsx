import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Header from './HomePage/Header';
import Hero from './HomePage/Hero';
import FeatureSection from './HomePage/FeatureSection';
import Footer from './HomePage/Footer';
import ContactBar from './HomePage/ContactBar';
import SignIn from './SignInPage/SignIn';
import SignUp from './SignUpPage/SignUp';
import ForgotPassword from './ForgotPassword/ForgotPassword';
import ResetPassword from './ForgotPassword/ResetPassword';
import FAQPage from './FAQPage/FAQPage';
import Guidelines from './Guidelines/Guidelines';
import ProfilePage from './ProfilePage/ProfilePage';
import IncomePage from './IncomePage/Income';
import BudgetPage from './BudgetPage/Budget';
import BudgetDetails from './BudgetPage/BudgetDetails/BudgetDetails';
import DashboardPage from './DashboardPage/Dashboard';
import ExpensePage from './ExpensePage/Expense';
import CommunityPage from './CommunityPage/Community';
import AddPostPage from './CommunityPage/AddPostPage/InputDesign';
import CommunityDetails from './CommunityPage/PostDetailsPage/Main';
import AdminUserPage from './AdminPage/Users/InputDesign';
import AdminCommunityPage from './AdminPage/Community/CommunityManagement';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, logout, checkAuthStatus } = useAuth();

  useEffect(() => {
    // Only check auth status once when the component mounts
    if (!user) {
      checkAuthStatus();
    }
  }, []); // Empty dependency array means this runs only once on mount

  const handleSignIn = (userData) => {
    login(userData);
    navigate(userData.role === 'admin' ? '/adminUser' : '/profile');
  };

  const handleSignUp = () => navigate('/sign-in');

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const showHeaderPages = ["/", "/sign-in", "/sign-up", "/forgot-password", "/faqs", "/guidelines"];
  const showHeader = showHeaderPages.includes(location.pathname);

  return (
    <div className="app">
      {showHeader && <Header user={user} onSignOut={handleSignOut} />}
      
      <main className="main">
        <Routes>
          <Route path="/" element={<Hero user={user} />} />
          <Route path="/sign-in" element={<SignIn onSignIn={handleSignIn} />} />
          <Route path="/sign-up" element={<SignUp onSignUp={handleSignUp} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/faqs" element={<FAQPage />} />
          <Route path="/guidelines" element={<Guidelines />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/income" element={<IncomePage user={user} />} />
            <Route path="/dashboard" element={<DashboardPage user={user} />} />
            <Route path="/budget" element={<BudgetPage user={user} />} />
            <Route path="/budgetdetails/:budgetID" element={<BudgetDetails user={user} />} />
            <Route path="/expense" element={<ExpensePage user={user} />} />
            <Route path="/community" element={<CommunityPage user={user} />} />
            <Route path="/addpost" element={<AddPostPage user={user} />} />
            <Route path="/postdetails" element={<CommunityDetails user={user} />} />
            <Route path="/adminUser" element={<AdminUserPage />} />
            <Route path="/adminCommunity" element={<AdminCommunityPage />} />
          </Route>

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {location.pathname === '/' && (
          <>
            <FeatureSection />
            <Footer user={user} />
            <ContactBar />
          </>
        )}
      </main>

      {/* Toast Container (Global) */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;