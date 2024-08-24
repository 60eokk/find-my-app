import React, { useState, useEffect } from 'react';
// useState: manage state within component
// useEffect: perform side features (ex: fetching data when component loads) 
import { db, auth } from './firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'; // imported from Firebase Firestore SDK
import { useNavigate } from 'react-router-dom';

const Friends = () => {
  const [friends, setFriends] = useState([]); // initialized as emptry array, setFriends updates friends state
  const [email, setEmail] = useState(''); // initialized as empty string, setEmail updates email state
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // track if the user is authenticated

  // real time friend list update
  useEffect(() => {
    if (auth.currentUser) {
      setIsAuthenticated(true);
      const unsubscribe = onSnapshot(
        doc(db, "friends", auth.currentUser.uid), // reference back to Firestore document in "friends" collection for currently authenticated user
        (doc) => { // callback function that runs every time document changes
          setFriends(doc.data()?.friends || []);
        }
      );

      return () => unsubscribe(); // prevent memory leak
      } else {
      console.error("User is not authenticated. Redirect to Sign In page")
      setIsAuthenticated(false);
    }
  }, [navigate]);



  // asynchronous function that is called when user wants to add a friend
  const addFriend = async () => {
    if (!auth.currentUser) {
      console.error("User is not authenticated. Cannot add friends.");
      return;
    }

    const friendDoc = await getDoc(doc(db, "users", email));
    if (friendDoc.exists()) {
      const userFriendsRef = doc(db, "friends", auth.currentUser.uid);
      await setDoc(
        userFriendsRef,
        {
          friends: [...friends, email],
        },
        { merge: true }
      );
    } else {
      console.error("Friend not found!");
    }
  };

  const handleSignInClick = () => {
    navigate("/signin"); // Navigate to the sign-in page
  };


  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h2>My Friends</h2>
          <input
            type="email"
            placeholder="Friend's Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={addFriend}>Add Friend</button>
          <ul>
            {friends.map((friend) => (
              <li key={friend}>{friend}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h2>You are not signed in. Sign in to use this feature!</h2>
          <button onClick={handleSignInClick}>Sign In</button>
        </div>
      )}
    </div>
  );
};

export default Friends;