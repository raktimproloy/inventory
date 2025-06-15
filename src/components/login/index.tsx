// Login.tsx
import { useState } from "react";
import { auth, googleProvider, facebookProvider } from "../../../config/firebase.config"; // Import Firebase auth
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // Handle email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // Redirect after successful login
    } catch (err: any) {
      setError("Invalid email or password.");
    }
  };

  // Handle Google login
  // const handleGoogleLogin = async () => {
  //   try {
  //     await signInWithPopup(auth, googleProvider);
  //     router.push("/");
  //   } catch (err: any) {
  //     setError("Google login failed.");
  //   }
  // };

  // Handle Facebook login
  // const handleFacebookLogin = async () => {
  //   try {
  //     await signInWithPopup(auth, facebookProvider);
  //     router.push("/");
  //     toast.success("Login Success")
  //   } catch (err: any) {
  //     setError("Facebook login failed.");
  //     toast.error("Login failed")
  //   }
  // };

  return (
    <div className="bg-[#F3F3F5] flex items-center">
      <div className="basis-6/12 bg-white lg:rounded-[65px] overflow-hidden h-[100vh]">
        <div className="p-4 lg:p-8 pb-8 md:mb-28">
            <Image src="/images/logo.svg" alt="logo" height={30} width={150}/>
        </div>
        <div className="max-w-[360px] mx-auto">
          <h2 className="md:text-4xl text-xl text-[#101828] font-semibold mb-2">Log in</h2>
          <p className="mb-8">Welcome back! Please enter your details.</p>
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          <div className="mb-5">
            <p className="mb-1">Email</p>
            <input
              type="email"
              className="block w-full p-3 mb-4 border border-[#D0D5DD] rounded-[8px] outline-none"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <p className="mb-1">Password</p>
              <input
                type="password"
                className="block w-full p-3 mb-4 border border-[#D0D5DD] rounded-[8px] outline-none"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
          </div>
          <div className="mb-5 flex justify-between items-center">
            <label className="flex gap-2 text-xs">
              <input type="checkbox" />
              Remember for 30 days
            </label>
            <Link className="text-[#DC5326] text-xs font-semibold" href='/forgot-password'>Forgot Password</Link>
          </div>
           <button
            onClick={handleLogin}
            className="w-full p-3 bg-[#DC5326] text-white rounded-lg " > Login </button>
          <div className="flex justify-between items-center gap-2 mb-5 mt-5">
            <span className="block bg-[#B3B2B2] h-[1px] w-6/12"></span>
            <span>or</span>
            <span className="block bg-[#B3B2B2] h-[1px] w-6/12"></span>
          </div>
          {/* <button
            onClick={handleGoogleLogin}
            className="w-full p-3 bg-white border border-[#D0D5DD] rounded-lg flex items-center justify-center gap-2"
          >
            <Image src="/images/google.svg" alt="icon" height={24} width={24}/>
            Sign in with Google
          </button> */}
          {/* <button
            onClick={handleFacebookLogin}
            className="w-full p-3 bg-white border border-[#D0D5DD] rounded-lg flex items-center justify-center gap-2 mt-5"
          >
            <Image src="/images/linkedin.svg" alt="icon" height={24} width={24}/>
            Sign in with LinkedIn
          </button> */}

          <p className="mt-4 text-center">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#DC5326] hover:underline">
              Sign up
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

export default Login;
