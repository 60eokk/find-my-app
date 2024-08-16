import React from 'react';

const SignUpPage = () => {
  return (
    <div style={styles.container}>
      <h2>Sign Up</h2>
      <form>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <input type="email" placeholder="Email" />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
};

export default SignUpPage;