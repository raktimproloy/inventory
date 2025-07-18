import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageData {
    id: string;
    title: string;
    imageUrl: string;
    gameCategory: string;
}

interface ImageSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (image: ImageData) => void;
    images: ImageData[];
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
    isOpen,
    onClose,
    onSelectImage,
    images
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);

    useEffect(() => {
        if (isOpen) {
            // Build categories from images
            const categorySet = new Set<string>();
            images.forEach(img => {
                if (img.gameCategory) categorySet.add(img.gameCategory);
            });
            setCategories(['All', ...Array.from(categorySet)]);
        }
    }, [isOpen, images]);

    const filteredImages = images.filter(img => {
        const matchesSearch = img.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || img.gameCategory === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleImageSelect = (image: ImageData) => {
        onSelectImage(image);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl w-full max-w-full sm:max-w-4xl max-h-[95vh] overflow-hidden border border-[#D0D5DD] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-[#E4E7EC] bg-white">
                    <h2 className="text-[18px] font-semibold text-dark">Select Game Image</h2>
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
                <div className="px-4 sm:px-6 py-4 border-b border-[#E4E7EC] bg-gray-50">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search images by title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                                />
                            </div>
                        </div>
                        <div className="w-full sm:w-48">
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
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] bg-white">
                    {images.length === 0 ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                <p className="text-gray-500">Loading images...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {filteredImages.map((img) => (
                                <div
                                    key={img.id}
                                    className="border border-[#E4E7EC] rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary bg-white group flex flex-col items-center"
                                    onClick={() => handleImageSelect(img)}
                                >
                                    <div className="w-full flex justify-center items-center p-4">
                                        <img
                                            src={img.imageUrl}
                                            alt={img.title}
                                            className="object-contain rounded-xl max-h-32 max-w-full"
                                        />
                                    </div>
                                    <div className="p-2 w-full text-center">
                                        <h3 className="font-medium text-sm text-dark truncate">{img.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {images.length > 0 && filteredImages.length === 0 && (
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
                <div className="flex justify-end p-4 sm:p-6 border-t border-[#E4E7EC] bg-gray-50">
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