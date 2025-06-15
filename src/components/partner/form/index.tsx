import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Image from "next/image";
import Link from "next/link";

export interface FormData {
  name: string;
  email: string;
  userType: string;
  kycRequest: string;
  profilePicture?: string | null;
  createdAt: string; // ✅ made required to match yup schema
  isBanned?: string;
}

interface UserFormProps {
  formHeading: string;
  onSubmit: (data: FormData, file?: File | null) => void;
  initialData?: any;
}

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  userType: yup.string().required("User type is required"),
  kycRequest: yup.string().required("KYC request is required"),
  createdAt: yup.string().required("Created At is required"),
  isBanned: yup.string().optional(), // Optional, still type-safe
});

const UserForm: React.FC<UserFormProps> = ({ formHeading, onSubmit, initialData }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialData?.profilePicture || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: initialData ? {
      name: initialData.name,
      email: initialData.email,
      userType: initialData.userType,
      kycRequest: initialData.kycRequest,
      createdAt: initialData.createdAt instanceof Date ? initialData.createdAt.toISOString().split('T')[0] : initialData.createdAt,
      isBanned: initialData.isBanned ? "true" : "false"
    } : undefined
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        userType: initialData.userType,
        kycRequest: initialData.kycRequest,
        createdAt: initialData.createdAt instanceof Date ? initialData.createdAt.toISOString().split('T')[0] : initialData.createdAt,
        isBanned: initialData.isBanned ? "true" : "false"
      });
    }
  }, [initialData, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit(data, file);
  };

  return (
    <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
      <h2 className="text-[18px] font-semibold text-dark mb-8">{formHeading}</h2>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
          <div className="form-group">
            <label>User Name</label>
            <input className="form-control" {...register("name")} />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" {...register("email")} />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label>Access</label>
            <select className="form-control" {...register("userType")}>
              <option value="">Select</option>
              <option value="regular">Regular</option>
              <option value="admin">Admin</option>
            </select>
            {errors.userType && <p className="text-red-500">{errors.userType.message}</p>}
          </div>
          <div className="form-group">
            <label>Created At</label>
            <input className="form-control" type="date" {...register("createdAt")} />
            {errors.createdAt && <p className="text-red-500">{errors.createdAt.message}</p>}
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" {...register("isBanned")}>
              <option value="false">Active</option>
              <option value="true">Inactive</option>
            </select>
          </div>
          <div className="form-group">
            <label>KYC Request</label>
            <select className="form-control" {...register("kycRequest")}>
              <option value="">Select</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
            {errors.kycRequest && <p className="text-red-500">{errors.kycRequest.message}</p>}
          </div>

          <div className="form-group col-span-2 mt-6">
            <div className="form-control relative flex flex-col items-center justify-center">
              <div className="absolute left-4 top-[50%] translate-y-[-50%]">
                {preview ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <Image
                      src={preview}
                      width={150}
                      height={80}
                      alt="Uploaded file"
                      className="w-[140px] h-[110px] object-cover rounded"
                    />
                    <button
                      onClick={removeImage}
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
                    alt="Default Thumbnail"
                    height={80}
                    width={135}
                    className="w-[140px] h-[110px] object-fill rounded"
                  />
                )}
              </div>
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col justify-center items-center text-center">
                <Image
                  src="/images/icon/upload-icon.png"
                  alt="Upload Icon"
                  height={40}
                  width={40}
                  className="mx-auto"
                />
                <span className="mt-3 text-sm font-normal text-gray block">
                  <strong className="text-primary font-semibold">Click to upload</strong> or drag and drop
                </span>
                <span className="text-gray-500 text-sm text-center mt-2">
                  SVG, PNG, JPG, or GIF (max: 800x400px)
                </span>
                <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex justify-end items-center gap-4 mt-6 col-span-2">
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
        </div>
      </form>
    </div>
  );
};

export default UserForm;
