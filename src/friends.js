import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Friends = ({ user, onFriendLocationsUpdate }) => {
  const [friends, setFriends] = useState([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [alertDistance, setAlertDistance] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(
        doc(db, "friends", user.uid),
        async (docSnapshot) => {
          const friendsData = docSnapshot.data()?.friends || [];
          const friendsWithDetails = await Promise.all(
            friendsData.map(async (friendId) => {
              const userDoc = await getDoc(doc(db, "users", friendId));
              const alertDoc = await getDoc(doc(db, "alerts", `${user.uid}_${friendId}`));
              return {
                id: friendId,
                email: userDoc.data()?.email,
                alertDistance: alertDoc.data()?.distance || null
              };
            })
          );
          setFriends(friendsWithDetails);
          updateFriendLocations(friendsWithDetails);
        }
      );
      return () => unsubscribe();
    } else {
      setFriends([]);
    }
  }, [user]);

  const updateFriendLocations = async (friendsList) => {
    const locations = await Promise.all(
      friendsList.map(async (friend) => {
        const userDoc = await getDoc(doc(db, "users", friend.id));
        return {
          email: friend.email,
          location: userDoc.data()?.location || null
        };
      })
    );
    if (typeof onFriendLocationsUpdate === 'function') {
      onFriendLocationsUpdate(locations);
    } else {
      console.warn('onFriendLocationsUpdate is not a function or not provided');
    }
  };

  const addFriend = async () => {
    if (!user) {
      setError("User is not authenticated. Cannot add friends.");
      return;
    }

    if (!email) {
      setError("Please enter a friend's email.");
      return;
    }

    setIsAddingFriend(true);
    setError(null);
    setSuccessMessage('');

    try {
      console.log("Searching for user with email:", email);
      
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No user found with this email.");
        setIsAddingFriend(false);
        return;
      }

      const friendDoc = querySnapshot.docs[0];
      const friendId = friendDoc.id;
      
      console.log("Found user:", friendId);

      if (friendId === user.uid) {
        setError("You can't add yourself as a friend.");
        setIsAddingFriend(false);
        return;
      }

      const userFriendsRef = doc(db, "friends", user.uid);
      await setDoc(userFriendsRef, {
        friends: [...friends.map(f => f.id), friendId]
      }, { merge: true });

      console.log("Added friend to user's list");

      const friendFriendsRef = doc(db, "friends", friendId);
      await setDoc(friendFriendsRef, {
        friends: [user.uid]
      }, { merge: true });

      console.log("Added user to friend's list");

      setEmail('');
      setSuccessMessage(`Successfully added ${email} as a friend!`);
      
    } catch (error) {
      console.error("Error adding friend:", error);
      setError("Error adding friend: " + error.message);
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setAlertDistance(friend.alertDistance || '');
  };

  const handleSetAlert = async () => {
    if (!selectedFriend || !alertDistance) return;

    try {
      await setDoc(doc(db, "alerts", `${user.uid}_${selectedFriend.id}`), {
        distance: Number(alertDistance)
      });
      setSelectedFriend(null);
      setAlertDistance('');
      setSuccessMessage(`Alert set for ${selectedFriend.email} at ${alertDistance} miles.`);
    } catch (error) {
      setError("Error setting alert: " + error.message);
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
        <button 
          onClick={addFriend} 
          style={styles.button}
          disabled={isAddingFriend}
        >
          {isAddingFriend ? 'Adding...' : 'Add Friend'}
        </button>
      </div>
      {error && <p style={styles.error}>{error}</p>}
      {successMessage && <p style={styles.success}>{successMessage}</p>}
      <div style={styles.friendListContainer}>
        <h3 style={styles.subtitle}>Friend List</h3>
        {friends.length === 0 ? (
          <p style={styles.noFriends}>You haven't added any friends yet.</p>
        ) : (
          <ul style={styles.friendList}>
            {friends.map((friend) => (
              <li key={friend.id} style={styles.friendItem} onClick={() => handleFriendClick(friend)}>
                {friend.email} 
                {friend.alertDistance && <span style={styles.alertBadge}>{friend.alertDistance} miles</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedFriend && (
        <div style={styles.alertContainer}>
          <h4>Set Alert for {selectedFriend.email}</h4>
          <input
            type="number"
            placeholder="Alert distance (miles)"
            value={alertDistance}
            onChange={(e) => setAlertDistance(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSetAlert} style={styles.button}>Set Alert</button>
        </div>
      )}
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
  success: {
    color: 'green',
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
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertBadge: {
    backgroundColor: '#e7f3ff',
    color: '#1877f2',
    padding: '2px 6px',
    borderRadius: '10px',
    fontSize: '0.8em',
  },
  alertContainer: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f7f7f7',
    borderRadius: '4px',
  },
};

export default Friends;