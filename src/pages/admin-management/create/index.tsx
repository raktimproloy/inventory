import ChsHead from "@/components/layouts/ChsHead";
import CreateAdmin from "@/components/admin/create";
import PrivateRoute from "@/routes/PrivetRoute";

const CreateAdminPage = () => {
  return (
    <PrivateRoute>
      <ChsHead />
      <CreateAdmin />
    </PrivateRoute>
  );
};

export default CreateAdminPage;
