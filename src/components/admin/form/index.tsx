"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Image from "next/image";

interface UploadedFile {
  url: string;
}

export interface FormData {
  fullName: string;
  email: string;
  company: string;
  role: string;
  phoneNumber: string;
  profilePicture?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminFormProps {
  formHeading: string;
  onSubmit: (data: FormData, file?: File | null) => void;
  initialData?: FormData;
  isLoading?: boolean;
}

const validationSchema = yup.object().shape({
  fullName: yup.string().required("Full name is required").min(2, "Full name must be at least 2 characters"),
  email: yup.string().required("Email is required").email("Please enter a valid email"),
  company: yup.string().required("Company is required").min(2, "Company name must be at least 2 characters"),
  role: yup.string().required("Role is required"),
  phoneNumber: yup.string().required("Phone number is required").matches(/^[+]?[\d\s\-\(\)]+$/, "Please enter a valid phone number"),
});

const AdminForm: React.FC<AdminFormProps> = ({ 
  formHeading, 
  onSubmit, 
  initialData, 
  isLoading = false 
}) => {
  const [file, setFile] = useState<UploadedFile | null>(
    initialData?.profilePicture ? { url: initialData.profilePicture } : null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      fullName: "",
      email: "",
      company: "",
      role: "staff",
      phoneNumber: "",
    },
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.profilePicture) {
        setFile({ url: initialData.profilePicture });
      }
    }
  }, [initialData, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setSelectedFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFile({ url: e.target?.result as string });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeImage = () => {
    setFile(null);
    setSelectedFile(null);
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit(data, selectedFile);
  };

  return (
    <div className="border border-[#D0D5DD] rounded-xl p-4 md:p-6 bg-white w-full mx-auto">
      <h2 className="text-[18px] md:text-[24px] font-semibold text-dark mb-6 md:mb-8">{formHeading}</h2>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Profile Image Upload */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
          <div className="flex items-center gap-4">
            {file && (
              <div className="relative">
                <Image
                  src={file.url}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-full border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-control"
                id="profilePicture"
              />
              <p className="text-xs text-gray-500 mt-1">Upload a profile picture (JPG, PNG, GIF)</p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <div className="form-group">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name*
            </label>
            <input
              type="text"
              id="fullName"
              className={`form-control ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
              placeholder="Enter full name"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address*
            </label>
            <input
              type="email"
              id="email"
              className={`form-control ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
              placeholder="Enter email address"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company*
            </label>
            <input
              type="text"
              id="company"
              className={`form-control ${errors.company ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
              placeholder="Enter company name"
              {...register("company")}
            />
            {errors.company && (
              <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role*
            </label>
            <select
              id="role"
              className={`form-control ${errors.role ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
              {...register("role")}
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="sponsor">Sponsor</option>
              <option value="partner">Partner</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number*
            </label>
            <input
              type="tel"
              id="phoneNumber"
              className={`form-control ${errors.phoneNumber ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
              placeholder="Enter phone number"
              {...register("phoneNumber")}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminForm;
