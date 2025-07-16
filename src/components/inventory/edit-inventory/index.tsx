import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import InventoryForm, { FormData } from "./../inventory-form";
import { toast } from "react-toastify";
import { fetchSingleData, updatedData } from "../../../../utility";
import { getSponsors, Sponsor } from '../../../../service/sponsorService';

const EditInventory: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Get the ID from the query parameters
  const [initialData, setInitialData] = useState<FormData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    loadInitialData();
  }, [id, router]);

  const loadInitialData = async () => {
      if (!id || typeof id !== "string") return;

      try {
        setIsLoading(true);

        // Fetch single document data from Firestore
        const data = await fetchSingleData("prize_database", id);

        if (data) {
          // If sponsorId exists, fetch sponsors and set selectedSponsor
          if (data.sponsorId) {
            const sponsors: Sponsor[] = await getSponsors();
            const matchedSponsor = sponsors.find(s => s.id === data.sponsorId);
            if (matchedSponsor) {
              data.selectedSponsor = matchedSponsor;
            }
          }
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
      await updatedData(data, "prize_database", (message: string) => {
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
      {initialData ? (
        <InventoryForm
          formHeading="Edit Inventory"
          initialData={initialData}
          onSubmit={handleUpdate}
        />
      ) : (
        <p>No data found!</p>
      )}
    </div>
  );
};

export default EditInventory;
