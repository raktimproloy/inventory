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
    gameCategory: string;
    difficultyLevel: string;
    imageUrl: string;
}

interface FormData {
    title: string;
    gameCategory: string;
    difficultyLevel: string;
    image: File | null;
}

const EditImagePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [imageData, setImageData] = useState<ImageData | null>(null);
    const [formData, setFormData] = useState<FormData>({
        title: "",
        gameCategory: "",
        difficultyLevel: "",
        image: null,
    });
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const fetchImageData = async () => {
        if (id) {
            try {
                const docRef = doc(db, "image_library", id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = {
                        id: docSnap.id,
                        ...(docSnap.data() as Omit<ImageData, "id">),
                    };
                    setImageData(data);
                    setFormData({
                        title: data.title || "",
                        gameCategory: data.gameCategory || "",
                        difficultyLevel: data.difficultyLevel || "",
                        image: null,
                    });
                    setPreviewUrl(data.imageUrl);
                    console.log("Fetched image data:", data);
                }
            } catch (error) {
                console.error("Error fetching image data:", error);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImageData();
    }, [id]);

    // Log form data changes to console
    useEffect(() => {
        console.log("Form Data Updated:", {
            ...formData,
            previewUrl,
            errors,
            isSubmitting
        });
    }, [formData, previewUrl, errors, isSubmitting]);

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.trim().length < 3) {
            newErrors.title = "Title must be at least 3 characters";
        }

        if (!formData.gameCategory) {
            newErrors.gameCategory = "Game Category is required";
        }

        if (!formData.difficultyLevel) {
            newErrors.difficultyLevel = "Difficulty Level is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof Omit<FormData, 'image'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        console.log(`Field "${field}" changed to:`, value);
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
            console.log("New image selected:", file.name);
            
            // Clear image error
            if (errors.image) {
                setErrors(prev => ({
                    ...prev,
                    image: undefined
                }));
            }
        }
    };

    const handleUpdate = async () => {
        console.log("=== FORM UPDATE STARTED ===");
        console.log("Form Data:", formData);
        console.log("Original Image Data:", imageData);

        if (!imageData) {
            console.log("No image data found");
            return;
        }

        if (!validateForm()) {
            console.log("Form validation failed:", errors);
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            let imageUrl = imageData.imageUrl;

            if (formData.image) {
                console.log("Uploading new image to Firebase...");
                const imageRef = ref(storage, `image_library/${formData.image.name}`);
                await uploadBytes(imageRef, formData.image);
                imageUrl = await getDownloadURL(imageRef);
                console.log("New image uploaded successfully:", imageUrl);
            }

            const updateData = {
                title: formData.title.trim(),
                gameCategory: formData.gameCategory,
                difficultyLevel: formData.difficultyLevel,
                imageUrl,
                updatedAt: new Date().toISOString(),
            };

            console.log("=== FINAL DATA TO UPDATE ===");
            console.log(JSON.stringify(updateData, null, 2));

            const docRef = doc(db, "image_library", imageData.id);
            await updateDoc(docRef, updateData);
            console.log("Document updated successfully");
            console.log("=== FORM UPDATE COMPLETE ===");

            alert("Image updated successfully!");
            router.push("/prize-image-library");
        } catch (error) {
            console.error("Error updating image:", error);
            setSubmitError("Failed to update image. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-lg text-gray-600">Loading...</p>
        </div>
    );
    
    if (!imageData) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-lg text-gray-600">No data found.</p>
        </div>
    );

    return (
        <div className="border border-[#D0D5DD] rounded-xl p-4 md:p-6 bg-white w-full max-w-4xl mx-auto">
            <h1 className="text-[18px] md:text-[24px] font-semibold text-dark mb-6 md:mb-8">Edit Item Stock</h1>
            
            {submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{submitError}</p>
                </div>
            )}

            <div className="space-y-4">
                <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            className={`form-control ${errors.title ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
                            placeholder="Enter title"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Game Category*</label>
                        <select
                            value={formData.gameCategory}
                            onChange={(e) => handleInputChange("gameCategory", e.target.value)}
                            className={`form-control ${errors.gameCategory ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
                        >
                            <option value="">Select Game Category</option>
                            <option value="Action">Action</option>
                            <option value="Adventure">Adventure</option>
                            <option value="RPG">RPG</option>
                            <option value="Strategy">Strategy</option>
                            <option value="Sports">Sports</option>
                            <option value="Racing">Racing</option>
                            <option value="Puzzle">Puzzle</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gameCategory && <p className="text-red-500 text-sm mt-1">{errors.gameCategory}</p>}
                    </div>
                </div>

                <div className="grid md:grid-cols-1 grid-cols-1 gap-4 md:gap-6">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level*</label>
                        <select
                            value={formData.difficultyLevel}
                            onChange={(e) => handleInputChange("difficultyLevel", e.target.value)}
                            className={`form-control ${errors.difficultyLevel ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
                        >
                            <option value="">Select Difficulty Level</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                            <option value="Expert">Expert</option>
                        </select>
                        {errors.difficultyLevel && <p className="text-red-500 text-sm mt-1">{errors.difficultyLevel}</p>}
                    </div>
                </div>

                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
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
                    <span className="text-gray-500 text-xs mt-2 block">Upload new image to replace current one (SVG, PNG, JPG, or GIF, max: 800x400px)</span>
                </div>

                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-6">
                    <Link 
                        href="/prize-image-library" 
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={handleUpdate}
                        disabled={isSubmitting}
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
