
// ✅ uploadImage.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadImageToFirebase = async (file: File): Promise<string> => {
  const storage = getStorage();
  const fileRef = ref(storage, `prize_database/edited_game_picture${Date.now()}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef); // ✅ Firebase hosted URL
};

// ✅ prizeService.ts
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase.config";
import { FormData } from "@/components/inventory/inventory-form";

export const addPrize = async (data: FormData) => {
  const prizeCollection = collection(db, "prize_database");
  await addDoc(prizeCollection, data); // ✅ thumbnail will contain Firebase URL
};
