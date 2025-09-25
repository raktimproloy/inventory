import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Pagination from '../../common/pagination';
import Image from 'next/image';
import Link from 'next/link';
import Dropdown from '../../common/dropdown';
import { toast } from "react-toastify";
import ConfirmationModal from '../../common/modal';

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

interface AdminTableProps {
  heading: string;
  items: Admin[];
  onDelete: (id: string) => void;
}

const AdminTable: React.FC<AdminTableProps> = ({ heading, items, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState({
    role: '',
    search: '',
  });

  const router = useRouter();
  const itemsPerPage = 10;

  // Filtering logic
  const filteredItems = React.useMemo(() => {
    let data = [...items];
    if (filter.role) {
      data = data.filter(item => item.role.toLowerCase() === filter.role.toLowerCase());
    }
    if (filter.search) {
      const search = filter.search.toLowerCase();
      data = data.filter(item =>
        item.fullName.toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search) ||
        item.company.toLowerCase().includes(search)
      );
    }
    return data;
  }, [items, filter]);

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const adminDataList = filteredItems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Dropdown toggle
  const handleDropdownToggle = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  // Handlers for dropdown actions
  const handleView = (id: string) => {
    router.push(`/admin-management/view/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin-management/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    setSelectedItemId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItemId !== null) {
      try {
        await onDelete(selectedItemId);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error deleting admin:", error);
        toast.error("Deletion failed! Please try again.");
      }
    }
  };

  // Handle individual checkbox selection
  const handleCheckboxChange = (id: string) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((itemId) => itemId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  // Handle "Select All" checkbox
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const allItemIds = adminDataList.map((item) => item.id);
      setSelectedItems(allItemIds);
    }
    setSelectAll(!selectAll);
  };

  // Check if all items on the current page are selected
  const isAllSelected = adminDataList.every((item) =>
    selectedItems.includes(item.id)
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'sponsor': return 'bg-green-100 text-green-800';
      case 'partner': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter dropdown UI
  const renderFilterDropdown = (
    <div className="absolute left-[-100%] top-[100%] mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 p-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={filter.role}
          onChange={e => setFilter(f => ({ ...f, role: e.target.value }))}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="sponsor">Sponsor</option>
          <option value="partner">Partner</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          type="text"
          className="w-full border rounded px-2 py-1"
          placeholder="Search by name, email, or company"
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => setFilter({ role: '', search: '' })}
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
        {/* Header */}
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
            <Link href="/admin-management/create" className="inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium">
              + Create Admin
            </Link>
          </div>
        </div>

        {/* Table */}
        <div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F3F3F5] border-b border-t !border-[#D0D5DD]">
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAllChange}
                    />
                    <span>Admin</span>
                  </div>
                </th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Email</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Company</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Role</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Phone</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Created</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {adminDataList.map((item) => (
                <tr key={item.id} className="border-b !border-[#D0D5DD]">
                  <td className="text-sm text-gray py-3 px-6">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                      />
                      <span className="h-10 w-10 min-w-10 bg-white rounded-full border border-[#D0D5DD] overflow-hidden">
                        <Image
                          src={item.profilePicture || '/images/Avatars.png'}
                          loading="lazy"
                          height={500}
                          width={500}
                          quality={100}
                          alt={item.fullName}
                          className="object-cover h-10"
                        />
                      </span>
                      <span className="text-dark font-medium text-sm">{item.fullName}</span>
                    </div>
                  </td>
                  <td className="text-sm text-gray py-3 px-6">{item.email}</td>
                  <td className="text-sm text-gray py-3 px-6">{item.company}</td>
                  <td className="text-sm text-gray py-3 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(item.role)}`}>
                      {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                    </span>
                  </td>
                  <td className="text-sm text-gray py-3 px-6">{item.phoneNumber}</td>
                  <td className="text-sm text-gray py-3 px-6">{formatDate(item.createdAt)}</td>
                  <td className="text-sm text-gray py-3 px-6">
                    <Dropdown
                      id={item.id}
                      isOpen={openDropdown === `${item.id}`}
                      toggleDropdown={() => handleDropdownToggle(`${item.id}`)}
                      options={[
                        { id: 1, name: '/images/icon/eye1.svg', title: 'View', action: () => handleView(item.id) },
                        { id: 2, name: '/images/icon/edit1.svg', title: 'Edit', action: () => handleEdit(item.id) },
                        { id: 3, name: '/images/icon/delete1.svg', title: 'Delete', action: () => handleDelete(item.id) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        message="Delete Admin"
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        description="Are you sure you want to delete this admin? This action cannot be undone."
        icon="/images/icon/delete-icon.png"
        iconAlt="Delete"
      />
    </>
  );
};

export default AdminTable;
