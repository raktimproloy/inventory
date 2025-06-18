import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from 'react-toastify';
import { fetchSingleData, updatedData } from "../../../../utility";
import AppConst from "../../../../config/app.config";
import RaffleForm, { FormData } from "../form";

const EditRaffle: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Get the ID from the query parameters
  const [initialData, setInitialData] = useState<any | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    loadInitialData();
  }, [id, router]);

  const loadInitialData = async () => {
      if (!id || typeof id !== "string") return;

      try {
        setIsLoading(true);

        // Fetch single document data from Firestore
        const data = await fetchSingleData("raffles", id);

        if (data) {
          setInitialData(data); // Set the fetched data as initial form data
        } else {
          toast.error("Inventory item not found!");
          router.push("/");
        }
      } catch (error) {
        console.error("Error loading inventory data:", error);
        toast.error("Failed to load inventory data.");
      } finally {
        setIsLoading(false);
      }
    };

  const handleUpdate = async (data: FormData) => {
    if (!id || typeof id !== "string") {
      toast.error("Invalid item ID!");
      return;
    }

    try {
      // Update the inventory item in Firestore
      await updatedData(data, "raffles", (message: string) => {
        toast(message);
      }, id);
      router.push("./");
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast.error("Failed to update inventory.");
    }
  };

  if (isLoading) return <p>Loading...</p>; // Show a loading indicator while fetching data

  return (
    <div>
      <RaffleForm
        formHeading="Edit Raffle"
        initialData={initialData}
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default EditRaffle;
