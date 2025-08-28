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
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState({
    name: '',
    email: '',
    status: '',
    access: '',
    kyc: '',
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Sorting logic
  const sortedItems = React.useMemo(() => {
    let sortable = [...items];
    if (sortConfig !== null) {
      const keyMap: Record<string, (item: User) => string | number> = {
        userName: (item) => item.userName || '',
        email: (item) => item.email || '',
        access: (item) => item.access || '',
        registrationDate: (item) => item.registrationDate || '',
        status: (item) => item.status || '',
        kycRequest: (item) => item.kycRequest || '',
      };
      const getValue = keyMap[sortConfig.key];
      sortable.sort((a, b) => {
        let aValue = getValue ? getValue(a) : '';
        let bValue = getValue ? getValue(b) : '';
        // For registrationDate, compare as date
        if (sortConfig.key === 'registrationDate') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        } else {
          aValue = aValue.toString().toLowerCase();
          bValue = bValue.toString().toLowerCase();
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [items, sortConfig]);

  // Filtering logic
  const filteredItems = React.useMemo(() => {
    let data = [...sortedItems];
    if (filter.name) {
      const search = filter.name.toLowerCase();
      data = data.filter(item => item.userName && item.userName.toLowerCase().includes(search));
    }
    if (filter.email) {
      const search = filter.email.toLowerCase();
      data = data.filter(item => item.email && item.email.toLowerCase().includes(search));
    }
    if (filter.status) {
      data = data.filter(item => item.status === filter.status);
    }
    if (filter.access) {
      data = data.filter(item => item.access === filter.access);
    }
    if (filter.kyc) {
      data = data.filter(item => item.kycRequest === filter.kyc);
    }
    return data;
  }, [sortedItems, filter]);

  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return new Date(date).toLocaleDateString("en-GB", options);
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
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

  // Filter dropdown UI
  const renderFilterDropdown = (
    <div className="absolute left-[-100%] top-[100%] mt-2 w-96 bg-white border rounded-lg shadow-lg z-50 p-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          className="w-full border rounded px-2 py-1"
          placeholder="Search by name"
          value={filter.name}
          onChange={e => setFilter(f => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="text"
          className="w-full border rounded px-2 py-1"
          placeholder="Search by email"
          value={filter.email}
          onChange={e => setFilter(f => ({ ...f, email: e.target.value }))}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Access</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={filter.access}
          onChange={e => setFilter(f => ({ ...f, access: e.target.value }))}
        >
          <option value="">All Access</option>
          <option value="admin">Admin</option>
          <option value="regular">Regular</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">KYC</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={filter.kyc}
          onChange={e => setFilter(f => ({ ...f, kyc: e.target.value }))}
        >
          <option value="">All KYC</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => setFilter({ name: '', email: '', status: '', access: '', kyc: '' })}
        >
          Reset
        </button>
        <button
          className="px-3 py-1 bg-primary text-white rounded"
          onClick={() => setFilterOpen(false)}
        >
          Apply
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="border border-[#D0D5DD] rounded-xl py-6 bg-white w-full">
        <div className="flex justify-between items-center mb-4 px-6 relative">
          <h1 className="text-[18px] font-semibold text-dark">{heading}</h1>
          <div className="flex items-center space-x-2 relative">
            <button
              className="inline-flex items-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium"
              onClick={() => setFilterOpen(f => !f)}
              type="button"
            >
              <svg width="20" viewBox="0 0 20 20">
                <use href="/images/sprite.svg#svg-filter"></use>
              </svg>
              <span>Filter</span>
            </button>
            {filterOpen && renderFilterDropdown}
            <Link
              href="/user-management/user-create"
              className="inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium"
            >
              + Add Gamers
            </Link>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F3F3F5] border-b border-t !border-[#D0D5DD]">
              <th className="py-3 px-6 text-[12px] font-medium text-gray cursor-pointer" onClick={() => handleSort('userName')}>
                User {sortConfig?.key === 'userName' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th className="py-3 px-6 text-[12px] font-medium text-gray cursor-pointer" onClick={() => handleSort('email')}>
                Email {sortConfig?.key === 'email' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th className="py-3 px-6 text-[12px] font-medium text-gray cursor-pointer" onClick={() => handleSort('access')}>
                Access {sortConfig?.key === 'access' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th className="py-3 px-6 text-[12px] font-medium text-gray cursor-pointer" onClick={() => handleSort('registrationDate')}>
                Registration Date {sortConfig?.key === 'registrationDate' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th className="py-3 px-6 text-[12px] font-medium text-gray cursor-pointer" onClick={() => handleSort('status')}>
                Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              {/* <th className="py-3 px-6 text-[12px] font-medium text-gray cursor-pointer" onClick={() => handleSort('kycRequest')}>
                KYC Request {sortConfig?.key === 'kycRequest' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th> */}
              <th className="py-3 px-6 text-[12px] font-medium text-gray">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id} className="border-b !border-[#D0D5DD]">
                <td className="py-3 px-6 text-sm text-gray flex items-center gap-2">
                  <Link href={`/user-management/profile/${item.id}`} className="flex items-center gap-2 hover:opacity-80">
                    <img
                      src={item.thumbnail || "/images/laptop.webp"}
                      alt={item.userName}
                      className="h-8 w-8 rounded-full object-cover cursor-pointer"
                    />
                    <span className="cursor-pointer hover:text-blue-600">{item.userName}</span>
                  </Link>
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
                {/* <td className="py-3 px-6 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs border font-medium ${item.kycRequest === "Approved"
                      ? "text-[#067647] border-[#D0D5DD]"
                      : item.kycRequest === "Pending"
                        ? "text-primary border-primary"
                        : "text-red-600 border-red-600"
                    }`}>
                    {item.kycRequest}
                  </span>
                </td> */}
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
