import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, updateDoc, arrayRemove } from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "../../../config/firebase.config";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ImageData {
    id: string;
    title: string;
    remainingQuantity: number;
    stockQuality: string;
    imageUrl: string;
    sponsor?: string;
}

const ImageLibrary = () => {
    const [images, setImages] = useState<ImageData[]>([]);
    const router = useRouter();
    const [filterStock, setFilterStock] = useState<string>("All");
    const [searchTitle, setSearchTitle] = useState<string>("");
    const [showFilterSection, setShowFilterSection] = useState(false);
    const [filterSponsorName, setFilterSponsorName] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterSponsor, setFilterSponsor] = useState("");

    // Famous sponsor list
    const sponsorList = [
        { id: "1", name: "Nike" },
        { id: "2", name: "Adidas" },
        { id: "3", name: "Coca-Cola" },
        { id: "4", name: "Pepsi" },
        { id: "5", name: "Samsung" },
        { id: "6", name: "Apple" },
        { id: "7", name: "Toyota" },
        { id: "8", name: "Sony" },
        { id: "9", name: "Red Bull" },
        { id: "10", name: "Visa" },
    ];

    const fetchImages = async () => {
        const querySnapshot = await getDocs(collection(db, "image_library"));
        const imageList = querySnapshot.docs.map((doc, idx) => {
            // Assign sponsor name sequentially
            const sponsorName = sponsorList[idx % sponsorList.length].name;
            return {
                id: doc.id,
                ...(doc.data() as Omit<ImageData, "id">),
                sponsor: sponsorName,
            };
        });
        setImages(imageList);
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, "image_library", id));
            // Remove prize ID from all sponsors' prizesCreation arrays
            const sponsorsSnapshot = await getDocs(collection(db, "sponsors"));
            const sponsorUpdates = sponsorsSnapshot.docs.map(async (sponsorDoc) => {
                const sponsorData = sponsorDoc.data();
                if (Array.isArray(sponsorData.prizesCreation) && sponsorData.prizesCreation.includes(id)) {
                    await updateDoc(doc(db, "sponsors", sponsorDoc.id), {
                        prizesCreation: arrayRemove(id)
                    });
                }
            });
            await Promise.all(sponsorUpdates);
            toast.success("Prize deleted and sponsors updated.");
            fetchImages();
        } catch (error) {
            toast.error("Failed to delete prize. Please try again.");
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const filteredImages = images.filter((img) => {
        const matchesSponsorName = filterSponsorName === "" || (img.sponsor && img.sponsor.toLowerCase().includes(filterSponsorName.toLowerCase()));
        const matchesStatus = filterStatus === "All" || (filterStatus === "Active" ? img.remainingQuantity > 0 : img.remainingQuantity === 0);
        const matchesSponsor = filterSponsor === "" || img.sponsor === filterSponsor;
        const matchesStock = filterStock === "All" || img.stockQuality === filterStock;
        const matchesTitle = img.title.toLowerCase().includes(searchTitle.toLowerCase());
        return matchesSponsorName && matchesStatus && matchesSponsor && matchesStock && matchesTitle;
    });
console.log(filteredImages)
    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-[18px] font-semibold text-dark">Image Library</h1>
                    <div className="flex items-center space-x-2 relative">
                        <button
                            className="inline-flex items-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium"
                            onClick={() => setShowFilterSection((prev) => !prev)}
                        >
                            <svg width="20" viewBox="0 0 20 20">
                                <use href="/images/sprite.svg#svg-filter"></use>
                            </svg>
                            <span>Filter</span>
                        </button>
                        {/* Filter Section */}
                        {showFilterSection && (
                            <div className="absolute right-0 top-full mt-2 w-[350px] max-w-[95vw] bg-white border border-[#E4E7EC] rounded-lg shadow-lg z-20 p-4 flex flex-col gap-3 sm:w-[500px]">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-base">Filters</span>
                                    <button onClick={() => setShowFilterSection(false)} className="text-gray-400 hover:text-gray-700 text-lg">&times;</button>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        placeholder="Search by sponsor name..."
                                        value={filterSponsorName}
                                        onChange={e => setFilterSponsorName(e.target.value)}
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
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <select
                                        value={filterSponsor}
                                        onChange={e => setFilterSponsor(e.target.value)}
                                        className="px-3 py-2 border border-[#E4E7EC] rounded-lg text-sm w-full"
                                    >
                                        <option value="">All Sponsors</option>
                                        {sponsorList.map(s => (
                                            <option key={s.id} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Search by title..."
                                        value={searchTitle}
                                        onChange={e => setSearchTitle(e.target.value)}
                                        className="px-3 py-2 border border-[#E4E7EC] rounded-lg text-sm w-full"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <select
                                        value={filterStock}
                                        onChange={e => setFilterStock(e.target.value)}
                                        className="px-3 py-0 border border-[#E4E7EC] rounded-lg text-sm w-full"
                                    >
                                        <option value="All">All Stock</option>
                                        <option value="Low">Low</option>
                                        <option value="High">High</option>
                                    </select>
                                    <button
                                        className="px-4 bg-red-500 text-white py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium w-full sm:w-auto"
                                        onClick={() => {
                                            setFilterSponsorName("");
                                            setFilterStatus("All");
                                            setFilterSponsor("");
                                            setSearchTitle("");
                                            setFilterStock("All");
                                        }}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* End Filter Section */}
                    </div>
                </div>
                <div className="grid xl:grid-cols-6 lg:grid-cols-4 grid-cols-3 gap-6">
                    {filteredImages.map((img) => {
                        return (
                            <div className="bg-transparent overflow-hidden group" key={img.id}>
                                <div className="relative">
                                    <span className="absolute right-2 top-2 z-10 bg-blue-100 text-blue-700 border border-blue-300 rounded-full px-1 py-[.75px] text-[11px] font-medium shadow">
                                        {img.sponsor}
                                    </span>
                                    <img src={img.imageUrl} alt={img.title} className="h-[150px] mt-2 w-full rounded-t-xl" />
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
                        );
                    })}
                </div>
                {filteredImages.length === 0 && (
                    <p className="text-center">No images found.</p>
                )}

            </div>
        </>
    );
};

export default ImageLibrary;
