import { db } from './firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

// export const updateUserLocation = async (userId, latitude, longitude) => {
//   const userRef = doc(db, "users", userId);
//   await updateDoc(userRef, {
//     location: { latitude, longitude }
//   });
// };

export const getFriendLocation = async (friendId) => {
  const friendRef = doc(db, "users", friendId);
  const friendDoc = await getDoc(friendRef);
  return friendDoc.data()?.location || null;
};