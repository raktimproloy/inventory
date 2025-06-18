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
  shortDescription: string;
  retailValue: number;
  quantityAvailable: number;
  partner: string;
  fullDescription: string;
  tags: string;
  prizeCategory: string;
  fulfillmentMethod: string;
  deliveryTimeline: string;
  claimWindow: string;
  eligibleRegions: string;
  pickupRequired: boolean;
  retailValueUSD: string;
  ageRestriction: string;
  termsConditionsUrl: string;
  idRequired: boolean;
  additionalInfo: string;
  thumbnail?: string | null;
}

interface InventoryFormProps {
  formHeading: string;
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
}

const validationSchema = yup.object().shape({
  prizeName: yup.string().required("Prize Name is required"),
  shortDescription: yup.string().required("Short Description is required"),
  retailValue: yup.number().typeError("Retail Value must be a number").required("Retail Value is required"),
  quantityAvailable: yup.number().typeError("Quantity must be a number").required("Quantity Available is required"),
  partner: yup.string().required("Partner is required"),
  fullDescription: yup.string().required("Full Description is required"),
  tags: yup.string().required("Tags are required"),
  prizeCategory: yup.string().required("Prize Category is required"),
  fulfillmentMethod: yup.string().required("Fulfillment Method is required"),
  deliveryTimeline: yup.string().required("Delivery Timeline is required"),
  claimWindow: yup.string().required("Claim Window is required"),
  eligibleRegions: yup.string().required("Eligible Regions is required"),
  retailValueUSD: yup.string().required("Retail Value (USD) is required"),
  ageRestriction: yup.string().required("Age Restriction is required"),
  termsConditionsUrl: yup.string().url("Must be a valid URL").required("Terms & Conditions URL is required"),
  additionalInfo: yup.string().optional(),
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
  const [pickupRequired, setPickupRequired] = useState<boolean>(false);
  const [idRequired, setIdRequired] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: initialData || {},
    resolver: yupResolver(validationSchema),
  });

  const watchedValues = watch();

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setPickupRequired(initialData.pickupRequired || false);
      setIdRequired(initialData.idRequired || false);
    }
  }, [initialData, reset]);

  // Log all form values to console whenever they change
  useEffect(() => {
    console.log("Form Values:", {
      ...watchedValues,
      pickupRequired,
      idRequired,
      files: files.map(f => f.url),
      selectedFiles: selectedFiles.map(f => f.name)
    });
  }, [watchedValues, pickupRequired, idRequired, files, selectedFiles]);

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

  const handleFormSubmit = async (data: any) => {
    try {
      let uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        uploadedUrls = await Promise.all(selectedFiles.map(f => uploadImageToFirebase(f)));
      }
      
      const formData: FormData = {
        ...data,
        pickupRequired,
        idRequired,
        thumbnail: uploadedUrls[0] || files[0]?.url || null,
      };

      console.log("Submitting Form Data:", formData);
      
      onSubmit(formData);
      reset();
      setFiles([]);
      setSelectedFiles([]);
      setPickupRequired(false);
      setIdRequired(false);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="border border-[#D0D5DD] rounded-xl p-4 md:p-6 bg-[#00000033] w-full">
      <h2 className="text-[18px] font-semibold text-dark mb-6 md:mb-8">{formHeading}</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <AccordionSection className="!bg-[#E9E9E9] !border-[#F3F3F5] !rounded-lg text-dark" title="1. Basic Info" isOpen={openSections[0]} onClick={() => toggleSection(0)}>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6 mb-4">
            <div className="form-group">
              <label htmlFor="prizeName" className="block text-sm font-medium text-gray-700 mb-1">Prize Name*</label>
              <input 
                className={`form-control ${errors.prizeName ? 'border-red-500' : ''}`} 
                type="text" 
                id="prizeName" 
                placeholder="Enter prize name" 
                {...register("prizeName")} 
              />
              {errors.prizeName && <p className="text-red-500 text-sm mt-1">{errors.prizeName.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">Short Description*</label>
              <input 
                className={`form-control ${errors.shortDescription ? 'border-red-500' : ''}`} 
                type="text" 
                id="shortDescription" 
                placeholder="Enter short description" 
                {...register("shortDescription")} 
              />
              {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription.message}</p>}
            </div>
          </div>
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4 md:gap-6 mb-4">
            <div className="form-group">
              <label htmlFor="retailValue" className="block text-sm font-medium text-gray-700 mb-1">Retail Value*</label>
              <input 
                className={`form-control ${errors.retailValue ? 'border-red-500' : ''}`} 
                type="number" 
                id="retailValue" 
                placeholder="Enter retail value" 
                {...register("retailValue")} 
              />
              {errors.retailValue && <p className="text-red-500 text-sm mt-1">{errors.retailValue.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="quantityAvailable" className="block text-sm font-medium text-gray-700 mb-1">Quantity Available*</label>
              <input 
                className={`form-control ${errors.quantityAvailable ? 'border-red-500' : ''}`} 
                type="number" 
                id="quantityAvailable" 
                placeholder="Enter quantity" 
                {...register("quantityAvailable")} 
              />
              {errors.quantityAvailable && <p className="text-red-500 text-sm mt-1">{errors.quantityAvailable.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="partner" className="block text-sm font-medium text-gray-700 mb-1">Partner*</label>
              <select 
                id="partner" 
                className={`form-control ${errors.partner ? 'border-red-500' : ''}`} 
                {...register("partner")}
              >
                <option value="">Select Partner</option>
                <option value="username1">Fullname1</option>
                <option value="username2">Fullname2</option>
                <option value="username3">Fullname3</option>
                <option value="username4">Fullname4</option>
                <option value="username5">Fullname5</option>
              </select>
              {errors.partner && <p className="text-red-500 text-sm mt-1">{errors.partner.message}</p>}
            </div>
          </div>
          <div className="grid md:grid-cols-1 grid-cols-1 gap-4 md:gap-6">
            <div className="form-group">
              <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-700 mb-1">Full Description*</label>
              <textarea 
                className={`form-control ${errors.fullDescription ? 'border-red-500' : ''}`} 
                id="fullDescription" 
                placeholder="Enter full description" 
                rows={5} 
                {...register("fullDescription")} 
              />
              {errors.fullDescription && <p className="text-red-500 text-sm mt-1">{errors.fullDescription.message}</p>}
            </div>
            <div className="form-group col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
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

        {/* Tags field */}
        <div className="form-group mb-4">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags*</label>
          <input 
            className={`form-control text-dark ${errors.tags ? 'border-red-500' : ''}`} 
            type="text" 
            id="tags" 
            placeholder="Enter tags separated by commas" 
            {...register("tags")}
          />
          <span className="text-gray-500 text-xs mt-1 block">Example: electronics, gaming, premium</span>
          {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>}
        </div>

        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="2. Prize Type & Dynamic Attributes" isOpen={openSections[1]} onClick={() => toggleSection(1)}>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6">
            <div className="form-group">
              <label htmlFor="prizeCategory" className="block text-sm font-medium text-gray-700 mb-1">Prize Category*</label>
              <div className="flex gap-2">
              <select 
                id="prizeCategory" 
                className={`form-control ${errors.prizeCategory ? 'border-red-500' : ''}`} 
                {...register("prizeCategory")}
              >
                <option value="">Select Prize Category</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Devices">Devices</option>
                <option value="Electronics">Electronics</option>
                <option value="Style">Style</option>
                <option value="Beauty & Grooming">Beauty & Grooming</option>
              </select>
              {errors.prizeCategory && <p className="text-red-500 text-sm mt-1">{errors.prizeCategory.message}</p>}
                <button 
                  type="button"
                  className="form-control w-[200px] md:w-[250px] text-left text-gray-500 hover:bg-gray-50"
                  id="addType"
                >
                  + Add New Type
                </button>
              </div>
              {errors.prizeCategory && <p className="text-red-500 text-sm mt-1">{errors.prizeCategory.message}</p>}
            </div>
          </div>
        </AccordionSection>

        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="3. Fulfillment & Logistics" isOpen={openSections[2]} onClick={() => toggleSection(2)}>
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4 md:gap-6">
            <div className="form-group">
              <label htmlFor="fulfillmentMethod" className="block text-sm font-medium text-gray-700 mb-1">Fulfillment Method*</label>
              <select 
                id="fulfillmentMethod" 
                className={`form-control ${errors.fulfillmentMethod ? 'border-red-500' : ''}`} 
                {...register("fulfillmentMethod")}
              >
                <option value="">Select Fulfillment Method</option>
                <option value="Digital">Digital</option>
                <option value="Delivery">Delivery</option>
                <option value="Collection">Collection</option>
              </select>
              {errors.fulfillmentMethod && <p className="text-red-500 text-sm mt-1">{errors.fulfillmentMethod.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="deliveryTimeline" className="block text-sm font-medium text-gray-700 mb-1">Delivery Timeline*</label>
              <input 
                className={`form-control ${errors.deliveryTimeline ? 'border-red-500' : ''}`} 
                type="text" 
                id="deliveryTimeline" 
                placeholder="e.g., 3-5 business days" 
                {...register("deliveryTimeline")}
              />
              {errors.deliveryTimeline && <p className="text-red-500 text-sm mt-1">{errors.deliveryTimeline.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="claimWindow" className="block text-sm font-medium text-gray-700 mb-1">Claim Window*</label>
              <input 
                className={`form-control ${errors.claimWindow ? 'border-red-500' : ''}`} 
                type="text" 
                id="claimWindow" 
                placeholder="e.g., 30 days" 
                {...register("claimWindow")}
              />
              {errors.claimWindow && <p className="text-red-500 text-sm mt-1">{errors.claimWindow.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="eligibleRegions" className="block text-sm font-medium text-gray-700 mb-1">Eligible Regions*</label>
              <select 
                id="eligibleRegions" 
                className={`form-control ${errors.eligibleRegions ? 'border-red-500' : ''}`} 
                {...register("eligibleRegions")}
              >
                <option value="">Select Eligible Region</option>
                <option value="arima">Arima</option>
                <option value="chaguanas">Chaguanas</option>
                <option value="claxton-bay">Claxton Bay</option>
                <option value="couva">Couva</option>
                <option value="debe">Debe</option>
                <option value="diego-martin">Diego Martin</option>
                <option value="freeport">Freeport</option>
                <option value="fyzabad">Fyzabad</option>
                <option value="gasparillo">Gasparillo</option>
                <option value="penal">Penal</option>
                <option value="point-fortin">Point Fortin</option>
                <option value="port-of-spain">Port of Spain</option>
                <option value="princes-town">Princes Town</option>
                <option value="roxborough">Roxborough</option>
                <option value="san-fernando">San Fernando</option>
                <option value="sangre-grande">Sangre Grande</option>
                <option value="san-juan">San Juan</option>
                <option value="scarborough">Scarborough</option>
                <option value="siparia">Siparia</option>
                <option value="tunapuna">Tunapuna</option>
                <option value="valencia">Valencia</option>
              </select>
              {errors.eligibleRegions && <p className="text-red-500 text-sm mt-1">{errors.eligibleRegions.message}</p>}
            </div>
            <div className="form-group flex items-center gap-2 justify-between">
              <label htmlFor="pickupRequired" className="block text-sm font-medium text-gray-700">Pickup Required</label>
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={pickupRequired}
                  onChange={(e) => setPickupRequired(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="relative w-11 h-6 bg-blue-500 border border-[#D0D5DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border after:border-red-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            <div className="form-group col-span-2">
              <label htmlFor="retailValueUSD" className="block text-sm font-medium text-gray-700 mb-1">Retail Value (USD)*</label>
              <input 
                className={`form-control ${errors.retailValueUSD ? 'border-red-500' : ''}`} 
                type="text" 
                id="retailValueUSD" 
                placeholder="Enter retail value in USD" 
                {...register("retailValueUSD")}
              />
              {errors.retailValueUSD && <p className="text-red-500 text-sm mt-1">{errors.retailValueUSD.message}</p>}
            </div>
          </div>
        </AccordionSection>

        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="4. Rules & Restrictions" isOpen={openSections[3]} onClick={() => toggleSection(3)}>
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4 md:gap-6">
            <div className="form-group">
              <label htmlFor="ageRestriction" className="block text-sm font-medium text-gray-700 mb-1">Age Restriction*</label>
              <input 
                className={`form-control ${errors.ageRestriction ? 'border-red-500' : ''}`} 
                type="text" 
                id="ageRestriction" 
                placeholder="e.g., 18+" 
                {...register("ageRestriction")}
              />
              {errors.ageRestriction && <p className="text-red-500 text-sm mt-1">{errors.ageRestriction.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="termsConditionsUrl" className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions URL*</label>
              <input 
                className={`form-control ${errors.termsConditionsUrl ? 'border-red-500' : ''}`} 
                type="url" 
                id="termsConditionsUrl" 
                placeholder="https://example.com/terms" 
                {...register("termsConditionsUrl")}
              />
              {errors.termsConditionsUrl && <p className="text-red-500 text-sm mt-1">{errors.termsConditionsUrl.message}</p>}
            </div>
            <div className="form-group flex items-center gap-2 justify-between">
              <label htmlFor="idRequired" className="block text-sm font-medium text-gray-700">ID Required</label>
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={idRequired}
                  onChange={(e) => setIdRequired(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="relative w-11 h-6 bg-blue-500 border border-[#D0D5DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border after:border-red-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="5. Notes" isOpen={openSections[4]} onClick={() => toggleSection(4)}>
          <div className="grid md:grid-cols-1 grid-cols-1 gap-4 md:gap-6">
            <div className="form-group">
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
              <textarea 
                className="form-control" 
                id="additionalInfo" 
                placeholder="Enter any additional information" 
                rows={5} 
                {...register("additionalInfo")}
              />
            </div>
          </div>
        </AccordionSection>
        

        <div className="w-full mt-6">
          <button
            type="button"
            className="w-full px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium text-center hover:bg-gray-50 transition-colors"
          >
            Add Custom Section
          </button>
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
            className="w-full sm:w-auto inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;