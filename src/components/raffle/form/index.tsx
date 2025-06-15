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

interface UploadedFile {
  url: string;
}

export interface FormData {
  id: any;
  title: string;
  picture: string;
  description: string;
  createdAt: string;
  expiryDate: string;
  status: string;
}

interface RaffleFormProps {
  formHeading: string;
  initialData?: any;
  onSubmit: (data: any) => void;
  // No need to pass onSubmit from parent anymore; logic is inside this component
}

const validationSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Prize Name is required"),
  createdAt: yup.string().required("Start Date is required"),
  expiryDate: yup.string().required("End Date is required"),
  status: yup.string().required("Status is required"),
});

const getCurrentDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const RaffleForm: React.FC<RaffleFormProps> = ({ formHeading, initialData }) => {
  const [file, setFile] = useState<UploadedFile | null>(
    initialData?.picture ? { url: initialData.picture } : null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    defaultValues: initialData || {},
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) {
      setSelectedFile(selected);
      setFile({ url: URL.createObjectURL(selected) });
    }
  };

  const removeFile = () => {
    setFile(null);
    setSelectedFile(null);
  };

  const handleFormSubmit = async (data: FormData) => {
    try {
      let uploadedUrl = "";

      if (selectedFile) {
        uploadedUrl = await uploadImageToFirebase(selectedFile);
      }

      const createdData = {
        ...data,
        picture: uploadedUrl || initialData?.picture || "",
        createdAt: new Date(data.createdAt),
        expiryDate: new Date(data.expiryDate),
      };
      console.log(createdData)

      // Create new document
      const docRef = await addDoc(collection(db, "raffles"), createdData);

      // Update with document ID
      await updateDoc(doc(db, "raffles", docRef.id), { id: docRef.id });
      toast.success("Raffle successfully created!");

      reset();
      setFile(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error creating raffle:", error);
    }
  };

  const handleEndEarly = () => {
    // TODO: Implement End Early logic
  };

  const handleRefund = () => {
    // TODO: Implement Refund logic
  };

  const handleExtend = () => {
    // TODO: Implement Extend logic
  };

  return (
    <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
      <h2 className="text-[18px] font-semibold text-dark mb-8">{formHeading}</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              className="form-control"
              type="text"
              id="title"
              placeholder="Title"
              {...register("title")}
            />
            {typeof errors.title?.message === "string" && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}

            {/* {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>} */}
          </div>
          <div className="form-group">
            <label htmlFor="prizeName">Prize Name</label>
            <input
              className="form-control"
              type="text"
              id="prizeName"
              placeholder="Prize Name"
              {...register("description")}
            />
            {/* {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>} */}
            {typeof errors.description?.message === "string" && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}

          </div>
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              className="form-control"
              type="date"
              id="startDate"
              {...register("createdAt")}
            />
            {/* {errors.createdAt && <p className="text-red-500 text-sm">{errors.createdAt.message}</p>} */}

            {typeof errors.createdAt?.message === "string" && (
              <p className="text-red-500 text-sm">{errors.createdAt.message}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              className="form-control"
              type="date"
              id="endDate"
              {...register("expiryDate")}
            />
            {/* {errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate.message}</p>} */}
            
            {typeof errors.expiryDate?.message === "string" && (
              <p className="text-red-500 text-sm">{errors.expiryDate.message}</p>
            )}
          </div>
          <div className={`form-group ${formHeading.includes("Edit") ? "md:col-span-1" : "md:col-span-2"}`}>
            <label htmlFor="status">Status</label>
            <select id="status" className="form-control" {...register("status")}>
              <option value="Active">Active</option>
              <option value="Ended">Ended</option>
              <option value="Ending Soon">Ending Soon</option>
            </select>
            {/* {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>} */}

            {typeof errors.status?.message === "string" && (
              <p className="text-red-500 text-sm">{errors.status.message}</p>
            )}
          </div>
          {/* Add action buttons below Status */}
          {formHeading.includes("Edit") && (
          <div className="form-group md:col-span-1 flex gap-4 items-center justify-evenly mt-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-[#7F1919] text-white font-medium"
              onClick={handleEndEarly}
            >
              End Early
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-[#FF3B30] text-white font-medium"
              onClick={handleRefund}
            >
              Refund
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-[#72EA5A] text-white font-medium"
              onClick={handleExtend}
            >
              Extend
            </button>
          </div>
            
          )}
          <div className="form-group col-span-2">
            <label htmlFor="">Thumbnail</label>
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
                      className="absolute top-2 right-2 bg-white text-gray-700 rounded-full shadow h-5 w-5 hover:bg-gray-100"
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
              <label
                htmlFor="file-upload"
                className="cursor-pointer !flex flex-col justify-center items-center text-center"
              >
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
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center gap-4 mt-6">
          <Link
            href="./"
            className="inline-flex items-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium"
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
  );
};

export default RaffleForm;
