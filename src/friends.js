import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

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

  if (!user) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>You are not signed in. Sign in to use this feature!</h2>
        <button onClick={() => navigate("/signin")} style={styles.button}>Sign In</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Friends</h2>
      <div style={styles.addFriendContainer}>
        <input
          type="email"
          placeholder="Friend's Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <button onClick={addFriend} style={styles.button}>Add Friend</button>
      </div>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.friendListContainer}>
        <h3 style={styles.subtitle}>Friend List</h3>
        {friends.length === 0 ? (
          <p style={styles.noFriends}>You haven't added any friends yet.</p>
        ) : (
          <ul style={styles.friendList}>
            {friends.map((friendId) => (
              <li key={friendId} style={styles.friendItem}>{friendId}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f0f2f5',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    color: '#1877f2',
    marginBottom: '20px',
    textAlign: 'center',
  },
  addFriendContainer: {
    display: 'flex',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    marginRight: '10px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    color: 'white',
    backgroundColor: '#1877f2',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
  friendListContainer: {
    backgroundColor: 'white',
    borderRadius: '4px',
    padding: '15px',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#444',
    marginBottom: '10px',
  },
  noFriends: {
    color: '#666',
    fontStyle: 'italic',
  },
  friendList: {
    listStyle: 'none',
    padding: 0,
  },
  friendItem: {
    padding: '10px',
    borderBottom: '1px solid #eee',
    color: '#333',
  },
  updateLocationButton: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    color: 'white',
    backgroundColor: '#42b72a',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Friends;