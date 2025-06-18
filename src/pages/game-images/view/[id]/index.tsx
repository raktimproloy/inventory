import ViewImagePage from "@/components/game-image-library/view";
import ChsHead from "@/components/layouts/ChsHead";
import PrivateRoute from "@/routes/PrivetRoute";

const ViewImgPage = () => {
    return (
        <PrivateRoute>
            <ChsHead />
            <ViewImagePage />
        </PrivateRoute>
    );
};

export default ViewImgPage;
