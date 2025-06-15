import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebase.config";

interface ImageData {
    title: string;
    remainingQuantity: number;
    stockQuality: string;
    imageUrl: string;
}

const ViewImagePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [imageData, setImageData] = useState<ImageData | null>(null);

    const fetchImage = async () => {
        if (id) {
            const docRef = doc(db, "image_library", id as string);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setImageData(docSnap.data() as ImageData);
            } else {
                console.log("No such document!");
            }
        }
    };

    useEffect(() => {
        fetchImage();
    }, [id]);

    if (!imageData) return <p>Loading...</p>;

    return (
        <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
            <h1 className="text-[18px] font-semibold text-dark mb-8">Image View</h1>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                <div className="form-group">
                    <label>Title</label>
                    <p className="form-control">imageData.title</p>
                </div>
                <div className="from-group">
                    <label>Remaining Quantity</label>
                    <p className="form-control">{imageData.remainingQuantity}</p>
                </div>
                <div className="form-group col-span-2">
                    <label>Stock Quality</label>
                    <p className="form-control">{imageData.stockQuality}</p>
                </div>
            </div>
            <div className="form-group mt-4 md:max-w-lg">
                <img
                    src={imageData.imageUrl}
                    alt={imageData.title}
                    className="form-control"
                />
            </div>
        </div>
    );
};

export default ViewImagePage;
