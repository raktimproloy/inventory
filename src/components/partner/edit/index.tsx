import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import UserForm, { FormData } from "../form";
import { fetchSingleData, updatedData } from "../../../../utility";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { storage } from "../../../../config/firebase.config";

const EditPartner: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [initialData, setInitialData] = useState<any | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [id, router]);

  const loadInitialData = async () => {
    if (!id || typeof id !== "string") return;

    try {
      setIsLoading(true);
      const data = await fetchSingleData("partners", id);

      if (data) {
        setInitialData(data);
      } else {
        toast.error("Partner not found!");
        router.push("/");
      }
    } catch (error) {
      console.error("Error loading partner data:", error);
      toast.error("Failed to load partner data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (formData: FormData, file?: File | null) => {
    if (!id || typeof id !== "string") {
      toast.error("Invalid partner ID!");
      return;
    }

    setUpdating(true);
    try {
      let profilePictureUrl = initialData.profilePicture;

      if (file) {
        const storageRef = ref(storage, `profile_pictures/${uuidv4()}`);
        await uploadBytes(storageRef, file);
        profilePictureUrl = await getDownloadURL(storageRef);
      }

      const updatedPartnerData = {
        ...formData,
        profilePicture: profilePictureUrl,
        isBanned: formData.isBanned === "true"
      };

      await updatedData(updatedPartnerData, "partners", (message: string) => {
        toast(message);
      }, id);
      router.push("./");
    } catch (error) {
      console.error("Error updating partner:", error);
      toast.error("Failed to update partner.");
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {updating && <div style={{ textAlign: 'center', margin: '20px 0' }}>Updating...</div>}
      <UserForm
        formHeading="Edit Partner"
        initialData={initialData}
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default EditPartner;
