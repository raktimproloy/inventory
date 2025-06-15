import ChsHead from "@/components/layouts/ChsHead";
import PartnerList from "@/components/partner/partner-list";
import PrivateRoute from "@/routes/PrivetRoute";

const PartnerManagementPage = () => {
	return (
		<PrivateRoute>
			<ChsHead />
			<PartnerList />
		</PrivateRoute>
	);
};

export default PartnerManagementPage;
