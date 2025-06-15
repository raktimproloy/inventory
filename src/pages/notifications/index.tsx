import ChsHead from "@/components/layouts/ChsHead";
import Settings from "@/components/notifications";
import PrivateRoute from "@/routes/PrivetRoute";

const NotificationsPage = () => {
	return (
		<PrivateRoute>
			<ChsHead />
			<Settings />
		</PrivateRoute>
	);
};

export default NotificationsPage;
