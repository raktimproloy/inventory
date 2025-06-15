// ✅ inventory-form.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Image from "next/image";
import Link from "next/link";
import { uploadImageToFirebase } from "../../../../service/uploadImage";

interface UploadedFile {
  url: string;
}

export interface FormData {
  id?: string;
  prizeName: string;
  ticketSold: number;
  price: number;
  partner: string;
  stockLevel: string;
  status: string;
  thumbnail?: string | null;
}

interface InventoryFormProps {
  formHeading: string;
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
}

const validationSchema = yup.object().shape({
  prizeName: yup.string().required("Prize Name is required"),
  ticketSold: yup.number().typeError("Ticket Sold must be a number").required("Ticket Sold is required"),
  price: yup.number().typeError("Price must be a number").required("Price is required"),
  partner: yup.string().required("Partner is required"),
  stockLevel: yup.string().required("Stock Level is required"),
  status: yup.string().required("Status is required"),
});

const AccordionSection: React.FC<{
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}> = ({ title, isOpen, onClick, children, style, className }) => (
  <div className={`mb-4 border rounded-lg ${className || ''}`} style={style}>
    <button
      type="button"
      className="w-full flex justify-between items-center px-4 py-3 text-left text-[16px] font-semibold focus:outline-none rounded-t-lg"
      onClick={onClick}
    >
      <span>{title}</span>
      <span>{isOpen ? '−' : '+'}</span>
    </button>
    {isOpen && <div className="p-4 bg-white rounded-b-lg">{children}</div>}
  </div>
);

