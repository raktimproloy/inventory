// components/pages/user-management/UserList.tsx

import React, { useEffect, useState } from "react";
import UserTable from "../user-table";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../../config/firebase.config";

const UserList: React.FC = () => {
  const [usersData, setUsersData] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userName: data.name || "",
          email: data.email || "",
          access: data.userType || "",
          registrationDate: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : "",
          status: data.isBanned ? "Blocked" : "Active",
          kycRequest: data.kycRequest || "Pending",
          thumbnail: data.profilePicture || null,
          telContact: data.telContact || "",
          gender: data.gender || "",
          location: data.location || "",
          birthday: data.birthday || "",
          timeZone: data.timeZone || "",
          kycDocument: data.kycDocument || "",
        };
      });
      setUsersData(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlock = async (id: string) => {
    await updateDoc(doc(db, "users", id), { isBanned: true });
    fetchUsers();
  };

  const handleUnblock = async (id: string) => {
    await updateDoc(doc(db, "users", id), { isBanned: false });
    fetchUsers();
  };

  const handleSuspend = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    fetchUsers();
  };

  return (
    <div className="user-list">
      <UserTable
        heading="Gamers List"
        items={usersData}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
        onSuspend={handleSuspend}
      />
    </div>
  );
};

export default UserList;
