import React from "react";
import { toast } from 'react-toastify';
import RaffleForm from "../form";
import { addGame } from "../../../../service/gameCreation";
import { addGameToSponsor } from '../../../../service/sponsorService';


const CreateRaffle: React.FC = () => {
  const handleCreate = async (data: any) => {
    try {
      // Create the game/raffle
      const docRef = await addGame(data);
      // If prizeId and sponsorId are present, add the raffle ID to sponsor's gamesCreation
      if (data.prizeId && data.sponsorId && docRef && docRef.id) {
        await addGameToSponsor(data.sponsorId, docRef.id);
      }
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
