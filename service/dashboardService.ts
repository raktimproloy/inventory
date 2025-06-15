// services/dashboardService.ts
import {
  collection,
  query,
  where,
  getCountFromServer,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase.config";

// 1. Active Raffles
export const getActiveRafflesCount = async () => {
  const now = Timestamp.fromDate(new Date());
  const q = query(collection(db, "raffles"), where("expiryDate", ">", now));
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
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