const InventoryForm: React.FC<InventoryFormProps> = ({
  formHeading,
  initialData,
  onSubmit,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>(initialData?.thumbnail ? [{ url: initialData.thumbnail }] : []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [openSections, setOpenSections] = useState([true, true, true, true, true]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: initialData || {},
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const toggleSection = (idx: number) => {
    setOpenSections((prev) => prev.map((open, i) => (i === idx ? !open : open)));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;
    if (selected) {
      const newFiles = Array.from(selected).slice(0, 4 - files.length);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      setFiles((prev) => [
        ...prev,
        ...newFiles.map((file) => ({ url: URL.createObjectURL(file) })),
      ]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFormSubmit = async (data: FormData) => {
    let uploadedUrls: string[] = [];
    if (selectedFiles.length > 0) {
      uploadedUrls = await Promise.all(selectedFiles.map(f => uploadImageToFirebase(f)));
    }
    const newData = {
      ...data,
      thumbnail: uploadedUrls[0] || files[0]?.url || null,
    };
    onSubmit(newData);
    reset();
    setFiles([]);
    setSelectedFiles([]);
  };

  return (
    <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
      <h2 className="text-[18px] font-semibold text-dark mb-8">{formHeading}</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="1. Basic Info" isOpen={openSections[0]} onClick={() => toggleSection(0)}>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
            <div className="form-group">
              <label htmlFor="prizeName">Prize Name</label>
              <input className="form-control" type="text" id="prizeName" placeholder="Prize Name" {...register("prizeName")} />
              {errors.prizeName && <p className="text-red-500 text-sm">{errors.prizeName.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="ticketSold">Ticket Sold</label>
              <input className="form-control" type="number" id="ticketSold" placeholder="Ticket Sold" {...register("ticketSold")} />
              {errors.ticketSold && <p className="text-red-500 text-sm">{errors.ticketSold.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <div className="relative">
                <Image className="absolute top-[50%] translate-y-[-50%] left-3" alt="icon" height={20} width={20} src="/images/icon/currency-dollar.png" />
                <input className="form-control pl-8" type="number" id="price" placeholder="Price" {...register("price")} />
              </div>
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="partner">Partner</label>
              <select id="partner" className="form-control" {...register("partner")}>
                <option value="username1">Fullname1</option>
                <option value="username2">Fullname2</option>
                <option value="username3">Fullname3</option>
                <option value="username4">Fullname4</option>
                <option value="username5">Fullname5</option>
              </select>
              {errors.partner && <p className="text-red-500 text-sm">{errors.partner.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="stockLevel">Stock Level</label>
              <select id="stockLevel" className="form-control" {...register("stockLevel")}>
                <option value="10">10</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="70">70</option>
                <option value="90">90</option>
              </select>
              {errors.stockLevel && <p className="text-red-500 text-sm">{errors.stockLevel.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" className="form-control" {...register("status")}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
            </div>
            <div className="form-group col-span-2">
              <label>Images</label>
              <div className="flex flex-wrap gap-4">
                {files.map((file, idx) => (
                  <div key={idx} className="form-control relative flex flex-col items-center justify-center">
                    <div className="relative rounded-lg overflow-hidden">
                      <Image
                        src={file.url}
                        width={150}
                        height={80}
                        alt={`Uploaded file ${idx + 1}`}
                        className="w-[140px] h-[110px] object-cover rounded"
                      />
                      <button
                        onClick={() => removeFile(idx)}
                        type="button"
                        className="absolute top-2 right-2 bg-white text-gray-700 rounded-full shadow h-5 w-5 hover:bg-gray-100"
                        aria-label="Remove file"
                      >
                        ✕
                      </button>
                      {idx === 0 && (
                        <p className="text-[8px] text-white mt-2 bg-[#00000033] absolute bottom-0 left-0 w-full text-center">
                          Current Thumbnail
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {files.length < 4 && (
                  <div className="form-control relative flex flex-col items-center justify-center">
                    <div className="absolute left-4 top-[50%] translate-y-[-50%]">
                      <Image
                        src="/images/thumb.png"
                        alt="photo"
                        height={80}
                        width={135}
                        className="w-[140px] h-[110px] object-fill rounded"
                      />
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
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              <span className="text-gray-500 text-xs mt-2 block">Upload up to 4 images (SVG, PNG, JPG, or GIF, max: 800x400px)</span>
            </div>
          </div>
        </AccordionSection>
        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="2. Prize Type & Dynamic Attributes" isOpen={openSections[1]} onClick={() => toggleSection(1)}>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
            <div className="form-group">
              <label htmlFor="prizeType">Prize Type</label>
              <div className="flex gap-2">
                <input className="form-control flex-1" type="text" id="prizeType" placeholder="Prize Type" />
                <button 
                  type="button"
                  className="form-control w-[250px] text-left text-gray-500 hover:bg-gray-50"
                  id="addType"
                >
                  + Add New Type
                </button>
              </div>
            </div>
          </div>
        </AccordionSection>
        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="3. Fulfillment & Logistics" isOpen={openSections[2]} onClick={() => toggleSection(2)}>
          <div className="grid grid-cols-3 gap-6">
            <div className="form-group">
              <label htmlFor="status">Fulfillment Method</label>
              <select id="status" className="form-control" {...register("status")}>
                <option value="Active">Active</option>
                <option value="Inactive">Pickup</option>
                <option value="Inactive">Delivery</option>
                <option value="Inactive">Self-Pickup</option>
                <option value="Inactive">Self-Delivery</option>
                <option value="Inactive">Self-Pickup & Delivery</option>
                <option value="Inactive">Self-Pickup & Delivery</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="deliveryTimeline">Delivery Timeline</label>
              <input className="form-control" type="text" id="deliveryTimeline" placeholder="Delivery Timeline" />
            </div>
            <div className="form-group">
              <label htmlFor="claimWindow">Claim Window</label>
              <input className="form-control" type="text" id="claimWindow" placeholder="Claim Window" />
            </div>
            <div className="form-group">
              <label htmlFor="eligibleRegions">Eligible Regions</label>
              <select id="status" className="form-control" {...register("status")}>
                <option value="Active">Active</option>
                <option value="Inactive">Pickup</option>
                <option value="Inactive">Delivery</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
            </div>
            <div className="form-group flex items-center gap-2">
              <label htmlFor="pickupRequired">Pickup Required</label>
              
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" />
                <div className="relative w-11 h-6 bg-blue-500 border border-[#D0D5DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border after:border-red-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            <br />
            <div className="form-group">
              <label htmlFor="deliveryTimeline">Retail Value (USD)</label>
              <input className="form-control" type="text" id="retailValue" placeholder="Retail Value (USD)" />
            </div>
            <div className="form-group">
              <label htmlFor="qualityAvailability">Quality Availability</label>
              <input className="form-control" type="text" id="qualityAvailability" placeholder="Quality Availability" />
            </div>
          </div>
        </AccordionSection>
        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="4. Rules & Restrictions" isOpen={openSections[3]} onClick={() => toggleSection(3)}>
          <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
          <div className="form-group">
              <label htmlFor="ageRestriction">Age Restriction</label>
              <input className="form-control" type="text" id="ageRestriction" placeholder="Age Restriction" />
            </div>
            <div className="form-group">
              <label htmlFor="qualityAvailability">Terms & Conditions URL</label>
              <input className="form-control" type="text" id="termsConditionsUrl" placeholder="Terms & Conditions URL" />
            </div>
            <div className="form-group flex items-center gap-2">
              <label htmlFor="pickupRequired">ID Required </label>
              
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" />
                <div className="relative w-11 h-6 bg-blue-500 border border-[#D0D5DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border after:border-red-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
          </div>
        </AccordionSection>
        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="5. Tags & Notes" isOpen={openSections[4]} onClick={() => toggleSection(4)}>
          <div className="grid md:grid-cols-1 grid-cols-1 gap-6">
            <div className="form-group">
              <label htmlFor="tags">Full Description</label>
              <textarea className="form-control" id="fullDescription" placeholder="Full Description" rows={5} />
            </div>
            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input className="form-control" type="text" id="tags" placeholder="Tags" />
            </div>
            
          </div>
        </AccordionSection>
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

export default InventoryForm;