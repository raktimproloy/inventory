import React, { useEffect, useState } from "react";
import RaffleTable from "../table";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../config/firebase.config";
import { deleteData } from "../../../../utility";
import { toast } from "react-toastify";
import { fetchUsers } from "../../../../utility"; // <-- import this

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