import ChsHead from "@/components/layouts/ChsHead";
import UserList from "@/components/user/user-list";
import PrivateRoute from "@/routes/PrivetRoute";

const UserManagementPage = () => {
	return (
		<PrivateRoute>
			<ChsHead />
			<UserList />
		</PrivateRoute>
	);
};

export default UserManagementPage;
