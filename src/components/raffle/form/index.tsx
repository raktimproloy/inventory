"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Image from "next/image";
import Link from "next/link";
import { uploadImageToFirebase } from "../../../../service/uploadImage";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../../config/firebase.config";
import { toast } from "react-toastify";
import ImageSelectionModal from "../../game-image-library/ImageSelectionModal";

interface UploadedFile {
  url: string;
}

interface ImageData {
  id: string;
  title: string;
  remainingQuantity: number;
  stockQuality: string;
  imageUrl: string;
  category: string;
  description: string;
}

export interface FormData {
  id?: string;
  title: string;
  picture: string;
  description: string;
  ticketPrice: number;
  category: string;
  gameDescription: string;
  createdAt: string;
  expiryDate: string;
  status: string;
}

interface RaffleFormProps {
  formHeading: string;
  initialData?: FormData;
  onSubmit?: (data: FormData) => void;
}

const validationSchema = yup.object().shape({
  title: yup.string().required("Title is required").min(3, "Title must be at least 3 characters"),
  description: yup.string().required("Prize description is required").min(5, "Prize description must be at least 5 characters"),
  ticketPrice: yup.number().typeError("Ticket price must be a number").required("Ticket price is required").positive("Ticket price must be positive"),
  category: yup.string().required("Category is required"),
  gameDescription: yup.string().required("Game description is required").min(10, "Game description must be at least 10 characters"),
  createdAt: yup.string().required("Start Date is required"),
  expiryDate: yup.string().required("End Date is required"),
  status: yup.string().required("Status is required"),
});

const getCurrentDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const RaffleForm: React.FC<RaffleFormProps> = ({ formHeading, initialData, onSubmit }) => {
  const [file, setFile] = useState<UploadedFile | null>(
    initialData?.picture ? { url: initialData.picture } : null
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm({
    defaultValues: initialData || {
      status: "Active",
      category: "Gaming",
      createdAt: getCurrentDate(),
    },
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const watchedValues = watch();

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Log all form values to console whenever they change
  useEffect(() => {
    console.log("Form Values Updated:", {
      ...watchedValues,
      file: file?.url,
      formErrors: errors,
      isValid
    });
  }, [watchedValues, file, errors, isValid]);

  const removeFile = () => {
    setFile(null);
    console.log("File removed");
  };

  const handleImageSelect = (image: ImageData) => {
    setFile({ url: image.imageUrl });
    console.log("Image selected from library:", image.title);
  };

  const handleInputChange = (field: string, value: any) => {
    (setValue as any)(field, value);
    console.log(`Field "${field}" changed to:`, value);
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      console.log("=== RAFFLE FORM SUBMISSION STARTED ===");
      console.log("Raw Form Data:", data);
      console.log("File:", file?.url);

      const formData: FormData = {
        ...data,
        picture: file?.url || "",
        createdAt: new Date(data.createdAt).toISOString(),
        expiryDate: new Date(data.expiryDate).toISOString(),
      };

      console.log("=== FINAL FORM DATA TO SUBMIT ===");
      console.log(JSON.stringify(formData, null, 2));
      console.log("=== FORM SUBMISSION COMPLETE ===");

      // Create new document
      const docRef = await addDoc(collection(db, "raffles"), formData);

      // Update with document ID
      await updateDoc(doc(db, "raffles", docRef.id), { id: docRef.id });
      
      toast.success("Raffle successfully created!");
      console.log("Raffle created with ID:", docRef.id);

      reset();
      setFile(null);
      
      if (onSubmit) {
        onSubmit(formData);
      }
      
    } catch (error) {
      console.error("Error creating raffle:", error);
      setSubmitError("Failed to create raffle. Please try again.");
      toast.error("Failed to create raffle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndEarly = () => {
    console.log("End Early clicked");
    // TODO: Implement End Early logic
  };

  const handleRefund = () => {
    console.log("Refund clicked");
    // TODO: Implement Refund logic
  };

  const handleExtend = () => {
    console.log("Extend clicked");
    // TODO: Implement Extend logic
  };

  return (
    <>
      <div className="border border-[#D0D5DD] rounded-xl p-4 md:p-6 bg-white w-full max-w-4xl mx-auto">
        <h2 className="text-[18px] md:text-[24px] font-semibold text-dark mb-6 md:mb-8">{formHeading}</h2>
        
        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6 mb-4">
            <div className="form-group">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
              <input
                className={`form-control ${errors.title ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
                type="text"
                id="title"
                placeholder="Enter raffle title"
                {...register("title")}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Prize Description*</label>
              <input
                className={`form-control ${errors.description ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
                type="text"
                id="description"
                placeholder="Enter prize description"
                {...register("description")}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-1 grid-cols-1 gap-4 md:gap-6 mb-4">
            <div className="form-group col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Game Image</label>
              <div className="form-control relative flex flex-col items-center justify-center">
                <div className="absolute left-4 top-[50%] translate-y-[-50%]">
                  {file ? (
                    <div className="relative rounded-lg overflow-hidden">
                      <Image
                        src={file.url}
                        width={150}
                        height={80}
                        alt="Uploaded file"
                        className="w-[140px] h-[110px] object-cover rounded"
                      />
                      <button
                        onClick={removeFile}
                        type="button"
                        className="absolute top-2 right-2 bg-white text-gray-700 rounded-full shadow h-5 w-5 hover:bg-gray-100 transition-colors"
                        aria-label="Remove file"
                      >
                        ✕
                      </button>
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
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="cursor-pointer !flex flex-col justify-center items-center text-center py-8 border-2 border-dashed border-[#D0D5DD] rounded-lg hover:border-primary hover:bg-gray-50 transition-colors w-full"
                >
                  <Image src="/images/icon/upload-icon.png" alt="icon" height={40} width={40} />
                  <span className="mt-3 text-sm font-normal text-gray block">
                    <span className="text-primary font-semibold">Select from Game Library</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 grid-cols-1 gap-4 md:gap-6 mb-4">
            <div className="form-group">
              <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700 mb-1">Ticket Price*</label>
              <input
                className={`form-control ${errors.ticketPrice ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
                type="number"
                id="ticketPrice"
                placeholder="Enter ticket price"
                min="0"
                step="0.01"
                {...register("ticketPrice")}
                onChange={(e) => handleInputChange("ticketPrice", parseFloat(e.target.value) || 0)}
              />
              {errors.ticketPrice && <p className="text-red-500 text-sm mt-1">{errors.ticketPrice.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
              <select 
                id="category" 
                className={`form-control ${errors.category ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`} 
                {...register("category")}
                onChange={(e) => handleInputChange("category", e.target.value)}
              >
                <option value="" selected>Select Category</option>
                <option value="Soccer">Soccer</option>
                <option value="Cricket">Cricket</option>
                <option value="Basketball">Basketball</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="gameDescription" className="block text-sm font-medium text-gray-700 mb-1">Game Description*</label>
              <input
                className={`form-control ${errors.gameDescription ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
                type="text"
                id="gameDescription"
                placeholder="Enter game description"
                {...register("gameDescription")}
                onChange={(e) => handleInputChange("gameDescription", e.target.value)}
              />
              {errors.gameDescription && <p className="text-red-500 text-sm mt-1">{errors.gameDescription.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6 mb-4">
            <div className="form-group">
              <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
              <input
                className={`form-control ${errors.createdAt ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
                type="date"
                id="createdAt"
                min={getCurrentDate()}
                {...register("createdAt")}
                onChange={(e) => handleInputChange("createdAt", e.target.value)}
              />
              {errors.createdAt && <p className="text-red-500 text-sm mt-1">{errors.createdAt.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
              <input
                className={`form-control ${errors.expiryDate ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
                type="date"
                id="expiryDate"
                min={getCurrentDate()}
                {...register("expiryDate")}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
              />
              {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>}
            </div>
          </div>

          {/* Add action buttons below Status */}
          {formHeading.includes("Edit") && (
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6 mb-4">
              <div className="form-group">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                <select 
                  id="status" 
                  className={`form-control ${errors.status ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`} 
                  {...register("status")}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Ended">Ended</option>
                  <option value="Ending Soon">Ending Soon</option>
                </select>
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
              </div>
              <div className="form-group flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-evenly mt-2">
                <button
                  type="button"
                  className="w-full sm:w-auto px-4 py-2 rounded bg-[#7F1919] text-white font-medium hover:bg-[#6A1515] transition-colors"
                  onClick={handleEndEarly}
                >
                  End Early
                </button>
                <button
                  type="button"
                  className="w-full sm:w-auto px-4 py-2 rounded bg-[#FF3B30] text-white font-medium hover:bg-[#E6352B] transition-colors"
                  onClick={handleRefund}
                >
                  Refund
                </button>
                <button
                  type="button"
                  className="w-full sm:w-auto px-4 py-2 rounded bg-[#72EA5A] text-white font-medium hover:bg-[#65D351] transition-colors"
                  onClick={handleExtend}
                >
                  Extend
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-6">
            <Link
              href="./"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      <ImageSelectionModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelectImage={handleImageSelect}
      />
    </>
  );
};

export default RaffleForm;
