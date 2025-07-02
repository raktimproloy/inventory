import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export interface FormData {
  name: string;
  email: string;
  userType: string;
  kycRequest: string;
  profilePicture?: string | null;
  createdAt: string;
  isBanned: string;
}

interface UserFormProps {
  formHeading: string;
  onSubmit: (data: FormData, file?: File | null) => void;
  initialData?: any;
}

const UserForm: React.FC<UserFormProps> = ({ formHeading, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    userType: "",
    kycRequest: "",
    createdAt: "",
    isBanned: "Active",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialData?.profilePicture || null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Log form data changes to console
  useEffect(() => {
    console.log("Partner Form Data Updated:", {
      ...formData,
      file: file?.name || null,
      preview,
      errors,
      isSubmitting
    });
  }, [formData, file, preview, errors, isSubmitting]);

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        userType: initialData.userType || "",
        kycRequest: initialData.kycRequest || "",
        createdAt: initialData.createdAt instanceof Date 
          ? initialData.createdAt.toISOString().split('T')[0] 
          : initialData.createdAt || "",
        isBanned: initialData.isBanned ? "true" : "false",
      });
      setPreview(initialData.profilePicture || null);
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.userType) {
      newErrors.userType = "User type is required";
    }

    if (!formData.kycRequest) {
      newErrors.kycRequest = "KYC request status is required";
    }

    if (!formData.createdAt) {
      newErrors.createdAt = "Registration date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      console.log("File selected:", selected.name);
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    console.log("Image removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== PARTNER FORM SUBMISSION STARTED ===");
    console.log("Form Data:", formData);
    console.log("File:", file?.name || "No file selected");

    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      console.log("=== FINAL DATA TO SUBMIT ===");
      console.log(JSON.stringify({
        ...formData,
        file: file?.name || null
      }, null, 2));

      // Call the onSubmit prop with form data and file
      await onSubmit(formData, file);
      
      console.log("=== FORM SUBMISSION COMPLETE ===");
      alert("Partner data saved successfully!");
    } catch (error) {
      console.error("Error saving partner data:", error);
      setSubmitError("Failed to save partner data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-[#D0D5DD] rounded-xl p-4 md:p-6 bg-white w-full max-w-4xl mx-auto">
      <h2 className="text-[18px] md:text-[24px] font-semibold text-dark mb-6 md:mb-8">{formHeading}</h2>
      
      {submitError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">User Name*</label>
            <input
              type="text"
              placeholder="Enter user name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`form-control ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`form-control ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Access*</label>
            <select
              value={formData.userType}
              onChange={(e) => handleInputChange("userType", e.target.value)}
              className={`form-control ${errors.userType ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
            >
              <option value="">Select Access Level</option>
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
            {errors.userType && <p className="text-red-500 text-sm mt-1">{errors.userType}</p>}
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date*</label>
            <input
              type="date"
              value={formData.createdAt}
              onChange={(e) => handleInputChange("createdAt", e.target.value)}
              className={`form-control ${errors.createdAt ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
            />
            {errors.createdAt && <p className="text-red-500 text-sm mt-1">{errors.createdAt}</p>}
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.isBanned}
              onChange={(e) => handleInputChange("isBanned", e.target.value)}
              className="form-control focus:border-blue-500 transition-colors"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">KYC Request*</label>
            <select
              value={formData.kycRequest}
              onChange={(e) => handleInputChange("kycRequest", e.target.value)}
              className={`form-control ${errors.kycRequest ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
            >
              <option value="">Select KYC Status</option>
              <option value="Approved">Approved</option>
              <option value="In Review">In Review</option>
              <option value="Declined">Declined</option>
            </select>
            {errors.kycRequest && <p className="text-red-500 text-sm mt-1">{errors.kycRequest}</p>}
          </div>
        </div>

        {/* Profile Picture Upload */}
        <div className="form-group mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
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
                    className="absolute top-2 right-2 bg-white text-gray-700 rounded-full shadow h-5 w-5 hover:bg-gray-100 flex items-center justify-center text-xs"
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
                  src={ formHeading === "Edit Partner" ? "/images/laptop.webp" : "/images/thumb.png"}
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
              <input 
                id="file-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
          </div>
          <span className="text-gray-500 text-xs mt-2 block">Upload profile picture (SVG, PNG, JPG, or GIF, max: 800x400px)</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-6">
          <Link
            href="./"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
