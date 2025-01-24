import { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './HomePage/Header';
import Hero from './HomePage/Hero';
import FeatureSection from './HomePage/FeatureSection';
import Footer from './HomePage/Footer';
import ContactBar from './HomePage/ContactBar';
import SignIn from './SignInPage/SignIn';
import SignUp from './SignUpPage/SignUp';
import FAQPage from './FAQPage/FAQPage';
import Guidelines from './Guidelines/Guidelines';
import './App.css';
import axios from 'axios';

const App = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignIn = (userData) => {
    setUser(userData); // Save user data (includes role)
    if (userData.role === 'admin') {
      navigate('/admin-home');
    } 
    else if (userData.role === 'medical-staff') {
      navigate('/appointment-view-ms');
    }
    else {
      navigate('/');
    }
  };

  const handleSignUp = (userData) => {
    setUser(userData); // Save user data (includes role)
    if (userData.role === 'user') {
      navigate('/');
    }
  };

  const handleSignOut = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app">
      <Header user={user} onSignOut={handleSignOut} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Hero user={user} />} />
          <Route path="/sign-in" element={<SignIn onSignIn={handleSignIn} />} />
          <Route path="/sign-up" element={<SignUp onSignUp={handleSignUp} />} />
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