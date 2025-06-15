// components/LogoutButton.tsx
import React from "react";
import { auth } from "../../../../config/firebase.config"; // Use named import
import { useRouter } from "next/router";

const LogoutButton: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Use the `auth` instance to sign out
      console.log("User logged out");
      router.push("/login"); // Redirect to the login page after logout
    } catch (err: any) {
      console.error("Error signing out: ", err.message);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button text-md font-semibold flex items-center gap-2 pt-8 border-[#F2F4F7] border-t w-full mt-auto">
      Log Out
      <img src="/images/icon/log-out.svg" alt="icon" />
    </button>
  );
};

export default LogoutButton;
