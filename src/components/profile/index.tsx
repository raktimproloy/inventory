import { useEffect, useState } from "react";
import { onAuthStateChanged, updateProfile, User } from "firebase/auth";
import { auth, db, storage } from "../../../config/firebase.config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/router";

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState({
    name: "",
    profilePicture: "",
    email: "",
    credits: 0,
    isBanned: false,
    age: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileData({
            name: data.name || "",
            age: data.age?.toString() || "",
            profilePicture: data.profilePicture || currentUser.photoURL || "",
            email: data.email || currentUser.email || "",
            credits: data.credits || 0,
            isBanned: data.isBanned || false,
            phone: data.phone || currentUser.phoneNumber || "",
          });
        }
      } else {
        router.push("/profile");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
      const file = e.target.files[0];
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setProfileData((prev) => ({
        ...prev,
        profilePicture: downloadURL,
      }));

      // Update Firebase auth profile pic
      await updateProfile(user, { photoURL: downloadURL });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    await setDoc(
      userDocRef,
      {
        name: profileData.name,
        age: Number(profileData.age),
        profilePicture: profileData.profilePicture,
        email: profileData.email,
        phone: profileData.phone,
        uid: user.uid,
      },
      { merge: true }
    );

    await updateProfile(user, {
      displayName: profileData.name,
      photoURL: profileData.profilePicture,
    });

    alert("Profile Updated Successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
      <h2 className="text-[18px] font-semibold text-dark mb-8">Profile</h2>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
        <div className="form-group col-span-2">
          <div className="form-control relative flex flex-col items-center justify-center">
            <div className="absolute left-4 top-[50%] translate-y-[-50%]">
              <img
                src={profileData.profilePicture || "/images/Avatars.png"}
                alt="Profile Picture"
                className="w-[140px] h-[110px] object-fill rounded"
              />
            </div>

            <label
              htmlFor="file-upload"
              className="cursor-pointer !flex flex-col justify-center items-center text-center"
            >
              <img src="/images/icon/upload-icon.png" alt="icon" />
              <span className="mt-3 text-sm font-normal text-gray block">
                <strong className="text-primary font-semibold">Click to upload </strong>
                or drag and drop
              </span>
              <span className="text-gray-500 text-sm text-center mt-2">
                SVG, PNG, JPG, or GIF (max: 800x400px)
              </span>
              <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={profileData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={profileData.age}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={profileData.email}
            disabled
            className="form-control cursor-not-allowed"
          />
        </div>
        <div className="form-group">
          <label>Credit</label>
          <input
            type="text"
            value={`Credits: ${profileData.credits}`}
            disabled
            className="form-control cursor-not-allowed"
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={profileData.phone}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Banned</label>
          <input
            type="text"
            value={`Banned: ${profileData.isBanned ? "Yes" : "No"}`}
            disabled
            className="form-control cursor-not-allowed"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        className="mt-6 bg-primary text-white py-2 rounded w-40"
      >
        Save Changes
      </button>
    </div>
  );
};

export default ProfilePage;
