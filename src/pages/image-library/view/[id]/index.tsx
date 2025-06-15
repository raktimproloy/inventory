import ViewImagePage from "@/components/image-library/view";
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
