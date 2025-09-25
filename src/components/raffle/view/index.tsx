import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { FormData } from "./../form";
import { fetchSingleData } from "../../../../utility";
import { toast } from "react-toastify";
import { Timestamp } from "firebase/firestore";

interface PrizeData {
  id: string;
  prizeName: string;
  retailValueUSD: string;
  thumbnail?: string;
  prizeCategory?: string;
}

const ViewRaffle: React.FC = () => {
  const { query } = useRouter();
  const { id } = query;
  const [raffles, setRaffles] = useState<FormData | null>(null);
  const [prize, setPrize] = useState<PrizeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    if (!id || typeof id !== "string") return;
    try {
      setIsLoading(true);
      // Fetch single document data from Firestore
      const data = await fetchSingleData("raffles", id);
      setRaffles(data);
      // If the raffle has a prizeId, fetch the prize
      if (data && data.prizeId) {
        const prizeData = await fetchSingleData("prize_database", data.prizeId);
        setPrize(prizeData);
      }
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

  const formatTime = (time: string) => {
    if (!time) return "N/A";
    
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) return (
    <div className="border border-[rgb(208,213,221)] rounded-xl p-6 bg-white w-full">
      <p>Loading...</p>
    </div>
  );

  if (!raffles) return (
    <div className="border border-[rgb(208,213,221)] rounded-xl p-6 bg-white w-full">
      <p>Item not found</p>
    </div>
  );

  return (
    <div className="border border-[rgb(208,213,221)] rounded-xl p-6 bg-white w-full">
      <h1 className="text-[18px] font-semibold text-dark mb-8">View Games</h1>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
        <div className="form-group">
          <label>Title</label>
          <p className="text-sm text-dark">{raffles.title}</p>
        </div>
        <div className="form-group">
          <label>Status</label>
          <p className="text-sm text-dark">{raffles.status || "Active"}</p>
        </div>
        
        <div className="form-group">
          <label>Start Date</label>
          <p className="text-sm text-dark">{formatDate(raffles.createdAt)}</p>
        </div>
        <div className="form-group">
          <label>Start Time</label>
          <p className="text-sm text-dark">{formatTime(raffles.startTime)}</p>
        </div>
        <div className="form-group">
          <label>End Date</label>
          <p className="text-sm text-dark">{formatDate(raffles.expiryDate)}</p>
        </div>
        <div className="form-group">
          <label>End Time</label>
          <p className="text-sm text-dark">{formatTime(raffles.endTime)}</p>
        </div>
        
        <div className="form-group">
          <label>Ticket Price</label>
          <p className="text-sm text-dark">{raffles.ticketPrice ? `${raffles.ticketPrice} Gold Coin${raffles.ticketPrice > 1 ? 's' : ''}` : "N/A"}</p>
        </div>
        <div className="form-group">
          <label>Game Category</label>
          <p className="text-sm text-dark">{raffles.gameDescription || "N/A"}</p>
        </div>
        <div className="form-group">
          <label>Prize Category</label>
          <p className="text-sm text-dark">{raffles.category || "N/A"}</p>
        </div>
        <div className="form-group">
          <label>Game Image</label>
          {raffles.picture ? (
            <Image
              src={raffles.picture}
              alt={raffles.description}
              width={150}
              height={100}
            />
          ) : (
            <Image
              src={"/images/laptop.webp"}
              alt={raffles.description}
              width={150}
              height={100}
            />
          )}
        </div>
        {prize && (
          
          <div className="form-group">
            <label>Prize Thumbnail</label>
            {prize.thumbnail ? (
              <Image
                src={prize.thumbnail}
                alt={prize.prizeName}
                width={150}
                height={100}
              />
            ) : (
              <span className="text-gray-400">No prize image</span>
            )}
          </div>
        )}
        <div className="form-group">
          <label>Prize Name</label>
          <p className="text-sm text-dark">{prize ? prize.prizeName : "N/A"}</p>
        </div>
        
        
        <div className="form-group">
        <label className="block">Prize Price</label>
          <span className="text-sm text-dark">{prize ? prize.retailValueUSD : "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default ViewRaffle;
