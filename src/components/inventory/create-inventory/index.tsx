// ✅ create-inventory.tsx
import React from "react";
import InventoryForm, { FormData } from "./../inventory-form";
import { toast } from "react-toastify";
import { addPrize } from "../../../../service/prizeService";
import { addGameToSponsor } from '../../../../service/sponsorService';

const CreateInventory: React.FC = () => {
  const handleCreate = async (data: FormData) => {
    try {
      console.log("=== CREATING INVENTORY ITEM ===");
      console.log("Form Data:", data);
      const prizeId = await addPrize(data);
      if (data.sponsorId && prizeId) {
        await addGameToSponsor(data.sponsorId, prizeId);
      }
      toast.success("Prize saved successfully!");
    } catch (error) {
      console.error("Error creating inventory item:", error);
      toast.error("Error saving prize.");
    }
  };

  return (
    <div>
      <InventoryForm
        formHeading="Create Prize"
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default CreateInventory;
