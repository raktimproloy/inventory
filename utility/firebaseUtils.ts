// utility/firebaseUtils.ts

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase.config";

export const uploadImageToFirebase = async (file: File, folder: string = "general"): Promise<string> => {
  // Generate a unique filename with timestamp
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `${folder}/${folder}_${timestamp}.${fileExtension}`;
  
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
};
