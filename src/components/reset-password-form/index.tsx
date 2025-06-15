import React, { useState } from "react";
import { auth } from "../../../config/firebase.config"; // Import Firebase auth
import { confirmPasswordReset } from "firebase/auth";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const { oobCode } = router.query; // Get the password reset code from the URL
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oobCode) {
      toast.error("Invalid or missing reset code.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmPasswordReset(auth, oobCode as string, newPassword);
      toast.success("Password reset successful! You can now log in.");
      router.push("/login"); // Redirect to the login page after a successful reset
    } catch (error: any) {
      toast.error(
        error.message || "Failed to reset password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h1 className="text-2xl font-semibold mb-4">Reset Password</h1>
      <form onSubmit={handleResetPassword} className="reset-password-form">
        <div className="mb-4">
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-primary-light"
            placeholder="Enter your new password"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-md transition disabled:opacity-50"
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
