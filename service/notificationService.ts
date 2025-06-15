// services/notificationService.ts
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase.config";

export interface NotificationSettings {
  // Event-Based Notifications
  newUserRegistration: boolean;
  raffleUpdate: boolean;
  maintenanceUpdates: boolean;
  
  // Alert Frequency
  user: boolean;
  raffle: boolean;
  inventory: boolean;
  
  // Reminders (first group)
  remindersDoNotNotify: boolean;
  remindersImportantOnly: boolean;
  remindersAll: boolean;
  
  // Reminders (second group)
  reminders2DoNotNotify: boolean;
  reminders2ImportantOnly: boolean;
  reminders2All: boolean;
  
  // More Activity About You
  activityDoNotNotify: boolean;
  activityAll: boolean;
  
  // Notification Method
  notificationMethod: "email" | "inApp" | "both";
}

export const saveNotificationSettings = async (settings: NotificationSettings) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const userDocRef = doc(db, "notification_settings", user.uid);
  await setDoc(userDocRef, settings, { merge: true });
};

export const getNotificationSettings = async (): Promise<NotificationSettings | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  const userDocRef = doc(db, "notification_settings", user.uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data() as NotificationSettings;
  }
  return null;
};