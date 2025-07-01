import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

interface ImageData {
    id: string;
    title: string;
    remainingQuantity: number;
    stockQuality: string;
    imageUrl: string;
    category: string;
    description: string;
}

const ImageLibrary = () => {
    const [images, setImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
        fetchImages();
    }, []);

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
                    <button className="inline-flex items-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium">
                        <svg width="20" viewBox="0 0 20 20">
                            <use href="/images/sprite.svg#svg-filter"></use>
                        </svg>
                        <span>Filter</span>
                    </button>
                    <Link href="/game-images/add" className="inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium">+ Add New</Link>
                </div>
            </div>
            <div className="grid xl:grid-cols-6 lg:grid-cols-4 grid-cols-3 gap-6">
                {images.map((img) => (
                    <div className="bg-transparent overflow-hidden group" key={img.id}>
                        <div className="relative">
                            <img src={img.imageUrl} alt={img.title} className="h-[150px] w-full rounded-t-xl object-cover" />
                            <div className="top-3 absolute transition-all duration-300 left-3 z-10 opacity-0 group-hover:opacity-100">
                                <button
                                    className="mb-2 flex items-center h-8 w-8 rounded-full p-2 bg-primary"
                                    onClick={() => router.push(`/game-images/view/${img.id}`)}
                                >
                                    <img src="/images/icon/eye1.svg" alt="icon" className="brightness-[100]" />
                                </button>
                                <button
                                    className="mb-2 flex items-center h-8 w-8 rounded-full p-2 bg-primary"
                                    onClick={() => router.push(`/game-images/edit/${img.id}`)}
                                >
                                    <img src="/images/icon/edit1.svg" alt="icon" className="brightness-[100]" />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center gap-2 mt-4">
                            <h3 className="text-base text-[#030303] font-medium">{img.title}</h3>
                            {/* {img.stockQuality === "Low" ?
                                <span className="text-[#D12A2A] border border-[#D12A2A] rounded-full flex items-center gap-1 px-2 py-1 text-xs font-medium">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 1.5V8.5M5 8.5L8.5 5M5 8.5L1.5 5" stroke="#F04438" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {img.stockQuality}
                                </span>
                                :
                                <span className="text-green-700 border border-green-700 rounded-full flex items-center gap-1 px-2 py-1 text-xs font-medium">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 1.5V8.5M5 8.5L8.5 5M5 8.5L1.5 5" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {img.stockQuality}
                                </span>
                            } */}
                        </div>
                    </div>
                ))}
            </div>
            {images.length === 0 && (
                <p className="text-center">No images found.</p>
            )}
        </div>
    );
};

export default ImageLibrary;
