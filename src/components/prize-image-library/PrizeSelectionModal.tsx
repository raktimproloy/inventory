import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase.config';
import { getSponsors, Sponsor } from '../../../service/sponsorService';

interface PrizeData {
  id: string;
  prizeName: string;
  retailValueUSD: string;
  quantityAvailable: number;
  status: string;
  thumbnail?: string;
  keywords?: string[];
  sponsorId?: string;
  sponsorName?: string;
}

interface PrizeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrize: (prize: PrizeData) => void;
}

const PrizeSelectionModal: React.FC<PrizeSelectionModalProps> = ({ isOpen, onClose, onSelectPrize }) => {
  const [prizes, setPrizes] = useState<PrizeData[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPrice, setSearchPrice] = useState('');
  const [selectedPrize, setSelectedPrize] = useState<PrizeData | null>(null);
  const [keywords, setKeywords] = useState(["", "", ""]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSponsor, setFilterSponsor] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch sponsors
      const sponsorList = await getSponsors();
      setSponsors(sponsorList);
      // Fetch prizes
      const querySnapshot = await getDocs(collection(db, 'prize_database'));
      const prizeList = querySnapshot.docs.map((doc) => {
        const data = doc.data() as PrizeData;
        const sponsor = sponsorList.find((s: Sponsor) => s.id === data.sponsorId);
        return {
          ...data,
          id: doc.id,
          sponsorName: sponsor ? sponsor.sponsorName : '',
        };
      });
      setPrizes(prizeList);
    } catch (error) {
      console.error('Error fetching prizes or sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrizes = prizes.filter((prize) => {
    const matchesTitle = prize.prizeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = searchPrice === '' || (prize.retailValueUSD && prize.retailValueUSD.includes(searchPrice));
    const matchesStatus = filterStatus === "All" || prize.status === filterStatus;
    const matchesSponsor = filterSponsor === '' || prize.sponsorId === filterSponsor;
    return matchesTitle && matchesPrice && matchesStatus && matchesSponsor;
  });

  const handlePrizeClick = (prize: PrizeData) => {
    setSelectedPrize(prize);
    setKeywords(prize.keywords && prize.keywords.length ? [
      prize.keywords[0] || "Keyword 1",
      prize.keywords[1] || "Keyword 2",
      prize.keywords[2] || "Keyword 3"
    ] : ["Keyword 1", "Keyword 2", "Keyword 3"]);
  };

  const handleConfirm = () => {
    if (selectedPrize) {
      onSelectPrize({ ...selectedPrize, keywords });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-white text-lg font-semibold">Loading...</span>
          </div>
        </div>
      )}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-[#D0D5DD]">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-[#E4E7EC] bg-white">
            <h2 className="text-[18px] font-semibold text-dark">Select Prize from Library</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Filter Section */}
          <div className="px-6 py-4 border-b border-[#E4E7EC] bg-gray-50 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-[#E4E7EC] rounded-lg text-sm w-full"
              />
              <input
                type="text"
                placeholder="Search by price..."
                value={searchPrice}
                onChange={e => setSearchPrice(e.target.value)}
                className="px-3 py-2 border border-[#E4E7EC] rounded-lg text-sm w-full"
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-[#E4E7EC] rounded-lg text-sm w-full"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <select
                value={filterSponsor}
                onChange={e => setFilterSponsor(e.target.value)}
                className="px-3 py-2 border border-[#E4E7EC] rounded-lg text-sm w-full"
              >
                <option value="">All Sponsors</option>
                {sponsors.map(s => (
                  <option key={s.id} value={s.id}>{s.sponsorName}</option>
                ))}
              </select>
              <button
                className="px-4 bg-red-500 text-white py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium w-full sm:w-auto"
                onClick={() => {
                  setSearchTerm('');
                  setSearchPrice('');
                  setFilterStatus('All');
                  setFilterSponsor('');
                }}
              >
                Clear
              </button>
            </div>
          </div>
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[40vh] bg-white">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <p className="text-gray-500">Loading prizes...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredPrizes.map((prize) => (
                  <div
                    key={prize.id}
                    className={`border border-[#E4E7EC] rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary bg-white group ${selectedPrize?.id === prize.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handlePrizeClick(prize)}
                  >
                    <div className="relative">
                      {/* Sponsor badge */}
                      {prize.sponsorName && (
                        <span className="absolute right-2 top-2 z-10 bg-blue-100 text-blue-700 border border-blue-300 rounded-full px-1 py-[.75px] text-[11px] font-medium shadow">
                          {prize.sponsorName}
                        </span>
                      )}
                      <img
                        src={prize.thumbnail}
                        alt={prize.prizeName}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-dark truncate">{prize.prizeName}</h3>
                      <p className="text-xs text-gray-500 mt-1 font-medium">Qty: {prize.quantityAvailable}</p>
                      <p className="text-xs text-gray-400 mt-1 truncate">Price: ${prize.retailValueUSD}</p>
                      <p className="text-xs text-gray-400 mt-1 truncate">Status: {prize.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && filteredPrizes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg font-medium">No prizes found</p>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-[#E4E7EC] bg-gray-50">
            <button
              onClick={onClose}
              className=" px-4 py-3 text-dark border border-[#E4E7EC] rounded-lg hover:bg-gray-50 transition-colors font-medium mt-4 mr-4"
            >
              Cancel
            </button>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
              onClick={handleConfirm}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrizeSelectionModal; 