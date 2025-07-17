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
  eligibleRegions: string;
  pickupRequired: boolean;
  retailValueUSD: string;
  ageRestriction: string;
  termsConditionsUrl: string;
  idRequired: boolean;
  additionalInfo: string;
  thumbnail?: string | null;
  keywords: string[];
  sponsorId?: string; // <-- add sponsorId
  breakEvenValue: number;
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
      return urls.length > 0 ? urls.map(url => ({ url })) : [{ url: "/images/laptop.webp" }];
    }
    return [{ url: "/images/laptop.webp" }];
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
  const [eligibleRegions, setEligibleRegions] = useState('');
  const [ageRestriction, setAgeRestriction] = useState('');
  const [termsConditionsUrl, setTermsConditionsUrl] = useState('');
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
      setEligibleRegions(initialData.eligibleRegions);
      setAgeRestriction(initialData.ageRestriction);
      setTermsConditionsUrl(initialData.termsConditionsUrl);
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
    if (!data.eligibleRegions) newErrors.eligibleRegions = 'Eligible Regions is required';
    if (!retailValueUSD) newErrors.retailValueUSD = 'Retail Value (USD) is required';
    if (!data.ageRestriction) newErrors.ageRestriction = 'Age Restriction is required';
    if (!data.termsConditionsUrl) newErrors.termsConditionsUrl = 'Terms & Conditions URL is required';
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
              <input 
                className={`form-control ${errors.deliveryTimeline ? 'border-red-500' : ''}`} 
                type="text" 
                id="deliveryTimeline" 
                placeholder="e.g., 3-5 business days" 
                value={deliveryTimeline}
                onChange={e => setDeliveryTimeline(e.target.value)}
              />
              {errors.deliveryTimeline && <p className="text-red-500 text-sm mt-1">{errors.deliveryTimeline}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="claimWindow" className="block text-sm font-medium text-gray-700 mb-1">Claim Window*</label>
              <input 
                className={`form-control ${errors.claimWindow ? 'border-red-500' : ''}`} 
                type="text" 
                id="claimWindow" 
                placeholder="e.g., 30 days" 
                value={claimWindow}
                onChange={e => setClaimWindow(e.target.value)}
              />
              {errors.claimWindow && <p className="text-red-500 text-sm mt-1">{errors.claimWindow}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="eligibleRegions" className="block text-sm font-medium text-gray-700 mb-1">Eligible Regions*</label>
              <select 
                id="eligibleRegions" 
                className={`form-control ${errors.eligibleRegions ? 'border-red-500' : ''}`} 
                value={eligibleRegions}
                onChange={e => setEligibleRegions(e.target.value)}
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
              {errors.eligibleRegions && <p className="text-red-500 text-sm mt-1">{errors.eligibleRegions}</p>}
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
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4 md:gap-6">
            <div className="form-group">
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
            <div className="form-group">
              <label htmlFor="termsConditionsUrl" className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions URL*</label>
              <input 
                className={`form-control ${errors.termsConditionsUrl ? 'border-red-500' : ''}`} 
                type="url" 
                id="termsConditionsUrl" 
                placeholder="https://example.com/terms" 
                value={termsConditionsUrl}
                onChange={e => setTermsConditionsUrl(e.target.value)}
              />
              {errors.termsConditionsUrl && <p className="text-red-500 text-sm mt-1">{errors.termsConditionsUrl}</p>}
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
                const data = {
                  prizeName,
                  quantityAvailable,
                  fullDescription,
                  tags,
                  prizeCategory,
                  fulfillmentMethod,
                  deliveryTimeline,
                  claimWindow,
                  eligibleRegions,
                  retailValueUSD,
                  ageRestriction,
                  termsConditionsUrl,
                  additionalInfo,
                  pickupRequired,
                  idRequired,
                  images: imageUrls.length > 0 ? imageUrls : files.map(f => f.url),
                  thumbnail: imageUrls[0] || files[0]?.url || null,
                  keywords: [keyword1, keyword2, keyword3].filter(Boolean),
                  breakEvenValue,
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