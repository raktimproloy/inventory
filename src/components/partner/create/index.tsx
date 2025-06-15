import React from "react";
import UserForm, { FormData } from "../form";
import { toast } from "react-toastify";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { db, storage } from "../../../../config/firebase.config";

const CreateUser = () => {
  const handleCreateUser = async (formData: FormData, file?: File | null) => {
    try {
      let profilePictureUrl = "";

      if (file) {
        const storageRef = ref(storage, `profile_pictures/${uuidv4()}`);
        await uploadBytes(storageRef, file);
        profilePictureUrl = await getDownloadURL(storageRef);
      }

      const newUser = {
        uid: uuidv4(),
        name: formData.name,
        email: formData.email,
        userType: formData.userType,
        kycRequest: formData.kycRequest,
        profilePicture: profilePictureUrl || "",
        isBanned: false,
        credits: 0,
        age: 25,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "users"), newUser);
      toast.success("User created successfully!");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user.");
    }
  };

  return <UserForm formHeading="Create Partner" onSubmit={handleCreateUser} />;
};

export default CreateUser;
