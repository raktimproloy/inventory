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
        console.log("Uploading admin profile image to Firebase...");
        profilePictureUrl = await uploadImageToFirebase(file, "admin-profiles");
        console.log("Admin profile image uploaded successfully:", profilePictureUrl);
      }

      // Prepare admin data
      const adminData = {
        ...data,
        profilePicture: profilePictureUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Saving admin data to Firestore:", adminData);

      // Save to Firestore
      const docRef = await addDoc(collection(db, "admins"), adminData);
      console.log("Admin created with ID:", docRef.id);

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
