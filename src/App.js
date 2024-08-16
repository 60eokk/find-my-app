import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import MainPage from './MainPage';
import Signin from './Signin';
import Signup from './Signup';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <nav style={styles.nav}>
          <Link to="/signin" style={styles.link}>Sign In</Link>
          <Link to="/signup" style={styles.link}>Sign Up</Link>
        </nav>
        <Route path="/" exact component={MainPage} />
        <Route path="/signin" component={Signin} />
        <Route path="/signup" component={Signup} />
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