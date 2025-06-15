// Signup.tsx
import { useState } from "react";
import { auth, googleProvider, facebookProvider } from "../../../config/firebase.config"; // Import Firebase auth
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/router";

const Signup = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // Handle email/password signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/"); // Redirect after successful signup
    } catch (err: any) {
      setError("Error creating account. Please try again.");
    }
  };

  // Handle Google signup
  // const handleGoogleSignup = async () => {
  //   try {
  //     await signInWithPopup(auth, googleProvider);
  //     router.push("/");
  //   } catch (err: any) {
  //     setError("Google signup failed.");
  //   }
  // };

  // Handle Facebook signup
  // const handleFacebookSignup = async () => {
  //   try {
  //     await signInWithPopup(auth, facebookProvider);
  //     router.push("/");
  //   } catch (err: any) {
  //     setError("Facebook signup failed.");
  //   }
  // };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center mb-4">Sign Up</h2>

        {/* Display error message */}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {/* Email input */}
        <input
          type="email"
          className="block w-full p-3 mb-4 border border-gray-300 rounded-md"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password input */}
        <input
          type="password"
          className="block w-full p-3 mb-4 border border-gray-300 rounded-md"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Signup button */}
        <button
          onClick={handleSignup}
          className="w-full p-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
        >
          Sign Up
        </button>

        {/* Google signup button */}
        {/* <button
          onClick={handleGoogleSignup}
          className="w-full p-3 bg-red-500 text-white rounded-md mt-4 hover:bg-red-600 transition duration-200"
        >
          Sign up with Google
        </button> */}

        {/* Facebook signup button */}
        {/* <button
          onClick={handleFacebookSignup}
          className="w-full p-3 bg-blue-600 text-white rounded-md mt-4 hover:bg-blue-700 transition duration-200"
        >
          Sign up with Facebook
        </button> */}

        {/* Login link */}
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
