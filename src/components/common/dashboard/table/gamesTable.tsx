import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Dropdown from '../../../common/dropdown';
import ConfirmationModal from '../../../common/modal';
import { toast } from "react-toastify";

interface GameItem {
  id: string;
  title: string;
  picture: string;
  partner: string;
  description: string;
  price: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  expiryDate: {
    seconds: number;
    nanoseconds: number;
  };
  status: string;
}

interface GamesTableProps {
  heading: string;
  items: GameItem[];
  onDelete: (id: string) => void;
}

const countDown = [
  {
      createdAt: {
          "seconds": Math.floor(new Date('2025-06-21').getTime() / 1000), // Starts June 21, 2025 (Pending)
          "nanoseconds": 0
      },
      expiryDate: {
          "seconds": Math.floor(new Date('2025-07-24').getTime() / 1000), // Ends June 24, 2025 (3 days later)
          "nanoseconds": 0
      }
  },
  {
      createdAt: {
          "seconds": Math.floor(new Date('2025-06-17').getTime() / 1000), // Started June 17, 2025 (Live)
          "nanoseconds": 0
      },
      expiryDate: {
          "seconds": Math.floor(new Date('2025-08-20').getTime() / 1000), // Ends June 20, 2025
          "nanoseconds": 0
      }
  },
  {
      createdAt: {
          "seconds": Math.floor(new Date('2025-07-13').getTime() / 1000), // Started June 18, 2025 (Live)
          "nanoseconds": 0
      },
      expiryDate: {
          "seconds": Math.floor(new Date('2025-08-10').getTime() / 1000), // Ends June 19, 2025
          "nanoseconds": 0
      }
  },
  {
      createdAt: {
          "seconds": Math.floor(new Date('2025-06-12').getTime() / 1000), // Started June 12, 2025 (Live)
          "nanoseconds": 0
      },
      expiryDate: {
          "seconds": Math.floor(new Date('2025-06-17').getTime() / 1000), // Ended June 17, 2025 (Expired)
          "nanoseconds": 0
      }
  }
];

const getStatus = (index: number) => {
  const now = new Date().getTime();
  const createdTime = countDown[index].createdAt.seconds * 1000;
  const expiryTime = countDown[index].expiryDate.seconds * 1000;

  if (now < createdTime) {
    return 'Pending';
  } else if (now >= createdTime && now < expiryTime) {
    return 'Live';
  } else {
    return 'Ended';
  }
};

const getCountdown = (now: Date, targetDate: Date) => {
  let diff = Math.max(0, targetDate.getTime() - now.getTime());
  if (diff === 0) {
    return '0 Day: 00 Hours: 00 Mins';
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const mins = Math.floor(diff / (1000 * 60));
  return `${days} Day${days !== 1 ? 's' : ''}: ${hours.toString().padStart(2, '0')} Hours: ${mins.toString().padStart(2, '0')} Mins`;
};

const GamesTable: React.FC<GamesTableProps> = ({ heading, items, onDelete }) => {
    console.log(items)
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const router = useRouter();

  // Real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Only show latest 5
  const sortedItems = items.slice(0, 5);

  // Dropdown toggle
  const handleDropdownToggle = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  // Handlers for dropdown actions
  const handleView = (id: string) => {
    router.push(`/raffle-creation/view/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/raffle-creation/${id}`);
  };

  const handleDelete = (id: string) => {
    setSelectedItemId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedItemId) {
      try {
        onDelete(selectedItemId);
        toast.success("Deleted successfully!");
        setIsModalOpen(false);
      } catch (error) {
        toast.error("Deletion failed! Please try again.");
      }
    }
  };

  // Checkbox logic
  const handleCheckboxChange = (id: string) => {
    setSelectedItems((prev) => prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]);
  };
  const handleSelectAllChange = () => {
    if (selectAll) setSelectedItems([]);
    else setSelectedItems(sortedItems.map((item) => item.id));
    setSelectAll(!selectAll);
  };
  const isAllSelected = sortedItems.every((item) => selectedItems.includes(item.id));
  const handleCloseModal = () => setIsModalOpen(false);

  const limitWords = (text: string, wordLimit = 3): string => {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  return (
    <>
      <div className="border border-[#D0D5DD] rounded-xl py-6 bg-white w-full overflow-x-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 px-6 gap-2">
          <h1 className="text-[18px] font-semibold text-dark">{heading}</h1>
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium">
              <svg width="20" viewBox="0 0 20 20">
                <use href="/images/sprite.svg#svg-filter"></use>
              </svg>
              <span>Filter</span>
            </button>
            <Link href="/raffle-creation/create-raffle" className="inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium">
              + Create New
            </Link>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F3F3F5] border-b border-t !border-[#D0D5DD]">
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAllChange}
                    />
                    <span>Game Name</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.3166 21.0976 11.6834 21.0976 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3Z" fill="#000000"/>
                    </svg>
                  </div>
                </th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Ticket Sold</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Price</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Sponsor</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Time to End</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Status</th>
                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, index) => {
                const status = getStatus(index);
                const now = currentTime;
                let countdownTarget: Date;
                let countdownText: string;

                if (status === 'Pending') {
                  countdownTarget = new Date(countDown[index].createdAt.seconds * 1000);
                  countdownText = getCountdown(now, countdownTarget);
                } else if (status === 'Live') {
                  countdownTarget = new Date(countDown[index].expiryDate.seconds * 1000);
                  countdownText = getCountdown(now, countdownTarget);
                } else {
                  countdownText = '0 Day: 00 Hours: 00 Mins';
                }

                return (
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
                            height={40}
                            width={40}
                            quality={100}
                            alt={item.title}
                            className="object-cover h-10"
                          />
                        </span>
                        <span className="text-dark font-medium text-sm">{limitWords(item.title)}</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray py-3 px-6">{item.description}</td>
                    <td className="text-sm text-gray py-3 px-6">${item.price}</td>
                    <td className="text-sm text-gray py-3 px-6">{item.partner}</td>
                    <td className="text-sm text-gray py-3 px-6">
                      <span className="">
                        {countdownText}
                      </span>
                    </td>
                    <td className="text-sm text-gray py-3 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          status === 'Live'
                            ? 'border-[#D0D5DD] text-[#067647] bg-[#F6FEF9]'
                            : status === 'Pending'
                            ? 'border-[#FEC84B] text-[#B54708] bg-[#FFFAEB]'
                            : 'border-[#F04438] text-[#B42318] bg-[#FEF3F2]'
                        }`}
                      >
                        {status}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        message="Delete Game"
      />
    </>
  );
};

export default GamesTable;