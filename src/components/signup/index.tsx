// Signup.tsx
import { useState } from "react";
import { auth, googleProvider, facebookProvider } from "../../../config/firebase.config"; // Import Firebase auth
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

const Signup = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // Handle email/password signup
  const handleSignup = async (e: React.FormEvent) => {
    // console.log(name, email, password);
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
    <div className="bg-[#F3F3F5] flex items-center">
      <div className="basis-6/12 bg-white lg:rounded-[65px] overflow-hidden h-[100vh]">
        <div className="p-4 lg:p-8 pb-8 md:mb-28">
            <Image src="/images/logo.svg" alt="logo" height={30} width={150}/>
        </div>
        <div className="max-w-[360px] mx-auto">
          <h2 className="md:text-4xl text-xl text-[#101828] font-semibold mb-2">Sign up</h2>
          <p className="mb-8">Start your 30-day free trial</p>
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          <div className="mb-5">
            <p className="mb-1">Full Name*</p>
            <input
              type="text"
              className="block w-full p-3 mb-4 border border-[#D0D5DD] rounded-[8px] outline-none"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <p className="mb-1">Email*</p>
            <input
              type="email"
              className="block w-full p-3 mb-4 border border-[#D0D5DD] rounded-[8px] outline-none"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <p className="mb-1">Password*</p>
              <input
                type="password"
                className="block w-full p-3 mb-0 border border-[#D0D5DD] rounded-[8px] outline-none"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
          <p className="mb-1 pt-0 mt-0">Must be at least 8 characters</p>
          </div>
           <button
            onClick={handleSignup}
            className="w-full p-3 bg-[#DC5326] text-white rounded-lg " > Sign Up </button>
          <div className="flex justify-between items-center gap-2 mb-5 mt-5">
            <span className="block bg-[#B3B2B2] h-[1px] w-6/12"></span>
            <span>or</span>
            <span className="block bg-[#B3B2B2] h-[1px] w-6/12"></span>
          </div>
          {/* <button
            onClick={handleGoogleSignup}
            className="w-full p-3 bg-white border border-[#D0D5DD] rounded-lg flex items-center justify-center gap-2"
          >
            <Image src="/images/google.svg" alt="icon" height={24} width={24}/>
            Sign up with Google
          </button> */}
          {/* <button
            onClick={handleFacebookSignup}
            className="w-full p-3 bg-white border border-[#D0D5DD] rounded-lg flex items-center justify-center gap-2 mt-5"
          >
            <Image src="/images/linkedin.svg" alt="icon" height={24} width={24}/>
            Sign up with LinkedIn
          </button> */}

          <p className="mt-4 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-[#DC5326] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
      <div className="basis-6/12 overflow-hidden">
        <Image src="/images/login.jpg" alt="img" height={1024} width={720} className="max-w-[720px] ml-auto"/>
      </div>
    </div>
  );
};

export default Signup;
