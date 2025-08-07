import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { FormData } from "../../../../service/inventoryDataType";
import { fetchSingleData } from "../../../../utility";
import { toast } from "react-toastify";
import { getSponsors, Sponsor } from '../../../../service/sponsorService';
const ViewInventory: React.FC = () => {
  const { query } = useRouter();
  const { id } = query;
  const [inventoryItem, setInventoryItem] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);

  useEffect(() => {
    setIsLoading(false);
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    if (!id || typeof id !== "string") return;
    try {
      setIsLoading(true);
      // Fetch single document data from Firestore
      const data = await fetchSingleData("prize_database", id);
      setInventoryItem(data);
      // Fetch sponsor if sponsorId exists
      if (data && data.sponsorId) {
        const sponsors = await getSponsors();
        const found = sponsors.find(s => s.id === data.sponsorId);
        if (found) setSponsor(found);
      }
    } catch (error) {
      console.error("Error loading inventory data:", error);
      toast.error("Failed to load inventory data.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="border border-[rgb(208,213,221)] rounded-xl p-6 bg-white w-full">
      <p>Loading...</p>
    </div>
  );

  if (!inventoryItem) return (
    <div className="border border-[rgb(208,213,221)] rounded-xl p-6 bg-white w-full">
      <p>Item not found</p>
    </div>
  );

  return (
    <div className="border border-[rgb(208,213,221)] rounded-xl p-6 bg-white w-full">
      <h1 className="text-[18px] font-semibold text-dark mb-8">View Inventory</h1>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-6 mb-6">
        <div className="form-group">
          <label>Prize Name</label>
          <p className="text-sm text-dark">{inventoryItem.prizeName}</p>
        </div>
        <div className="form-group">
          <label>Prize Category</label>
          <p className="text-sm text-dark">{(inventoryItem as any).prizeCategory}</p>
        </div>
        <div className="form-group">
          <label>Retail Value (USD)</label>
          <p className="text-sm text-dark">${(inventoryItem as any).retailValueUSD}</p>
        </div>
        <div className="form-group">
          <label>Break-even Value</label>
          <p className="text-sm text-dark">${(inventoryItem as any).breakEvenValue}</p>
        </div>
        <div className="form-group">
          <label>Quantity Available</label>
          <p className="text-sm text-dark">{(inventoryItem as any).quantityAvailable}</p>
        </div>
        <div className="form-group">
          <label>Tags</label>
          <p className="text-sm text-dark">{(inventoryItem as any).tags}</p>
        </div>
        <div className="form-group">
          <label>Keywords</label>
          <p className="text-sm text-dark">{(inventoryItem as any).keywords?.join(', ')}</p>
        </div>
        <div className="form-group">
          <label>Full Description</label>
          <p className="text-sm text-dark">{(inventoryItem as any).fullDescription}</p>
        </div>
        <div className="form-group">
          <label>Additional Info</label>
          <p className="text-sm text-dark">{(inventoryItem as any).additionalInfo}</p>
        </div>
        <div className="form-group">
          <label>Fulfillment Method</label>
          <p className="text-sm text-dark">{(inventoryItem as any).fulfillmentMethod}</p>
        </div>
        <div className="form-group">
          <label>Delivery Timeline</label>
          <p className="text-sm text-dark">{(inventoryItem as any).deliveryTimeline}</p>
        </div>
        <div className="form-group">
          <label>Claim Window</label>
          <p className="text-sm text-dark">{(inventoryItem as any).claimWindow}</p>
        </div>
        <div className="form-group">
          <label>Eligible Regions</label>
          <p className="text-sm text-dark">{(inventoryItem as any).eligibleRegions}</p>
        </div>
        <div className="form-group">
          <label>Pickup Required</label>
          <p className="text-sm text-dark">{(inventoryItem as any).pickupRequired ? 'Yes' : 'No'}</p>
        </div>
        <div className="form-group">
          <label>ID Required</label>
          <p className="text-sm text-dark">{(inventoryItem as any).idRequired ? 'Yes' : 'No'}</p>
        </div>
        <div className="form-group">
          <label>Age Restriction</label>
          <p className="text-sm text-dark">{(inventoryItem as any).ageRestriction}</p>
        </div>
        <div className="form-group">
          <label>Terms & Conditions URL</label>
          <a className="text-blue-600 underline" href={(inventoryItem as any).termsConditionsUrl} target="_blank" rel="noopener noreferrer">{(inventoryItem as any).termsConditionsUrl}</a>
        </div>
        <div className="form-group">
          <label>Sponsor</label>
          {sponsor ? (
            <div className="flex items-center gap-2">
              {sponsor.logo && sponsor.logo.length > 0 && (
                <img src={sponsor.logo[0]} alt={sponsor.sponsorName} className="w-12 h-12 object-contain rounded border" />
              )}
              <span className="text-sm text-dark font-semibold">{sponsor.sponsorName}</span>
            </div>
          ) : (
            <span className="text-sm text-dark">N/A</span>
          )}
        </div>
      </div>
      <div className="mb-6">
        <label className="block font-medium mb-2">Images</label>
        <div className="flex flex-wrap gap-4">
          {Array.isArray((inventoryItem as any).images) && (inventoryItem as any).images.length > 0 ? (
            (inventoryItem as any).images.map((img: string, idx: number) => (
              <Image key={idx} src={img} alt={inventoryItem.prizeName} width={150} height={100} className="rounded border" />
            ))
          ) : (
            <Image src={inventoryItem.thumbnail || "/images/laptop.webp"} alt={inventoryItem.prizeName} width={150} height={100} className="rounded border" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewInventory;
