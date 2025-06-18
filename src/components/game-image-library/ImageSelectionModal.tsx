import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageData {
    id: string;
    title: string;
    remainingQuantity: number;
    stockQuality: string;
    imageUrl: string;
    category: string;
    description: string;
}

interface ImageSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (image: ImageData) => void;
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
    isOpen,
    onClose,
    onSelectImage
}) => {
    const [images, setImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const fetchImages = async () => {
        try {
            const response = await fetch('/data/game-images.json');
            const imageList = await response.json();
            setImages(imageList);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchImages();
        }
    }, [isOpen]);

    const categories = ['All', 'Soccer', 'Cricket', 'Basketball', 'Tennis', 'Golf', 'Swimming', 'Boxing', 'Volleyball', 'Hockey', 'Rugby', 'Baseball'];

    const filteredImages = images.filter(img => {
        const matchesSearch = img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            img.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || img.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleImageSelect = (image: ImageData) => {
        onSelectImage(image);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-[#D0D5DD]">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#E4E7EC] bg-white">
                    <h2 className="text-[18px] font-semibold text-dark">Select Image from Game Library</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="px-6 py-4 border-b border-[#E4E7EC] bg-gray-50">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search images by title or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                                />
                            </div>
                        </div>
                        <div className="md:w-48">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh] bg-white">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                <p className="text-gray-500">Loading images...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredImages.map((img) => (
                                <div
                                    key={img.id}
                                    className="border border-[#E4E7EC] rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary bg-white group"
                                    onClick={() => handleImageSelect(img)}
                                >
                                    <div className="relative">
                                        <img
                                            src={img.imageUrl}
                                            alt={img.title}
                                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-2 right-2">
                                            {img.stockQuality === "Low" ? (
                                                <span className="bg-red-50 text-[#D12A2A] border border-[#D12A2A] text-xs px-2 py-1 rounded-full font-medium">
                                                    {img.stockQuality}
                                                </span>
                                            ) : (
                                                <span className="bg-green-50 text-green-700 border border-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                                    {img.stockQuality}
                                                </span>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-white rounded-full p-2">
                                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium text-sm text-dark truncate">{img.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1 font-medium">{img.category}</p>
                                        <p className="text-xs text-gray-400 mt-1 truncate">{img.description}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">Qty: {img.remainingQuantity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!loading && filteredImages.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg font-medium">No images found</p>
                            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>

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

export default ImageSelectionModal; 