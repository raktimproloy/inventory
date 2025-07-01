import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "../../../config/firebase.config";
import Link from "next/link";

interface ImageData {
    id: string;
    title: string;
    remainingQuantity: number;
    stockQuality: string;
    imageUrl: string;
}

const ImageLibrary = () => {
    const [images, setImages] = useState<ImageData[]>([]);
    const router = useRouter();
    const [filterStock, setFilterStock] = useState<string>("All");
    const [searchTitle, setSearchTitle] = useState<string>("");

    const fetchImages = async () => {
        const querySnapshot = await getDocs(collection(db, "image_library"));
        const imageList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<ImageData, "id">),
        }));
        setImages(imageList);
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

        await deleteDoc(doc(db, "image_library", id));
        fetchImages();
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const filteredImages = images.filter((img) => {
        const matchesStock = filterStock === "All" || img.stockQuality === filterStock;
        const matchesTitle = img.title.toLowerCase().includes(searchTitle.toLowerCase());
        return matchesStock && matchesTitle;
    });

    return (
        <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-[18px] font-semibold text-dark">Image Library</h1>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTitle}
                        onChange={e => setSearchTitle(e.target.value)}
                        className="px-3 py-2 border border-[#E4E7EC] rounded-lg text-sm"
                    />
                    <select
                        value={filterStock}
                        onChange={e => setFilterStock(e.target.value)}
                        className="px-3 py-2 border border-[#E4E7EC] rounded-lg text-sm"
                    >
                        <option value="All">All Stock</option>
                        <option value="Low">Low</option>
                        <option value="High">High</option>
                    </select>
                    <button className="inline-flex items-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium">
                        <svg width="20" viewBox="0 0 20 20">
                            <use href="/images/sprite.svg#svg-filter"></use>
                        </svg>
                        <span>Filter</span>
                    </button>
                    {/* <Link href="/prize-image-library/add" className="inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium">+ Add New</Link> */}
                </div>
            </div>
            <div className="grid xl:grid-cols-6 lg:grid-cols-4 grid-cols-3 gap-6">
                {filteredImages.map((img) => (
                    <div className="bg-transparent overflow-hidden group" key={img.id}>
                        <div className="relative">
                            <img src={img.imageUrl} alt={img.title} className="h-[150px] w-full rounded-t-xl" />
                            <div className="top-3 absolute transition-all duration-300 left-3 z-10 opacity-0 group-hover:opacity-100">
                                <button
                                    className="mb-2 flex items-center h-8 w-8 rounded-full p-2 bg-primary"
                                    onClick={() => router.push(`/prize-database/inventory-view/${"4W6FzXGv2PX5wuZSyyYD"}`)}
                                >
                                    <img src="/images/icon/eye1.svg" alt="icon" className="brightness-[100]" />
                                </button>
                                <button
                                    className="mb-2 flex items-center h-8 w-8 rounded-full p-2 bg-primary"
                                    onClick={() => router.push(`/prize-database/${"4W6FzXGv2PX5wuZSyyYD"}`)}
                                >
                                    <img src="/images/icon/edit1.svg" alt="icon" className="brightness-[100]" />
                                </button>
                                <button
                                    className="mb-2 flex items-center h-8 w-8 rounded-full p-2 bg-primary"
                                    onClick={() => handleDelete(img.id)}
                                >
                                    <img src="/images/icon/delete1.svg" alt="icon" className="brightness-[100]" />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center gap-2 mt-4">
                            <h3 className="text-base text-[#030303] font-medium">{img.title}</h3>
                            {img.stockQuality === "Low" ?
                                <span className="text-[#D12A2A] border border-[#D12A2A] rounded-full flex items-center gap-1 px-2 py-1 text-xs font-medium">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 1.5V8.5M5 8.5L8.5 5M5 8.5L1.5 5" stroke="#F04438" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    {img.stockQuality}
                                </span>
                                :
                                <span className="text-green-700 border border-green-700 rounded-full flex items-center gap-1 px-2 py-1 text-xs font-medium">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 1.5V8.5M5 8.5L8.5 5M5 8.5L1.5 5" stroke="#15803d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    {img.stockQuality}

                                </span>
                            }
                        </div>
                        <p className="mt-1 text-sm text-[#777B8B] font-normal">Remaining Quantity : {img.remainingQuantity}</p>
                    </div>
                ))}
            </div>
            {filteredImages.length === 0 && (
                <p className="text-center">No images found.</p>
            )}

        </div>
    );
};

export default ImageLibrary;
