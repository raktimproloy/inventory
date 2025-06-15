import React, { useEffect, useState } from "react";
import RaffleTable from "../table";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../config/firebase.config";
import { deleteData } from "../../../../utility";
import { toast } from "react-toastify";

interface RaffleListProps {}

const RaffleList: React.FC<RaffleListProps> = () => {
  const [raffleData, setRaffleData] = useState<any[]>([]);

  // Fetch raffle data from Firestore
  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "raffles"));
        const data: any[] = [];

        querySnapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setRaffleData(data);
      } catch (error) {
        console.error("Error fetching raffles:", error);
      }
    };

    fetchRaffles();
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
