import ChsHead from "@/components/layouts/ChsHead";
import EditAdmin from "@/components/admin/edit";
import PrivateRoute from "@/routes/PrivetRoute";

const EditAdminPage = () => {
  return (
    <PrivateRoute>
      <ChsHead />
      <EditAdmin />
    </PrivateRoute>
  );
};

export default EditAdminPage;
