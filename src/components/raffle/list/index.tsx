import React, { useEffect, useState } from "react";
import RaffleTable from "../table";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../config/firebase.config";
import { deleteData } from "../../../../utility";
import { toast } from "react-toastify";
import { fetchUsers } from "../../../../utility";

function getRaffleStatus(raffle: any) {
  const now = new Date();

  // Handle Firestore Timestamp or string/Date
  const getDate = (val: any) => {
    if (!val) return new Date(0);
    if (typeof val.toDate === 'function') return val.toDate();
    return new Date(val);
  };

  const createdAt = getDate(raffle.createdAt);
  const expiryDate = getDate(raffle.expiryDate);
  const status = (raffle.status || "").toLowerCase();
  if (["refunded", "end early", "inactive"].includes(status)) return "Ended";
  if (expiryDate < now) return "Ended";
  if (createdAt > now) return "Pending";
  if (createdAt <= now && expiryDate > now) return "Live";
  return "Pending";
}

const RaffleList: React.FC = () => {
  const [raffleData, setRaffleData] = useState<any[]>([]);
  const [prizeMap, setPrizeMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch all prizes
        const prizes = await fetchUsers("prize_database");
        // Create a map for quick lookup
        const prizeMap: Record<string, any> = {};
        prizes.forEach((prize: any) => {
          prizeMap[prize.id] = prize;
        });
        setPrizeMap(prizeMap);

        // Fetch all raffles
        const querySnapshot = await getDocs(collection(db, "raffles"));
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          const raffle: any = { id: doc.id, ...doc.data() };
          // Attach prize details if prizeId exists
          if (raffle.prizeId && prizeMap[raffle.prizeId]) {
            raffle.prizeName = prizeMap[raffle.prizeId].prizeName;
            raffle.prizeImage = prizeMap[raffle.prizeId].thumbnail;
          }
          // Attach computed status
          raffle.computedStatus = getRaffleStatus(raffle);
          data.push(raffle);
        });
        setRaffleData(data);
      } catch (error) {
        console.error("Error fetching raffles or prizes:", error);
      }
    };

    fetchAll();
  }, []);

  const handleDelete = async (id: any) => {
    try {
      await deleteData("raffles", id, (message: string) => {
        toast(message);
      });
      setRaffleData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Error deleting item. Please try again.");
    }
  };

  return (
    <div className="Game List">
      <RaffleTable
        items={raffleData}
        heading="Raffle List"
        onDelete={handleDelete}
      />
    </div>
  );
};

export default RaffleList;