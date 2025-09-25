import React, { useState } from "react";
import { toast } from 'react-toastify';
import AdminForm, { FormData } from "../form";
import { uploadImageToFirebase } from "../../../../utility/firebaseUtils";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../../config/firebase.config";
import { useRouter } from "next/router";

const CreateAdmin: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (data: FormData, file?: File | null) => {
    setIsLoading(true);
    try {
      let profilePictureUrl = null;

      // Upload image if provided
      if (file) {
        profilePictureUrl = await uploadImageToFirebase(file);
      }

      // Prepare admin data
      const adminData = {
        ...data,
        profilePicture: profilePictureUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      await addDoc(collection(db, "admins"), adminData);

      toast.success("Admin created successfully!");
      router.push("/admin-management");
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error("Failed to create admin. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <AdminForm
        formHeading="Create Admin"
        onSubmit={handleCreate}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CreateAdmin;
