import {
  collection,
  getDocs,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../config/firebase.config";

// Helper: Format date into Daily, Weekly, Monthly labels
const formatDate = (
  date: Date,
  type: "Daily" | "Weekly" | "Monthly"
): string => {
  if (type === "Daily") {
    return date.toLocaleDateString("en-US", { weekday: "short" }); // e.g., "Mon"
  }

  if (type === "Weekly") {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil(
      ((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7
    );
    return `Week ${week}`;
  }

  if (type === "Monthly") {
    return date.toLocaleDateString("en-US", { month: "short" }); // e.g., "Jan"
  }

  return "Unknown";
};

export const getRevenueGrouped = async (
  type: "Daily" | "Weekly" | "Monthly"
): Promise<{ labels: string[]; data: number[] }> => {
  try {
    const snapshot = await getDocs(collection(db, "raffle_tickets"));

    const revenueMap: Record<string, number> = {};

    snapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      const price = data.price || 0;
      const createdAt: Timestamp | undefined = data.createdAt;

      if (createdAt) {
        const date = createdAt.toDate();
        const label = formatDate(date, type);

        if (label) {
          if (!revenueMap[label]) {
            revenueMap[label] = 0;
          }
          revenueMap[label] += price;
        }
      }
    });

    // Sort labels in logical order
    const labels = Object.keys(revenueMap).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    return {
      labels,
      data: labels.map((label) => revenueMap[label]),
    };
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return { labels: [], data: [] };
  }
};