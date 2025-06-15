import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../../config/firebase.config";
import Image from "next/image";
import Link from "next/link";

interface ImageData {
    id: string;
    title: string;
    remainingQuantity: number;
    stockQuality: string;
    imageUrl: string;
}

const EditImagePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [imageData, setImageData] = useState<ImageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchImageData = async () => {
        if (id) {
            const docRef = doc(db, "image_library", id as string);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setImageData({
                    id: docSnap.id,
                    ...(docSnap.data() as Omit<ImageData, "id">),
                });
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImageData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (imageData) {
            setImageData({
                ...imageData,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewImageFile(file);
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview); // new image selected hole preview show
        }
    };

    const handleUpdate = async () => {
        if (!imageData) return;

        try {
            let imageUrl = imageData.imageUrl;

            if (newImageFile) {
                const imageRef = ref(storage, `image_library/${newImageFile.name}`);
                await uploadBytes(imageRef, newImageFile);
                imageUrl = await getDownloadURL(imageRef);
            }

            const docRef = doc(db, "image_library", imageData.id);
            await updateDoc(docRef, {
                title: imageData.title,
                remainingQuantity: Number(imageData.remainingQuantity),
                stockQuality: imageData.stockQuality,
                imageUrl,
            });

            alert("Image updated successfully!");
            router.push("/image-library");
        } catch (error) {
            console.error(error);
            alert("Failed to update image.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!imageData) return <p>No data found.</p>;

    return (
        <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
            <h1 className="text-[18px] font-semibold text-dark mb-8">Edit Item Stock
            </h1>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        name="title"
                        value={imageData.title}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label>Remaining Quantity</label>
                    <input
                        type="number"
                        name="remainingQuantity"
                        value={imageData.remainingQuantity}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
                <div className="form-group col-span-2">
                    <label>Stock Quality</label>
                    <select
                        name="stockQuality"
                        value={imageData.stockQuality}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">Select Quality</option>
                        <option value="Low">Low</option>
                        <option value="High">High</option>
                    </select>
                </div>
                <div className="form-group col-span-2">
                    <label>Item  Image</label>
                    <div className="form-control relative flex flex-col items-center justify-center">
                        <div className="absolute left-4 top-[50%] translate-y-[-50%]">
                            <div className="relative rounded-lg overflow-hidden">
                                <Image
                                    src={previewUrl || imageData.imageUrl}
                                    width={150}
                                    height={80}
                                    alt="Uploaded file"
                                    className="w-[140px] h-[110px] object-cover rounded"
                                />
                                <p className="text-[8px] text-white mt-2 bg-[#00000033] absolute bottom-0 left-0 w-full text-center">
                                    Current Thumbnail
                                </p>
                            </div>
                        </div>
                        <label htmlFor="file-upload" className="cursor-pointer !flex flex-col justify-center items-center text-center">
                            <Image src="/images/icon/upload-icon.png" alt="icon" height={40} width={40} />
                            <span className="mt-3 text-sm font-normal text-gray block">
                                <strong className="text-primary font-semibold">Click to upload </strong>
                                or drag and drop
                            </span>
                            <span className="text-gray-500 text-sm text-center mt-2">
                                SVG, PNG, JPG, or GIF (max: 800x400px)
                            </span>
                            <input
                                type="file"
                                id="file-upload"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>


                <div className="flex justify-end items-center gap-4 mt-6 col-span-2">
                    <Link href="/image-library" className="inline-flex items-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium">Cancel</Link>
                    <button
                        onClick={handleUpdate}
                        className="inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditImagePage;
