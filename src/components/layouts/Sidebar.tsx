import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import LogoutButton from "../common/logout-button";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SidebarProps { }

const Sidebar: React.FC<SidebarProps> = () => {
  const router = useRouter();

  const [isActive, setIsActive] = useState(false);
  const toggleDarkMode = () => {
    setIsActive((prev) => !prev);
  };

  useEffect(() => {
    if (isActive) {
      document.body.classList.remove("active-body");
    }
  }, [isActive]);

  return (
    <div className="sidebar-menu bg-white max-w-[250px] h-screen p-4 lg:py-8 fixed top-0 lg:left-0 left-[-100%] z-40 w-full flex flex-col">
      <div className="flex justify-center items-center mb-6 text-center">
        <Image
          src="/images/logo.svg"
          alt="logo"
          width={162}
          height={44}
          sizes="100vw"
          quality={100}
        />
      </div>
      <ul>
        {SidebarData.map((item) => {
          // Check if the current path starts with the menu item's URL
          const isActive =
            router.pathname === item.url ||
            (item.url !== "/" && router.pathname.startsWith(item.url));

          return (
            <li key={item.id} className="mb-1">
              <Link
                className={
                  isActive ? "active menu-item group" : "menu-item group"
                }
                href={item.url}
                onClick={toggleDarkMode}
              >
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={24}
                  height={24}
                  sizes="100vw"
                  quality={100}
                  className="transition duration-[0.3s] group-hover:brightness-[100]"
                />
                <span>{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <LogoutButton />
    </div>
  );
};

export default Sidebar;

interface SidebarData {
  id: number;
  title: string;
  url: string;
  icon: string;
}

const SidebarData: Array<SidebarData> = [
  {
    id: 1,
    title: "Dashboard",
    url: "/",
    icon: "/images/icon/01.svg",
  },
  {
    id: 2,
    title: "Prize Database",
    url: "/prize-database",
    icon: "/images/icon/02.svg",
  },
  {
    id: 3,
    title: "Game Creation",
    url: "/raffle-creation",
    icon: "/images/icon/03.svg",
  },
  {
    id: 4,
    title: "User Management",
    url: "/user-management",
    icon: "/images/icon/04.svg",
  },
  {
    id: 5,
    title: "Prize Image Library",
    url: "/prize-image-library",
    icon: "/images/icon/05.svg",
  },
  {
    id: 6,
    title: "Notifications",
    url: "/notifications",
    icon: "/images/icon/06.svg",
  },
  {
    id: 7,
    title: "Game Images",
    url: "/game-images",
    icon: "/images/icon/05.svg",
  },
  {
    id: 8,
    title: "Partner Management",
    url: "/partner-management",
    icon: "/images/icon/04.svg",
  },
];
