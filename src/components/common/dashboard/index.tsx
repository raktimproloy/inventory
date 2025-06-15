import React, { useEffect, useState } from "react";
import GraphComponent from "../graph";
import SmallTable from "./table/smTable";
import GamesTable from "./table/gamesTable";
import { deleteData } from "../../../../utility";
import { toast } from "react-toastify";
import { getAllRaffles } from "../../../../service/raffleService";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../../../../config/firebase.config";

export const fetchUser = async (collectionName: string, limitCount: number = 5) => {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, limit(limitCount)); // Limit the results to `limitCount`
  
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => ({
    id: doc.id,  // Include document ID in the result
    ...doc.data() // Include document data
  }));
  return data;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DashboardProps {}
// types/raffle.d.ts
export interface RaffleItem {
  id: string;
  title: string;
  image: string;
  description: string;
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [raffles, setRaffles] = useState<RaffleItem[]>([]);

  useEffect(() => {
    getTopInventory();
  }, []);

  const getTopInventory = async () => {
    try {
      // Fetch top 5 items from the "Prize_Database" collection
      const topInventory = await fetchUser("prize_database", 5); // Limit to 5 items
      setInventoryData(topInventory);
    } catch (error) {
      console.error("Error fetching top inventory data:", error);
      toast.error("Failed to fetch top inventory data.");
    }
  };

  // Transform inventory data for SmallTable
  const transformedInventoryData = inventoryData.map(item => ({
    id: item.id,
    title: item.prizeName || item.title,
    image: item.thumbnail || item.image,
    qty: item.stockLevel || item.qty
  }));

  // Transform raffles data for InventoryTable
  const transformedRafflesData = raffles.map(item => ({
    id: item.id,
    title: item.title,
    picture: item.image,
    partner: "N/A",
    description: item.description,
    price: "0",
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    expiryDate: { seconds: Date.now() / 1000, nanoseconds: 0 },
    status: "Active"
  }));

  // Handle item deletion
  const handleDelete = async (id: string) => {
    try {
      await deleteData("raffles", id, (message: string) => {
        toast(message);
      });
      setInventoryData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Error deleting item. Please try again.");
    }
  };

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const data = await getAllRaffles(4);
        setRaffles(data);
      } catch (error) {
        console.error("Error fetching raffles:", error);
        toast.error("Failed to fetch raffles data.");
      }
    };
    fetchRaffles();
  }, []);

  return (
    <div className="grid xl:grid-cols-3 grid-cols-1 gap-6 mt-6">
      <div className="xl:col-span-2">
        <GraphComponent />
      </div>
      <div className="xl:col-span-1">
        <SmallTable options={transformedInventoryData} />
      </div>
      <div className="xl:col-span-3">
        <div className="best-inventory-table">
          <GamesTable
            items={transformedRafflesData}
            heading="Games"
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



// interface smTableDataType {
//     id: number;
//     title: string;
//     qty: string;
//     low: string;
//     image: string
// }
// const smTableData : Array<smTableDataType> = [
//     {
//         id: 1,
//         title: "Iphone 6",
//         qty: "100",
//         low: "Low",
//         image: "/images/icon/5.svg",
//     },
//     {
//         id: 2,
//         title: "Iphone 6",
//         qty: "100",
//         low: "Low",
//         image: "/images/icon/5.svg",
//     },
//     {
//         id: 3,
//         title: "Iphone 6",
//         qty: "100",
//         low: "Low",
//         image: "/images/icon/5.svg",
//     },
//     {
//         id: 4,
//         title: "Iphone 6",
//         qty: "100",
//         low: "Low",
//         image: "/images/icon/5.svg",
//     },
// ]