import React from "react";
import Image from "next/image";
import Link from "next/link";
import { title } from "process";
interface Option {
  id: string;
  title: string;
  image: string;
  qty: number;
}
interface SmallTableProps {
    options: Array<Option>
}

const SmallTable: React.FC<SmallTableProps> = ({
    options
}) => {
    const limitWords = (text: string, wordLimit = 3): string => {
        if (!text) return '';
        const words = text.trim().split(/\s+/);
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(" ") + "...";
    };
    return (
        <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white">
            <div className="flex justify-between items-center">
                <h3 className="text-[18px] font-semibold text-dark">Inventory Stock</h3>
                <Link className="text-sm font-semibold text-primary" href="/inventory-database">See All</Link>
            </div>
            <div className="overflow-auto">
                <table className="w-full mt-2">
                <tbody className="divide-y divide-[#D9DADF]">
                    {options.map(item => (
                        <tr key={item.id}>
                            <td className="p-3">
                                <div className="bg-primary-light h-10 w-10 overflow-hidden rounded-lg">
                                    <Image
                                    src={item.image || '/images/laptop.webp'}
                                    alt="icon"
                                    width={40}
                                    height={40}
                                    sizes="100vw"
                                    quality={100}
                                    className="object-cover h-10"
                                />
                                </div>
                            </td>
                            <td className="p-3">
                                <strong className="text-sm font-medium text-dark block line-clamp-1">{limitWords(item.title)}</strong>
                                <p className="text-sm text-normal text-gray">Remaining Quantity :
                                    {item.qty}
                                </p>
                            </td>
                            <td className="p-3">
                                <span className="flex items-center justify-center font-medium text-[12px] border border-[#D12A2A] text-[#D12A2A] px-3 p-1 gap-1 rounded-full">
                                    <Image
                                        src="/images/icon/5.svg"
                                        alt="icon"
                                        width={12}
                                        height={ 12 }
                                        sizes="100vw"
                                        quality={100}
                                    />
                                    Low
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
	);
};

export default SmallTable;
