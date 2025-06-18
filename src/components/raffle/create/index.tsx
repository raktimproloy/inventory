import React from "react";
import { toast } from 'react-toastify';
import RaffleForm from "../form";
import { addGame } from "../../../../service/gameCreation";


const CreateRaffle: React.FC = () => {
  const handleCreate = async (data: any) => {
    try {
      await addGame(data);
      toast.success("Prize saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error saving prize.");
    }
  };
  return (
    <div>
      <RaffleForm
        formHeading="Create Game "
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default CreateRaffle;
