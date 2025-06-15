import LogoutButton from "@/components/common/logout-button";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../../../config/firebase.config";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NavProps {}

const Nav: React.FC<NavProps> = () => {
 const [isActive, setIsActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const toggleDarkMode = () => {
    setIsActive((prev) => !prev);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isActive) {
      document.body.classList.add("active-body");
    } else {
      document.body.classList.remove("active-body");
    }
  }, [isActive]);

  const profilePicture = currentUser?.photoURL || "/images/Avatars.png";

	return (
		<div className="app-header flex md:p-6 p-4 justify-between items-center bg-white border-b border-[#D0D5DD] fixed top-0 right-0 lg:w-[calc(100%-250px)] z-20 w-full">
		<button className="block lg:hidden"
        onClick={toggleDarkMode}>
			<Image
				alt="icon"
				src="/images/side-menu.svg"
				height={20}
				width={30}
				sizes="100vw"
				quality={100}
			/>
      </button>
			<form className="relative max-w-[320px] w-full">
				<span className="w-5 h-5 absolute top-1/2 left-3 -translate-y-1/2">
					<Image
					src="/images/icon/search.svg"
					alt="logo"
					width={20}
					height={20}
					sizes="100vw"
                    quality={100}
					/>
				</span>
				<input className="p-2 bg-white border border-[#D0D5DD] pl-9 outline-0 w-full" type="text" placeholder="Search..." />
			</form>
			<div className="flex items-center gap-4">
				{/* <Link href="/profile" className="w-10 h-10 block">
					<img className="h-10 w-10"
					src="/images/icon/bell.svg"
					alt="logo"
					/>
				</Link> */}
				<Link href="/profile" className="w-10 h-10 overflow-hidden rounded-full block">
					<img
						src={profilePicture}
						alt="logo"
						className="h-10 w-10 object-cover"
					/>
				</Link>
			</div>
		</div>
	);
};

export default Nav;
