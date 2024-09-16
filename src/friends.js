import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
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

  const updateFriendLocations = useCallback(async (friendsList) => {
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
  }, [onFriendLocationsUpdate]);

  const fetchFriends = useCallback(async () => {
    if (user) {
      const friendsDoc = await getDoc(doc(db, "friends", user.uid));
      const friendsData = friendsDoc.data()?.friends || [];
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
  }, [user, updateFriendLocations]);

  useEffect(() => {
    if (user) {
      fetchFriends();
      const unsubscribe = onSnapshot(doc(db, "friends", user.uid), fetchFriends);
      return () => unsubscribe();
    } else {
      setFriends([]);
    }
  }, [user, fetchFriends]);

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
      const q = query(usersRef, where("email", "==", email.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);

      console.log("Query snapshot:", querySnapshot.size);

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
      await updateDoc(userFriendsRef, {
        friends: arrayUnion(friendId)
      });

      console.log("Added friend to user's list");

      const friendFriendsRef = doc(db, "friends", friendId);
      await updateDoc(friendFriendsRef, {
        friends: arrayUnion(user.uid)
      });

      console.log("Added user to friend's list");

      setEmail('');
      setSuccessMessage(`Successfully added ${email} as a friend!`);
      
      // Refresh friends list
      fetchFriends();
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
      fetchFriends(); // Refresh the friends list to update UI
    } catch (error) {
      setError("Error setting alert: " + error.message);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">You are not signed in. Sign in to use this feature!</h2>
        <button onClick={() => navigate("/signin")} className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200">Sign In</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">My Friends</h2>
      <div className="flex mb-4">
        <input
          type="email"
          placeholder="Friend's Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-grow mr-2 p-2 border rounded"
        />
        <button 
          onClick={addFriend} 
          disabled={isAddingFriend}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
        >
          {isAddingFriend ? 'Adding...' : 'Add Friend'}
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold mb-2">Friend List</h3>
        {friends.length === 0 ? (
          <p className="text-gray-600 italic">You haven't added any friends yet.</p>
        ) : (
          <ul>
            {friends.map((friend) => (
              <li key={friend.id} className="flex justify-between items-center py-2 border-b last:border-b-0" onClick={() => handleFriendClick(friend)}>
                <span>{friend.email}</span>
                {friend.alertDistance && <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{friend.alertDistance} miles</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedFriend && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Set Alert for {selectedFriend.email}</h4>
          <input
            type="number"
            placeholder="Alert distance (miles)"
            value={alertDistance}
            onChange={(e) => setAlertDistance(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <button onClick={handleSetAlert} className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200">Set Alert</button>
        </div>
      )}
    </div>
  );
};

export default Friends;