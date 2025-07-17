import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Dropdown from "../common/dropdown";
import ConfirmationModal from "../common/modal";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase.config";
import Pagination from "../common/pagination";

interface ImageData {
    id: string;
    title: string;
    remainingQuantity: number;
    stockQuality: string;
    imageUrl: string;
    category: string;
    description: string;
}

const IMAGES_PER_PAGE = 4;

const ImageLibrary = () => {
    const [images, setImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [viewModal, setViewModal] = useState<{ open: boolean; image: ImageData | null }>({ open: false, image: null });
    const [editModal, setEditModal] = useState<{ open: boolean; image: ImageData | null }>({ open: false, image: null });
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    const fetchImages = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "image_library"));
            const imageList: ImageData[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                imageList.push({
                    id: doc.id,
                    title: data.title || "",
                    remainingQuantity: data.remainingQuantity || 0,
                    stockQuality: data.stockQuality || "",
                    imageUrl: data.imageUrl || "",
                    category: data.gameCategory || "",
                    description: data.description || "",
                });
            });
            setImages(imageList);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // Pagination logic
    const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);
    const paginatedImages = images.slice((currentPage - 1) * IMAGES_PER_PAGE, currentPage * IMAGES_PER_PAGE);

    const handleDropdownToggle = (id: string) => {
        setOpenDropdown((prev) => (prev === id ? null : id));
    };

    const handleDelete = (id: string) => {
        setSelectedImageId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        // TODO: Implement delete logic
        setIsDeleteModalOpen(false);
        setSelectedImageId(null);
        fetchImages();
    };

    const handleView = (image: ImageData) => {
        router.push(`/game-images/view/${image.id}`);
    };

    const handleEdit = (id: string) => {
        router.push(`/game-images/edit/${id}`);
    };

    const handleThumbnailClick = (id: string) => {
        router.push(`/game-images/view/${id}`);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return (
            <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
                <div className="flex justify-center items-center h-32">
                    <p className="text-gray-500">Loading images...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-[18px] font-semibold text-dark">Game Images</h1>
                <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center gap-2 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium">
                        <svg width="20" viewBox="0 0 20 20">
                            <use href="/images/sprite.svg#svg-filter"></use>
                        </svg>
                        <span>Filter</span>
                    </button>
                    <a href="/game-images/add" className="inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium">+ Add New</a>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedImages.map((img) => (
                    <div
                        key={img.id}
                        className="flex flex-col items-center group min-h-[210px]"
                    >
                        {/* Thumbnail */}
                        <div
                            className="w-[100%] h-[100%] flex items-center justify-center mb-4 cursor-pointer relative"
                            style={{ marginTop: '8px', marginBottom: '18px' }}
                            title="View Image"
                        >
                            {img.imageUrl ? (
                                <img src={img.imageUrl} alt={img.title} className="object-contain rounded-xl max-h-40 max-w-[100%]" onClick={() => handleThumbnailClick(img.id)} />
                            ) : (
                                <span className="text-gray-400 text-2xl">?</span>
                            )}
                            {/* 3-dot Dropdown */}
                            <div className="absolute right-3 top-3 z-10">
                                <Dropdown
                                    id={img.id}
                                    isOpen={openDropdown === img.id}
                                    toggleDropdown={() => handleDropdownToggle(img.id)}
                                    options={[
                                        { id: 1, name: '/images/icon/eye1.svg', title: 'View', action: () => handleView(img) },
                                        { id: 2, name: '/images/icon/edit1.svg', title: 'Edit', action: () => handleEdit(img.id) },
                                        { id: 3, name: '/images/icon/delete1.svg', title: 'Delete', action: () => handleDelete(img.id) },
                                    ]}
                                />
                            </div>
                        </div>
                        {/* Image Title */}
                        <span className="text-base font-medium text-dark block truncate max-w-[140px] mx-auto" style={{ marginTop: '0px' }}>{img.title}</span>
                    </div>
                ))}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                message="Delete Image"
            />
            {/* View Modal */}
            {viewModal.open && viewModal.image && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#D0D5DD] relative">
                        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={() => setViewModal({ open: false, image: null })}>&times;</button>
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full border border-[#D0D5DD] overflow-hidden mb-4 bg-gray-50 flex items-center justify-center">
                                {viewModal.image.imageUrl ? (
                                    <img src={viewModal.image.imageUrl} alt={viewModal.image.title} className="object-contain w-full h-full" />
                                ) : (
                                    <span className="text-gray-400 text-2xl">?</span>
                                )}
                            </div>
                            <div className="text-center">
                                <span className="text-lg font-semibold text-dark block mb-2">{viewModal.image.title}</span>
                                <p className="text-sm text-gray-500 mb-2">{viewModal.image.description}</p>
                                <span className="text-xs text-gray-400">Category: {viewModal.image.category}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Modal */}
            {editModal.open && editModal.image && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#D0D5DD] relative">
                        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={() => setEditModal({ open: false, image: null })}>&times;</button>
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full border border-[#D0D5DD] overflow-hidden mb-4 bg-gray-50 flex items-center justify-center">
                                {editModal.image.imageUrl ? (
                                    <img src={editModal.image.imageUrl} alt={editModal.image.title} className="object-contain w-full h-full" />
                                ) : (
                                    <span className="text-gray-400 text-2xl">?</span>
                                )}
                            </div>
                            <div className="text-center w-full">
                                <input
                                    className="form-control w-full text-lg font-semibold text-dark block mb-2 text-center border border-[#E4E7EC] rounded-lg px-2 py-1"
                                    value={editModal.image.title}
                                    onChange={e => setEditModal(modal => modal.image ? { ...modal, image: { ...modal.image, title: e.target.value } } : modal)}
                                />
                                {/* Add more editable fields as needed */}
                                <button className="mt-4 px-4 py-2 bg-primary text-white rounded" onClick={() => setEditModal({ open: false, image: null })}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageLibrary;
