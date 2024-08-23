import React, { useState } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { navigate } from 'svelte-routing';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Redirect to the main page or display success message
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignUp = async() => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch(error) {
      setError(error.message)
    }
  }

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      </form>
      <button onClick={handleGoogleSignUp}>Sign Up with Google</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default SignUpPage;