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
  const [partnersData, setPartnersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "partners"));
      const partners = querySnapshot.docs.map((doc) => {
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
      setPartnersData(partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast.error("Error fetching partners data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleBlock = async (id: string) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "partners", id), { isBanned: true });
      await fetchPartners();
      toast.success("Partner blocked successfully!");
    } catch (error) {
      toast.error("Failed to block partner.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "partners", id), { isBanned: false });
      await fetchPartners();
      toast.success("Partner unblocked successfully!");
    } catch (error) {
      toast.error("Failed to unblock partner.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "partners", id));
      await fetchPartners();
      toast.success("Partner suspended successfully!");
    } catch (error) {
      toast.error("Failed to suspend partner.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/partner-management/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteData("partners", id, (message: string) => {
        toast(message);
      });
      setPartnersData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Error deleting partner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-list">
      {loading && <div style={{ textAlign: 'center', margin: '20px 0' }}>Loading...</div>}
      <PartnerTable
        heading="Partners List"
        items={partnersData}
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
