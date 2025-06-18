import AddImagePage from "@/components/game-image-library/addForm";
import ChsHead from "@/components/layouts/ChsHead";
import PrivateRoute from "@/routes/PrivetRoute";

const AddFormPage = () => {
    return (
        <PrivateRoute>
            <ChsHead />
            <AddImagePage />
        </PrivateRoute>
    );
};

export default AddFormPage;
