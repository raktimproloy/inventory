// utility/firebaseUtils.ts

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase.config";

export const uploadImageToFirebase = async (file: File): Promise<string> => {
  const fileName = `raffles/raffle_picture${Date.now()}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
};
