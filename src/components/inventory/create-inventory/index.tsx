
// ✅ create-inventory.tsx
import React from "react";
import InventoryForm from "./../inventory-form";
import { toast } from "react-toastify";
import { FormData } from "../../../../service/inventoryDataType";
import { addPrize } from "../../../../service/prizeService";

const CreateInventory: React.FC = () => {
  const handleCreate = async (data: FormData) => {
    try {
      await addPrize(data);
      toast.success("Prize saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error saving prize.");
    }
  };

  return (
    <div>
      <InventoryForm
        formHeading="Create Inventory"
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default CreateInventory;
