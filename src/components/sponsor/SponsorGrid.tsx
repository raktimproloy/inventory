import React, { useEffect, useState } from "react";
import { getSponsors, Sponsor } from "../../../service/sponsorService";
import Dropdown from "../common/dropdown";
import ConfirmationModal from "../common/modal";
import Image from "next/image";
import { useRouter } from "next/router";

const SponsorGrid: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<{ open: boolean; sponsor: Sponsor | null }>({ open: false, sponsor: null });
  const [editModal, setEditModal] = useState<{ open: boolean; sponsor: Sponsor | null }>({ open: false, sponsor: null });
  const router = useRouter();

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
    // TODO: Implement delete logic
    setIsDeleteModalOpen(false);
    setSelectedSponsorId(null);
    fetchSponsors();
  };

  const handleView = (sponsor: Sponsor) => {
    setViewModal({ open: true, sponsor });
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditModal({ open: true, sponsor });
  };

  const handleThumbnailClick = (id: string) => {
    router.push(`/sponsor-library/view/${id}`);
  };

  return (
    <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
      <h1 className="text-[18px] font-semibold text-dark mb-8">Sponsor Library</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className=" flex flex-col items-center group min-h-[210px]"
          >
            

            {/* Thumbnail */}
            <div
              className="w-[100%] h-[100%] rounded bg-white border border-[#E4E7EC] flex items-center justify-center mb-4 cursor-pointer relative"
              style={{ marginTop: '8px', marginBottom: '18px' }}
              title="View Sponsor"
            >
              {sponsor.logo && sponsor.logo[0] ? (
                <Image src={sponsor.logo[0]} alt={sponsor.sponsorName} width={1000} height={1000} className="object-contain max-h-[60%] max-w-[100%]" onClick={() => handleThumbnailClick(sponsor.id)} />
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
              <div className="w-24 h-24 rounded-full border border-[#D0D5DD] overflow-hidden mb-4 bg-gray-50 flex items-center justify-center">
                {viewModal.sponsor.logo && viewModal.sponsor.logo[0] ? (
                  <Image src={viewModal.sponsor.logo[0]} alt={viewModal.sponsor.sponsorName} width={96} height={96} className="object-contain w-full h-full" />
                ) : (
                  <span className="text-gray-400 text-2xl">?</span>
                )}
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold text-dark block mb-2">{viewModal.sponsor.sponsorName}</span>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {viewModal.sponsor.logo && viewModal.sponsor.logo.map((logo, idx) => (
                    <Image key={idx} src={logo} alt={`logo-${idx}`} width={48} height={48} className="object-contain rounded border" />
                  ))}
                </div>
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
              <div className="w-24 h-24 rounded-full border border-[#D0D5DD] overflow-hidden mb-4 bg-gray-50 flex items-center justify-center">
                {editModal.sponsor.logo && editModal.sponsor.logo[0] ? (
                  <Image src={editModal.sponsor.logo[0]} alt={editModal.sponsor.sponsorName} width={96} height={96} className="object-contain w-full h-full" />
                ) : (
                  <span className="text-gray-400 text-2xl">?</span>
                )}
              </div>
              <div className="text-center w-full">
                <input
                  className="form-control w-full text-lg font-semibold text-dark block mb-2 text-center border border-[#E4E7EC] rounded-lg px-2 py-1"
                  value={editModal.sponsor.sponsorName}
                  onChange={e => setEditModal(modal => modal.sponsor ? { ...modal, sponsor: { ...modal.sponsor, sponsorName: e.target.value } } : modal)}
                />
                {/* Add more editable fields as needed */}
                <button className="mt-4 px-4 py-2 bg-primary text-white rounded" onClick={() => setEditModal({ open: false, sponsor: null })}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorGrid; 