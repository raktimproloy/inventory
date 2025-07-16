import EditImagePage from "@/components/prize-image-library/editForm";
import ChsHead from "@/components/layouts/ChsHead";
import PrivateRoute from "@/routes/PrivetRoute";

const EditImgPage = () => {
    return (
        <PrivateRoute>
            <ChsHead />
            <EditImagePage />
        </PrivateRoute>
    );
};

export default EditImgPage;
