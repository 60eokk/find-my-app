import { db, auth } from './firebase';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

const Friends = ({ onFriendLocationsUpdate }) => {
  const [friends, setFriends] = useState([]);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      setIsAuthenticated(true);
      const unsubscribe = onSnapshot(
        doc(db, "friends", auth.currentUser.uid),
        (doc) => {
          const friendsData = doc.data()?.friends || [];
          setFriends(friendsData);
          updateFriendLocations(friendsData);
        }
      );

      return () => unsubscribe();
    } else {
      setIsAuthenticated(false);
    }
  }, [navigate]);

  const updateFriendLocations = async (friendsList) => {
    const locations = await Promise.all(
      friendsList.map(async (friendEmail) => {
        const userDoc = await getDoc(doc(db, "users", friendEmail));
        return {
          email: friendEmail,
          location: userDoc.data()?.location || null
        };
      })
    );
    onFriendLocationsUpdate(locations);
  };

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
      setEmail('');
    } else {
      console.error("Friend not found!");
    }
  };

  const updateUserLocation = async (latitude, longitude) => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.email);
      await updateDoc(userRef, {
        location: { latitude, longitude }
      });
    }
  };

  const handleSignInClick = () => {
    navigate("/signin");
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
          <button onClick={() => {
            navigator.geolocation.getCurrentPosition(
              (position) => updateUserLocation(position.coords.latitude, position.coords.longitude)
            );
          }}>
            Update My Location
          </button>
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