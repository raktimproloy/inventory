import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/router";
import { db, storage } from "../../../config/firebase.config";
import Image from "next/image";
import Link from "next/link";

const AddImagePage = () => {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [remainingQuantity, setRemainingQuantity] = useState("");
    const [stockQuality, setStockQuality] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !remainingQuantity || !stockQuality || !image) {
            alert("Please fill all fields.");
            return;
        }

        try {
            const imageRef = ref(storage, `image_library/${image.name}`);
            await uploadBytes(imageRef, image);
            const imageUrl = await getDownloadURL(imageRef);

            await addDoc(collection(db, "image_library"), {
                title,
                remainingQuantity,
                stockQuality,
                imageUrl,
            });

            alert("Image added successfully!");
            router.push("/prize-image-library");
        } catch (error) {
            console.error(error);
            alert("Failed to add image.");
        }
    };

    return (
        <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
            <h1 className="text-[18px] font-semibold text-dark mb-8">Add Item Stock</h1>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 grid-cols-1 gap-6">
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label>Remaining Quantity</label>
                    <input
                        type="number"
                        placeholder="Remaining Quantity"
                        value={remainingQuantity}
                        onChange={(e) => setRemainingQuantity(e.target.value)}
                        className="form-control"
                    />
                </div>
                <div className="form-group col-span-2">
                    <label>Stock Quality</label>
                    <select
                        value={stockQuality}
                        onChange={(e) => setStockQuality(e.target.value)}
                        className="form-control"
                    >
                        <option value="">Select Stock Quality</option>
                        <option value="Low">Low</option>
                        <option value="High">High</option>
                    </select>
                </div>
                {/* Thumbnail Upload */}
                <div className="form-group col-span-2">
                    <label>Item  Image</label>
                    <div className="form-control relative flex flex-col items-center justify-center">
                        <div className="absolute left-4 top-[50%] translate-y-[-50%]">
                            {previewUrl ? (
                                <div className="relative rounded-lg overflow-hidden">
                                    <Image
                                        src={previewUrl}
                                        width={150}
                                        height={80}
                                        alt="Uploaded file"
                                        className="w-[140px] h-[110px] object-cover rounded"
                                    />
                                    <p className="text-[8px] text-white mt-2 bg-[#00000033] absolute bottom-0 left-0 w-full text-center">
                                        Current Thumbnail
                                    </p>
                                </div>
                            ) : (
                                <Image
                                    src="/images/thumb.png"
                                    alt="photo"
                                    height={80}
                                    width={135}
                                    className="w-[140px] h-[110px] object-fill rounded"
                                />
                            )}
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
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
                <div className="flex justify-end items-center gap-4 mt-6 col-span-2">
                    <Link href="/prize-image-library" className="inline-flex items-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium">Cancel</Link>
                    <button
                        type="submit"
                        className="inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddImagePage;
