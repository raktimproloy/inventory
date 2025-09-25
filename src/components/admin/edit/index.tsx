import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from 'react-toastify';
import { fetchSingleData, updatedData } from "../../../../utility";
import AdminForm, { FormData } from "../form";
import { uploadImageToFirebase } from "../../../../utility/firebaseUtils";

const EditAdmin: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [initialData, setInitialData] = useState<FormData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [id, router]);

  const loadInitialData = async () => {
    if (!id || typeof id !== "string") return;

    try {
      setIsLoading(true);
      const data = await fetchSingleData("admins", id);

      if (data) {
        setInitialData(data);
      } else {
        toast.error("Admin not found!");
        router.push("/admin-management");
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load admin data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: FormData, file?: File | null) => {
    if (!id || typeof id !== "string") {
      toast.error("Invalid admin ID!");
      return;
    }

    setIsSaving(true);
    try {
      let profilePictureUrl = data.profilePicture;

      // Upload new image if provided
      if (file) {
        profilePictureUrl = await uploadImageToFirebase(file);
      }

      // Prepare updated data
      const updatedDataPayload = {
        ...data,
        profilePicture: profilePictureUrl,
        updatedAt: new Date().toISOString(),
      };

      await updatedData(
        updatedDataPayload,
        "admins",
        (message: string) => {
          toast.success(message);
        },
        id
      );

      router.push("/admin-management");
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error("Failed to update admin.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <p className="text-gray-600">Loading admin data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminForm
        formHeading="Edit Admin"
        initialData={initialData}
        onSubmit={handleUpdate}
        isLoading={isSaving}
      />
    </div>
  );
};

export default EditAdmin;
