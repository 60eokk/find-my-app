import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import MainPage from './MainPage';
import SignInPage from './Signin';
import SignUpPage from './Signup';
import Friends from './Friends';
import './App.css';



// nav, link, route: nav is used to group "link components", 
// link is from react-router-dom, and it navigates between different routes without reloading full page
// and route is also from react-router-dom, defining path b/w URL path and React component
const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <nav style={styles.nav}>
          <Link to="/" style={styles.link}>Home</Link>
          {!user && <Link to="/signin" style={styles.link}>Sign In</Link>}
          {!user && <Link to="/signup" style={styles.link}>Sign Up</Link>}
          {user && <Link to="/Friends" style={styles.link}>Friends</Link>}
          {user && <button onClick={() => auth.signOut()} style={styles.link}>Sign Out</button>}
        </nav>
        
        <Routes>
          <Route path="/" element={<MainPage user={user} />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/Friends" element={<Friends user={user} />} />
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