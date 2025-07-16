
// ✅ prizeService.ts
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase.config";
import { FormData } from "@/components/inventory/inventory-form";

export const addPrize = async (data: FormData) => {
  const prizeCollection = collection(db, "prize_database");
  const docRef = await addDoc(prizeCollection, data);
  return docRef.id;
};
