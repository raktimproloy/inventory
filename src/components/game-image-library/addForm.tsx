import { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/router";
import { db, storage } from "../../../config/firebase.config";
import Image from "next/image";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FormData {
    title: string;
    gameCategory: string;
    difficultyLevel: string;
    image: File | null;
}

interface FormErrors {
    title?: string;
    gameCategory?: string;
    difficultyLevel?: string;
    image?: string;
}

const AddImagePage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        title: "",
        gameCategory: "",
        difficultyLevel: "",
        image: null,
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

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
        const newErrors: FormErrors = {};

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

        if (!formData.image) {
            newErrors.image = "Image is required";
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
            console.log("Image selected:", file.name);
            
            // Clear image error
            if (errors.image) {
                setErrors(prev => ({
                    ...prev,
                    image: undefined
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("=== FORM SUBMISSION STARTED ===");
        console.log("Form Data:", formData);

        if (!validateForm()) {
            console.log("Form validation failed:", errors);
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            console.log("Uploading image to Firebase...");
            const imageRef = ref(storage, `image_library/${formData.image!.name}`);
            await uploadBytes(imageRef, formData.image!);
            const imageUrl = await getDownloadURL(imageRef);
            console.log("Image uploaded successfully:", imageUrl);

            const docData = {
                title: formData.title.trim(),
                gameCategory: formData.gameCategory,
                difficultyLevel: formData.difficultyLevel,
                imageUrl,
                createdAt: new Date().toISOString(),
            };

            console.log("=== FINAL DATA TO SUBMIT ===");
            console.log(JSON.stringify(docData, null, 2));

            const docRef = await addDoc(collection(db, "image_library"), docData);
            console.log("Document created with ID:", docRef.id);
            console.log("=== FORM SUBMISSION COMPLETE ===");

            toast.success("Image added successfully!");
            router.push("/game-images");
        } catch (error) {
            console.error("Error adding image:", error);
            setSubmitError("Failed to add image. Please try again.");
            toast.error("Failed to add image. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="border border-[#D0D5DD] rounded-xl p-4 md:p-6 bg-white w-full max-w-4xl mx-auto">
                <h1 className="text-[18px] md:text-[24px] font-semibold text-dark mb-6 md:mb-8">Add Game Image</h1>
                
                {submitError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{submitError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                            <input
                                type="text"
                                placeholder="Enter title"
                                value={formData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                className={`form-control ${errors.title ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
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
                                <option value="football">Football</option>
                                <option value="cricket">Cricket</option>
                                <option value="basketball">Basketball</option>
                                <option value="tennis">Tennis</option>
                                <option value="rugby">Rugby</option>
                                <option value="volleyball">Volleyball</option>
                                <option value="netball">Netball</option>
                                <option value="hockey">Hockey</option>
                                <option value="golf">Golf</option>
                                <option value="other">Other</option>
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

                    {/* Image Upload */}
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Item Image*</label>
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
                        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                        <span className="text-gray-500 text-xs mt-2 block">Upload item image (SVG, PNG, JPG, or GIF, max: 800x400px)</span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-6">
                        <Link 
                            href="/prize-image-library" 
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddImagePage;