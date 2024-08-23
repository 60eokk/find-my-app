import React, { useState, useEffect } from 'react';
// useState: manage state within component
// useEffect: perform side features (ex: fetching data when component loads) 
import { db, auth } from './firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'; // imported from Firebase Firestore SDK


const Friends = () => {
  const [friends, setFriends] = useState([]); // initialized as emptry array, setFriends updates friends state
  const [email, setEmail] = useState(''); // initialized as empty string, setEmail updates email state

  // real time friend list update
  useEffect(() => {
    if (auth.currentUser) {
      const unsubscribe = onSnapshot(
        doc(db, "friends", auth.currentUser.uid), // reference back to Firestore document in "friends" collection for currently authenticated user
        (doc) => { // callback function that runs every time document changes
          setFriends(doc.data()?.friends || []);
        }
      );

      return () => unsubscribe(); // prevent memory leak
      } else {
      console.error("User is not authenticated. Redirect to Sign In page")
      // REDIRECT TO SIGNINPAGE
    }
  }, []);

  // asynchronous function that is called when user wants to add a friend
  const addFriend = async () => {
    const friendDoc = await getDoc(doc(db, "users", email)); // getDoc fetches document's data, await pauses function execution until data is fetched
    if (friendDoc.exists()) {
      const userFriendsRef = doc(db, "friends", auth.currentUser.uid); // gets reference to "friends" document for signed-in users
      await setDoc( // update with new friends array
        userFriendsRef,
        {
          friends: [...friends, email],
        },
        { merge: true } // ensures only "friends" field is updated
      );
    } else {
      console.error("Friend not found!");
    }
  };


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
      <ul>
        {friends.map((friend) => (
          <li key={friend}>{friend}</li>
        ))}
      </ul>
    </div>
  );
};

export default Friends;