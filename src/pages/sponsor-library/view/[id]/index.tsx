import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ChsHead from "@/components/layouts/ChsHead";
import PrivateRoute from "@/routes/PrivetRoute";
import { fetchUsers } from "../../../../../utility";
import { getSponsors, Sponsor } from "../../../../../service/sponsorService";
import Image from "next/image";
import Dropdown from "@/components/common/dropdown";
import Link from "next/link";

const SponsorViewPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [prizes, setPrizes] = useState<any[]>([]);
    const [sponsor, setSponsor] = useState<Sponsor | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchSponsorAndPrizes(id as string);
        }
    }, [id]);

    const fetchSponsorAndPrizes = async (sponsorId: string) => {
        const [allPrizes, sponsors] = await Promise.all([
            fetchUsers("prize_database"),
            getSponsors(),
        ]);
        const sponsorObj = (sponsors as Sponsor[]).find((s: Sponsor) => s.id === sponsorId) || null;
        setSponsor(sponsorObj);
        // Only show prizes created by this sponsor
        const filtered = allPrizes.filter((p: any) => p.sponsorId === sponsorId);
        setPrizes(filtered);
    };

    const handleDropdownToggle = (id: string) => {
        setOpenDropdown(prev => (prev === id ? null : id));
    };

    const handleView = (prizeId: string) => {
        router.push(`/prize-database/inventory-view/${prizeId}`);
    };
    const handleEdit = (prizeId: string) => {
        router.push(`/prize-database/${prizeId}`);
    };
    const handleCreateGame = (prizeId: string) => {
        router.push(`/raffle-creation/create-raffle?prizeId=${prizeId}`);
    };

    return (
        <PrivateRoute>
            <ChsHead />
            <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full mt-8">
                <h1 className="text-xl font-semibold mb-4">Sponsor: {sponsor?.sponsorName || id}</h1>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F3F3F5] border-b border-t !border-[#D0D5DD]">
                                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Prize Name</th>
                                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Key Details</th>
                                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Price</th>
                                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Stock Level</th>
                                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6">Status</th>
                                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6 text-center">Action</th>
                                <th className="text-[12px] font-medium text-gray border-0 py-3 px-6 text-center">Create Game</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prizes.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No prizes found for this sponsor.</td></tr>
                            ) : prizes.map((item) => (
                                <tr key={item.id} className="border-b !border-[#D0D5DD]">
                                    <td className="text-sm text-gray py-3 px-6">
                                        <div className="flex items-center gap-3">
                                            <span className="h-10 w-10 min-w-10 bg-white rounded-full border border-[#D0D5DD] overflow-hidden">
                                                <Image
                                                    src={item.thumbnail || '/images/laptop.webp'}
                                                    loading="lazy"
                                                    height={40}
                                                    width={40}
                                                    quality={100}
                                                    alt={item.prizeName}
                                                    className="object-cover h-10"
                                                />
                                            </span>
                                            <span className="text-dark font-medium text-sm">{item.prizeName}</span>
                                        </div>
                                    </td>
                                    <td className="text-sm text-gray py-3 px-6">{Array.isArray(item.keywords) ? item.keywords.join(', ') : (item.keywords || '')}</td>
                                    <td className="text-sm text-gray py-3 px-6">${item.retailValueUSD}</td>
                                    <td className="text-sm text-gray py-3 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-full bg-[#EAECF0] rounded-full h-2">
                                                <div
                                                    className="bg-red-500 h-2 rounded-full"
                                                    style={{ width: `${item.quantityAvailable || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-gray-700 text-sm">{item.quantityAvailable || 0}</span>
                                        </div>
                                    </td>
                                    <td className="text-sm text-gray py-3 px-6">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${item.status === 'Active' ? 'border-[#D0D5DD] text-[#067647]' : 'border-primary text-primary'}`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="text-sm text-gray py-3 px-6 text-center">
                                        <Dropdown
                                            id={item.id}
                                            isOpen={openDropdown === `${item.id}`}
                                            toggleDropdown={() => handleDropdownToggle(`${item.id}`)}
                                            options={[
                                                { id: 1, name: '/images/icon/eye1.svg', title: 'View', action: () => handleView(item.id) },
                                                { id: 2, name: '/images/icon/edit1.svg', title: 'Edit', action: () => handleEdit(item.id) },
                                            ]}
                                        />
                                    </td>
                                    <td className="text-sm text-gray py-3 px-6 text-center">
                                        <button
                                            className="px-4 py-2 bg-primary text-white rounded text-xs font-medium hover:bg-primary-dark"
                                            onClick={() => handleCreateGame(item.id)}
                                        >
                                            Create Game
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PrivateRoute>
    );
};

export default SponsorViewPage;
