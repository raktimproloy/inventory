import ChsHead from "@/components/layouts/ChsHead";
import EditPartner from "@/components/partner/edit";
import PrivateRoute from "@/routes/PrivetRoute";

const EditPartnerPage = () => {
	return (
		<PrivateRoute>
            <ChsHead />
            <EditPartner />
		</PrivateRoute>
	);
};

export default EditPartnerPage;
