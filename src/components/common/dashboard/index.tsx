import React, { useEffect, useState } from "react";
import GraphComponent from "../graph";
import SmallTable from "./table/smTable";
import GamesTable from "./table/gamesTable";
import { deleteData } from "../../../../utility";
import { toast } from "react-toastify";
import { getAllRaffles } from "../../../../service/raffleService";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../../../../config/firebase.config";
import { getSponsors } from "../../../../service/sponsorService";

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
  const [raffles, setRaffles] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [prizes, setPrizes] = useState<any[]>([]);

  useEffect(() => {
    // Fetch all dashboard data in parallel
    const fetchDashboardData = async () => {
      try {
        // Fetch raffles, sponsors, prizes in parallel
        const [raffleData, sponsorList, prizeSnapshot, topInventory] = await Promise.all([
          getAllRaffles(10),
          getSponsors(),
          getDocs(collection(db, "prize_database")),
          fetchUser("prize_database", 4)
        ]);
        setRaffles(raffleData);
        setSponsors(sponsorList);
        setPrizes(prizeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setInventoryData(topInventory);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to fetch dashboard data.");
      }
    };
    fetchDashboardData();
  }, []);

  // Transform inventory data for SmallTable
  const transformedInventoryData = inventoryData.map(item => ({
    id: item.id,
    title: item.prizeName || item.title,
    image: item.thumbnail || item.image,
    quantityAvailable: item.stockLevel || item.quantityAvailable
  }));

  // --- Raffle Sorting Logic ---
  function getDate(val: any) {
    if (!val) return new Date(0);
    if (typeof val.toDate === 'function') return val.toDate();
    if (typeof val === 'object' && val.seconds) return new Date(val.seconds * 1000);
    return new Date(val);
  }

  const now = new Date();
  const liveRaffles = raffles.filter((r: any) => {
    const createdAt = getDate(r.createdAt);
    const expiryDate = getDate(r.expiryDate);
    return createdAt <= now && expiryDate > now;
  });
  const pendingRaffles = raffles.filter((r: any) => {
    const createdAt = getDate(r.createdAt);
    return createdAt > now;
  });
  const endedRaffles = raffles.filter((r: any) => {
    const expiryDate = getDate(r.expiryDate);
    return expiryDate <= now;
  });

  // 2 soonest ending (Live)
  const soonestEnding = [...liveRaffles].sort((a, b) => getDate(a.expiryDate) - getDate(b.expiryDate)).slice(0, 2);
  // 2 most recently started (Live)
  const recentStarted = [...liveRaffles].sort((a, b) => getDate(b.createdAt) - getDate(a.createdAt)).slice(0, 2);
  // 1 soonest starting (Pending)
  const soonestPending = [...pendingRaffles].sort((a, b) => getDate(a.createdAt) - getDate(b.createdAt)).slice(0, 1);
  // 1 most recently ended (Ended)
  const mostRecentEnded = [...endedRaffles].sort((a, b) => getDate(b.expiryDate) - getDate(a.expiryDate)).slice(0, 1);

  // Merge and deduplicate by id, keep order, max 5
  let mergedRaffles = [...soonestEnding, ...recentStarted, ...soonestPending, ...mostRecentEnded]
    .filter((item, idx, arr) => arr.findIndex(i => i.id === item.id) === idx);

  // If less than 5, fill with more raffles (not already included)
  if (mergedRaffles.length < 5) {
    const extra = raffles.filter(r => !mergedRaffles.some(m => m.id === r.id)).slice(0, 5 - mergedRaffles.length);
    mergedRaffles = [...mergedRaffles, ...extra];
  }
  mergedRaffles = mergedRaffles.slice(0, 5);

  // Build sponsorId -> sponsorName map
  const sponsorMap = sponsors.reduce((acc: Record<string, string>, sponsor: any) => {
    acc[sponsor.id] = sponsor.sponsorName;
    return acc;
  }, {});
  // Build prizeId -> prize map
  const prizeMap = prizes.reduce((acc: Record<string, any>, prize: any) => {
    acc[prize.id] = prize;
    return acc;
  }, {});

  // Transform raffles data for GamesTable
  const transformedRafflesData = mergedRaffles.map((item: any) => {
    let price = 0;
    let prizeName = "N/A";
    if (item.prizeId && prizeMap[item.prizeId]) {
      price = prizeMap[item.prizeId].retailValueUSD || 0;
      prizeName = prizeMap[item.prizeId].prizeName || "N/A";
    }
    return {
      id: item.id,
      title: item.title,
      picture: item.image,
      partner: item.sponsorId ? sponsorMap[item.sponsorId] || "N/A" : "N/A",
      description: prizeName,
      price,
      ticketSold: 0,
      createdAt: item.createdAt,
      expiryDate: item.expiryDate,
      status: "Active"
    };
  });

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