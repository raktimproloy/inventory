import { GetStaticPaths, GetStaticProps } from 'next';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { FormData } from "../../../../service/inventoryDataType";
import { fetchSingleData } from "../../../../utility";
import { toast } from "react-toastify";
const ViewInventory: React.FC = () => {
  const { query } = useRouter();
  const { id } = query;
  const [inventoryItem, setInventoryItem] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    setIsLoading(false); 
    loadInitialData()
  }, [id]);
  const loadInitialData = async () => {
      if (!id || typeof id !== "string") return;
      try {
        setIsLoading(true);
        // Fetch single document data from Firestore
        const data = await fetchSingleData("prize_database", id);
        setInventoryItem(data);
      } catch (error) {
        console.error("Error loading inventory data:", error);
        toast.error("Failed to load inventory data.");
      } finally {
        setIsLoading(false);
      }
    };

  if (isLoading) return
    <div className="border border-[rgb(208,213,221)] rounded-xl p-6 bg-white w-full">
      <p>Loading...</p>
    </div>;
  
    if (!inventoryItem) return
    <div className="border border-[rgb(208,213,221)] rounded-xl p-6 bg-white w-full">
      <p>Item not found</p>;
    </div>

  return (
    <div className="border border-[rgb(208,213,221)] rounded-xl p-6 bg-white w-full">
      <h1 className="text-[18px] font-semibold text-dark mb-8">View Inventory</h1>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
        <div className="form-group">
          <label>Prize Name</label>
          <p className="text-sm text-dark">{inventoryItem.prizeName}</p>
        </div>
        <div className="form-group">
          <label>Games Attached</label>
          <p className="text-sm text-dark">{inventoryItem.ticketSold}</p>
        </div>
        <div className="form-group">
          <label>Price</label>
          <p className="text-sm text-dark">${inventoryItem.price}</p>
        </div>
        <div className="form-group">
          <label>Sponsor</label>
          <p className="text-sm text-dark">{inventoryItem.partner}</p>
        </div>
        <div className="form-group">
          <label>Stock Level</label>
          <p className="text-sm text-dark">{inventoryItem.stockLevel}</p>
        </div>
        <div className="form-group">
          <label>Status</label>
          <p className="text-sm text-dark">{inventoryItem.status}</p>
        </div>
        <div className="form-group">
          <label>Prize Image</label>
          {inventoryItem.thumbnail ? (
            <Image src={inventoryItem.thumbnail} alt={inventoryItem.prizeName} width={150} height={100} />
          ) :
          (
            <Image src={"/images/laptop.webp"} alt={inventoryItem.prizeName} width={150} height={100} />
          )
        }
        </div>
      </div>
    </div>
  );
};

export default ViewInventory;
