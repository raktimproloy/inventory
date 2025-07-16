
// ✅ prizeService.ts
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase.config";

export const addGame = async (data: any) => {
  const prizeCollection = collection(db, "raffles");
  const docRef = await addDoc(prizeCollection, data);
  return docRef;
};
