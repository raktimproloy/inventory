// services/dashboardService.ts
import {
  collection,
  query,
  where,
  getCountFromServer,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase.config";

// 1. Active Raffles (Live Games)
export const getActiveRafflesCount = async () => {
  const now = new Date();
  
  // Get all raffles and filter in application code to avoid composite index requirement
  const rafflesSnapshot = await getDocs(collection(db, "raffles"));
  
  const liveRaffles = rafflesSnapshot.docs.filter(doc => {
    const data = doc.data();
    const createdAt = data.createdAt;
    const expiryDate = data.expiryDate;
    
    // Convert Firestore timestamps to Date objects for comparison
    const createdAtDate = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
    const expiryDateDate = expiryDate?.toDate ? expiryDate.toDate() : new Date(expiryDate);
    
    // A raffle is "live" if it has started and not expired
    return createdAtDate <= now && expiryDateDate > now;
  });
  
  return liveRaffles.length;
};

// 2. Total Game Sales (raffle_tickets collection)
export const getTotalGameSales = async () => {
  const snapshot = await getCountFromServer(collection(db, "raffle_tickets"));
  return snapshot.data().count;
};

// 3. Low Stock Items (raffles with ticketsSold < threshold)
export const getLowStockItemsCount = async (threshold = 10) => {
  const q = query(collection(db, "raffles"), where("ticketsSold", "<", threshold));
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

// 4. Users
export const getUsersCount = async () => {
  const snapshot = await getCountFromServer(collection(db, "users"));
  return snapshot.data().count;
};
