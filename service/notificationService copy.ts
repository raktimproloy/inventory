// /services/notificationService.ts

import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase.config";

export const saveNotificationSettings = async (settings: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const userDocRef = doc(db, "notification_settings", user.uid);
  await setDoc(userDocRef, settings, { merge: true });
};

export const getNotificationSettings = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  const userDocRef = doc(db, "notification_settings", user.uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};
