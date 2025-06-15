// utility/fetchUsers.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase.config";

export const fetchUsers = async (collectionName: string) => {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  const data = snapshot.docs.map(doc => ({
    id: doc.id, // Add document ID to each item
    ...doc.data() // Add document data
  }));
  return data;
};
