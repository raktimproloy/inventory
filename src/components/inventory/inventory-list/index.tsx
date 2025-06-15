// components/InventoryList.tsx
import React, { useEffect, useState } from "react";
import InventoryTable from "./../inventory-table";
import { fetchUsers, deleteData } from "../../../../utility";
import { toast } from "react-toastify";

const InventoryList: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<any[]>([]);

  useEffect(() => {
    getAllInventory();
  }, []);

  const getAllInventory = async () => {
    try {
      // Fetch inventory data from the "Prize_Database" collection
      const inventoryData = await fetchUsers("prize_database");
      setInventoryData(inventoryData);
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
    <div className="inventory-list">
      <InventoryTable
        items={inventoryData}
        heading="Prize List"
        onDelete={handleDelete}
      />
    </div>
  );
};

export default InventoryList;
