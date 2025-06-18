import EditImagePage from "@/components/game-image-library/editForm";
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
