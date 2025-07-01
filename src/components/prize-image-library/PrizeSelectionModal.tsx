import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase.config';

interface PrizeData {
  id: string;
  title: string;
  remainingQuantity: number;
  stockQuality: string;
  imageUrl: string;
  keywords?: string[];
}

interface PrizeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrize: (prize: PrizeData) => void;
}

const PrizeSelectionModal: React.FC<PrizeSelectionModalProps> = ({ isOpen, onClose, onSelectPrize }) => {
  const [prizes, setPrizes] = useState<PrizeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrize, setSelectedPrize] = useState<PrizeData | null>(null);
  const [keywords, setKeywords] = useState(["", "", ""]);

  useEffect(() => {
    if (isOpen) {
      fetchPrizes();
    }
  }, [isOpen]);

  const fetchPrizes = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'image_library'));
      const prizeList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<PrizeData, 'id'>),
      }));
      setPrizes(prizeList);
    } catch (error) {
      console.error('Error fetching prizes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrizes = prizes.filter(prize =>
    prize.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {/* Search */}
        <div className="px-6 py-4 border-b border-[#E4E7EC] bg-gray-50">
          <input
            type="text"
            placeholder="Search prizes by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          />
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
                    <img
                      src={prize.imageUrl}
                      alt={prize.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-dark truncate">{prize.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Qty: {prize.remainingQuantity}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{prize.stockQuality}</p>
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
        {/* Keyword fields */}
        {selectedPrize && (
          <div className="px-6 py-4 border-t border-[#E4E7EC] bg-gray-50">
            <div className="mb-2 font-medium text-gray-700">Keywords</div>
            <div className="flex gap-2">
              {keywords.map((kw, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="form-control flex-1"
                  value={kw}
                  onChange={e => {
                    const newKeywords = [...keywords];
                    newKeywords[idx] = e.target.value;
                    setKeywords(newKeywords);
                  }}
                  placeholder={`Keyword ${idx + 1}`}
                />
              ))}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
              onClick={handleConfirm}
            >
              Confirm Selection
            </button>
          </div>
        )}
        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-[#E4E7EC] bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 text-dark border border-[#E4E7EC] rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrizeSelectionModal; 