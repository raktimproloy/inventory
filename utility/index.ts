import { db } from "../config/firebase.config";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

/**
 * Create a new document in Firestore
 * @param data - Data to be added to Firestore
 * @param dbCollection - Firestore collection name
 * @param message - Callback to display a message
 */
export const DataCreate = async (
  data: any,
  dbCollection: string,
  message: (msg: string) => void
) => {
  try {
    if (!data || Object.keys(data).length === 0) {
      message("Creation Unsuccessful");
      return;
    }

    const docRef = doc(collection(db, dbCollection)); // Auto-generate ID
    await setDoc(docRef, data);

    message("Created successfully!");
  } catch (error) {
    console.error("Error creating document: ", error);
    message("Creation Unsuccessful");
  }
};

/**
 * Fetch all documents from Firestore
 * @param dbCollection - Firestore collection name
 * @returns - Array of documents
 */
export const fetchUsers = async (dbCollection: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, dbCollection));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Fetched users: ", data);
    return data;
  } catch (error) {
    console.error("Error fetching data: ", error);
    return [];
  }
};

/**
 * Fetch a single document from Firestore
 * @param dbCollection - Firestore collection name
 * @param id - Document ID
 * @returns - Single document data
 */
export const fetchSingleData = async (
  dbCollection: any,
  id: any
): Promise<any | null> => {
  try {
    const docRef = doc(db, dbCollection, id);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      return {
        id: docSnapshot.id,
        ...(docSnapshot.data() as FormData), // Ensure it matches FormData
      };
    } else {
      console.error("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching single document: ", error);
    return null;
  }
};


/**
 * Update a document in Firestore
 * @param data - Updated data
 * @param dbCollection - Firestore collection name
 * @param id - Document ID
 * @param message - Callback to display a message
 */
export const updatedData = async (
  data: Record<string, any>, // Better type than 'any' for data
  dbCollection: string,
  message: (msg: string) => void,
  id?: string // Optional id, can be undefined
) => {
  if (!id) {
    console.error("Document ID is required for update");
    message("Update Unsuccessful: Missing ID");
    return;
  }

  try {
    // Create a reference to the document in the specified collection
    const docRef = doc(db, dbCollection, id); // Assuming db is initialized Firestore instance
    // Perform the update
    await updateDoc(docRef, data);
    message("Updated successfully!");
  } catch (error) {
    console.error("Error updating document: ", error);
    message("Update Unsuccessful");
  }
};

/**
 * Delete a document from Firestore
 * @param dbCollection 
 * @param id
 * @param message
 */
export const deleteData = async (
  dbCollection: string,
  id: string,
  message: (msg: string) => void
) => {
  try {
    const docRef = doc(db, dbCollection, id);
    await deleteDoc(docRef); // Delete from Firestore
    // message("Item Deleted successfully!"); // Success message
  } catch (error) {
    console.error("Error deleting document: ", error);
    message("Item Delete Unsuccessful"); // Error message
  }
};

