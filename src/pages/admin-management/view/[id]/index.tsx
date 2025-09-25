import ChsHead from "@/components/layouts/ChsHead";
import AdminView from "@/components/admin/view";
import PrivateRoute from "@/routes/PrivetRoute";

const ViewAdminPage = () => {
  return (
    <PrivateRoute>
      <ChsHead />
      <AdminView />
    </PrivateRoute>
  );
};

export default ViewAdminPage;
