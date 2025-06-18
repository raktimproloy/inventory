import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { FormData } from "./../form";
import { fetchSingleData } from "../../../../utility";
import { toast } from "react-toastify";
import { Timestamp } from "firebase/firestore";

const ViewRaffle: React.FC = () => {
   const { query } = useRouter();
  const { id } = query;
  const [raffles, setRaffles] = useState<FormData | null>(null);
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
        const data = await fetchSingleData("raffles", id);
        setRaffles(data);
      } catch (error) {
        console.error("Error loading inventory data:", error);
        toast.error("Failed to load inventory data.");
      } finally {
        setIsLoading(false);
      }
  };
  
const formatDate = (date: Timestamp | Date | string) => {
  const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  return jsDate.toLocaleDateString("en-GB", options); // e.g., "15 Apr 2025"
};
  if (isLoading) return
    <div className="border border-[rgb(208,213,221)] rounded-xl p-6 bg-white w-full">
      <p>Loading...</p>
    </div>;
  
    if (!raffles) return
    <div className="border border-[rgb(208,213,221)] rounded-xl p-6 bg-white w-full">
      <p>Item not found</p>;
    </div>
  return (
    <div className="border border-[rgb(208,213,221)] rounded-xl p-6 bg-white w-full">
      <h1 className="text-[18px] font-semibold text-dark mb-8">View Games</h1>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
        <div className="form-group">
          <label>Title</label>
          <p className="text-sm text-dark">{raffles.title}</p>
        </div>
        <div className="form-group">
          <label>Prize</label>
          <p className="text-sm text-dark">{raffles.title}</p>
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <p className="text-sm text-dark">{formatDate(raffles.createdAt)}</p>
        </div>
        <div className="form-group">
          <label>End Date</label>
          <p className="text-sm text-dark">{formatDate(raffles.expiryDate)}</p>
        </div>
        <div className="form-group">
          <label>Status</label>
          <p className="text-sm text-dark">{raffles.status || "Active"}</p>
        </div>
        <div className="form-group">
          <label>Ticket Price</label>
          <p className="text-sm text-dark">{raffles.title}</p>
        </div>
        <div className="form-group md:col-span-2">
          <label>Game Description</label>
          <p className="text-sm text-dark">{raffles.description}</p>
        </div>
        <div className="form-group md:col-span-2">
          <label>Game Image</label>
          {raffles.picture && (
            <Image
              src={raffles.picture}
              alt={raffles.description}
              width={150}
              height={100}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRaffle;
