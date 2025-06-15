import React, { useState } from "react";
import { auth } from "../../../config/firebase.config"; // Import Firebase auth
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`, // Redirect to this route after clicking the email link
        handleCodeInApp: true, // Ensures the link is handled in the app
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      toast.success("Password reset email sent! Please check your inbox.");
      setEmail("");
    } catch (error: any) {
      toast.error(
        error.message || "Failed to send password reset email. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h1 className="text-2xl font-semibold mb-4">Forgot Password</h1>
      <form onSubmit={handlePasswordReset} className="forgot-password-form">
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-primary-light"
            placeholder="Enter your email address"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-md transition disabled:opacity-50"
        >
          {isSubmitting ? "Sending..." : "Send Password Reset Email"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
