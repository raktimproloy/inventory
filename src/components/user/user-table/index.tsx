// components/pages/user-table.tsx

import React, { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import ConfirmationModal from "@/components/common/modal";
import Pagination from "@/components/common/pagination";
import Dropdown from "@/components/common/dropdown";

interface User {
  id: string;
  userName: string;
  email: string;
  access: string;
  registrationDate: string;
  status: string;
  kycRequest: string;
  thumbnail?: string | null;
}

interface UserTableProps {
  heading: string;
  items: User[];
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
  onSuspend: (id: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  heading,
  items,
  onBlock,
  onUnblock,
  onSuspend,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return new Date(date).toLocaleDateString("en-GB", options);
  };

  const handleDropdownToggle = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleBlockUser = (id: string) => {
    onBlock(id);
    toast.success("User blocked successfully!");
  };

  const handleUnblockUser = (id: string) => {
    onUnblock(id);
    toast.success("User unblocked successfully!");
  };

  const handleSuspendUser = (id: string) => {
    setSelectedItemId(id);
    setIsModalOpen(true);
  };

  const confirmSuspend = () => {
    if (selectedItemId) {
      onSuspend(selectedItemId);
      toast.success("User suspended (deleted) successfully!");
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="border border-[#D0D5DD] rounded-xl py-6 bg-white w-full">
        <div className="flex justify-between items-center mb-4 px-6">
          <h1 className="text-[18px] font-semibold text-dark">{heading}</h1>
          <Link
            href="/user-management/user-create"
            className="inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium"
          >
            + Create New
          </Link>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F3F3F5] border-b border-t !border-[#D0D5DD]">
              <th className="py-3 px-6 text-[12px] font-medium text-gray">User</th>
              <th className="py-3 px-6 text-[12px] font-medium text-gray">Email</th>
              <th className="py-3 px-6 text-[12px] font-medium text-gray">Access</th>
              <th className="py-3 px-6 text-[12px] font-medium text-gray">Date</th>
              <th className="py-3 px-6 text-[12px] font-medium text-gray">Status</th>
              <th className="py-3 px-6 text-[12px] font-medium text-gray">KYC</th>
              <th className="py-3 px-6 text-[12px] font-medium text-gray">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id} className="border-b !border-[#D0D5DD]">
                <td className="py-3 px-6 text-sm text-gray flex items-center gap-2">
                  <img
                    src={item.thumbnail || "/images/laptop.webp"}
                    alt={item.userName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span>{item.userName}</span>
                </td>
                <td className="py-3 px-6 text-sm">{item.email}</td>
                <td className="py-3 px-6 text-sm">{item.access}</td>
                <td className="py-3 px-6 text-sm">{formatDate(item.registrationDate)}</td>
                <td className="py-3 px-6 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs border font-medium ${item.status === "Active"
                      ? "text-[#067647] border-[#D0D5DD]"
                      : "text-primary border-primary"
                    }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs border font-medium ${item.kycRequest === "Approved"
                      ? "text-[#067647] border-[#D0D5DD]"
                      : item.kycRequest === "Pending"
                        ? "text-primary border-primary"
                        : "text-red-600 border-red-600"
                    }`}>
                    {item.kycRequest}
                  </span>
                </td>
                <td className="py-3 px-6 text-sm">
                  <Dropdown
                    id={item.id}
                    isOpen={openDropdown === item.id}
                    toggleDropdown={() => handleDropdownToggle(item.id)}
                    options={[
                      {
                        id: 1,
                        name: "/images/icon/block.svg",
                        title: "Block",
                        action: () => handleBlockUser(item.id),
                      },
                      {
                        id: 2,
                        name: "/images/icon/check1.svg",
                        title: "Check",
                        action: () => handleUnblockUser(item.id),
                      },
                      {
                        id: 3,
                        name: "/images/icon/delete1.svg",
                        title: "Delete",
                        action: () => handleSuspendUser(item.id),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length > 10 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(items.length / itemsPerPage)}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmSuspend}
        message="Are you sure you want to suspend this user?"
      />
    </>
  );
};

export default UserTable;
