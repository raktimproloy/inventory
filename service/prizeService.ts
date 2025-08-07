
// ✅ prizeService.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase.config";
import { FormData } from "@/components/inventory/inventory-form";

export const addPrize = async (data: FormData) => {
  // Remove file objects before saving to Firestore
  const { customTermsFile, ...dataToSave } = data;
  
  const prizeCollection = collection(db, "prize_database");
  const docRef = await addDoc(prizeCollection, {
    ...dataToSave,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};
