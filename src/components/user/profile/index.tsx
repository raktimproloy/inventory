import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../config/firebase.config";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  userType: string;
  kycRequest: string;
  profilePicture?: string | null;
  telContact?: string;
  gender?: string;
  location?: string;
  birthday?: string;
  timeZone?: string;
  kycDocument?: string;
  createdAt: any;
  isBanned: boolean;
}

const UserProfile: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycPreview, setKycPreview] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "",
    kycRequest: "",
    telContact: "",
    gender: "",
    location: "",
    birthday: "",
    timeZone: "",
  });

  useEffect(() => {
    if (id && typeof id === "string") {
      loadUserProfile(id);
    }
  }, [id]);

  const loadUserProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        const profileData = {
          ...userData,
          id: userDoc.id,
        };
        
        setProfile(profileData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          userType: userData.userType || "",
          kycRequest: userData.kycRequest || "",
          telContact: userData.telContact || "",
          gender: userData.gender || "",
          location: userData.location || "",
          birthday: userData.birthday || "",
          timeZone: userData.timeZone || "",
        });
      } else {
        toast.error("User not found!");
        router.push("/user-management");
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      toast.error("Failed to load user profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKycFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        setKycFile(file);
        setKycPreview(URL.createObjectURL(file));
        
        // Simulate upload delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success("File uploaded successfully!");
      } catch (error) {
        toast.error("Failed to upload file");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setIsUploadingProfile(true);
      try {
        setProfileImageFile(file);
        setProfileImagePreview(URL.createObjectURL(file));
        
        // Simulate upload delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success("Profile image uploaded successfully!");
      } catch (error) {
        toast.error("Failed to upload profile image");
      } finally {
        setIsUploadingProfile(false);
      }
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      let kycDocumentUrl = profile.kycDocument || "";
      let profileImageUrl = profile.profilePicture || "";

      // Upload KYC document if new file is selected
      if (kycFile) {
        const storageRef = ref(storage, `kyc_documents/${profile.id}_${Date.now()}`);
        await uploadBytes(storageRef, kycFile);
        kycDocumentUrl = await getDownloadURL(storageRef);
      }

      // Upload profile image if new file is selected
      if (profileImageFile) {
        const storageRef = ref(storage, `profile_pictures/${profile.id}_${Date.now()}`);
        await uploadBytes(storageRef, profileImageFile);
        profileImageUrl = await getDownloadURL(storageRef);
      }

      // Update user document
      const userRef = doc(db, "users", profile.id);
      await updateDoc(userRef, {
        ...formData,
        profilePicture: profileImageUrl,
        kycDocument: kycDocumentUrl,
        updatedAt: new Date(),
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      
      // Reload profile data
      await loadUserProfile(profile.id);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        userType: profile.userType || "",
        kycRequest: profile.kycRequest || "",
        telContact: profile.telContact || "",
        gender: profile.gender || "",
        location: profile.location || "",
        birthday: profile.birthday || "",
        timeZone: profile.timeZone || "",
      });
    }
    setIsEditing(false);
    setKycFile(null);
    setKycPreview(null);
    setProfileImageFile(null);
    setProfileImagePreview(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">User not found</div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="overflow-hidden">
          {/* Header Section with Light Grey Bar */}
          <div className="bg-gray-200 h-12 sm:h-16 flex items-center justify-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Profile Info Section */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {profileImagePreview ? (
                      <Image
                        src={profileImagePreview}
                        alt={profile.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : profile.profilePicture ? (
                      <Image
                        src={profile.profilePicture}
                        alt={profile.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => document.getElementById('profile-image-upload')?.click()}
                      disabled={isUploadingProfile}
                      className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                      title="Update profile picture"
                    >
                      {isUploadingProfile ? (
                        <svg className="animate-spin h-2.5 w-2.5 sm:h-3 sm:w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                      ) : (
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{profile.name}</h1>
                  <p className="text-sm sm:text-base text-gray-600 truncate">{profile.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full sm:w-auto px-4 sm:px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>
        </div>
                 {/* Profile Form */}
         <form className="space-y-4 sm:space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
             {/* Left Column */}
             <div className="space-y-3 sm:space-y-4">
               <div className="form-group">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                 <input
                   type="text"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   disabled={!isEditing}
                   className={`form-control ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                   placeholder="Your First Name"
                 />
               </div>

               <div className="form-group">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                 <select
                   value={formData.gender}
                   onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                   disabled={!isEditing}
                   className={`form-control ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                 >
                   <option value="">Please select</option>
                   <option value="male">Male</option>
                   <option value="female">Female</option>
                   <option value="other">Other</option>
                 </select>
               </div>

               <div className="form-group">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                 <input
                   type="date"
                   value={formData.birthday}
                   onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                   disabled={!isEditing}
                   className={`form-control ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                 />
               </div>
             </div>

             {/* Right Column */}
             <div className="space-y-3 sm:space-y-4">
               <div className="form-group">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Tel Contact</label>
                 <input
                   type="tel"
                   value={formData.telContact}
                   onChange={(e) => setFormData({ ...formData, telContact: e.target.value })}
                   disabled={!isEditing}
                   className={`form-control ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                   placeholder="868 123 4567"
                 />
               </div>

               <div className="form-group">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                 <select
                   value={formData.location}
                   onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                   disabled={!isEditing}
                   className={`form-control ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                 >
                   <option value="">Please Select</option>
                   <option value="arima">Arima</option>
                   <option value="chaguanas">Chaguanas</option>
                   <option value="port-of-spain">Port of Spain</option>
                   <option value="san-fernando">San Fernando</option>
                   <option value="scarborough">Scarborough</option>
                   <option value="other">Other</option>
                 </select>
               </div>

               <div className="form-group">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                 <select
                   value={formData.timeZone}
                   onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                   disabled={!isEditing}
                   className={`form-control ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                 >
                   <option value="">Please Select</option>
                   <option value="AST">Atlantic Standard Time (AST)</option>
                   <option value="EST">Eastern Standard Time (EST)</option>
                   <option value="PST">Pacific Standard Time (PST)</option>
                   <option value="UTC">UTC</option>
                 </select>
               </div>
             </div>
           </div>

                     {/* Documents Section */}
           <div className="border-t pt-4 sm:pt-6">
             <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Documents</h3>
             
             <div className="space-y-3 sm:space-y-4">
               {/* Existing KYC Document */}
               {profile.kycDocument && (
                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2 sm:gap-0">
                   <div className="flex items-center space-x-3">
                     <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                     </svg>
                     <div className="min-w-0 flex-1">
                       <p className="font-medium text-gray-900 truncate">KYC Verification</p>
                       <p className="text-xs sm:text-sm text-gray-500">1 month ago</p>
                     </div>
                   </div>
                   {isEditing && (
                     <button
                       type="button"
                       onClick={() => setKycFile(null)}
                       className="text-red-500 hover:text-red-700 text-sm font-medium self-end sm:self-auto"
                     >
                       Remove
                     </button>
                   )}
                 </div>
               )}

                              {/* Add Documents Button */}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => document.getElementById('kyc-upload')?.click()}
                    disabled={isUploading}
                    className={`w-full sm:w-auto px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-medium flex items-center justify-center space-x-2 ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      '+Add Documents'
                    )}
                  </button>
                )}

                             {/* Hidden file input */}
               {isEditing && (
                 <input
                   type="file"
                   accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                   onChange={handleKycFileChange}
                   className="hidden"
                   id="kyc-upload"
                 />
               )}

               {/* Hidden profile image input */}
               {isEditing && (
                 <input
                   type="file"
                   accept="image/*"
                   onChange={handleProfileImageChange}
                   className="hidden"
                   id="profile-image-upload"
                 />
               )}
            </div>
          </div>

                                           {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`w-full sm:w-auto px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium flex items-center justify-center space-x-2 ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            )}
        </form>
      </div>
    </div>
  );
};

export default UserProfile; 