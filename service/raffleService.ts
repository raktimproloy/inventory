// services/raffleService.ts or .js
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../config/firebase.config";
// types/raffle.d.ts
export interface RaffleItem {
  id: string;
  title: string;
  image: string;
  description: string;
  createdAt?: any;
  expiryDate?: any;
}


export const getAllRaffles = async (limitCount = 4): Promise<RaffleItem[]> => {
  const rafflesRef = collection(db, "raffles");
  const q = query(rafflesRef, orderBy("createdAt", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);

  // const snapshot = await getDocs(rafflesRef);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "Untitled",
      image: data.picture || "/images/Avatars.png",
      description: data.description || "",
      createdAt: data.createdAt,
      expiryDate: data.expiryDate,
    };
  });
};