import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from './firebase'; // Ensure this path correctly points to your firebase.js file

export const ensureUserDocument = async (userId, email) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: email,
      createdAt: new Date(),
      // 
    });
    console.log("Created new user document for", userId);
  }
};

export const updateUserLocation = async (userId, latitude, longitude) => {
  await ensureUserDocument(userId);
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    location: { latitude, longitude }
  }, { merge: true });
};

export const getFriendLocation = async (friendId) => {
  const friendRef = doc(db, "users", friendId);
  const friendDoc = await getDoc(friendRef);
  return friendDoc.data()?.location || null;
};