import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "friends", auth.currentUser.uid),
      (doc) => {
        setFriends(doc.data()?.friends || []);
      }
    );

    return () => unsubscribe();
  }, []);

  const addFriend = async () => {
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