import Image from "next/image";
import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  description?: string;
  icon?: string;
  iconAlt?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel",
  description = "Are you sure you want to delete this inventory? This action cannot be undone.",
  icon = "/images/icon/delete-icon.png",
  iconAlt = "Delete"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed text-center inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg p-6 w-96 text-center">
            <Image src={icon} alt={iconAlt} height={50} width={50} className="mx-auto" />
            <h2 className="text-lg font-semibold text-dark my-2">{message}</h2>
            <p className="text-sm font-normal text-gray">{description}</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                    className="items-center gap-4 px-4 py-3 bg-white text-dark border border-[#E4E7EC] rounded-lg text-sm font-medium block"
                    onClick={onClose}
                >
                    {cancelButtonText}
                </button>
                <button
                    className="block px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium"
                    onClick={onConfirm}
                >
                    {confirmButtonText}
                </button>
            </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
