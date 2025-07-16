"use client";

import React, { useState, useEffect, useRef } from "react";
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
import PrizeSelectionModal from "../../prize-image-library/PrizeSelectionModal";

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

// TicketPriceSelect: custom select with search and info tooltip
const TicketPriceSelect = ({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const options = Array.from({ length: 50 }, (_, i) => i + 1);
  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            className="form-control w-full cursor-pointer pr-10"
            value={
              value
                ? `${value} Gold Coin${value > 1 ? 's' : ''}`
                : ""
            }
            readOnly
            onFocus={() => !disabled && setOpen(true)}
            onClick={() => !disabled && setOpen(true)}
            placeholder="Select ticket price"
            disabled={disabled}
            style={{ background: disabled ? '#f3f3f3' : undefined }}
          />
          {/* Dropdown icon */}
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-transparent border-none outline-none"
            onClick={() => {
              if (!disabled) {
                setOpen((o) => !o);
                inputRef.current?.focus();
              }
            }}
            style={{ pointerEvents: disabled ? 'none' : 'auto' }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8L10 12L14 8" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {open && !disabled && (
            <div className="absolute z-10 bg-white border border-gray-200 rounded shadow w-full max-h-48 overflow-y-auto mt-1 min-w-[150px] md:min-w-[200px]">
              {options.map(opt => (
                <div
                  key={opt}
                  className="px-4 py-2 hover:bg-primary/10 cursor-pointer text-sm"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  {opt} Gold Coin{opt > 1 ? 's' : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RaffleForm: React.FC<RaffleFormProps> = ({ formHeading, initialData, onSubmit }) => {
  const [file, setFile] = useState<UploadedFile | null>(
    initialData?.picture ? { url: initialData.picture } : null
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<any>(null);
  const [selectedPrizeId, setSelectedPrizeId] = useState<string | null>(null);
  const [selectedPrizePrice, setSelectedPrizePrice] = useState<string | null>(null);
  const [prizeKeywords, setPrizeKeywords] = useState<string[]>([]);
  const [actionModal, setActionModal] = useState<{ type: 'extend' | 'refund' | 'endEarly' | null, open: boolean }>({ type: null, open: false });
  const [extendDate, setExtendDate] = useState("");

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
  console.log(watchedValues.createdAt)
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

  const handlePrizeSelect = (prize: any) => {
    setSelectedPrize(prize);
    setSelectedPrizeId(prize.id);
    setSelectedPrizePrice(prize.retailValueUSD);
    setValue("description", prize.prizeName);
    // Try to get keywords from prize, else use dummy
    if (prize.keywords && Array.isArray(prize.keywords) && prize.keywords.length) {
      setPrizeKeywords([
        prize.keywords[0] || "Keyword 1",
        prize.keywords[1] || "Keyword 2",
        prize.keywords[2] || "Keyword 3",
      ]);
    } else {
      setPrizeKeywords(["Keyword 1", "Keyword 2", "Keyword 3"]);
    }
    setIsPrizeModalOpen(false);
    console.log("Prize selected:", prize);
    console.log("Keywords:", prize.keywords || ["Keyword 1", "Keyword 2", "Keyword 3"]);
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      console.log("=== RAFFLE FORM SUBMISSION STARTED ===");
      console.log("Raw Form Data:", data);
      console.log("File:", file?.url);

      const formData: FormData & { prizeId?: string; ticketPrice?: string } = {
        ...data,
        picture: file?.url || "",
        createdAt: new Date(data.createdAt).toISOString(),
        expiryDate: new Date(data.expiryDate).toISOString(),
        prizeId: selectedPrizeId || undefined,
        ticketPrice: selectedPrizePrice || undefined,
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
      setSelectedPrize(null);
      setSelectedPrizeId(null);
      setSelectedPrizePrice(null);
      
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
    setActionModal({ type: 'endEarly', open: true });
  };

  const handleRefund = () => {
    setActionModal({ type: 'refund', open: true });
  };

  const handleExtend = () => {
    setActionModal({ type: 'extend', open: true });
  };

  const handleActionConfirm = () => {
    if (actionModal.type === 'extend') {
      console.log('Extend confirmed. New end date:', extendDate);
    } else if (actionModal.type === 'refund') {
      console.log('Refund confirmed.');
    } else if (actionModal.type === 'endEarly') {
      console.log('End Early confirmed.');
    }
    setActionModal({ type: null, open: false });
  };

  // Helper to determine edit mode and live/end status
  const isEditMode = formHeading.includes("Edit");
  // Type guard for Firebase Timestamp
  const isTimestamp = (val: any): val is { seconds: number; nanoseconds: number } =>
    val && typeof val === 'object' && typeof val.seconds === 'number' && typeof val.nanoseconds === 'number';
  const isLive = (() => {
    if (!isEditMode || !watchedValues?.createdAt) return false;
    let createdAtDate: Date | null = null;
    if (isTimestamp(watchedValues.createdAt)) {
      createdAtDate = new Date(watchedValues.createdAt.seconds * 1000);
    } else if (typeof watchedValues.createdAt === "string") {
      createdAtDate = new Date(watchedValues.createdAt);
    }
    if (!createdAtDate) return false;
    return createdAtDate < new Date();
  })();
  const isEnded = watchedValues.status === "Ended";

  return (
    <>
      <div className="border border-[#D0D5DD] rounded-xl p-4 md:p-6 bg-white w-full mx-auto">
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
                className={`form-control ${errors.title ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors${isLive ? ' bg-black opacity-10 text-white cursor-not-allowed' : ''}`}
                type="text"
                id="title"
                placeholder="Enter game title"
                {...register("title")}
                onChange={(e) => handleInputChange("title", e.target.value)}
                disabled={isLive}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Prize*</label>
              <div className="flex gap-2">
                <input
                  className={`form-control ${errors.description ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors${isLive ? ' bg-black opacity-10 text-white cursor-not-allowed' : ''}`}
                  type="text"
                  id="description"
                  placeholder="Select prize from library"
                  value={selectedPrize ? selectedPrize.title : watchedValues.description}
                  readOnly
                  onClick={() => !isLive ? setIsPrizeModalOpen(true) : null}
                  style={{ cursor: isLive ? 'not-allowed' : 'pointer' }}
                  disabled={isLive}
                />
              </div>
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              {/* 3 keyword fields (now display-only) */}
              <div className="flex flex-wrap gap-2 mt-2">
                { prizeKeywords && prizeKeywords.length > 0 && prizeKeywords.map((kw: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full border border-primary/20 max-w-full truncate"
                    title={kw}
                  >
                    {kw}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className={`mt-2 px-3 py-1 bg-gray-100 rounded text-xs${isLive ? ' opacity-70 cursor-not-allowed' : ''}`}
                onClick={() => console.log("Prize:", selectedPrize, "Keywords:", prizeKeywords)}
                disabled={isLive}
              >
                Log Prize & Keywords
              </button>
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
                        className={`absolute top-2 right-2 bg-white text-gray-700 rounded-full shadow h-5 w-5 hover:bg-gray-100 transition-colors${isLive ? ' opacity-70 cursor-not-allowed' : ''}`}
                        aria-label="Remove file"
                        disabled={isLive}
                      >
                        ✕
                      </button>
                      <p className="text-[8px] text-white mt-2 bg-[#00000033] absolute bottom-0 left-0 w-full text-center">
                        Current Thumbnail
                      </p>
                    </div>
                  ) : (
                    <Image
                      src={formHeading.includes("Edit") ? "/images/laptop.webp" : "/images/thumb.png"}
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
                  className={`cursor-pointer !flex flex-col justify-center items-center text-center py-8 border-2 border-dashed border-[#D0D5DD] rounded-lg hover:border-primary hover:bg-gray-50 transition-colors w-full${isLive ? ' bg-black opacity-10 text-white cursor-not-allowed' : ''}`}
                  disabled={isLive}
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
              <div className="flex items-center gap-1 mb-1">
                <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700 flex items-center gap-1" style={{ marginBottom: '0px' }}>
                  Ticket Price*
                </label>
                <span className="relative group">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-gray-400 cursor-pointer ml-1">
            <circle cx="12" cy="12" r="12" fill="#F87171" />
            <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#ffffff">i</text>
          </svg>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20 group-hover:block">1 Gold Coin = $10</span>
        </span>
              </div>

              <TicketPriceSelect
                value={watchedValues.ticketPrice}
                onChange={v => handleInputChange("ticketPrice", v)}
                disabled={isLive}
              />
              {errors.ticketPrice && <p className="text-red-500 text-sm mt-1">{errors.ticketPrice.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
              <select 
                id="category" 
                className={`form-control ${errors.category ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors${isLive ? ' bg-black opacity-10 text-white cursor-not-allowed' : ''}`} 
                {...register("category")}
                onChange={(e) => handleInputChange("category", e.target.value)}
                disabled={isLive}
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
                className={`form-control ${errors.gameDescription ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors${isLive ? ' bg-black opacity-10 text-white cursor-not-allowed' : ''}`}
                type="text"
                id="gameDescription"
                placeholder="Enter game description"
                {...register("gameDescription")}
                onChange={(e) => handleInputChange("gameDescription", e.target.value)}
                disabled={isLive}
              />
              {errors.gameDescription && <p className="text-red-500 text-sm mt-1">{errors.gameDescription.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6 mb-4">
            <div className="form-group">
              <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
              <input
                className={`form-control ${errors.createdAt ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors${isLive ? ' bg-black opacity-10 text-white cursor-not-allowed' : ''}`}
                type="date"
                id="createdAt"
                min={getCurrentDate()}
                {...register("createdAt")}
                onChange={(e) => handleInputChange("createdAt", e.target.value)}
                disabled={isLive}
              />
              {errors.createdAt && <p className="text-red-500 text-sm mt-1">{errors.createdAt.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
              <input
                className={`form-control ${errors.expiryDate ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors${isLive ? ' bg-black opacity-10 text-white cursor-not-allowed' : ''}`}
                type="date"
                id="expiryDate"
                min={getCurrentDate()}
                {...register("expiryDate")}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                disabled={isLive}
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
                  className={`form-control ${errors.status ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors${isLive ? ' bg-black opacity-10 text-white cursor-not-allowed' : ''}`} 
                  {...register("status")}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  disabled={isLive}
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
                  className={`w-full sm:w-auto px-4 py-2 rounded bg-[#72EA5A] text-black font-medium hover:bg-[#65D351] transition-colors`}
                  onClick={handleExtend}
                >
                  Extend
                </button>
                <button
                  type="button"
                  className={`w-full sm:w-auto px-4 py-2 rounded bg-[#FF9500] text-white font-medium hover:bg-[#E6352B] transition-colors`}
                  onClick={handleRefund}
                >
                  Refund
                </button>
                <button
                  type="button"
                  className={`w-full sm:w-auto px-4 py-2 rounded bg-[#D12A2A] text-white font-medium hover:bg-[#6A1515] transition-colors`}
                  onClick={handleEndEarly}
                >
                  End Early
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

      <PrizeSelectionModal
        isOpen={isPrizeModalOpen}
        onClose={() => setIsPrizeModalOpen(false)}
        onSelectPrize={handlePrizeSelect}
      />

      {/* Action Modal */}
      <ActionModal
        open={actionModal.open}
        onClose={() => setActionModal({ type: null, open: false })}
        type={actionModal.type}
        onConfirm={handleActionConfirm}
        extendDate={extendDate}
        setExtendDate={setExtendDate}
      />
    </>
  );
};

const ActionModal = ({ open, onClose, type, onConfirm, extendDate, setExtendDate }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-auto p-6 relative">
        <div className="text-lg font-semibold mb-4">
          {type === 'extend' ? 'Extend Raffle' : type === 'refund' ? 'Refund Confirmation' : 'End Early Confirmation'}
        </div>
        {type === 'extend' ? (
          <div>
            <label className="block mb-2">Select new end date:</label>
            <input
              type="date"
              className="form-control mb-4"
              value={extendDate}
              onChange={e => setExtendDate(e.target.value)}
            />
          </div>
        ) : (
          <div className="mb-4">Are you sure you want to {type === 'refund' ? 'refund all participants?' : 'end this raffle early?'} </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >Cancel</button>
          <button
            type="button"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            onClick={onConfirm}
          >Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default RaffleForm;
