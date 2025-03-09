import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("http://localhost:8080/check-auth", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (data.isAuthenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
      }
    };

    checkAuthStatus();
  }, []);

  const handleSignIn = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') {
      navigate('/admin-home');
    } else {
      navigate('/profile');
    }
  };

  const handleSignUp = (userData) => {
    setUser(userData);
    navigate('/sign-in');
  };

  const handleSignOut = async () => {
    try {
      // Call backend to log out the user (if applicable)
      await fetch("http://localhost:8080/sign-out", {
        method: "POST",
        credentials: "include",
      });
  
      // Clear user session data
      setUser(null);
      
      // Remove any stored authentication tokens
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
  
      // Remove authentication cookie
      document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
      // Redirect to home after logout
      navigate('/');
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  // Define pages where the Header should be visible
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/faqs" element={<FAQPage />} />
          <Route path="/guidelines" element={<Guidelines />} />
        </Routes>

        {location.pathname === '/' && (
          <>
            <FeatureSection />
            <Footer user={user} />
            <ContactBar />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
