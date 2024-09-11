import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { doc, setDoc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Friends = ({ onFriendLocationsUpdate }) => {
  const [friends, setFriends] = useState([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setIsAuthenticated(true);
        const friendsUnsubscribe = onSnapshot(
          doc(db, "friends", user.uid),
          (doc) => {
            const friendsData = doc.data()?.friends || [];
            setFriends(friendsData);
            updateFriendLocations(friendsData);
          }
        );
        return () => friendsUnsubscribe();
      } else {
        setIsAuthenticated(false);
        setFriends([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateFriendLocations = async (friendsList) => {
    const locations = await Promise.all(
      friendsList.map(async (friendId) => {
        const userDoc = await getDoc(doc(db, "users", friendId));
        return {
          email: userDoc.data()?.email,
          location: userDoc.data()?.location || null
        };
      })
    );
    onFriendLocationsUpdate(locations);
  };

  const addFriend = async () => {
    if (!auth.currentUser) {
      setError("User is not authenticated. Cannot add friends.");
      return;
    }

    try {
      const friendDoc = await getDoc(doc(db, "users", email));
      if (friendDoc.exists()) {
        const friendId = friendDoc.id;
        const userFriendsRef = doc(db, "friends", auth.currentUser.uid);
        await updateDoc(userFriendsRef, {
          friends: arrayUnion(friendId)
        });
        
        // Add current user to friend's friend list
        const friendFriendsRef = doc(db, "friends", friendId);
        await updateDoc(friendFriendsRef, {
          friends: arrayUnion(auth.currentUser.uid)
        });

        setEmail('');
        setError(null);
      } else {
        setError("Friend not found!");
      }
    } catch (error) {
      setError("Error adding friend: " + error.message);
    }
  };

  const updateUserLocation = async (latitude, longitude) => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
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
          {error && <p style={{color: 'red'}}>{error}</p>}
          <ul>
            {friends.map((friendId) => (
              <li key={friendId}>{friendId}</li>
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