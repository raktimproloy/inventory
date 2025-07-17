import React, { useEffect, useState } from "react";
import { getSponsors, Sponsor, uploadSponsorImages, deleteSponsor } from "../../../service/sponsorService";
import Dropdown from "../common/dropdown";
import ConfirmationModal from "../common/modal";
import Image from "next/image";
import { useRouter } from "next/router";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase.config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../common/pagination";

const SponsorGrid: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<{ open: boolean; sponsor: Sponsor | null }>({ open: false, sponsor: null });
  const [editModal, setEditModal] = useState<{ open: boolean; sponsor: Sponsor | null }>({ open: false, sponsor: null });
  const [editName, setEditName] = useState("");
  const [editLogos, setEditLogos] = useState<File[]>([]);
  const [editLogoPreviews, setEditLogoPreviews] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // You can adjust this as needed

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    const data = await getSponsors();
    setSponsors(data);
  };

  const handleDropdownToggle = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const handleDelete = (id: string) => {
    setSelectedSponsorId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSponsorId) return;
    try {
      await deleteSponsor(selectedSponsorId);
      toast.success("Sponsor deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete sponsor. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedSponsorId(null);
      fetchSponsors();
    }
  };

  const handleView = (sponsor: Sponsor) => {
    setViewModal({ open: true, sponsor });
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditModal({ open: true, sponsor });
    setEditName(sponsor.sponsorName);
    setEditLogos([]);
    setEditLogoPreviews([]);
  };

  const handleThumbnailClick = (id: string) => {
    router.push(`/sponsor-library/view/${id}`);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).slice(0, 2) : [];
    setEditLogos(files);
    setEditLogoPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleEditSave = async () => {
    if (!editModal.sponsor) return;
    setEditLoading(true);
    try {
      let logoUrls = editModal.sponsor.logo;
      if (editLogos.length > 0) {
        logoUrls = await uploadSponsorImages(editLogos);
      }
      const docRef = doc(db, "sponsors", editModal.sponsor.id);
      await updateDoc(docRef, {
        sponsorName: editName,
        logo: logoUrls,
      });
      toast.success("Sponsor updated successfully!");
      setEditModal({ open: false, sponsor: null });
      setEditLogos([]);
      setEditLogoPreviews([]);
      fetchSponsors();
    } catch (error) {
      toast.error("Failed to update sponsor. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  // Calculate paginated sponsors
  const totalPages = Math.ceil(sponsors.length / itemsPerPage);
  const paginatedSponsors = sponsors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[18px] font-semibold text-dark">Sponsor Library</h1>
        <button className="inline-flex items-center gap-2 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium">
          <svg width="20" viewBox="0 0 20 20">
            <use href="/images/sprite.svg#svg-filter"></use>
          </svg>
          <span>Filter</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedSponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className=" flex flex-col items-center group min-h-[210px]"
          >
            {/* Thumbnail */}
            <div
              className="w-[100%] h-[100%] rounded-t-xl bg-white border-2 border-gray-500 flex items-center justify-center mb-4 cursor-pointer relative"
              style={{ marginTop: '8px', marginBottom: '18px' }}
              title="View Sponsor"
            >
              {sponsor.logo && sponsor.logo[0] ? (
                <Image src={sponsor.logo[0]} alt={sponsor.sponsorName} width={1000} height={1000} className="object-contain rounded-t-xl max-h-[100%] max-w-[100%]" onClick={() => handleThumbnailClick(sponsor.id)} />
              ) : (
                <span className="text-gray-400 text-2xl">?</span>
              )}
              {/* 3-dot Dropdown */}
              <div className="absolute right-3 top-3 z-10">
                <Dropdown
                  id={sponsor.id}
                  isOpen={openDropdown === sponsor.id}
                  toggleDropdown={() => handleDropdownToggle(sponsor.id)}
                  options={[
                    { id: 1, name: '/images/icon/eye1.svg', title: 'View', action: () => handleView(sponsor) },
                    { id: 2, name: '/images/icon/edit1.svg', title: 'Edit', action: () => handleEdit(sponsor) },
                    { id: 3, name: '/images/icon/delete1.svg', title: 'Delete', action: () => handleDelete(sponsor.id) },
                  ]}
                />
              </div>
            </div>
            {/* Sponsor Name */}
            <div className="text-center w-full">
              <span className="text-base font-medium text-dark block truncate max-w-[140px] mx-auto" style={{ marginTop: '0px' }}>{sponsor.sponsorName}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Delete Sponsor"
      />
      {/* View Modal */}
      {viewModal.open && viewModal.sponsor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#D0D5DD] relative">
            <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={() => setViewModal({ open: false, sponsor: null })}>&times;</button>
            <div className="flex flex-col items-center">
              <div className="flex gap-2 mb-4">
                {viewModal.sponsor.logo && viewModal.sponsor.logo.length > 0 ? (
                  viewModal.sponsor.logo.map((logo, idx) => (
                    <Image key={idx} src={logo} alt={`logo-${idx}`} width={200} height={200} className="object-contain rounded border" />
                  ))
                ) : (
                  <span className="text-gray-400 text-2xl">?</span>
                )}
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold text-dark block mb-2"> Sponsor Name: {viewModal.sponsor.sponsorName}</span>
                <div className="text-gray-500 text-sm mt-2">Total Prizes: {viewModal.sponsor.prizesCreation ? viewModal.sponsor.prizesCreation.length : 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editModal.open && editModal.sponsor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#D0D5DD] relative">
            <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={() => setEditModal({ open: false, sponsor: null })}>&times;</button>
            <div className="flex flex-col items-center">
              <div className="flex gap-2 mb-4">
                {/* Show previews for new logos, else current logos */}
                {editLogoPreviews.length > 0
                  ? editLogoPreviews.map((url, idx) => (
                      <Image key={idx} src={url} alt={`preview-${idx}`} width={64} height={64} className="object-contain rounded border" />
                    ))
                  : editModal.sponsor.logo && editModal.sponsor.logo.length > 0
                  ? editModal.sponsor.logo.map((logo, idx) => (
                      <Image key={idx} src={logo} alt={`logo-${idx}`} width={64} height={64} className="object-contain rounded border" />
                    ))
                  : <span className="text-gray-400 text-2xl">?</span>
                }
              </div>
              <div className="text-center w-full">
                <input
                  className="form-control w-full text-lg font-semibold text-dark block mb-2 text-center border border-[#E4E7EC] rounded-lg px-2 py-1"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  disabled={editLoading}
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleLogoChange}
                  className="form-control w-full mb-2"
                  disabled={editLoading || editLogoPreviews.length >= 2}
                />
                <button
                  className="mt-4 px-4 py-2 bg-primary text-white rounded w-full"
                  onClick={handleEditSave}
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <span className="flex items-center justify-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Saving...</span>
                  ) : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorGrid; 