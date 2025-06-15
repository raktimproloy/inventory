import Image from "next/image";
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CardComponentProps {
    title: string;
    icon: string;
    count : string;
}

const CardComponent: React.FC<CardComponentProps> = ({
    title,
    icon,
    count
}) => {

    return (
        <div className="bg-white rounded-md overflow-hidden border border-[#D0D5DD] p-6">
            <div className="w-10 h-10 bg-primary-light rounded-md flex justify-center items-center mb-4">
                <Image
                    src={icon}
                    alt="icon"
                    width={24}
                    height={ 24 }
                    sizes="100vw"
                    quality={100}
                />
            </div>
            <h5 className="text-base font-medium text-gray mb-1">{ title }</h5>
            <h2 className="text-3xl font-semibold text-dark">{ count }</h2>
        </div>
	);
};

export default CardComponent;

interface CardComponentData {
	id: number;
    title: string;
	url: string;
	icon: string;
}

const CardComponentData: Array<CardComponentData> = [
	{
		id: 1,
        title: "Dashboard",
		url: "/",
		icon: "/images/icon/01.svg"
	},
	{
		id: 2,
        title: "Inventory Database",
		url: "/database",
		icon: "/images/icon/01.svg"
	},
	{
		id: 3,
        title: "Raffle Creation",
		url: "/raffle",
		icon: "/images/icon/01.svg"
	},
	{
		id: 4,
        title: "User Management",
		url: "/user",
		icon: "/images/icon/01.svg"
	},
	{
		id: 5,
        title: "Image Library",
		url: "/library",
		icon: "/images/icon/01.svg"
	},
	{
		id: 6,
        title: "Notifications",
		url: "/notifications",
		icon: "/images/icon/01.svg"
	},
]
