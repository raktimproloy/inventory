// components/InventoryList.tsx
import React, { useEffect, useState } from "react";
import InventoryTable from "./../inventory-table";
import { fetchUsers, deleteData } from "../../../../utility";
import { getSponsors, Sponsor } from "../../../../service/sponsorService";
import { toast } from "react-toastify";

const InventoryList: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    getAllData();
  }, []);

  const getAllData = async () => {
    try {
      const [rawInventory, sponsorList] = await Promise.all([
        fetchUsers("prize_database"),
        getSponsors(),
      ]);
      setSponsors(sponsorList);
      // Map sponsorId to sponsorName
      const sponsorMap = sponsorList.reduce((acc, s) => {
        acc[s.id] = s.sponsorName;
        return acc;
      }, {} as Record<string, string>);
      // Transform inventory data
      const transformed = rawInventory.map((item: any) => ({
        id: item.id,
        prizeName: item.prizeName || '',
        keyDetails: Array.isArray(item.keywords) ? item.keywords.join(', ') : (item.keywords || ''),
        price: item.retailValueUSD || '',
        sponsor: sponsorMap[item.sponsorId] || '',
        stockLevel: item.quantityAvailable || 0,
        status: item.status || 'Inactive',
        thumbnail: item.thumbnail || '',
        createdAt: item.createdAt || null,
      }));
      // Sort by createdAt (latest first) if createdAt exists
      transformed.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          // Firestore Timestamp object: use .toDate() or .seconds
          const aTime = a.createdAt.seconds ? a.createdAt.seconds : new Date(a.createdAt).getTime();
          const bTime = b.createdAt.seconds ? b.createdAt.seconds : new Date(b.createdAt).getTime();
          return bTime - aTime;
        }
        // If only one has createdAt, keep the one with createdAt first
        if (a.createdAt) return -1;
        if (b.createdAt) return 1;
        // If neither has createdAt, keep original order
        return 0;
      });
      setInventoryData(transformed);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast.error("Failed to fetch inventory data.");
    }
  };

  // Handle item deletion
  const handleDelete = async (id: string) => {
    try {
      await deleteData("prize_database", id, (message: string) => {
        toast(message);
      });
      setInventoryData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Error deleting item. Please try again.");
    }
  };

  return (
    <div className="inventory-list relative">
      <InventoryTable
        items={inventoryData}
        sponsors={sponsors}
        heading="Prize List"
        onDelete={handleDelete}
      />
    </div>
  );
};

export default InventoryList;
