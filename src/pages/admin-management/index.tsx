import ChsHead from "@/components/layouts/ChsHead";
import AdminList from "@/components/admin/admin-list";
import PrivateRoute from "@/routes/PrivetRoute";

const AdminManagementPage = () => {
  return (
    <PrivateRoute>
      <ChsHead />
      <AdminList />
    </PrivateRoute>
  );
};

export default AdminManagementPage;
