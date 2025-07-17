import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, updateDoc, doc, arrayUnion, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase.config";

export interface Sponsor {
  id: string;
  sponsorName: string;
  logo: string[]; // Array of Firebase Storage URLs (max 2)
  gamesCreation: string[]; // Array of prize/game IDs
  prizesCreation: string[]; // Array of prize/game IDs
}

// Upload sponsor images to Firebase Storage and return their URLs
export const uploadSponsorImages = async (files: File[]): Promise<string[]> => {
  const storage = getStorage();
  const uploadPromises = files.map(async (file, idx) => {
    const fileRef = ref(storage, `sponsors/logo_${Date.now()}_${idx}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  });
  return Promise.all(uploadPromises);
};

// Add a new sponsor to Firestore
export const addSponsor = async (sponsorName: string, logoFiles: File[]): Promise<Sponsor> => {
  const logoUrls = await uploadSponsorImages(logoFiles);
  const sponsorData = {
    sponsorName,
    logo: logoUrls,
    gamesCreation: [],
    prizesCreation: [],
    status: "Active"
  };
  const sponsorCollection = collection(db, "sponsors");
  const docRef = await addDoc(sponsorCollection, sponsorData);
  return { id: docRef.id, ...sponsorData };
};

// Get all sponsors from Firestore
export const getSponsors = async (): Promise<Sponsor[]> => {
  const sponsorCollection = collection(db, "sponsors");
  const snapshot = await getDocs(sponsorCollection);
  return snapshot.docs
    .map(docSnap => ({ ...(docSnap.data() as Sponsor & { status?: string }), id: docSnap.id }))
    .filter(sponsor => sponsor.status === "Active") as Sponsor[];
};

// Add a prize ID to a sponsor's gamesCreation array
export const addGameToSponsor = async (sponsorId: string, gameId: string): Promise<void> => {
  const sponsorDoc = doc(db, "sponsors", sponsorId);
  await updateDoc(sponsorDoc, {
    gamesCreation: arrayUnion(gameId),
  });
};

// Add a prize ID to a sponsor's gamesCreation array
export const addPrizeToSponsor = async (sponsorId: string, gameId: string): Promise<void> => {
  const sponsorDoc = doc(db, "sponsors", sponsorId);
  await updateDoc(sponsorDoc, {
    prizesCreation: arrayUnion(gameId),
  });
};

// Delete a sponsor from Firestore
export const deleteSponsor = async (sponsorId: string): Promise<void> => {
  const sponsorDoc = doc(db, "sponsors", sponsorId);
  await deleteDoc(sponsorDoc);
}; 