import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import AdminTable from "../admin-table";
import { deleteData, fetchUsers } from "../../../../utility";

interface Admin {
  id: string;
  fullName: string;
  email: string;
  company: string;
  role: string;
  phoneNumber: string;
  profilePicture?: string;
  createdAt: string;
}

const AdminList: React.FC = () => {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUsers("admins");
      // Cast the data to Admin[] since fetchUsers returns the correct structure
      setAdmins((data as Admin[]) || []);
    } catch (error) {
      console.error("Error loading admins:", error);
      toast.error("Failed to load admins.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteData("admins", id, (message) => {
        if (message.includes("success")) {
          setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== id));
          toast.success("Admin deleted successfully!");
        } else {
          toast.error(message);
        }
      });
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Failed to delete admin.");
    }
  };

  if (isLoading) {
    return (
      <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <p className="text-gray-600">Loading admins...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Management</h1>
          <p className="text-gray-600">Manage admin users and their permissions</p>
        </div>
        <button
          onClick={loadAdmins}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Admin Table */}
      <AdminTable
        heading="Admin List"
        items={admins}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminList;
