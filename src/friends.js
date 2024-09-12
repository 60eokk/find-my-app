import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { updateUserLocation } from './locationService';

const Friends = ({ user, onFriendLocationsUpdate }) => {
  const [friends, setFriends] = useState([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(
        doc(db, "friends", user.uid),
        (doc) => {
          const friendsData = doc.data()?.friends || [];
          setFriends(friendsData);
          updateFriendLocations(friendsData);
        }
      );
      return () => unsubscribe();
    } else {
      setFriends([]);
    }
  }, [user]);

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
    if (!user) {
      setError("User is not authenticated. Cannot add friends.");
      return;
    }

    try {
      const friendDoc = await getDoc(doc(db, "users", email));
      if (friendDoc.exists()) {
        const friendId = friendDoc.id;
        if (friendId === user.uid) {
          setError("You can't add yourself as a friend.");
          return;
        }
        const userFriendsRef = doc(db, "friends", user.uid);
        await updateDoc(userFriendsRef, {
          friends: arrayUnion(friendId)
        });
        
        // Add current user to friend's friend list
        const friendFriendsRef = doc(db, "friends", friendId);
        await updateDoc(friendFriendsRef, {
          friends: arrayUnion(user.uid)
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

  const handleUpdateLocation = () => {
    if (user) {
      navigator.geolocation.getCurrentPosition(
        (position) => updateUserLocation(user.uid, position.coords.latitude, position.coords.longitude),
        (err) => setError("Error getting location: " + err.message)
      );
    }
  };

  if (!user) {
    return (
      <div>
        <h2>You are not signed in. Sign in to use this feature!</h2>
        <button onClick={() => navigate("/signin")}>Sign In</button>
      </div>
    );
  }

  return (
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
      <button onClick={handleUpdateLocation}>Update My Location</button>
    </div>
  );
};

export default Friends;