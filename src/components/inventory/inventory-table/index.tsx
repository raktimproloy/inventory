import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Pagination from '../../common/pagination';
import Image from 'next/image';
import Link from 'next/link';
import Dropdown from '../../common/dropdown';
import { toast } from "react-toastify";
import ConfirmationModal from '../../common/modal';
import { collection, getDocs, updateDoc, doc, arrayRemove } from "firebase/firestore";
import { db } from "../../../../config/firebase.config";

import { Sponsor } from "../../../../service/sponsorService";

interface InventoryTableProps {
  id: string;  // Changed to string
  prizeName: string;
  ticketSold: number;
  price: string;
  partner: string;
  stockLevel: number;
  status: 'Active' | 'Inactive';
  thumbnail: string;
}

interface InventoryTablePropsWithHeading {
  heading: string;
  items: any[];
  sponsors: Sponsor[];
  onDelete: (id: string) => Promise<void>;
}

const InventoryTable: React.FC<InventoryTablePropsWithHeading> = ({ heading, items, sponsors, onDelete }) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState({
    sponsor: '',
    status: '',
    search: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Changed to string[]
  const [selectAll, setSelectAll] = useState(false); // Track "Select All" checkbox state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null); // Changed to string | null

  const router = useRouter();
  const itemsPerPage = 10;

  // Filtering logic
  const filteredItems = React.useMemo(() => {
    let data = [...items];
    if (filter.sponsor) {
      data = data.filter(item => item.sponsor === filter.sponsor);
    }
    if (filter.status) {
      data = data.filter(item => item.status === filter.status);
    }
    if (filter.search) {
      const search = filter.search.toLowerCase();
      data = data.filter(item =>
        (item.prizeName && item.prizeName.toLowerCase().includes(search)) ||
        (item.keyDetails && item.keyDetails.toLowerCase().includes(search))
      );
    }
    return data;
  }, [items, filter]);

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const inventoryDataList = filteredItems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Dropdown toggle
  const handleDropdownToggle = (id: string) => { // Changed to string
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  // Handlers for dropdown actions
  const handleView = (id: string) => { // Changed to string
    router.push(`/prize-database/inventory-view/${id}`);
  };

  const handleEdit = (id: string) => { // Changed to string
    router.push(`/prize-database/${id}`);
  };

  // Handle Delete
  const handleDelete = (id: string) => { // Changed to string
    setSelectedItemId(id); // Store the selected item id
    setIsModalOpen(true); // Show the modal
  };

  const handleConfirmDelete = async () => {
    if (selectedItemId !== null) {
      try {
        await onDelete(selectedItemId); // Perform the delete action (should delete from inventory/prize)
        // Remove the prize ID from all sponsors' prizesCreation arrays
        const sponsorsSnapshot = await getDocs(collection(db, "sponsors"));
        const sponsorUpdates = sponsorsSnapshot.docs.map(async (sponsorDoc) => {
          const sponsorData = sponsorDoc.data();
          if (Array.isArray(sponsorData.prizesCreation) && sponsorData.prizesCreation.includes(selectedItemId)) {
            await updateDoc(doc(db, "sponsors", sponsorDoc.id), {
              prizesCreation: arrayRemove(selectedItemId)
            });
          }
        });
        await Promise.all(sponsorUpdates);
        toast.success("Deleted successfully and sponsor data updated!");
        setIsModalOpen(false); // Close the modal after confirmation
      } catch (error) {
        toast.error("Deletion failed! Please try again.");
      }
    }
  };

  // Handle individual checkbox selection
  const handleCheckboxChange = (id: string) => { // Changed to string
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
      const allItemIds = inventoryDataList.map((item) => item.id);
      setSelectedItems(allItemIds); // Select all
    }
    setSelectAll(!selectAll); // Toggle "Select All" state
  };

  // Check if all items on the current page are selected
  const isAllSelected = inventoryDataList.every((item) =>
    selectedItems.includes(item.id)
  );

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close modal on cancel
  };
 console.log(inventoryDataList)
  // Filter dropdown UI
  const renderFilterDropdown = (
    <div className="absolute left-[-100%] top-[100%] mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 p-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={filter.sponsor}
          onChange={e => setFilter(f => ({ ...f, sponsor: e.target.value }))}
        >
          <option value="">All Sponsors</option>
          {sponsors.map(s => (
            <option key={s.id} value={s.sponsorName}>{s.sponsorName}</option>
          ))}
        </select>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          type="text"
          className="w-full border rounded px-2 py-1"
          placeholder="Prize name or keywords"
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => setFilter({ sponsor: '', status: '', search: '' })}
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
            <Link href="/prize-database/create-inventory" className="inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium">
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
                    <span>Prize Name</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.3166 21.0976 11.6834 21.0976 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3Z" fill="#000000"/>
                    </svg>
                  </div>
                </th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Key Details</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Price</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Sponsor</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Stock Level</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Status</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventoryDataList.map((item) => (
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
                          src={item.thumbnail || '/images/laptop.webp'}
                          loading="lazy"
                          height={40}
                          width={40}
                          quality={100}
                          alt={item.prizeName}
                          className="object-cover h-10"
                        />
                      </span>
                      <span className="text-dark font-medium text-sm">{item.prizeName}</span>
                    </div>
                  </td>
                  <td className="text-sm text-gray py-3 px-6">{item.keyDetails}</td>
                  <td className="text-sm text-gray py-3 px-6">${item.price}</td>
                  <td className="text-sm text-gray py-3 px-6">{item.sponsor}</td>
                  <td className="text-sm text-gray py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-[#EAECF0] rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${item.stockLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-700 text-sm">{item.stockLevel}</span>
                    </div>
                  </td>
                  <td className="text-sm text-gray py-3 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${item.status === 'Active' ? 'border-[#D0D5DD] text-[#067647]' : 'border-primary text-primary'
                        }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="text-sm text-gray py-3 px-6 text-center">
                    <Dropdown
                      id={Number(item.id)}
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
        message="Delete Inventory"
      />
    </>
  );
};

export default InventoryTable;
