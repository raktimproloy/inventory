// ✅ inventory-form.tsx
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { uploadImageToFirebase } from "../../../../service/uploadImage";
import { addSponsor, Sponsor, getSponsors } from '../../../../service/sponsorService';
import { toast } from "react-toastify";

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
  eligibleRegions: string | string[];
  pickupRequired: boolean;
  retailValueUSD: string;
  ageRestriction: string;
  termsConditionsUrl: string;
  idRequired: boolean;
  additionalInfo: string;
  thumbnail?: string | null;
  keywords: string[];
  sponsorId?: string;
  breakEvenValue: number;
  stockDate: string;
  useStandardTerms?: boolean;
  customTermsFile?: File | null;
  customTermsUrl?: string;
  customTermsType?: 'url' | 'file';
}

// Update InventoryFormProps to allow extra fields for parent
interface InventoryFormProps {
  formHeading: string;
  initialData?: FormData;
  // Accepts extra fields for parent to handle uploads, etc.
  onSubmit: (data: any) => Promise<void>;
}

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
  console.log(initialData)
  // For edit mode, show both thumbnail and all images (no duplicates)
  const getInitialFiles = () => {
    if (initialData) {
      let urls: string[] = [];
      if (Array.isArray((initialData as any).images)) {
        urls = [...(initialData as any).images];
      }
      // Do NOT add thumbnail separately
      // Remove duplicates just in case
      urls = Array.from(new Set(urls));
      return urls.length > 0 ? urls.map(url => ({ url })) : [];
    }
    return [];
  };
  const [files, setFiles] = useState<UploadedFile[]>(getInitialFiles());
  console.log(files)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [openSections, setOpenSections] = useState([true, true, true, true, true, true]);
  const [pickupRequired, setPickupRequired] = useState<boolean>(false);
  const [idRequired, setIdRequired] = useState<boolean>(false);
  const [keyword1, setKeyword1] = useState('');
  const [keyword2, setKeyword2] = useState('');
  const [keyword3, setKeyword3] = useState('');
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorImages, setSponsorImages] = useState<File[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [sponsorLoading, setSponsorLoading] = useState(false);
  const [retailValueUSD, setRetailValueUSD] = useState('');
  const [breakEvenValue, setBreakEvenValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [regionsDropdownOpen, setRegionsDropdownOpen] = useState(false);
  // Add manual validation state
  const [errors, setErrors] = useState<any>({});

  // Add state for all form fields
  const [prizeName, setPrizeName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [retailValue, setRetailValue] = useState('');
  const [quantityAvailable, setQuantityAvailable] = useState('');
  const [partner, setPartner] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [tags, setTags] = useState('');
  const [prizeCategory, setPrizeCategory] = useState('');
  const [fulfillmentMethod, setFulfillmentMethod] = useState('');
  const [deliveryTimeline, setDeliveryTimeline] = useState('');
  const [claimWindow, setClaimWindow] = useState('');
  const [eligibleRegions, setEligibleRegions] = useState<string[]>([]);
  const [ageRestriction, setAgeRestriction] = useState('');
  const [termsConditionsUrl, setTermsConditionsUrl] = useState('');
  const [useStandardTerms, setUseStandardTerms] = useState(true);
  const [customTermsFile, setCustomTermsFile] = useState<File | null>(null);
  const [customTermsUrl, setCustomTermsUrl] = useState('');
  const [customTermsType, setCustomTermsType] = useState<'url' | 'file'>('url');
  const [stockDate, setStockDate] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  useEffect(() => {
    if (initialData) {
      // reset(initialData); // No longer needed with manual validation
      setPickupRequired(initialData.pickupRequired || false);
      setIdRequired(initialData.idRequired || false);
      setPrizeName(initialData.prizeName);
      setShortDescription(initialData.shortDescription);
      setRetailValue(initialData.retailValueUSD.toString());
      setQuantityAvailable(initialData.quantityAvailable.toString());
      setPartner(initialData.partner);
      setFullDescription(initialData.fullDescription);
      setTags(initialData.tags);
      setPrizeCategory(initialData.prizeCategory);
      setFulfillmentMethod(initialData.fulfillmentMethod);
      setDeliveryTimeline(initialData.deliveryTimeline);
      setClaimWindow(initialData.claimWindow);
      setEligibleRegions(
        typeof initialData.eligibleRegions === 'string' 
          ? initialData.eligibleRegions.split(',').map((region: string) => region.trim()) 
          : Array.isArray(initialData.eligibleRegions) 
            ? initialData.eligibleRegions 
            : []
      );
      setAgeRestriction(initialData.ageRestriction);
      setTermsConditionsUrl(initialData.termsConditionsUrl);
      setUseStandardTerms(initialData.termsConditionsUrl === 'https://example.com/standard-terms');
      setCustomTermsFile(null);
      setCustomTermsUrl(initialData.customTermsUrl || (initialData.termsConditionsUrl !== 'https://example.com/standard-terms' ? initialData.termsConditionsUrl : ''));
      setCustomTermsType(initialData.customTermsType || (initialData.termsConditionsUrl && initialData.termsConditionsUrl !== 'https://example.com/standard-terms' ? 'url' : 'url'));
      setStockDate(initialData.stockDate || '');
      setUseStandardTerms(initialData.useStandardTerms !== undefined ? initialData.useStandardTerms : (initialData.termsConditionsUrl === 'https://example.com/standard-terms'));
      setAdditionalInfo(initialData.additionalInfo);
      setRetailValueUSD(initialData.retailValueUSD);
      setBreakEvenValue(initialData.breakEvenValue);
      setKeyword1(initialData.keywords[0] || '');
      setKeyword2(initialData.keywords[1] || '');
      setKeyword3(initialData.keywords[2] || '');
      // setFiles(initialData.thumbnail ? [{ url: initialData.thumbnail }] : [{url: "/images/laptop.webp"}]);
      // If sponsorId exists and selectedSponsor is not set, fetch and set it
      if (initialData.sponsorId && !selectedSponsor) {
        (async () => {
          const sponsorList = await getSponsors();
          const found = sponsorList.find(s => s.id === initialData.sponsorId);
          if (found) setSelectedSponsor(found);
        })();
      }
    }
  }, [initialData]);


  useEffect(() => {
    const retail = Number(retailValueUSD) || 0;
    setBreakEvenValue(retail * 2.5);
  }, [retailValueUSD]);

  useEffect(() => {
    // Fetch sponsors from Firestore
    (async () => {
      const sponsorList = await getSponsors();
      setSponsors(sponsorList);
    })();
  }, []);

  function formatCurrency(value: number) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

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

  const handleSponsorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 2 - sponsorImages.length);
    setSponsorImages(prev => [...prev, ...files]);
  };

  const handleAddSponsor = async () => {
    if (!sponsorName || sponsorImages.length === 0) return;
    setSponsorLoading(true);
    try {
      const newSponsor = await addSponsor(sponsorName, sponsorImages);
      setSponsors(prev => [...prev, newSponsor]);
      setSelectedSponsor(newSponsor);
      setSponsorModalOpen(false);
      setSponsorName('');
      setSponsorImages([]);
    } catch (err) {
      // Optionally show error toast
      console.error('Error adding sponsor:', err);
    } finally {
      setSponsorLoading(false);
    }
  };

  // Manual validation function
  const validate = (data: any) => {
    const newErrors: any = {};
    if (!data.prizeName) newErrors.prizeName = 'Prize Name is required';
    if (!data.quantityAvailable || isNaN(Number(data.quantityAvailable))) newErrors.quantityAvailable = 'Quantity Available is required and must be a number';
    if (!data.fullDescription) newErrors.fullDescription = 'Full Description is required';
    if (!data.tags) newErrors.tags = 'Tags are required';
    if (!data.prizeCategory) newErrors.prizeCategory = 'Prize Category is required';
    if (!data.fulfillmentMethod) newErrors.fulfillmentMethod = 'Fulfillment Method is required';
    if (!data.deliveryTimeline) newErrors.deliveryTimeline = 'Delivery Timeline is required';
    if (!data.claimWindow) newErrors.claimWindow = 'Claim Window is required';
    if (!data.eligibleRegions || data.eligibleRegions.length === 0) newErrors.eligibleRegions = 'Eligible Regions is required';
    if (!retailValueUSD) newErrors.retailValueUSD = 'Retail Value (USD) is required';
    if (!data.ageRestriction) newErrors.ageRestriction = 'Age Restriction is required';
    if (!data.termsConditionsUrl) newErrors.termsConditionsUrl = 'Terms & Conditions are required';
    if (!data.stockDate) newErrors.stockDate = 'Prize Stock Date is required';
    // Add more as needed
    return newErrors;
  };

  return (
    <div className="border border-[#D0D5DD] rounded-xl p-4 md:p-6 bg-[#00000033] w-full">
      <h2 className="text-[18px] font-semibold text-dark mb-6 md:mb-8">{formHeading}</h2>
      <form className="space-y-4">
        <AccordionSection className="!bg-[#E9E9E9] !border-[#F3F3F5] !rounded-lg text-dark" title="1. Basic Info" isOpen={openSections[0]} onClick={() => toggleSection(0)}>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6 mb-4">
            <div className="form-group">
              <label htmlFor="prizeName" className="block text-sm font-medium text-gray-700 mb-1">Prize Name*</label>
              <input 
                className={`form-control ${errors.prizeName ? 'border-red-500' : ''}`} 
                type="text" 
                id="prizeName" 
                placeholder="Enter prize name" 
                value={prizeName}
                onChange={e => setPrizeName(e.target.value)}
              />
              {errors.prizeName && <p className="text-red-500 text-sm mt-1">{errors.prizeName}</p>}
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description - 3 Details</label>
              <div className="flex flex-wrap md:flex-nowrap items-center border rounded-lg px-2 py-1 bg-white border-[#00000034] gap-2 w-full">
                <input
                  type="text"
                  className="flex-1 min-w-0 w-full md:w-auto px-2 py-1 outline-none bg-transparent"
                  placeholder="Detail 1"
                  value={keyword1}
                  onChange={e => setKeyword1(e.target.value)}
                  maxLength={20}
                />
                <span className="mx-2 text-[#00000080] hidden md:inline">|</span>
                <input
                  type="text"
                  className="flex-1 min-w-0 w-full md:w-auto px-2 py-1 outline-none bg-transparent"
                  placeholder="Detail 2"
                  value={keyword2}
                  onChange={e => setKeyword2(e.target.value)}
                  maxLength={20}
                />
                <span className="mx-2 text-[#00000080] hidden md:inline">|</span>
                <input
                  type="text"
                  className="flex-1 min-w-0 w-full md:w-auto px-2 py-1 outline-none bg-transparent"
                  placeholder="Detail 3"
                  value={keyword3}
                  onChange={e => setKeyword3(e.target.value)}
                  maxLength={20}
                />
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4 md:gap-6 mb-4">
            <div className="form-group">
              <label htmlFor="quantityAvailable" className="block text-sm font-medium text-gray-700 mb-1">Quantity Item*</label>
              <input
                className={`form-control ${errors.quantityAvailable ? 'border-red-500' : ''}`}
                type="number"
                id="quantityAvailable"
                placeholder="Enter quantity"
                value={quantityAvailable}
                onChange={e => setQuantityAvailable(e.target.value)}
              />
              {errors.quantityAvailable && <p className="text-red-500 text-sm mt-1">{errors.quantityAvailable}</p>}
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
                value={fullDescription}
                onChange={e => setFullDescription(e.target.value)}
              />
              {errors.fullDescription && <p className="text-red-500 text-sm mt-1">{errors.fullDescription}</p>}
            </div>
            <div className="form-group col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
          <div className="flex gap-4">
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
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
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
            placeholder="Add tags separated by commas" 
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
          {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
        </div>

        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="2. Prize Sponsorship" isOpen={openSections[1]} onClick={() => toggleSection(1)}>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6">
            <div className="form-group">
              <label htmlFor="prizeCategory" className="block text-sm font-medium text-gray-700 mb-1">Select Sponsor Name*</label>
              <div className="flex gap-2 items-center">
              <select
              className="form-control w-full"
              value={selectedSponsor?.id || ''}
              onChange={e => {
                const found = sponsors.find(s => s.id === e.target.value);
                setSelectedSponsor(found || null);
              }}
            >
              <option value="">Select Sponsor</option>
              {sponsors.map(s => (
                <option key={s.id} value={s.id}>{s.sponsorName}</option>
              ))}
            </select>
                <button
                  type="button"
                  className="form-control w-[200px] md:w-[250px] text-left text-gray-500 hover:bg-gray-50 border"
                  id="addType"
                  onClick={() => setSponsorModalOpen(true)}
                >
                  + Add New Sponsor
                </button>
              </div>
              {errors.prizeCategory && <p className="text-red-500 text-sm mt-1">{errors.prizeCategory}</p>}
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor Logos*</label>
              <div className="flex flex-wrap gap-2">
                {selectedSponsor && selectedSponsor.logo.map((img: string, idx: number) => (
                  <img key={idx} src={img} alt="sponsor logo" className="w-36 h-16 object-contain rounded border" />
                ))}
              </div>
              
            </div>
          </div>
          {/* Custom Modal for Sponsor */}
          {sponsorModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6 relative">
                <div className="text-lg font-semibold mb-4">Add New Sponsor</div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Sponsor Name</label>
                  <input
                    type="text"
                    className="form-control w-full"
                    value={sponsorName}
                    onChange={e => setSponsorName(e.target.value)}
                    placeholder="Enter sponsor name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Sponsor Logo(s) (max 2)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSponsorImageChange}
                    className="form-control w-full"
                    disabled={sponsorImages.length >= 2}
                  />
                  <div className="flex gap-2 mt-2">
                    {sponsorImages.map((file, idx) => (
                      <div key={idx} className="relative">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-12 h-12 object-cover rounded border" />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full px-1 text-xs"
                          onClick={() => setSponsorImages(prev => prev.filter((_, i) => i !== idx))}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => setSponsorModalOpen(false)}
                  >Cancel</button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                    onClick={handleAddSponsor}
                    disabled={!sponsorName || sponsorImages.length === 0 || sponsorLoading}
                  >
                    {sponsorLoading ? 'Adding...' : 'Add'}
                  </button>
                </div>
                <button
                  type="button"
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={() => setSponsorModalOpen(false)}
                  aria-label="Close"
                >×</button>
              </div>
            </div>
          )}
        </AccordionSection>

        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="3. Prize Type & Dynamic Attributes" isOpen={openSections[2]} onClick={() => toggleSection(2)}>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6">
            <div className="form-group">
              <label htmlFor="prizeCategory" className="block text-sm font-medium text-gray-700 mb-1">Prize Category*</label>
              <div className="flex gap-2">
              <select 
                id="prizeCategory" 
                className={`form-control ${errors.prizeCategory ? 'border-red-500' : ''}`} 
                value={prizeCategory}
                onChange={e => setPrizeCategory(e.target.value)}
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
              {errors.prizeCategory && <p className="text-red-500 text-sm mt-1">{errors.prizeCategory}</p>}
                <button 
                  type="button"
                  className="form-control w-[200px] md:w-[250px] text-left text-gray-500 hover:bg-gray-50"
                  id="addType"
                >
                  + Add New Type
                </button>
              </div>
              {errors.prizeCategory && <p className="text-red-500 text-sm mt-1">{errors.prizeCategory}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="stockDate" className="block text-sm font-medium text-gray-700 mb-1">Prize Stock Added/Updated*</label>
              <input 
                type="date" 
                id="stockDate" 
                className={`form-control ${errors.stockDate ? 'border-red-500' : ''}`} 
                value={stockDate}
                onChange={e => setStockDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.stockDate && <p className="text-red-500 text-sm mt-1">{errors.stockDate}</p>}
            </div>
          </div>
        </AccordionSection>

        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="4. Fulfillment & Logistics" isOpen={openSections[3]} onClick={() => toggleSection(3)}>
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4 md:gap-6">
            <div className="form-group">
              <label htmlFor="fulfillmentMethod" className="block text-sm font-medium text-gray-700 mb-1">Fulfillment Method*</label>
              <select 
                id="fulfillmentMethod" 
                className={`form-control ${errors.fulfillmentMethod ? 'border-red-500' : ''}`} 
                value={fulfillmentMethod}
                onChange={e => setFulfillmentMethod(e.target.value)}
              >
                <option value="">Select Fulfillment Method</option>
                <option value="Digital">Digital</option>
                <option value="Delivery">Delivery</option>
                <option value="Collection">Collection</option>
              </select>
              {errors.fulfillmentMethod && <p className="text-red-500 text-sm mt-1">{errors.fulfillmentMethod}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="deliveryTimeline" className="block text-sm font-medium text-gray-700 mb-1">Delivery Timeline*</label>
              <select 
                id="deliveryTimeline" 
                className={`form-control ${errors.deliveryTimeline ? 'border-red-500' : ''}`} 
                value={deliveryTimeline}
                onChange={e => setDeliveryTimeline(e.target.value)}
              >
                <option value="">Select Delivery Timeline</option>
                {Array.from({ length: 14 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={`${day} day${day > 1 ? 's' : ''}`}>
                    {day} day{day > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              {errors.deliveryTimeline && <p className="text-red-500 text-sm mt-1">{errors.deliveryTimeline}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="claimWindow" className="block text-sm font-medium text-gray-700 mb-1">Claim Window*</label>
              <select 
                id="claimWindow" 
                className={`form-control ${errors.claimWindow ? 'border-red-500' : ''}`} 
                value={claimWindow}
                onChange={e => setClaimWindow(e.target.value)}
              >
                <option value="">Select Claim Window</option>
                {Array.from({ length: 14 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={`${day} day${day > 1 ? 's' : ''}`}>
                    {day} day{day > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              {errors.claimWindow && <p className="text-red-500 text-sm mt-1">{errors.claimWindow}</p>}
            </div>
            <div className="form-group flex items-center gap-2 justify-between mt-5">
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
            <div className="form-group">
              <label htmlFor="eligibleRegions" className="block text-sm font-medium text-gray-700 mb-1">Eligible Regions*</label>
              <div className="relative">
                <div 
                  className={`form-control min-h-[42px] flex flex-wrap items-center gap-1 p-2 cursor-pointer ${errors.eligibleRegions ? 'border-red-500' : ''}`}
                  onClick={() => setRegionsDropdownOpen(!regionsDropdownOpen)}
                >
                  {eligibleRegions.length > 0 ? (
                    <>
                      {eligibleRegions.map((region) => (
                        <span key={region} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white">
                          {region.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEligibleRegions(eligibleRegions.filter(r => r !== region));
                            }}
                            className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-white hover:text-primary"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </>
                  ) : (
                    <span className="text-gray-400">Select regions...</span>
                  )}
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Dropdown Options */}
                {regionsDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {[
                      { value: "arima", label: "Arima" },
                      { value: "chaguanas", label: "Chaguanas" },
                      { value: "claxton-bay", label: "Claxton Bay" },
                      { value: "couva", label: "Couva" },
                      { value: "debe", label: "Debe" },
                      { value: "diego-martin", label: "Diego Martin" },
                      { value: "freeport", label: "Freeport" },
                      { value: "fyzabad", label: "Fyzabad" },
                      { value: "gasparillo", label: "Gasparillo" },
                      { value: "penal", label: "Penal" },
                      { value: "point-fortin", label: "Point Fortin" },
                      { value: "port-of-spain", label: "Port of Spain" },
                      { value: "princes-town", label: "Princes Town" },
                      { value: "roxborough", label: "Roxborough" },
                      { value: "san-fernando", label: "San Fernando" },
                      { value: "sangre-grande", label: "Sangre Grande" },
                      { value: "san-juan", label: "San Juan" },
                      { value: "scarborough", label: "Scarborough" },
                      { value: "siparia", label: "Siparia" },
                      { value: "tunapuna", label: "Tunapuna" },
                      { value: "valencia", label: "Valencia" }
                    ].map((region) => (
                      <div
                        key={region.value}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                          eligibleRegions.includes(region.value) ? 'bg-primary text-white' : ''
                        }`}
                        onClick={() => {
                          if (eligibleRegions.includes(region.value)) {
                            setEligibleRegions(eligibleRegions.filter(r => r !== region.value));
                          } else {
                            setEligibleRegions([...eligibleRegions, region.value]);
                          }
                        }}
                      >
                        {region.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.eligibleRegions && <p className="text-red-500 text-sm mt-1">{errors.eligibleRegions}</p>}
            </div>
            <div className="form-group col-span-2">
              <label htmlFor="retailValueUSD" className="block text-sm font-medium text-gray-700 mb-1">Prize Value*</label>
              <input
                className={`form-control ${errors.retailValueUSD ? 'border-red-500' : ''}`}
                type="text"
                id="retailValueUSD"
                placeholder="$1000"
                value={retailValueUSD}
                onChange={e => setRetailValueUSD(e.target.value.replace(/[^\d.]/g, ''))}
                name="retailValueUSD"
              />
              {errors.retailValueUSD && <p className="text-red-500 text-sm mt-1">{errors.retailValueUSD}</p>}
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Break-even Value</label>
              <input
                className="form-control bg-gray-100 cursor-not-allowed"
                type="text"
                value={formatCurrency(breakEvenValue)}
                readOnly
                tabIndex={-1}
              />
              <span className="text-gray-400 text-xs mt-1 block">250% of retail value</span>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="5. Rules & Restrictions" isOpen={openSections[4]} onClick={() => toggleSection(4)}>
          <div className="grid md:grid-cols-8 grid-cols-1 gap-4 md:gap-6">
            <div className="form-group col-span-2">
              <label htmlFor="ageRestriction" className="block text-sm font-medium text-gray-700 mb-1">Age Restriction*</label>
              <input 
                className={`form-control ${errors.ageRestriction ? 'border-red-500' : ''}`} 
                type="text" 
                id="ageRestriction" 
                placeholder="e.g., 18+" 
                value={ageRestriction}
                onChange={e => setAgeRestriction(e.target.value)}
              />
              {errors.ageRestriction && <p className="text-red-500 text-sm mt-1">{errors.ageRestriction}</p>}
            </div>
            <div className="form-group col-span-2 mt-10 flex items-start gap-2 justify-between">
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
            <div className="form-group col-span-4">
              <label htmlFor="termsConditions" className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions*</label>
              
              {/* Terms & Conditions Options */}
              <div className="space-y-4">
                {/* Standard Terms Option */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id="standardTerms"
                      name="termsType"
                      checked={useStandardTerms}
                      onChange={() => setUseStandardTerms(true)}
                      className="mt-1 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <label htmlFor="standardTerms" className="block text-base font-semibold text-gray-900 cursor-pointer">
                        Use Standard Terms & Conditions
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        Review and accept our standard terms & conditions for your prize
                      </p>
                      {useStandardTerms && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium text-blue-900">Standard Terms & Conditions</span>
                            </div>
                            <a 
                              href="https://example.com/standard-terms" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Review Terms
                            </a>
                          </div>
                          <div className="bg-white rounded-md p-3 border border-blue-200">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={termsConditionsUrl === 'https://example.com/standard-terms'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTermsConditionsUrl('https://example.com/standard-terms');
                                  } else {
                                    setTermsConditionsUrl('');
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">I accept the standard terms & conditions</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Custom Terms Option */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id="customTerms"
                      name="termsType"
                      checked={!useStandardTerms}
                      onChange={() => setUseStandardTerms(false)}
                      className="mt-1 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <label htmlFor="customTerms" className="block text-base font-semibold text-gray-900 cursor-pointer">
                        Custom Terms & Conditions
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        Provide a link or upload your own terms & conditions document
                      </p>
                      {!useStandardTerms && (
                        <div className="mt-3 space-y-4">
                          {/* Custom Terms Type Selection */}
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="customTermsType"
                                value="url"
                                checked={customTermsType === 'url'}
                                onChange={() => setCustomTermsType('url')}
                                className="text-primary focus:ring-primary"
                              />
                              <span className="text-sm font-medium text-gray-700">Provide URL</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="customTermsType"
                                value="file"
                                checked={customTermsType === 'file'}
                                onChange={() => setCustomTermsType('file')}
                                className="text-primary focus:ring-primary"
                              />
                              <span className="text-sm font-medium text-gray-700">Upload File</span>
                            </label>
                          </div>

                          {/* URL Input */}
                          {customTermsType === 'url' && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
                              <label className="block text-sm font-medium text-green-900 mb-2">
                                Terms & Conditions URL
                              </label>
                              <div className="flex space-x-2">
                                <input
                                  type="url"
                                  placeholder="https://example.com/your-terms"
                                  value={customTermsUrl}
                                  onChange={(e) => {
                                    setCustomTermsUrl(e.target.value);
                                    setTermsConditionsUrl(e.target.value);
                                  }}
                                  className="form-control flex-1"
                                />
                              </div>
                            </div>
                          )}

                          {/* File Upload */}
                          {customTermsType === 'file' && (
                            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200 p-4">
                              <label className="block text-sm font-medium text-purple-900 mb-2">
                                Upload Terms & Conditions Document
                              </label>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null;
                                      setCustomTermsFile(file);
                                      if (file) {
                                        setTermsConditionsUrl(`custom-terms-${Date.now()}`);
                                      } else {
                                        setTermsConditionsUrl('');
                                      }
                                    }}
                                    className="form-control flex-1"
                                  />
                                </div>
                                {customTermsFile && (
                                  <div className="bg-white rounded-lg border border-purple-200 p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm font-medium text-purple-900">
                                          ✓ {customTermsFile.name}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCustomTermsFile(null);
                                          setTermsConditionsUrl('');
                                        }}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                    <p className="text-xs text-purple-600 mt-1">
                                      File size: {(customTermsFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {errors.termsConditionsUrl && <p className="text-red-500 text-sm mt-1">{errors.termsConditionsUrl}</p>}
            </div>
            
          </div>
        </AccordionSection>

        <AccordionSection className="!bg-[#E9E9E9] !border-[#D0D5DD] !rounded-lg" title="6. Notes" isOpen={openSections[5]} onClick={() => toggleSection(5)}>
          <div className="grid md:grid-cols-1 grid-cols-1 gap-4 md:gap-6">
            <div className="form-group">
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
              <textarea 
                className="form-control" 
                id="additionalInfo" 
                placeholder="Enter any additional information" 
                rows={5} 
                value={additionalInfo}
                onChange={e => setAdditionalInfo(e.target.value)}
              />
            </div>
          </div>
        </AccordionSection>
        
{/* 
        <div className="w-full mt-6">
          <button
            type="button"
            className="w-full px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium text-center hover:bg-gray-50 transition-colors"
          >
            Add Custom Section
          </button>
        </div> */}

        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-6">
          <Link
            href="./"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            className="w-full sm:w-auto inline-block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                // Gather form data from state
                let imageUrls: string[] = [];
                if (selectedFiles.length > 0) {
                  imageUrls = await Promise.all(selectedFiles.map(f => uploadImageToFirebase(f)));
                }
                
                // Handle custom terms file upload if present
                let uploadedCustomTermsUrl = '';
                if (customTermsFile && !useStandardTerms) {
                  uploadedCustomTermsUrl = await uploadImageToFirebase(customTermsFile);
                }
                const data = {
                  prizeName,
                  quantityAvailable,
                  fullDescription,
                  tags,
                  prizeCategory,
                  fulfillmentMethod,
                  deliveryTimeline,
                  claimWindow,
                  eligibleRegions: eligibleRegions.join(', '),
                  retailValueUSD,
                  ageRestriction,
                  termsConditionsUrl,
                  stockDate,
                  additionalInfo,
                  pickupRequired,
                  idRequired,
                  images: imageUrls.length > 0 ? imageUrls : files.map(f => f.url),
                  thumbnail: imageUrls[0] || files[0]?.url || null,
                  keywords: [keyword1, keyword2, keyword3].filter(Boolean),
                  breakEvenValue,
                  useStandardTerms,
                  customTermsUrl: uploadedCustomTermsUrl || customTermsUrl,
                  customTermsType,
                  ...(selectedSponsor && { sponsorId: selectedSponsor.id }),
                };
                console.log(data)
                const validationErrors = validate(data);
                setErrors(validationErrors);
                console.log(Object.keys(validationErrors).length)

                if (Object.keys(validationErrors).length === 0) {
                  await onSubmit({...data, status: "Active"});
                }
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? (
              <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Saving...</span>
            ) : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;