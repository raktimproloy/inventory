// components/pages/user-management/UserList.tsx

import React, { useEffect, useState } from "react";
import PartnerTable from "../partner-table";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../../config/firebase.config";
import { deleteData } from "../../../../utility";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const PartnerList: React.FC = () => {
  const [usersData, setUsersData] = useState<any[]>([]);
  const router = useRouter();

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
        };
      });
      setUsersData(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users data");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlock = async (id: string) => {
    await updateDoc(doc(db, "users", id), { isBanned: true });
    fetchUsers();
    toast.success("Partner blocked successfully!");
  };

  const handleUnblock = async (id: string) => {
    await updateDoc(doc(db, "users", id), { isBanned: false });
    fetchUsers();
    toast.success("Partner unblocked successfully!");
  };

  const handleSuspend = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    fetchUsers();
    toast.success("Partner suspended successfully!");
  };

  const handleEdit = (id: string) => {
    router.push(`/partner-management/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteData("users", id, (message: string) => {
        toast(message);
      });
      setUsersData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Error deleting partner. Please try again.");
    }
  };

  return (
    <div className="user-list">
      <PartnerTable
        heading="Partners List"
        items={usersData}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
        onSuspend={handleSuspend}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PartnerList;
