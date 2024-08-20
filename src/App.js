import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainPage from './MainPage';
import SignInPage from './Signin';
import SignUpPage from './Signup';
import './App.css';


// nav, link, route: nav is used to group "link components", 
// link is from react-router-dom, and it navigates between different routes without reloading full page
// and route is also from react-router-dom, defining path b/w URL path and React component
const App = () => {
  return (
    <Router>
      <div className="app-container">
        {/* Navigation Bar */}
        <nav style={styles.nav}>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/signin" style={styles.link}>Sign In</Link>
          <Link to="/signup" style={styles.link}>Sign Up</Link>
        </nav>
        
        {/* Routes for Sign In and Sign Up pages */}
        <Routes>
          <Route path="/" element={<MainPage/>}/>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </div>
    </Router>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  link: {
    margin: '0 10px',
    textDecoration: 'none',
    fontSize: '1.2rem',
    color: '#007bff',
  },
};

export default App;