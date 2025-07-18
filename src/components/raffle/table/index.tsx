import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Pagination from '../../common/pagination';
import Image from 'next/image';
import Link from 'next/link';
import Dropdown from '../../common/dropdown';
import { toast } from "react-toastify";
import ConfirmationModal from '../../common/modal';
import { Timestamp } from 'firebase/firestore';

interface RaffleTableProps {
  id: any;
  title: string;
  picture: string;
  description: string;
  editedGamePicture: string;
  createdAt: string;
  expiryDate: string;
  status: string;
  prizeImage?: string;
  prizeName?: string;
  computedStatus?: string; // Added for computed status
}

interface RaffleTablePropsWithHeading {
  heading: string;
  items: RaffleTableProps[];  // Accepts items as prop
  onDelete: (id: number) => void; // Accepts delete handler as prop
}

const RaffleTable: React.FC<RaffleTablePropsWithHeading> = ({ heading, items, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]); // Track selected items
  const [selectAll, setSelectAll] = useState(false); // Track "Select All" checkbox state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState({
    status: '',
    search: '',
  });

  const router = useRouter();
  const itemsPerPage = 10;

  // Filtering logic
  const filteredItems = React.useMemo(() => {
    let data = [...items];
    if (filter.status) {
      data = data.filter(item => (item.computedStatus || '').toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.search) {
      const search = filter.search.toLowerCase();
      data = data.filter(item =>
        (item.title && item.title.toLowerCase().includes(search))
      );
    }
    return data;
  }, [items, filter]);

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const raffleDataList = filteredItems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Dropdown toggle
  const handleDropdownToggle = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  // Handlers for dropdown actions
  const handleView = (id: number) => {
    router.push(`/raffle-creation/view/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/raffle-creation/${id}`);
  };

  // Handle Delete
  const handleDelete = (id: number) => {
    setSelectedItemId(id); // Store the selected item id
    setIsModalOpen(true); // Show the modal
  };

  const handleConfirmDelete = () => {
    if (selectedItemId !== null) {
      try {
        onDelete(selectedItemId); // Perform the delete action
        toast.success("Deleted successfully!");
        setIsModalOpen(false); // Close the modal after confirmation
      } catch (error) {
        toast.error("Deletion failed! Please try again.");
      }
    }
  };

  // Handle individual checkbox selection
  const handleCheckboxChange = (id: number) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((itemId) => itemId !== id); // Deselect
      } else {
        return [...prevSelected, id]; // Select
      }
    });
  };

  // Handle "Select All" checkbox
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedItems([]); // Deselect all
    } else {
      const allItemIds = raffleDataList.map((item) => item.id);
      setSelectedItems(allItemIds); // Select all
    }
    setSelectAll(!selectAll); // Toggle "Select All" state
  };

  // Check if all items on the current page are selected
  const isAllSelected = raffleDataList.every((item) =>
    selectedItems.includes(item.id)
  );

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close modal on cancel
  };



  const formatDate = (date: Timestamp | Date | string) => {
    const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return jsDate.toLocaleDateString("en-GB", options); // e.g., "15 Apr 2025"
  };
  const limitWords = (text: string, wordLimit = 3): string => {
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };
  console.log(raffleDataList);

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'live': return 'border-[#067647] text-[#067647]'; // green
      case 'pending': return 'border-yellow-500 text-yellow-500'; // yellow
      case 'ended': return 'border-red-500 text-red-500'; // red
      default: return 'border-gray-400 text-gray-400';
    }
  };

  // Filter dropdown UI
  const renderFilterDropdown = (
    <div className="absolute left-[-100%] top-[100%] mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 p-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Status</option>
          <option value="Live">Live</option>
          <option value="Pending">Pending</option>
          <option value="Ended">Ended</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Title Search</label>
        <input
          type="text"
          className="w-full border rounded px-2 py-1"
          placeholder="Search by title"
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => setFilter({ status: '', search: '' })}
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
            <Link href="/raffle-creation/create-raffle" className="inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium">
              + Create New
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
                    <span>Title</span>
                  </div>
                </th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Prize Name</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Start Date</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">End Date</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Status</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {raffleDataList.map((item) => (
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
                          src={item.picture || '/images/laptop.webp'}
                          loading="lazy"
                          height={500}
                          width={500}
                          quality={100}
                          alt={item.title}
                          className="object-cover h-10"
                        />
                      </span>
                      <span className="text-dark font-medium text-sm">{limitWords(item.title)}</span>
                    </div>
                  </td>
                  <td className="text-sm text-gray py-3 px-6">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 min-w-10 bg-white rounded-full border border-[#D0D5DD] overflow-hidden">
                        <Image
                          src={item.prizeImage || item.editedGamePicture || '/images/laptop.webp'}
                          loading="lazy"
                          height={500}
                          width={500}
                          quality={100}
                          alt={item.prizeName || item.description}
                          className="object-cover h-10"
                        />
                      </span>
                      <span className="text-dark font-medium text-sm">
                        {item.prizeName || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="text-sm text-gray py-3 px-6">{formatDate(item.createdAt)}</td>
                  <td className="text-sm text-gray py-3 px-6">{formatDate(item.expiryDate)}</td>
                  <td className="text-sm text-gray py-3 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.computedStatus || "")}`}
                    >
                      {item.computedStatus || "Pending"}
                    </span>
                  </td>
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
        message="Delete Raffle"
      />
    </>
  );
};

export default RaffleTable;
