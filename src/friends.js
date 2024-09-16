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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateFriendLocations = useCallback(async (friendsList) => {
    if (!isOnline) {
      console.warn('Cannot update friend locations while offline');
      return;
    }

    try {
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
      }
    } catch (error) {
      console.error('Error updating friend locations:', error);
    }
  }, [onFriendLocationsUpdate, isOnline]);

  const fetchFriends = useCallback(async () => {
    if (!user || !isOnline) return;

    try {
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
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError('Failed to fetch friends. Please check your internet connection.');
    }
  }, [user, updateFriendLocations, isOnline]);

  useEffect(() => {
    if (user && isOnline) {
      fetchFriends();
      const unsubscribe = onSnapshot(
        doc(db, "friends", user.uid),
        fetchFriends,
        (error) => {
          console.error('Error in friends snapshot listener:', error);
          setError('Failed to listen for friend updates. Please check your internet connection.');
        }
      );
      return () => unsubscribe();
    } else {
      setFriends([]);
    }
  }, [user, fetchFriends, isOnline]);

  const addFriend = async () => {
    if (!user) {
      setError("User is not authenticated. Cannot add friends.");
      return;
    }
  
    if (!isOnline) {
      setError("Cannot add friends while offline. Please check your internet connection.");
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
      
      // Add a small delay to allow for potential network recovery
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email.toLowerCase().trim()));
      
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (fetchError) {
        console.error("Error fetching user data:", fetchError);
        setError("Failed to fetch user data. Please check your internet connection and try again.");
        setIsAddingFriend(false);
        return;
      }
  
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
      
      fetchFriends();
    } catch (error) {
      console.error("Detailed error in addFriend:", error);
      if (error.code) console.error("Error code:", error.code);
      if (error.message) console.error("Error message:", error.message);
      if (error.stack) console.error("Error stack:", error.stack);
      setError("Error adding friend. Please try again later.");
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

    if (!isOnline) {
      setError("Cannot set alert while offline. Please check your internet connection.");
      return;
    }

    try {
      await setDoc(doc(db, "alerts", `${user.uid}_${selectedFriend.id}`), {
        distance: Number(alertDistance)
      });
      setSelectedFriend(null);
      setAlertDistance('');
      setSuccessMessage(`Alert set for ${selectedFriend.email} at ${alertDistance} miles.`);
      fetchFriends();
    } catch (error) {
      console.error("Error setting alert:", error);
      setError("Error setting alert. Please try again later.");
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
      {!isOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">You are offline</p>
          <p>Some features may be unavailable. Please check your internet connection.</p>
        </div>
      )}
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
          disabled={isAddingFriend || !isOnline}
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
          <button 
            onClick={handleSetAlert} 
            disabled={!isOnline}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200 disabled:bg-green-300"
          >
            Set Alert
          </button>
        </div>
      )}
    </div>
  );
};

export default Friends;